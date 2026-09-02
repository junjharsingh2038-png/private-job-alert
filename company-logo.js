(function(){'use strict';
function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function domain(name){let n=String(name||'').toLowerCase().trim().replace(/\b(pvt|private|limited|ltd|llp|inc|india|company|corporation|corp)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);return n.length?n.join('')+'.com':''}
function initials(name){return String(name||'Company').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'CO'}
function logo(name){const d=domain(name);return d?'https://www.google.com/s2/favicons?domain='+encodeURIComponent(d)+'&sz=128':''}
function make(name){const n=esc(name||'Company'),u=logo(name);return '<span class="company-logo" title="'+n+'"><img src="'+u+'" alt="'+n+' logo" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"/><span class="company-logo-fallback">'+initials(name)+'</span></span>'}
function apply(){
 document.querySelectorAll('.job,.job-card,.ep-job,.application-card').forEach(card=>{
  if(card.querySelector('.company-logo'))return;
  let el=card.querySelector('.company,.company-name');
  if(!el){const h=card.querySelector('h3');if(h&&h.nextElementSibling&&h.nextElementSibling.tagName==='B')el=h.nextElementSibling}
  if(!el)return;
  const name=el.textContent.trim();if(!name)return;
  el.insertAdjacentHTML('afterbegin',make(name));
 });
}
window.PJACompanyLogo={make,apply};
function start(){apply();setTimeout(apply,500);setTimeout(apply,1500);setTimeout(apply,3000);new MutationObserver(apply).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
