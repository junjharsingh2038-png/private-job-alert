(function(){'use strict';
const IDLE_MS=5*60*1000,KEY='pja_last_activity_v2',URL='https://rlidcatrwonemshwzafp.supabase.co',KEYS='sb_publishable_ocJhWyfPg9rVhYROn_Vj0Q_DSSgxeuE',ADMIN='junjharsingh740@gmail.com';
let client=null,timer=null,expired=false;
function path(){return location.pathname.split('/').pop().toLowerCase()}
function db(){if(client)return client;if(window.sb?.auth)return window.sb; if(window.supabase?.createClient)client=window.supabase.createClient(URL,KEYS);return client}
async function guard(){const s=db();if(!s?.auth)return;const r=await s.auth.getUser(),u=r.data?.user;if(!u)return;const p=path(),email=(u.email||'').toLowerCase(),role=String(u.user_metadata?.role||'').toLowerCase(),md=u.user_metadata||{};let employee=role==='employee',hr=role==='hr'||role==='employer'||(!employee&&(!!md.hr_name||!!md.company)),admin=email===ADMIN;
if(p==='admin.html'&&!admin){await s.auth.signOut();alert('Admin access denied.');location.reload();return}
try{if(!employee&&!hr&&!admin){const j=await s.from('jobs').select('id').eq('hr_user_id',u.id).limit(1);hr=!j.error&&(j.data||[]).length>0}}catch(e){}
if(p==='hr.html'&&employee){await s.auth.signOut();alert('This Employee Login ID cannot access the HR Portal.');location.reload();return}
if(p==='seeker.html'&&hr&&!admin){await s.auth.signOut();alert('This HR Login ID cannot access the Employee Portal.');location.reload();return}
}
function touch(){localStorage.setItem(KEY,String(Date.now()))}
async function idle(){const s=db();if(!s?.auth||expired)return;const r=await s.auth.getUser();if(!r.data?.user)return;const last=Number(localStorage.getItem(KEY)||Date.now());if(Date.now()-last>=IDLE_MS){expired=true;localStorage.removeItem(KEY);await s.auth.signOut();alert('Your session expired after 5 minutes of inactivity. Please login again.');location.reload()}}
function start(){touch();timer=setInterval(idle,15000);['click','keydown','mousemove','scroll','touchstart'].forEach(x=>window.addEventListener(x,touch,{passive:true}));setTimeout(guard,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
