(function(){
'use strict';
document.addEventListener('submit',async function(e){
  if(!e.target||e.target.id!=='loginForm') return;
  e.preventDefault(); e.stopImmediatePropagation();
  const form=e.target, btn=form.querySelector('button'), out=document.getElementById('loginMsg');
  if(out){out.className='msg';out.textContent='Logging in...';}
  if(btn)btn.disabled=true;
  try{
    const f=new FormData(form),email=String(f.get('email')||'').trim().toLowerCase(),password=String(f.get('password')||'');
    if(!email||!password) throw new Error('Email and password are required.');
    const client=window.sb;
    if(!client||!client.auth) throw new Error('Login system is not loaded. Please refresh the page.');
    const r=await client.auth.signInWithPassword({email,password});
    if(r.error) throw new Error(r.error.message);
    if(out){out.className='msg success';out.textContent='Login successful. Opening HR Portal...';}
    if(typeof window.portal==='function') await window.portal();
    else location.reload();
  }catch(err){
    if(out){out.className='msg danger';out.textContent=err?.message||'Login failed. Please check email and password.';}
  }finally{if(btn)btn.disabled=false;}
},true);
})();