/* Replace the old public application submit handler with an authenticated seeker flow. */
(function(){
  document.addEventListener('submit',async function(e){
    if(e.target.id!=='applyForm')return;
    e.preventDefault();e.stopImmediatePropagation();
    const form=e.target,msg=document.getElementById('applyMsg'),fd=new FormData(form),file=fd.get('resume');
    const {data:{user}}=await SEEKER_SB.auth.getUser();
    if(!user){location.href='seeker.html';return}
    if(!file||file.size>5*1024*1024){msg.className='danger';msg.textContent='Resume must be PDF/DOC/DOCX and maximum 5 MB.';return}
    if(!currentJob||!currentJob.hr_email){msg.className='danger';msg.textContent='This job has no HR email configured.';return}
    msg.className='';msg.textContent='Submitting application...';
    try{
      let resumePath=null;
      const ext=(file.name.split('.').pop()||'pdf').toLowerCase();
      const upload=await SEEKER_SB.storage.from('resumes').upload(user.id+'/'+Date.now()+'.'+ext,file,{upsert:false});
      if(upload.error)throw new Error(upload.error.message);
      resumePath=upload.path;
      const r=await SEEKER_SB.from('applications').insert({job_id:currentJob.id,hr_email:currentJob.hr_email,candidate_user_id:user.id,candidate_name:fd.get('name'),candidate_mobile:fd.get('mobile'),candidate_email:user.email,candidate_location:fd.get('location'),qualification:fd.get('qualification'),experience:fd.get('experience')||'',resume_path:resumePath,status:'Applied'});
      if(r.error)throw new Error(r.error.message);
      msg.className='success';msg.textContent='Application submitted successfully. You can track it in Applied Jobs.';form.reset();
    }catch(err){msg.className='danger';msg.textContent=err.message||'Application could not be submitted.'}
  },true);
})();