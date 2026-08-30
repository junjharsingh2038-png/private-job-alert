PRIVATE JOB ALERT RAJASTHAN — SUPABASE VERSION

This version removes FormSubmit dependency for job applications.

FLOW:
HR creates account -> HR posts job -> job stores HR email.
Candidate clicks Apply Now -> candidate details + resume -> application stored.
Supabase Edge Function -> email notification sent to the HR email stored on that job.

IMPORTANT:
1. Put all website files in the GitHub Pages root.
2. Open app.js and replace:
   PASTE_YOUR_SUPABASE_URL
   PASTE_YOUR_SUPABASE_ANON_KEY
3. Run supabase-schema.sql in Supabase SQL Editor.
4. Deploy the Edge Function from supabase-functions-notify-hr-index.ts as notify-hr.
5. Set Edge Function secrets:
   RESEND_API_KEY
   FROM_EMAIL
6. Configure Supabase Auth email settings as desired.

Do NOT put the Supabase service-role key in app.js or GitHub.
