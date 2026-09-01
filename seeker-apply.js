/* Authenticated employee application flow: one application per employee per job + email notifications. */
(function(){
  document.addEventListener('submit',async function(e){
    if(e.target.id!=='applyForm')return;
    e.preventDefault();e.stopImmediatePropagation();
    const form=e.target,msg=document.getElementById('applyMsg'),fd=new FormData(form),file=fd.get('resume');
    const {data:{user}}=await SEEKER_SB.auth.getUser();
    if(!user){location.href='seeker.html';return}
    if((user.user_metadata||{}).role!=='employee'){
      await SEEKER_SB.auth.signOut();msg.className='danger';msg.textContent='This account is not an Employee account.';return;
    }
    if(!file||file.size>5*1024*1024){msg.className='danger';msg.textContent='Resume must be PDF/DOC/DOCX and maximum 5 MB.';return}
    if(!currentJob||!currentJob.hr_email){msg.className='danger';msg.textContent='This job has no HR email configured.';return}
    msg.className='';msg.textContent='Checking application...';
    try{
      const existing=await SEEKER_SB.from('applications').select('id').eq('job_id',currentJob.id).eq('candidate_user_id',user.id).maybeSingle();
      if(existing.error)throw new Error(existing.error.message);
      if(existing.data){msg.className='danger';msg.textContent='You have already applied for this job. One employee can apply only once for each job.';return}
      msg.textContent='Submitting application...';
      const ext=(file.name.split('.').pop()||'pdf').toLowerCase();
      const upload=await SEEKER_SB.storage.from('resumes').upload(user.id+'/'+Date.now()+'.'+ext,file,{upsert:false});
      if(upload.error)throw new Error(upload.error.message);
      const resumePath=upload.path;
      const r=await SEEKER_SB.from('applications').insert({job_id:currentJob.id,hr_email:currentJob.hr_email,candidate_user_id:user.id,candidate_name:fd.get('name'),candidate_mobile:fd.get('mobile'),candidate_email:user.email,candidate_location:fd.get('location'),qualification:fd.get('qualification'),experience:fd.get('experience')||'',resume_path:resumePath,status:'Received'}).select('id').single();
      if(r.error){if(r.error.code==='23505'){msg.className='danger';msg.textContent='You have already applied for this job.';return}throw new Error(r.error.message)}
      msg.className='success';msg.textContent='Application submitted successfully. You can track it in Applied Jobs.';form.reset();
      if(r.data?.id){
        const emailResult=await SEEKER_SB.functions.invoke('notify-hr',{body:{application_id:r.data.id,action:'application_received'}});
        if(emailResult.error)console.warn('Application email notification failed:',emailResult.error.message);
      }
    }catch(err){msg.className='danger';msg.textContent=err.message||'Application could not be submitted.'}
  },true);
})();