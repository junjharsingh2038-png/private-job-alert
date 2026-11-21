(function(){'use strict';
function slug(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'job'}
function makeUrl(j){const id=String(j&&j.id||'');if(!id)return new URL('jobs/view.html',location.origin+'/private-job-alert/').href;return new URL('jobs/'+slug(j.title||'job')+'-'+slug(j.company||'job')+'-'+id.slice(0,8)+'/',location.origin+'/private-job-alert/').href}
function getJob(card){const b=card.querySelector('.apply[onclick]');if(!b)return null;const s=b.getAttribute('onclick')||'',a=s.indexOf('openApply('),z=s.lastIndexOf(')');if(a<0||z<0)return null;try{return JSON.parse(s.slice(a+10,z).replace(/&#39;/g,"'"))}catch(e){return null}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function copy(url){try{await navigator.clipboard.writeText(url);return true}catch(e){try{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return true}catch(x){return false}}}
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}}
function wrap(c,text,x,y,maxWidth,lineHeight,maxLines,font,color){c.font=font;c.fillStyle=color;let line='',lines=[];for(const word of String(text||'').split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}lines.forEach((t,i)=>c.fillText(t,x,y+i*lineHeight));return y+lines.length*lineHeight}
async function posterBlob(j){
 const W=1080,H=1350,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 const c=canvas.getContext('2d');
 const company=String(j.company||j.company_name||'Hiring Company');
 const title=String(j.title||'Job Vacancy');
 const loc=[j.city,j.state].filter(Boolean).join(', ')||j.location||'All India';
 const salary=String(j.salary||'As per company');
 const qual=String(j.qualification||'Not specified');
 const type=String(j.job_type||j.type||'Full Time');
 const exp=String(j.experience||'Not specified');
 const desc=String(j.description||'Explore this opportunity and apply through Private Job Alert.');
 const vacancies=String(j.vacancies||'Multiple');
 const navy='#082e65',blue='#0758b8',orange='#ff7900',ink='#0b2852';
 const rounded=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}};
 const text=(v,x,y,size,color,weight='700',align='left')=>{c.font=weight+' '+size+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(String(v),x,y);c.textAlign='left'};
 const wrap=(value,x,y,maxWidth,size,color,weight='700',maxLines=2,align='left',lineGap=1.24)=>{
   let font=size,lines=[];
   const makeLines=()=>{c.font=weight+' '+font+'px Arial,sans-serif';let line='';const out=[];for(const word of String(value||'').split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){out.push(line);line=word}else line=test}if(line)out.push(line);return out};
   lines=makeLines();while(lines.length>maxLines&&font>15){font-=2;lines=makeLines()}
   if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];c.font=weight+' '+font+'px Arial,sans-serif';while(last.length&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}
   c.font=weight+' '+font+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;
   lines.forEach((line,i)=>c.fillText(line,x,y+i*font*lineGap));c.textAlign='left';
   return y+lines.length*font*lineGap;
 };
 const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#eaf4ff');bg.addColorStop(.5,'#fff');bg.addColorStop(1,'#e2f0fc');c.fillStyle=bg;c.fillRect(0,0,W,H);
 // Brand header
 rounded(38,34,1004,112,22,'#fff','#d4e4f4');rounded(62,55,72,72,17,navy);
 text('PJA',98,101,25,'#fff','800','center');
 text('PRIVATE JOB ALERT',158,91,38,navy,'800');text('ALL INDIA PRIVATE JOBS',161,122,17,'#667a91','700');
 text('INDIA’S TRUSTED PRIVATE JOB PORTAL',1007,103,18,navy,'700','right');
 // Decorative side shapes, kept behind content
 c.fillStyle=navy;c.beginPath();c.moveTo(0,170);c.lineTo(210,170);c.bezierCurveTo(120,330,145,490,235,600);c.lineTo(0,600);c.closePath();c.fill();
 c.fillStyle=blue;c.beginPath();c.moveTo(W,170);c.lineTo(940,170);c.bezierCurveTo(1015,330,1000,475,900,600);c.lineTo(W,600);c.closePath();c.fill();
 c.strokeStyle=orange;c.lineWidth=18;c.beginPath();c.arc(1005,330,130,Math.PI*.55,Math.PI*1.48);c.stroke();
 // Company panel
 rounded(60,178,345,112,18,'#fff','#d8e6f4');
 if(/genus/i.test(company)){text('G',92,253,70,blue,'800');text('e',142,253,70,orange,'800');text('nus',180,253,70,blue,'800');text('POWER INFRASTRUCTURES',95,278,14,navy,'700')}
 else{wrap(company,82,224,300,28,navy,'800',2,'left',1.15)}
 // Hiring and job title: centered, wrapped and never allowed to overflow
 rounded(490,180,480,82,18,navy);text('WE ARE HIRING',730,237,42,'#fff','800','center');
 wrap(title,730,335,500,54,orange,'800',2,'center',1.12);
 wrap(company,730,420,500,27,navy,'700',2,'center',1.15);
 // Technician / job image panel; use employer-supplied image only, otherwise clean vector illustration
 rounded(55,315,370,525,24,'#d9edfb');
 let loaded=false;const photoUrl=String(j.poster_photo_url||j.technician_photo||'').trim();
 if(photoUrl){try{const im=await new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=photoUrl});c.save();c.beginPath();c.roundRect(70,330,340,495,18);c.clip();const scale=Math.max(340/im.width,495/im.height),iw=im.width*scale,ih=im.height*scale;c.drawImage(im,70+(340-iw)/2,330+(495-ih)/2,iw,ih);c.restore();loaded=true}catch(e){}}
 if(!loaded){
   const pg=c.createLinearGradient(70,330,410,825);pg.addColorStop(0,'#d9efff');pg.addColorStop(1,'#8fc3e9');rounded(70,330,340,495,18,pg);
   // Safety helmet and professional technician illustration
   c.fillStyle=navy;c.beginPath();c.arc(240,485,91,0,Math.PI*2);c.fill();
   c.fillStyle='#f0c39e';c.beginPath();c.arc(240,493,64,0,Math.PI*2);c.fill();
   c.fillStyle=orange;c.beginPath();c.arc(240,445,75,Math.PI,Math.PI*2);c.lineTo(315,453);c.lineTo(165,453);c.closePath();c.fill();
   rounded(165,430,150,19,9,'#ffdc28');
   rounded(130,585,220,195,48,navy);
   rounded(205,585,70,110,18,blue);
   text('FIELD TECHNICIAN',240,810,19,navy,'800','center');
 }
 // Four information columns
 const facts=[['⌖','LOCATION',loc],['♟','VACANCIES',vacancies],['◆','QUALIFICATION',qual],['₹','SALARY',salary]];
 const fx=450,fw=560,col=140;
 facts.forEach((f,i)=>{const x=fx+i*col;if(i){c.strokeStyle='#a9bfd8';c.lineWidth=2;c.setLineDash([7,7]);c.beginPath();c.moveTo(x,520);c.lineTo(x,675);c.stroke();c.setLineDash([])}text(f[0],x+col/2,558,34,i===1?orange:blue,'800','center');text(f[1],x+col/2,595,15,ink,'700','center');wrap(f[2],x+col/2,632,col-14,17,ink,'800',2,'center',1.2)});
 c.setLineDash([9,7]);c.strokeStyle='#7899bd';c.beginPath();c.moveTo(455,710);c.lineTo(1010,710);c.stroke();c.setLineDash([]);
 rounded(570,745,365,74,16,orange);text('APPLY NOW  →',752,794,32,'#fff','800','center');
 // Details panel with fixed columns and bounded text
 rounded(38,885,1004,340,24,navy);text('JOB DETAILS',78,948,28,'#ffb35c','800');
 text('EXPERIENCE',80,1005,17,'#d8e9ff','700');wrap(exp,80,1045,250,22,'#fff','800',2,'left',1.2);
 text('JOB TYPE',390,1005,17,'#d8e9ff','700');wrap(type,390,1045,250,22,'#fff','800',2,'left',1.2);
 text('ABOUT THE ROLE',700,1005,17,'#d8e9ff','700');wrap(desc,700,1045,290,18,'#fff','600',5,'left',1.45);
 text('PRIVATE JOB ALERT  •  VERIFY DETAILS WITH THE EMPLOYER',540,1290,17,'#52677f','700','center');
 return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Poster image export failed')),'image/png'));
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