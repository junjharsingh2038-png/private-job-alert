(function(){'use strict';
const ADMIN='junjharsingh740@gmail.com';
function injectAdminRecovery(){
 if(location.pathname.split('/').pop().toLowerCase()!=='admin.html')return;
 const button=document.getElementById('forgot'),box=document.getElementById('forgotBox'),email=document.getElementById('resetEmail');
 if(!button||!box||!email)return;
 button.textContent='Forgot / Change Password (Email Recovery)';
 email.value=ADMIN;
 email.readOnly=true;
 if(button.dataset.nativeRecovery==='1')return;
 button.dataset.nativeRecovery='1';
 button.onclick=()=>{box.classList.toggle('hidden');if(!box.classList.contains('hidden')){email.value=ADMIN;const msg=document.getElementById('resetMsg');if(msg)msg.textContent='A secure password recovery link will be sent to the registered Owner Admin email.'}};
}
function run(){injectAdminRecovery();setTimeout(injectAdminRecovery,250);setTimeout(injectAdminRecovery,800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
new MutationObserver(injectAdminRecovery).observe(document.documentElement,{childList:true,subtree:true});
})();