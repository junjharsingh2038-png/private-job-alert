(function(){'use strict';
function slug(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'job'}
function makeUrl(j){const id=String(j&&j.id||'');if(!id)return new URL('jobs/view.html',location.origin+'/private-job-alert/').href;return new URL('jobs/'+slug(j.title||'job')+'-'+slug(j.company||'job')+'-'+id.slice(0,8)+'/',location.origin+'/private-job-alert/').href}
function getJob(card){const b=card.querySelector('.apply[onclick]');if(!b)return null;const s=b.getAttribute('onclick')||'',a=s.indexOf('openApply('),z=s.lastIndexOf(')');if(a<0||z<0)return null;try{return JSON.parse(s.slice(a+10,z).replace(/&#39;/g,"'"))}catch(e){return null}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function copy(url){try{await navigator.clipboard.writeText(url);return true}catch(e){try{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return true}catch(x){return false}}}
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}}
function wrap(c,text,x,y,maxWidth,lineHeight,maxLines,font,color){c.font=font;c.fillStyle=color;let line='',lines=[];for(const word of String(text||'').split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}lines.forEach((t,i)=>c.fillText(t,x,y+i*lineHeight));return y+lines.length*lineHeight}
async function posterBlob(j){
 const W=1080,H=1350,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');
 const company=String(j.company||j.company_name||'Hiring Company'),title=String(j.title||'Job Vacancy'),loc=[j.city,j.state].filter(Boolean).join(', ')||j.location||'India',salary=String(j.salary||'As per company'),qual=String(j.qualification||'Not specified'),type=String(j.job_type||j.type||'Full Time'),exp=String(j.experience||'Not specified'),desc=String(j.description||'');
 const navy='#082d59',blue='#1264bd',orange='#ff8b2b',ink='#183653';
 const box=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}};
 const txt=(v,x,y,size,color,weight='700',align='left')=>{c.font=weight+' '+size+'px Arial';c.fillStyle=color;c.textAlign=align;c.fillText(String(v),x,y);c.textAlign='left'};
 const lines=(v,x,y,max,size,color,n=2)=>{c.font='700 '+size+'px Arial';let arr=[],line='';for(const w of String(v||'').split(/\s+/)){const t=line?line+' '+w:w;if(c.measureText(t).width>max&&line){arr.push(line);line=w}else line=t}if(line)arr.push(line);arr=arr.slice(0,n);if(arr.length===n&&c.measureText(arr[n-1]).width>max){while(arr[n-1].length&&c.measureText(arr[n-1]+'…').width>max)arr[n-1]=arr[n-1].slice(0,-1);arr[n-1]+='…'}arr.forEach((v,i)=>txt(v,x,y+i*(size+13),size,color));return y+arr.length*(size+13)};
 c.fillStyle='#f1f5fa';c.fillRect(0,0,W,H);
 const grad=c.createLinearGradient(0,0,W,600);grad.addColorStop(0,navy);grad.addColorStop(.7,blue);grad.addColorStop(1,'#17477d');c.fillStyle=grad;c.fillRect(0,0,W,610);
 c.fillStyle='rgba(255,255,255,.07)';c.beginPath();c.arc(1010,100,270,0,Math.PI*2);c.fill();c.beginPath();c.arc(0,550,210,0,Math.PI*2);c.fill();
 // brand strip and real company identity
 box(52,42,976,112,22,'rgba(255,255,255,.13)','rgba(255,255,255,.25)');
 box(76,62,72,72,16,'#fff');let logoOK=false;const logoUrl=String(j.company_logo||j.logo_url||'');
 if(logoUrl){try{const logo=await new Promise((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=reject;im.src=logoUrl});c.save();c.beginPath();c.roundRect(82,68,60,60,12);c.clip();c.drawImage(logo,82,68,60,60);c.restore();logoOK=true}catch(err){}}
 if(!logoOK){const initials=company.split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase()||'CO';txt(initials,112,109,25,navy,'700','center')}
 txt('PRIVATE JOB ALERT',174,101,37,'#fff');txt('INDIA-WIDE PRIVATE JOB OPPORTUNITIES',176,130,15,'#dceaff');
 box(52,180,976,82,16,orange);txt('WE ARE HIRING',540,235,39,navy,'800','center');
 txt('JOIN OUR TEAM',80,318,18,'#ffcf9f','800');
 let y=lines(title,78,395,900,65,'#fff',2);y=lines(company,82,y+12,880,29,'#e4efff',1);
 box(52,520,976,630,28,'#fff','#dce6f1');txt('JOB OVERVIEW',88,580,25,blue);
 const data=[['LOCATION',loc],['SALARY',salary],['QUALIFICATION',qual],['JOB TYPE',type],['EXPERIENCE',exp]];
 const coords=[[82,615],[562,615],[82,790],[562,790],[82,965]];
 data.forEach(([label,value],i)=>{const [x,top]=coords[i];box(x,top,436,145,18,'#f3f7fc','#e4ebf4');box(x+18,top+22,7,100,4,orange);txt(label,x+44,top+53,17,blue);lines(value,x+44,top+94,350,26,ink,2)});
 if(desc){txt('ABOUT THIS ROLE',82,1140,15,blue);lines(desc,82,1174,900,19,'#50647c',2)}
 box(72,1195,936,94,18,navy);txt('APPLY NOW',540,1240,34,'#ffbd6b','800','center');txt('Open the job details link to apply',540,1270,17,'#fff','600','center');
 txt('PRIVATE JOB ALERT  •  VERIFY DETAILS WITH THE EMPLOYER',540,1324,15,'#52647b','700','center');
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