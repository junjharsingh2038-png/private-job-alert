(function(){'use strict';
function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function domain(name){let n=String(name||'').toLowerCase().trim().replace(/\b(pvt|private|limited|ltd|llp|inc|india|company|corporation|corp)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);if(!n.length)return'';return n.join('')+'.com'}
function initials(name){return String(name||'C').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'C'}
function logo(name){const d=domain(name);return d?'https://www.google.com/s2/favicons?domain='+encodeURIComponent(d)+'&sz=128':''}
function make(name){const n=esc(name||'Company');const u=logo(name);return '<span class="company-logo" title="'+n+'"><img src="'+u+'" alt="'+n+' logo" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"/><span class="company-logo-fallback">'+initials(name)+'</span></span>'}
function apply(){document.querySelectorAll('.job-card,.ep-job,.application-card').forEach(card=>{if(card.querySelector('.company-logo'))return;let el=card.querySelector('.company,.company-name,[class*=company]');if(!el)return;let name=el.textContent.trim();if(!name)return;el.insertAdjacentHTML('afterbegin',make(name));});}
window.PJACompanyLogo={make,apply};
new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
window.addEventListener('load',()=>{apply();setTimeout(apply,800);setTimeout(apply,2000)});
})();
