(function(){'use strict';
function slug(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'job'}
function makeUrl(j){return new URL('jobs/view.html?id='+encodeURIComponent(String(j.id||'')),location.origin+'/private-job-alert/').href}
function getJob(card){const b=card.querySelector('.apply[onclick]');if(!b)return null;const s=b.getAttribute('onclick')||'',a=s.indexOf('openApply('),z=s.lastIndexOf(')');if(a<0||z<0)return null;try{return JSON.parse(s.slice(a+10,z).replace(/&#39;/g,"'"))}catch(e){return null}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function copy(url){try{await navigator.clipboard.writeText(url);return true}catch(e){try{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return true}catch(x){return false}}}
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}}
function wrap(c,text,x,y,maxWidth,lineHeight,maxLines,font,color){c.font=font;c.fillStyle=color;let line='',lines=[];for(const word of String(text||'').split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}lines.forEach((t,i)=>c.fillText(t,x,y+i*lineHeight));return y+lines.length*lineHeight}
async function posterBlob(j){
 const W=1080,H=1350,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');
 const company=String(j.company||j.company_name||'Hiring Company'),title=String(j.title||'Job Vacancy'),loc=[j.city,j.state].filter(Boolean).join(', ')||j.location||'India',salary=String(j.salary||'As per company'),qual=String(j.qualification||'Any qualification'),type=String(j.job_type||j.type||'Full Time'),exp=String(j.experience||'Not specified'),desc=String(j.description||'');
 const navy='#062b59',blue='#1055a4',gold='#ffc400',ink='#10294b';
 const rr=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}};
 const text=(t,x,y,font,color,align='left')=>{c.font=font;c.fillStyle=color;c.textAlign=align;c.fillText(String(t),x,y);c.textAlign='left'};
 const fit=(t,max,font)=>{let size=font;while(size>28){c.font='bold '+size+'px Arial';if(c.measureText(t).width<=max)break;size-=2}return size};
 const wrap=(t,x,y,max,fs,color,maxLines=2)=>{const words=String(t||'').split(/\s+/);let lines=[],line='';c.font='bold '+fs+'px Arial';for(const w of words){const test=line?line+' '+w:w;if(c.measureText(test).width>max&&line){lines.push(line);line=w}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let z=lines[maxLines-1];while(z&&c.measureText(z+'…').width>max)z=z.slice(0,-1);lines[maxLines-1]=z+'…'}lines.forEach((v,i)=>text(v,x,y+i*(fs+13),'bold '+fs+'px Arial',color));return y+lines.length*(fs+13)};
 c.fillStyle='#edf3fa';c.fillRect(0,0,W,H);
 const g=c.createLinearGradient(0,0,W,570);g.addColorStop(0,navy);g.addColorStop(.72,blue);g.addColorStop(1,'#0b3972');c.fillStyle=g;c.fillRect(0,0,W,560);
 c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.arc(1010,90,260,0,Math.PI*2);c.fill();c.beginPath();c.arc(40,480,180,0,Math.PI*2);c.fill();
 // Brand and announcement ribbon
 rr(58,48,964,94,22,'rgba(255,255,255,.12)','rgba(255,255,255,.25)');
 text('PRIVATE JOB ALERT',88,108,'bold 37px Arial','#fff');
 text('INDIA  •  LATEST PRIVATE JOBS',88,128,'bold 15px Arial','#dceaff');
 rr(58,174,964,86,18,gold);
 text('JOB VACANCY  /  WE ARE HIRING',540,231,'bold 37px Arial',navy,'center');
 // Main job heading
 const titleSize=fit(title,900,68);
 let y=wrap(title,76,355,920,titleSize,'#fff',2);
 y=wrap(company,80,y+17,900,30,'#dceaff',1);
 // decorative interview/office motif
 rr(830,385,190,112,18,'rgba(255,255,255,.13)','rgba(255,255,255,.25)');
 text('OPEN',925,428,'bold 23px Arial',gold,'center');
 text('POSITION',925,462,'bold 26px Arial','#fff','center');
 // Detail card
 rr(48,535,984,580,30,'#fff','#d8e3f0');
 text('JOB DETAILS',88,594,'bold 27px Arial',blue);
 const fields=[['LOCATION',loc],['SALARY',salary],['QUALIFICATION',qual],['JOB TYPE',type],['EXPERIENCE',exp]];
 const positions=[[82,628],[562,628],[82,795],[562,795],[82,962]];
 fields.forEach(([label,value],i)=>{const [x,top]=positions[i];rr(x,top,430,142,17,'#f0f5fb','#e0e9f4');rr(x+17,top+20,8,102,4,gold);text(label,x+42,top+49,'bold 18px Arial',blue);wrap(value,x+42,top+91,355,27,ink,2)});
 // Bottom CTA and caution
 rr(78,1145,924,100,18,navy);
 text('APPLY NOW',540,1190,'bold 34px Arial',gold,'center');
 text('Open the job link to read full details and submit your application',540,1222,'bold 18px Arial','#fff','center');
 text('PRIVATE JOB ALERT  •  VERIFY JOB DETAILS BEFORE APPLYING',540,1302,'bold 17px Arial','#52647b','center');
 return await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
}
function ensureModal(html){
 let modal=document.getElementById('pjaShareOverlay');if(!modal){modal=document.createElement('div');modal.id='pjaShareOverlay';modal.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(9,25,48,.68);display:flex;align-items:center;justify-content:center;padding:12px;';document.body.appendChild(modal)}
 modal.innerHTML=html;modal.style.display='flex';return modal;
}
function share(j){
 const url=makeUrl(j),title=j.title||'Private Job',company=j.company||j.company_name||'',loc=[j.city,j.state].filter(Boolean).join(', ')||j.location||'India';
 const caption=title+' | '+company+'\nLocation: '+loc+'\nApply / Details: '+url;
 const html='<div class="pja-share-modal"><button class="pja-share-close" id="pjaShareClose" aria-label="Close">×</button><div class="pja-share-head"><div class="pja-share-icon">↗</div><div><h2>Professional Job Poster</h2><p>Instagram • Facebook • WhatsApp</p></div></div><div class="pja-share-job"><strong>'+esc(title)+'</strong><span>'+esc(company)+'</span></div><div id="pjaPosterPreview" class="pja-poster-preview">Poster is being generated…</div><div class="pja-share-options"><button class="pja-share-option whatsapp" id="pjaSharePoster"><b>Share Poster</b><small>Open phone share menu for supported apps</small></button><button class="pja-share-option copy" id="pjaDownloadPoster"><b>Download PNG</b><small>1080 × 1350 high-quality image</small></button><button class="pja-share-option telegram" id="pjaWhatsAppLink"><b>WhatsApp Job Link</b><small>Send job details and apply link</small></button><button class="pja-share-option copy" id="pjaCopyLink"><b>Copy Job Link</b><small>Copy the unique job page</small></button></div><div class="pja-share-url">'+esc(url)+'</div></div>';
 let modal;
 if(typeof openModal==='function'&&document.getElementById('modalContent')){openModal(html);modal=document.getElementById('modalContent')}else{modal=ensureModal(html)}
 const close=()=>{if(modal.id==='modalContent'&&typeof closeModal==='function')closeModal();else{const o=document.getElementById('pjaShareOverlay');if(o)o.style.display='none'}};
 modal.querySelector('#pjaShareClose').onclick=close;
 let blob=null,objectUrl='';
 posterBlob(j).then(b=>{blob=b;if(!b)return;objectUrl=URL.createObjectURL(b);const img=document.createElement('img');img.alt='Professional job poster for '+title;img.src=objectUrl;const box=modal.querySelector('#pjaPosterPreview');if(box){box.innerHTML='';box.appendChild(img)}}).catch(()=>{const box=modal.querySelector('#pjaPosterPreview');if(box)box.textContent='Poster could not be generated. Please try again.'});
 const download=()=>{if(!blob){alert('Poster is still being prepared.');return}const a=document.createElement('a');a.href=objectUrl||URL.createObjectURL(blob);a.download=slug(title)+'-private-job-alert.png';a.click()};
 modal.querySelector('#pjaDownloadPoster').onclick=download;
 modal.querySelector('#pjaSharePoster').onclick=async()=>{if(!blob){alert('Poster is still being prepared.');return}const file=new File([blob],slug(title)+'-job-poster.png',{type:'image/png'});try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title,text:caption})}else{download();window.open('https://wa.me/?text='+encodeURIComponent(caption),'_blank','noopener');alert('Poster downloaded. Attach the PNG image in WhatsApp, Facebook or Instagram.')}}catch(e){if(e.name!=='AbortError')alert('Sharing was not completed. Download the poster and attach it in your social app.')}}
 modal.querySelector('#pjaWhatsAppLink').onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent(caption),'_blank','noopener');
 modal.querySelector('#pjaCopyLink').onclick=async()=>{const ok=await copy(url);modal.querySelector('#pjaCopyLink b').textContent=ok?'✓ Link Copied':'Copy Failed'};
}
function wire(card){const j=getJob(card);if(!j||!j.id)return;card.querySelectorAll('[data-job-share]').forEach(b=>{if(b.dataset.shareWired)return;b.dataset.shareWired='1';b.onclick=e=>{e.preventDefault();e.stopPropagation();share(j)}});card.querySelectorAll('[data-job-copy]').forEach(b=>{if(b.dataset.copyWired)return;b.dataset.copyWired='1';b.onclick=async e=>{e.preventDefault();e.stopPropagation();const ok=await copy(makeUrl(j));const old=b.textContent;b.textContent=ok?'✓ Copied':'Copy Link';setTimeout(()=>b.textContent=old,1400)}})}
function add(){document.querySelectorAll('.nk-job-card,.job').forEach(wire)}
window.PJAJobShare={share,add,makeUrl,posterBlob};
function start(){add();setTimeout(add,300);setTimeout(add,1000);setTimeout(add,2500);if(document.body)new MutationObserver(add).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();