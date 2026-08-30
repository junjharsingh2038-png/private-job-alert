// Deploy as Supabase Edge Function: notify-hr
// Set secrets: RESEND_API_KEY and FROM_EMAIL.
// Example: supabase functions deploy notify-hr
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { application_id } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: a, error } = await supabase.from("applications").select("*").eq("id", application_id).single();
    if (error || !a) throw new Error("Application not found");

    const { data: job } = await supabase.from("jobs").select("title,company").eq("id", a.job_id).single();
    const { data: signed } = await supabase.storage.from("resumes").createSignedUrl(a.resume_path, 86400);

    const body = `New application received

Job: ${job?.title || ""}
Company: ${job?.company || ""}

Candidate Name: ${a.candidate_name}
Mobile: ${a.candidate_mobile}
Email: ${a.candidate_email}
Location: ${a.candidate_location || ""}
Qualification: ${a.qualification || ""}
Experience: ${a.experience || ""}

Resume: ${signed?.signedUrl || "not available"}`;

    const r = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{"Authorization":`Bearer ${Deno.env.get("RESEND_API_KEY")}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        from:Deno.env.get("FROM_EMAIL"),
        to:[a.hr_email],
        subject:`New Job Application – ${job?.title || "Job"}`,
        text:body
      })
    });
    if(!r.ok) throw new Error(await r.text());
    return new Response(JSON.stringify({ok:true}),{headers:{"Content-Type":"application/json"}});
  } catch(e) {
    return new Response(JSON.stringify({error:String(e)}),{status:400,headers:{"Content-Type":"application/json"}});
  }
});