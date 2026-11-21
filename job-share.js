(function(){'use strict';
function slug(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'job'}
function makeUrl(j){const id=String(j&&j.id||'');if(!id)return new URL('jobs/view.html',location.origin+'/private-job-alert/').href;return new URL('jobs/'+slug(j.title||'job')+'-'+slug(j.company||'job')+'-'+id.slice(0,8)+'/',location.origin+'/private-job-alert/').href}
function getJob(card){const b=card.querySelector('.apply[onclick]');if(!b)return null;const s=b.getAttribute('onclick')||'',a=s.indexOf('openApply('),z=s.lastIndexOf(')');if(a<0||z<0)return null;try{return JSON.parse(s.slice(a+10,z).replace(/&#39;/g,"'"))}catch(e){return null}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function copy(url){try{await navigator.clipboard.writeText(url);return true}catch(e){try{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return true}catch(x){return false}}}
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}}
function wrap(c,text,x,y,maxWidth,lineHeight,maxLines,font,color){c.font=font;c.fillStyle=color;let line='',lines=[];for(const word of String(text||'').split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}lines.forEach((t,i)=>c.fillText(t,x,y+i*lineHeight));return y+lines.length*lineHeight}
async function posterBlob(j){
 const W=1080,H=1182,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 const c=canvas.getContext('2d');
 const company=String(j.company||j.company_name||'Hiring Company');
 const title=String(j.title||'Job Vacancy');
 const loc=[j.city,j.state].filter(Boolean).join(', ')||j.location||'All India';
 const salary=String(j.salary||'As per company');
 const qual=String(j.qualification||'Not specified');
 const exp=String(j.experience||'Not specified');
 const vacancies=String(j.vacancies||j.openings||'As per requirement');
 const jobUrl=makeUrl(j),navy='#07366e',blue='#0758a7',orange='#ff7900',ink='#111827';
 const responsibilities=Array.isArray(j.responsibilities)?j.responsibilities:(String(j.description||'').replace(/<[^>]*>/g,' ').split(/[.\n•]+/).map(x=>x.trim()).filter(x=>x.length>12).slice(0,4));
 const benefits=Array.isArray(j.benefits)?j.benefits:(typeof j.benefits==='string'?j.benefits.split(/[\n•]+/).map(x=>x.trim()).filter(Boolean):[]);
 const round=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}};
 const text=(v,x,y,size,color,weight='700',align='left')=>{c.font=weight+' '+size+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(String(v),x,y);c.textAlign='left'};
 const fit=(value,x,y,maxWidth,size,color,weight='700',maxLines=2,align='left')=>{
  let font=size,lines=[];const split=()=>{c.font=weight+' '+font+'px Arial,sans-serif';let line='';const out=[];for(const word of String(value||'').split(/\s+/)){const t=line?line+' '+word:word;if(c.measureText(t).width>maxWidth&&line){out.push(line);line=word}else line=t}if(line)out.push(line);return out};
  lines=split();while(lines.length>maxLines&&font>14){font-=2;lines=split()}if(lines.length>maxLines){lines=lines.slice(0,maxLines);c.font=weight+' '+font+'px Arial,sans-serif';let s=lines[maxLines-1];while(s.length&&c.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);lines[maxLines-1]=s+'…'}
  c.font=weight+' '+font+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;lines.forEach((s,i)=>c.fillText(s,x,y+i*font*1.13));c.textAlign='left';
 };
 // White and pale-blue base
 const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#f5faff');bg.addColorStop(.5,'#fff');bg.addColorStop(1,'#e8f3ff');c.fillStyle=bg;c.fillRect(0,0,W,H);
 // Exact sample-style header
 c.fillStyle='#fff';c.fillRect(0,0,W,130);
 c.strokeStyle=orange;c.lineWidth=9;c.beginPath();c.arc(100,63,48,.15,Math.PI*1.9);c.stroke();
 c.fillStyle=navy;c.beginPath();c.arc(82,53,12,0,Math.PI*2);c.arc(101,43,13,0,Math.PI*2);c.arc(120,53,12,0,Math.PI*2);c.fill();
 c.fillStyle=navy;c.beginPath();c.arc(100,81,25,Math.PI,0);c.fill();
 text('Private',168,69,51,navy,'800');text('Job',350,69,51,orange,'800');text('Alert',443,69,51,navy,'800');
 text('LATEST JOBS • RIGHT OPPORTUNITIES • BRIGHT FUTURE',171,99,16,'#111','700');
 c.fillStyle=navy;c.beginPath();c.moveTo(740,0);c.lineTo(1080,0);c.lineTo(1080,130);c.lineTo(670,130);c.closePath();c.fill();
 c.strokeStyle=orange;c.lineWidth=5;c.beginPath();c.moveTo(735,0);c.lineTo(670,130);c.moveTo(750,0);c.lineTo(685,130);c.stroke();
 text('Private & MNC Jobs',900,43,30,'#fff','800','center');c.fillStyle='#ffd52b';c.beginPath();c.moveTo(770,58);c.lineTo(1040,58);c.lineTo(1018,106);c.lineTo(748,106);c.closePath();c.fill();
 text('All India Hiring',895,91,27,'#111','800','center');
 // Main hero: use the actual people photo crop from the approved sample
 const photo=new Image();
 photo.crossOrigin='anonymous';
 photo.src=new URL('team-poster.jpg?v=employee-photo-20261121',document.baseURI).href;
 try{if(photo.decode) await photo.decode();else await new Promise((resolve,reject)=>{photo.onload=resolve;photo.onerror=reject})}catch(e){}
 if(photo.naturalWidth>0){
   c.save();c.beginPath();c.rect(0,132,520,350);c.clip();
   const scale=Math.max(520/photo.naturalWidth,350/photo.naturalHeight);
   const pw=photo.naturalWidth*scale,ph=photo.naturalHeight*scale;
   c.drawImage(photo,(520-pw)/2,132+(350-ph)/2,pw,ph);c.restore();
 }else{
   c.fillStyle='#dcecf8';c.fillRect(0,132,520,350);
   text('TEAM PHOTO',260,310,30,navy,'800','center');
 }
 // Right hero area with hiring headline and job title
 c.fillStyle='#fff';c.fillRect(520,132,560,350);
 round(570,151,475,74,18,navy);text('WE ARE HIRING',807,204,40,'#fff','800','center');
 // Megaphone illustration
 c.save();c.translate(540,208);c.rotate(-.25);c.fillStyle='#ffcf24';c.beginPath();c.moveTo(0,-24);c.lineTo(80,-47);c.lineTo(80,25);c.lineTo(0,4);c.closePath();c.fill();c.strokeStyle='#f04438';c.lineWidth=8;c.stroke();c.fillStyle='#f04438';c.fillRect(8,4,18,42);c.beginPath();c.ellipse(80,-11,10,37,0,0,Math.PI*2);c.stroke();c.restore();
 round(520,298,560,77,0,blue);fit(title,800,350,520,44,'#fff','800',2,'center');
 // Company row
 text('▦',545,427,34,blue,'800');fit('Company: '+company,588,421,470,27,navy,'800',1);
 // Left-side facts and right-side panels
 const facts=[['♟','Vacancy',vacancies],['₹','Salary',salary],['●','Location',loc],['◆','Qualification',qual],['▣','Experience',exp]];
 const ys=[548,618,688,758,828];
 facts.forEach((f,i)=>{const y=ys[i];text(f[0],40,y+2,35,blue,'800');text(f[1]+':',112,y,24,'#111','800');fit(f[2],245,y,360,22,'#111','700',1);c.strokeStyle='#d6e3ef';c.lineWidth=2;c.beginPath();c.moveTo(112,y+18);c.lineTo(600,y+18);c.stroke()});
 c.strokeStyle='#9bb2ca';c.lineWidth=2;c.beginPath();c.moveTo(620,515);c.lineTo(620,850);c.stroke();
 round(652,515,408,230,20,'#fff','#d7e3ef');round(670,515,350,47,16,blue);text('Key Responsibilities',845,547,24,'#fff','800','center');
 const resp=responsibilities.length?responsibilities:['See full job description online'];
 resp.slice(0,4).forEach((line,i)=>{const y=592+i*38;c.fillStyle='#20b64b';c.beginPath();c.arc(688,y-6,11,0,Math.PI*2);c.fill();text('✓',688,y,15,'#fff','800','center');fit(line,712,y,325,18,'#111','600',1)});
 round(652,765,408,128,20,'#e1f4e2');text('♔  Benefits',690,802,26,'#111','800');
 const ben=benefits.length?benefits.slice(0,3):['See employer details'];
 ben.slice(0,3).forEach((line,i)=>{c.fillStyle='#20b64b';c.beginPath();c.arc(690,828+i*24,8,0,Math.PI*2);c.fill();text('✓',690,833+i*24,12,'#fff','800','center');fit(line,710,834+i*24,330,16,'#111','600',1)});
 // Large orange Apply Now button
 round(300,910,480,78,39,orange);text('Apply Now  →',540,964,48,'#fff','800','center');
 // Bottom strip with real per-job QR and WhatsApp channel prompt
 round(16,1008,1048,130,20,'#dceafa');round(16,1008,475,130,20,navy);
 c.fillStyle='#fff';c.fillRect(86,1015,125,116);
 text('Scan & Apply',245,1064,30,'#fff','800');text('Now',245,1101,30,'#fff','800');
 c.fillStyle='#075f3d';c.beginPath();c.arc(625,1073,43,0,Math.PI*2);c.fill();text('☎',625,1090,48,'#fff','800','center');
 text('For More Job Updates',690,1060,26,'#111','800');text('Join Our WhatsApp Channel',690,1095,23,'#111','800');
 try{const qrUrl='https://quickchart.io/qr?text='+encodeURIComponent(jobUrl)+'&size=220&margin=1&ecLevel=M&format=png';const qr=await new Promise((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=reject;im.src=qrUrl});c.drawImage(qr,88,1017,121,112)}catch(e){text('QR',148,1080,26,navy,'800','center')}
 // Footer strip
 c.fillStyle=navy;c.fillRect(0,1150,W,32);text('◎  www.privatejobalert.in',62,1174,24,'#fff','800');text('Follow Us:  ▶  ◎  f  ➤',1015,1174,21,'#fff','700','right');
 return await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Poster export failed')),'image/png'));
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