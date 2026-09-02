(function(){'use strict';
const IDLE_MS=30*60*1000,KEY='pja_last_activity';
function path(){return location.pathname.split('/').pop().toLowerCase()}
async function guard(){if(!window.sb?.auth)return;const r=await sb.auth.getUser(),u=r.data?.user;if(!u)return;const role=String(u.user_metadata?.role||'').toLowerCase();const p=path();let isEmployee=role==='employee';let isHR=role==='hr'||role==='employer';
try{if(!isEmployee&&!isHR){const j=await sb.from('jobs').select('id').eq('hr_user_id',u.id).limit(1);isHR=!j.error&&(j.data||[]).length>0}}catch(e){}
if(p==='hr.html'&&isEmployee){await sb.auth.signOut();alert('This Employee Login ID cannot access the HR Portal.');location.href='hr.html';return}
if(p==='seeker.html'&&isHR&&!isEmployee){await sb.auth.signOut();alert('This HR Login ID cannot access the Employee Portal.');location.href='seeker.html';return}
}
function activity(){localStorage.setItem(KEY,String(Date.now()))}
async function idle(){const last=Number(localStorage.getItem(KEY)||Date.now());if(Date.now()-last>=IDLE_MS){localStorage.removeItem(KEY);if(window.sb?.auth){await sb.auth.signOut();alert('Your session expired due to inactivity. Please login again.');location.reload()}return}activity()}
window.addEventListener('load',()=>{activity();setInterval(idle,60000);['click','keydown','mousemove','scroll','touchstart'].forEach(x=>window.addEventListener(x,activity,{passive:true}));setTimeout(guard,0)});
})();