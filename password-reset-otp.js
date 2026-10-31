(function(){'use strict';
const URL='https://rlidcatrwonemshwzafp.supabase.co/functions/v1/password-reset-otp';
const ADMIN='junjharsingh740@gmail.com';
async function call(body){const r=await fetch(URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body)});let d={};try{d=await r.json()}catch(e){}if(!r.ok||!d.ok)throw new Error(d.error||'Request failed ('+r.status+')');return d}
function build(host,emailValue,admin){if(!host||host.dataset.otpReady==='1')return;host.dataset.otpReady='1';host.innerHTML=`
<form class="form otp-reset-form" novalidate>
<label class="otp-email-label">Registered Email<input class="otp-email" type="email" autocomplete="email" ${admin?'readonly':''} required></label>
<p class="otp-admin-note" style="display:none">OTP will be sent to the registered Owner Admin email.</p>
<button type="button" class="otp-send">Send 6 Digit OTP</button>
<label>6-Digit OTP<input class="otp-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required></label>
<label>New Password<input class="otp-pass" type="password" minlength="6" autocomplete="new-password" required></label>
<label>Confirm New Password<input class="otp-confirm" type="password" minlength="6" autocomplete="new-password" required></label>
<button type="submit" class="otp-verify">Verify OTP & Change Password</button>
<p class="msg otp-msg" role="status" aria-live="polite"></p>
</form>`;
const q=s=>host.querySelector(s),mail=q('.otp-email'),msg=q('.otp-msg');mail.value=admin?ADMIN:(emailValue||'');if(admin){q('.otp-email-label').style.display='none';q('.otp-admin-note').style.display='block'}
q('.otp-send').onclick=async()=>{const email=String(mail.value||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){msg.textContent='Please enter a valid registered email.';msg.className='msg otp-msg danger';return}q('.otp-send').disabled=true;msg.textContent='Sending OTP...';try{await call({action:'send',email});msg.textContent='6-digit OTP sent. Check Inbox and Spam folder. OTP is valid for 10 minutes.';msg.className='msg otp-msg success'}catch(e){msg.textContent=e.message;msg.className='msg otp-msg danger'}finally{q('.otp-send').disabled=false}};
q('.otp-reset-form').onsubmit=async e=>{e.preventDefault();const email=String(mail.value||'').trim().toLowerCase(),otp=q('.otp-code').value.trim(),password=q('.otp-pass').value,confirm=q('.otp-confirm').value;if(password.length<6){msg.textContent='Password must be at least 6 characters.';return}if(password!==confirm){msg.textContent='New passwords do not match.';return}q('.otp-verify').disabled=true;msg.textContent='Verifying OTP...';try{await call({action:'verify',email,otp,password});msg.textContent='Password changed successfully. You can now login with the new password.';msg.className='msg otp-msg success';q('.otp-reset-form').reset();mail.value=admin?ADMIN:email}catch(e){msg.textContent=e.message;msg.className='msg otp-msg danger'}finally{q('.otp-verify').disabled=false}};
}
function wire(buttonId,boxId,formId,admin){const b=document.getElementById(buttonId),box=document.getElementById(boxId);if(!b||!box)return;if(b.dataset.otpButton!=='1'){b.dataset.otpButton='1';b.textContent='Forgot / Reset Password with 6-Digit OTP';b.onclick=()=>{box.classList.toggle('hidden');if(!box.classList.contains('hidden')){const old=document.getElementById(formId),v=admin?ADMIN:(old?.querySelector('input[name="email"]')?.value||'');build(box,v,admin)}}}if(!box.classList.contains('hidden'))build(box,admin?ADMIN:'',admin)}
function run(){const p=location.pathname.split('/').pop().toLowerCase();if(p==='admin.html')wire('forgot','forgotBox','resetForm',true);if(p==='hr.html')wire('hrForgotBtn','hrForgotBox','hrForgotForm',false);if(p==='seeker.html')wire('forgotBtn','forgotBox','forgotForm',false)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
})();