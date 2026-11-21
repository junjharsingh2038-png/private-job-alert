(function(){
'use strict';
const host=document.getElementById('pjaHomeAccount');if(!host)return;
const sb=window.supabase?.createClient('https://rlidcatrwonemshwzafp.supabase.co','sb_publishable_ocJhWyfPg9rVhYROn_Vj0Q_DSSgxeuE');if(!sb)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=n=>String(n||'U').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
function draw(user,p){
 if(!user){host.innerHTML='<a class="login-link" href="seeker.html">♙ Login</a><a class="register-link" href="seeker.html">♟ Register</a>';return}
 const name=p?.full_name||user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Job Seeker',role=user.user_metadata?.account_type==='hr'?'HR / Employer':'Job Seeker',photo=p?.profile_photo_url||user.user_metadata?.avatar_url||'',av=photo?'<img src="'+esc(photo)+'" alt="Profile photo">':'<span>'+esc(initials(name))+'</span>';
 host.innerHTML='<div class="pja-account-wrap"><button class="pja-account-trigger" id="pjaAccountToggle" type="button" aria-expanded="false"><span class="pja-account-avatar">'+av+'</span><span class="pja-account-label"><b>'+esc(name)+'</b><small>'+esc(role)+'</small></span><span class="pja-account-chevron">⌄</span></button><div class="pja-account-menu" id="pjaAccountMenu" hidden><div class="pja-account-menu-head"><span class="pja-account-avatar large">'+av+'</span><span><b>'+esc(name)+'</b><small>'+esc(role)+'</small><em>✓ Verified Account</em></span></div><a href="seeker.html#profile">♙ <span>My Profile</span></a><a href="seeker.html#profile">✎ <span>Edit Profile</span></a><a href="seeker.html#profile">▧ <span>Upload / Change Photo</span></a><a href="seeker.html#applications">▣ <span>My Applications</span></a><a href="seeker.html#saved">♧ <span>Saved Jobs</span></a><a href="seeker.html#alerts">♧ <span>Job Alerts</span></a><button type="button" class="pja-logout" id="pjaAccountLogout">⇥ <span>Logout</span></button></div></div>';
 const t=document.getElementById('pjaAccountToggle'),m=document.getElementById('pjaAccountMenu');t.onclick=()=>{m.hidden=!m.hidden;t.setAttribute('aria-expanded',String(!m.hidden))};
 document.addEventListener('click',e=>{if(!host.contains(e.target)){m.hidden=true;t.setAttribute('aria-expanded','false')}});
 document.getElementById('pjaAccountLogout').onclick=async()=>{await sb.auth.signOut();draw(null,null)};
}
async function refresh(session){const u=session?.user;if(!u){draw(null,null);return}const r=await sb.from('job_seeker_profiles').select('full_name,profile_photo_url').eq('id',u.id).maybeSingle();draw(u,r.error?null:r.data)}
sb.auth.getSession().then(({data})=>refresh(data.session));sb.auth.onAuthStateChange((_e,s)=>setTimeout(()=>refresh(s),0));
})();