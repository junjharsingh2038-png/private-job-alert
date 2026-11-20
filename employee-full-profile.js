(()=>{'use strict';
const $=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fields=[
['headline','Professional Headline','text','e.g. MIS Executive | Advanced Excel | 5 Years'],
['current_company','Current / Last Company','text','Company name'],['current_designation','Current / Last Designation','text','Your designation'],
['total_experience','Total Experience','text','e.g. 5 Years'],['notice_period','Notice Period','text','Immediate / 30 Days'],
['expected_salary','Expected Salary','text','Annual CTC / Monthly salary'],['preferred_locations','Preferred Job Locations','text','Jaipur, Jodhpur, Barmer'],
['preferred_job_type','Preferred Job Type','text','Full Time / Part Time / Remote'],
['education_details','Education Details','textarea','Degree, institute, year, marks'],['employment_details','Employment History','textarea','Company, role, duration, responsibilities'],
['certifications','Certifications','textarea','Course / certificate details'],['projects','Projects','textarea','Project name, work and achievement'],
['languages','Languages','text','Hindi, English'],['linkedin_url','LinkedIn Profile URL','url','https://linkedin.com/in/...'],
['portfolio_url','Portfolio / Website URL','url','https://...'],['profile_photo_url','Profile Photo URL','url','Public image URL (optional)']
];
function addUI(){
 const sec=$('profile'); if(!sec||$('pHeadline'))return;
 const grid=sec.querySelector('.detail-grid'); if(!grid)return;
 const box=document.createElement('div');box.className='full';box.innerHTML='<h3 style="margin:20px 0 8px">Professional Profile Details</h3><div class="detail-grid" id="extendedEmployeeFields"></div><div id="employeeProfileProgress" class="muted" style="margin:14px 0;font-weight:700"></div>';
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
 if($('profileVisibility'))$('profileVisibility').checked=p.profile_visibility!==false;
 const base=['pName','pMobile','pLocation','pQualification','pExperience','pSkills'];
 const all=[...base,...fields.map(([k])=>'p'+k[0].toUpperCase()+k.slice(1))];
 const filled=all.filter(id=>$(id)?.value?.trim()).length;
 const percent=Math.round(filled/all.length*100);
 if($('employeeProfileProgress'))$('employeeProfileProgress').textContent='Profile completion: '+percent+'% · '+filled+'/'+all.length+' fields filled';
}
async function save(e){
 if(!window.sb||!window.PJA_SEEKER_USER)return;
 e.preventDefault();e.stopImmediatePropagation();
 const u=window.PJA_SEEKER_USER;
 const row={id:u.id,full_name:$('pName').value.trim(),mobile:$('pMobile').value.trim(),location:$('pLocation').value.trim(),qualification:$('pQualification').value.trim(),experience:$('pExperience').value.trim(),skills:$('pSkills').value.trim(),updated_at:new Date().toISOString()};
 fields.forEach(([k])=>row[k]=getVal(k));
 if($('profileVisibility'))row.profile_visibility=$('profileVisibility').checked;
 const res=await sb.from('job_seeker_profiles').upsert(row,{onConflict:'id'});
 const m=$('profileMsg');if(m){m.textContent=res.error?'Save failed: '+res.error.message:'Your complete professional profile has been saved.';m.className=res.error?'danger':'success'}
 if(!res.error)load();
}
function init(){
 addUI();
 const old=window.showDash;
 if(typeof old==='function'&&!window.__pjaFullProfileDash){window.__pjaFullProfileDash=true;window.showDash=function(){old();window.PJA_SEEKER_USER=window.user||window.PJA_SEEKER_USER;setTimeout(load,350)}}
 const f=$('profileForm');if(f)f.addEventListener('submit',save,true);
 document.querySelectorAll('[data-section="profile"]').forEach(b=>b.addEventListener('click',()=>setTimeout(load,250)));
 const watch=new MutationObserver(()=>{if($('profile')&&!$('pHeadline')){addUI();setTimeout(load,150)}});if($('profile'))watch.observe($('profile'),{childList:true,subtree:true});
 setTimeout(()=>{sb.auth.getUser().then(r=>{if(r.data?.user){window.PJA_SEEKER_USER=r.data.user;load()}})},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();