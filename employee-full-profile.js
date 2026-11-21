(()=>{'use strict';
const $=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields=[
['date_of_birth','Date of Birth','date',''],['gender','Gender','text',''],['city','City','text','Jaipur'],['state','State','text','Rajasthan'],['pincode','PIN Code','text',''],['headline','Professional Headline','text','e.g. MIS Executive | Advanced Excel | 5 Years'],
['current_company','Current / Last Company','text','Company name'],['current_designation','Current / Last Designation','text','Your designation'],
['total_experience','Total Experience','text','e.g. 5 Years'],['notice_period','Notice Period','text','Immediate / 30 Days'],
['expected_salary','Expected Salary','text','Annual CTC / Monthly salary'],['preferred_locations','Preferred Job Locations','text','Jaipur, Jodhpur, Barmer'],
['preferred_job_type','Preferred Job Type','text','Full Time / Part Time / Remote'],
['education_details','Education Details','textarea','Degree, institute, year, marks'],['employment_details','Employment History','textarea','Company, role, duration, responsibilities'],
['certifications','Certifications','textarea','Course / certificate details'],['projects','Projects','textarea','Project name, work and achievement'],
['languages','Languages','text','Hindi, English'],['linkedin_url','LinkedIn Profile URL','url','https://linkedin.com/in/...'],
['portfolio_url','Portfolio / Website URL','url','https://...']
];
function ensureModal(){
 if($('pjaEmployeeProfileModal'))return;
 const m=document.createElement('div');m.id='pjaEmployeeProfileModal';m.className='pja-profile-modal';m.innerHTML='<div class="pja-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="pjaEmployeeModalTitle"><div class="pja-profile-head"><div><span class="pja-profile-kicker">PRIVATE JOB ALERT · EMPLOYEE ACCOUNT</span><h2 id="pjaEmployeeModalTitle">Professional Profile & Resume</h2><p>View and update your career information</p></div><button type="button" class="pja-profile-close" aria-label="Close">×</button></div><div class="pja-profile-body" id="pjaEmployeeModalBody"></div></div>';
 document.body.appendChild(m);m.querySelector('.pja-profile-close').onclick=closeModal;m.addEventListener('click',e=>{if(e.target===m)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
}
function closeModal(){const m=$('pjaEmployeeProfileModal');if(m)m.classList.remove('is-open');document.body.classList.remove('pja-modal-lock')}
function openModal(){ensureModal();const sec=$('profile'),body=$('pjaEmployeeModalBody');if(sec&&body&&!body.contains(sec)){sec.classList.add('pja-profile-in-modal')}if(sec){sec.classList.add('open');if(body&&!body.contains(sec))body.appendChild(sec)}$('pjaEmployeeProfileModal').classList.add('is-open');document.body.classList.add('pja-modal-lock');load()}
function addUI(){
 const sec=$('profile'); if(!sec||$('pHeadline'))return;
 const grid=sec.querySelector('.detail-grid'); if(!grid)return;
 const hero=document.createElement('div');hero.className='full pja-profile-dashboard employee-profile-dashboard';hero.innerHTML='<div class="pja-profile-cover"><span>PRIVATE JOB ALERT · CAREER PROFILE</span><div class="pja-profile-identity"><img id="employeePhotoPreview" alt="Employee profile photo"><div><h2 id="employeeDisplayName">Your Name</h2><p id="employeeDisplayHeadline">Add your professional headline</p><small id="employeeDisplayLocation">Your location</small></div></div><button type="button" id="employeeEditDetails">Edit Profile</button></div><div class="pja-profile-stats"><div><b id="employeePercent">0%</b><span>Profile Complete</span></div><div><b id="employeeSkillCount">0</b><span>Profile Fields</span></div><div><b>Resume</b><span>Career Documents</span></div></div><div class="pja-photo-upload"><label>Upload / Change Profile Photo <input id="employeePhotoUpload" type="file" accept="image/png,image/jpeg,image/webp"></label><small>JPG, PNG or WEBP · Maximum 3 MB</small></div></div>';grid.prepend(hero);const box=document.createElement('div');box.className='full';box.innerHTML='<h3 style="margin:20px 0 8px">Professional Profile Details</h3><div class="detail-grid" id="extendedEmployeeFields"></div><div id="employeeProfileProgress" class="muted" style="margin:14px 0;font-weight:700"></div>';
 grid.appendChild(box);
 const dest=$('extendedEmployeeFields');
 fields.forEach(([key,label,type,ph])=>{const wrap=document.createElement('label');wrap.className='full';wrap.textContent=label;const el=type==='textarea'?document.createElement('textarea'):document.createElement('input');el.id='p'+key[0].toUpperCase()+key.slice(1);el.name=key;el.placeholder=ph;if(type!=='textarea')el.type=type;el.rows=type==='textarea'?3:undefined;wrap.appendChild(el);dest.appendChild(wrap)});
}
function getVal(k){const el=$('p'+k[0].toUpperCase()+k.slice(1));return el?.value?.trim()||null}
async function load(){
 if(!window.PJA_SEEKER_USER)return;
 const u=window.PJA_SEEKER_USER;
 const r=await sb.from('job_seeker_profiles').select('*').eq('id',u.id).maybeSingle();if(r.error)return;
 const p=r.data||{};
 fields.forEach(([k])=>{const el=$('p'+k[0].toUpperCase()+k.slice(1));if(el)el.value=p[k]||''});
 if($('profileVisibility'))$('profileVisibility').checked=p.profile_visibility!==false;if($('employeePhotoPreview'))$('employeePhotoPreview').src=p.profile_photo_url||'';if($('employeeDisplayName'))$('employeeDisplayName').textContent=p.full_name||$('pName')?.value||'Your Name';if($('employeeDisplayHeadline'))$('employeeDisplayHeadline').textContent=p.headline||'Add your professional headline';if($('employeeDisplayLocation'))$('employeeDisplayLocation').textContent=[p.city,p.state].filter(Boolean).join(', ')||p.location||'Add your location';
 const base=['pName','pMobile','pLocation','pQualification','pExperience','pSkills'];
 const all=[...base,...fields.map(([k])=>'p'+k[0].toUpperCase()+k.slice(1))];
 const filled=all.filter(id=>$(id)?.value?.trim()).length;
 const percent=Math.round(filled/all.length*100);
 if($('employeeProfileProgress'))$('employeeProfileProgress').textContent='Profile completion: '+percent+'% · '+filled+'/'+all.length+' fields filled';if($('employeePercent'))$('employeePercent').textContent=percent+'%';if($('employeeSkillCount'))$('employeeSkillCount').textContent=fields.length;
}
async function save(e){
 if(!window.sb||!window.PJA_SEEKER_USER)return;
 e.preventDefault();e.stopImmediatePropagation();
 const u=window.PJA_SEEKER_USER,file=$('resume')?.files?.[0];
 if(file&&file.size>5*1024*1024){const m=$('profileMsg');if(m){m.textContent='Resume maximum size is 5 MB.';m.className='danger'}return}
 const old=await sb.from('job_seeker_profiles').select('resume_path').eq('id',u.id).maybeSingle();
 if(old.error){const m=$('profileMsg');if(m){m.textContent=old.error.message;m.className='danger'}return}
 let resumePath=old.data?.resume_path||null;
 if(file){
  const ext=(file.name.split('.').pop()||'pdf').toLowerCase();
  const up=await sb.storage.from('resumes').upload(u.id+'/'+Date.now()+'.'+ext,file,{upsert:false});
  if(up.error){const m=$('profileMsg');if(m){m.textContent=up.error.message;m.className='danger'}return}
  resumePath=up.data.path;
 }
 const row={id:u.id,full_name:$('pName').value.trim(),mobile:$('pMobile').value.trim(),location:$('pLocation').value.trim(),qualification:$('pQualification').value.trim(),experience:$('pExperience').value.trim(),skills:$('pSkills').value.trim(),resume_path:resumePath,updated_at:new Date().toISOString()};
 fields.forEach(([k])=>{if(k!=='profile_photo_url')row[k]=getVal(k)});const photo=$('employeePhotoUpload')?.files?.[0];if(photo){if(photo.size>3*1024*1024){const m=$('profileMsg');if(m)m.textContent='Photo must be 3 MB or smaller.';return}const ext=photo.type==='image/png'?'png':photo.type==='image/webp'?'webp':'jpg';const path=u.id+'/employee-profile-'+Date.now()+'.'+ext;const up=await sb.storage.from('profile-photos').upload(path,photo,{upsert:true,contentType:photo.type});if(up.error){const m=$('profileMsg');if(m)m.textContent='Photo upload failed: '+up.error.message;return}row.profile_photo_url=sb.storage.from('profile-photos').getPublicUrl(path).data.publicUrl;}
 if($('profileVisibility'))row.profile_visibility=$('profileVisibility').checked;
 const res=await sb.from('job_seeker_profiles').upsert(row,{onConflict:'id'});
 const m=$('profileMsg');if(m){m.textContent=res.error?'Save failed: '+res.error.message:'Your complete professional profile and resume have been saved.';m.className=res.error?'danger':'success'}
 if(!res.error){if($('resumeBox'))$('resumeBox').textContent=resumePath?'Resume uploaded and saved.':'No resume uploaded yet.';load()}
}
function init(){
 addUI();
 ensureModal();const old=window.showDash;
 if(typeof old==='function'&&!window.__pjaFullProfileDash){window.__pjaFullProfileDash=true;window.showDash=function(){old();window.PJA_SEEKER_USER=window.user||window.PJA_SEEKER_USER;setTimeout(load,350)}}
 const f=$('profileForm');if(f)f.addEventListener('submit',save,true);document.addEventListener('change',e=>{if(e.target?.id==='employeePhotoUpload'&&e.target.files?.[0])$('employeePhotoPreview').src=URL.createObjectURL(e.target.files[0])});document.addEventListener('click',e=>{if(e.target?.id==='employeeEditDetails')$('profileForm')?.scrollIntoView({behavior:'smooth'})});
 document.querySelectorAll('[data-section="profile"]').forEach(b=>{b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openModal()},true)});
 const watch=new MutationObserver(()=>{if($('profile')&&!$('pHeadline')){addUI();setTimeout(load,150)}});if($('profile'))watch.observe($('profile'),{childList:true,subtree:true});
 setTimeout(()=>{sb.auth.getUser().then(r=>{if(r.data?.user){window.PJA_SEEKER_USER=r.data.user}})},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

})();