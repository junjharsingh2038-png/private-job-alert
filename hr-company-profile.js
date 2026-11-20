(()=>{'use strict';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hrFields=[
['hr_full_name','Your Full Name','text'],['hr_designation','Your Designation','text'],['hr_department','Department / Function','text'],['hr_mobile','Personal / Work Mobile','tel'],['hr_experience','Recruitment / HR Experience','text'],['hr_city','Your City','text'],['hr_state','Your State','text'],['hr_languages','Languages','text'],['hr_bio','Professional Summary','textarea'],['hr_linkedin_url','Personal LinkedIn URL','url'],['hr_website_url','Professional Website URL','url'],['hr_profile_photo_url','Profile Photo URL','url']
];
const companyFields=[
['company_name','Company / Organization Name','text'],['contact_name','HR / Contact Person','text'],['phone','Company Contact Mobile','tel'],['email','Official Email','email'],
['industry','Industry','text'],['company_type','Company Type','text'],['company_size','Company Size / Employees','text'],['founded_year','Year Established','text'],
['company_website','Company Website','url'],['logo_url','Company Logo URL','url'],['company_description','About Company','textarea'],
['headquarters','Headquarters','text'],['address','Full Address','textarea'],['city','Company City','text'],['state','Company State','text'],['pincode','PIN Code','text'],
['hiring_for','Departments / Roles Hiring For','textarea'],['linkedin_url','Company LinkedIn Page','url'],['instagram_url','Company Social / Instagram URL','url']
];
const allFields=[...hrFields,...companyFields];
function addField(dest,[k,label,type]){
 const w=document.createElement('label');w.className='detail-item';w.textContent=label;
 const el=type==='textarea'?document.createElement('textarea'):document.createElement('input');
 el.id='hrp_'+k;el.name=k;if(type!=='textarea')el.type=type;else el.rows=4;
 el.autocomplete='off';w.appendChild(el);dest.appendChild(w);
}
function ensureModal(){
 if($('pjaHrProfileModal'))return;
 const m=document.createElement('div');m.id='pjaHrProfileModal';m.className='pja-profile-modal';m.innerHTML='<div class="pja-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="pjaHrModalTitle"><div class="pja-profile-head"><div><span class="pja-profile-kicker">PRIVATE JOB ALERT · HR ACCOUNT</span><h2 id="pjaHrModalTitle">Professional Profile</h2><p>View and update your recruiter and company information</p></div><button type="button" class="pja-profile-close" aria-label="Close">×</button></div><div class="pja-profile-body" id="pjaHrModalBody"></div></div>';
 document.body.appendChild(m);
 m.querySelector('.pja-profile-close').onclick=closeModal;
 m.addEventListener('click',e=>{if(e.target===m)closeModal()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
}
function closeModal(){const m=$('pjaHrProfileModal');if(m)m.classList.remove('is-open');document.body.classList.remove('pja-modal-lock')}
function openModal(){ensureModal();const sec=$('hrCompanyProfileSection'),body=$('pjaHrModalBody');if(sec&&body&&!body.contains(sec)){sec.classList.add('pja-profile-in-modal');body.appendChild(sec)}$('pjaHrProfileModal').classList.add('is-open');document.body.classList.add('pja-modal-lock');load()}
function ensureUI(){
 const grid=document.querySelector('.quick-grid'),main=$('mainContent');if(!grid||!main)return;
 if(!$('hrCompanyProfileCard')){const c=document.createElement('article');c.className='quick-card';c.id='hrCompanyProfileCard';c.innerHTML='<div class="dashboard-stat"><span class="num">04 · PROFILE</span></div><h3>HR & Company Profile</h3><p>Create your own professional HR profile and complete your company hiring profile.</p><span class="card-link">Edit Full Profile →</span>';c.onclick=()=>openModal();grid.appendChild(c)}
 if(!$('hrCompanyProfileSection')){
  const s=document.createElement('section');s.id='hrCompanyProfileSection';s.className='section-box';
  s.innerHTML='<div class="application-details" style="margin-top:22px"><h2>My Professional HR Profile</h2><p class="muted">Your personal recruiter identity — similar to a professional job-network profile.</p><div id="hrProfileProgress" class="muted" style="font-weight:800;margin:12px 0"></div><form id="hrCompanyProfileForm" class="list"><h3>Personal & Professional Details</h3><div class="detail-grid" id="hrPersonalFields"></div><h3>Company Profile</h3><p class="muted">Company details candidates can use to understand your organization.</p><div class="detail-grid" id="hrCompanyFields"></div><label style="display:flex;gap:10px;align-items:center"><input type="checkbox" id="hrCompanyVisibility" checked style="width:auto"> Show profile to candidates where profile access is enabled</label><button type="submit">Save Complete HR & Company Profile</button><p id="hrCompanyMsg"></p></form></div>';
  main.appendChild(s);hrFields.forEach(f=>addField($('hrPersonalFields'),f));companyFields.forEach(f=>addField($('hrCompanyFields'),f));
  $('hrCompanyProfileForm').addEventListener('submit',save);
 }
}
function updateProgress(){
 const ids=allFields.map(([k])=>'hrp_'+k),filled=ids.filter(id=>$(id)?.value.trim()).length;
 const el=$('hrProfileProgress');if(el)el.textContent='Profile completion: '+Math.round(filled/ids.length*100)+'% · '+filled+'/'+ids.length+' details completed';
}
async function load(){
 const u=(await sb.auth.getUser()).data?.user;if(!u)return;
 const r=await sb.from('hr_profiles').select('*').eq('id',u.id).maybeSingle();
 if(r.error){$('hrCompanyMsg').textContent='Could not load profile: '+r.error.message;return}
 const p=r.data||{};
 allFields.forEach(([k])=>{const el=$('hrp_'+k);if(el)el.value=p[k]||((k==='email')?u.email:((k==='hr_full_name')?(u.user_metadata?.hr_name||''):''))});
 if($('hrCompanyVisibility'))$('hrCompanyVisibility').checked=p.profile_visibility!==false;
 updateProgress();
}
async function save(e){
 e.preventDefault();const u=(await sb.auth.getUser()).data?.user;if(!u)return;
 const row={id:u.id,updated_at:new Date().toISOString(),profile_visibility:$('hrCompanyVisibility').checked};
 allFields.forEach(([k])=>{row[k]=$('hrp_'+k).value.trim()||null});
 const r=await sb.from('hr_profiles').upsert(row,{onConflict:'id'});
 $('hrCompanyMsg').textContent=r.error?'Save failed: '+r.error.message:'Your HR personal profile and company profile have been saved.';
 $('hrCompanyMsg').className=r.error?'danger':'success';if(!r.error)updateProgress();
}
function init(){
 ensureUI();ensureModal();const old=window.portal;
 if(typeof old==='function'&&!window.__pjaHrCompanyProfile){window.__pjaHrCompanyProfile=true;window.portal=async function(){await old();ensureUI();load()}}
 setTimeout(()=>{ensureUI();ensureModal()},800);
 const mo=new MutationObserver(()=>{if(document.querySelector('.quick-grid'))ensureUI()});mo.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('input',e=>{if(e.target?.id?.startsWith('hrp_'))updateProgress()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

/* Professional profile modal for HR */
.pja-profile-modal{position:fixed;inset:0;z-index:9999;background:rgba(5,18,42,.66);backdrop-filter:blur(7px);display:none;align-items:center;justify-content:center;padding:22px;box-sizing:border-box}.pja-profile-modal.is-open{display:flex}.pja-profile-dialog{width:min(100%,1000px);max-height:min(92vh,900px);background:#fff;border-radius:22px;box-shadow:0 28px 90px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden;animation:pjaProfileIn .2s ease}.pja-profile-head{padding:23px 28px;background:linear-gradient(120deg,#071b3a,#1264e8);color:#fff;display:flex;justify-content:space-between;gap:20px;align-items:center}.pja-profile-head h2{margin:6px 0;font-size:25px}.pja-profile-head p{margin:0;color:#dce9ff}.pja-profile-kicker{font-size:11px;font-weight:900;letter-spacing:.12em;color:#b9d7ff}.pja-profile-close{width:42px;height:42px;flex:0 0 42px;border-radius:50%!important;background:rgba(255,255,255,.16)!important;color:#fff!important;font-size:28px!important;box-shadow:none!important}.pja-profile-body{overflow:auto;padding:24px;background:#f5f8fc}.pja-profile-in-modal{margin:0!important}.pja-profile-in-modal>.application-details{margin:0!important;border:0!important;box-shadow:none!important}.pja-modal-lock{overflow:hidden!important}@keyframes pjaProfileIn{from{opacity:0;transform:translateY(12px) scale(.99)}to{opacity:1;transform:none}}@media(max-width:650px){.pja-profile-modal{padding:0}.pja-profile-dialog{width:100%;height:100%;max-height:100vh;border-radius:0}.pja-profile-head{padding:18px}.pja-profile-body{padding:14px}}
})();