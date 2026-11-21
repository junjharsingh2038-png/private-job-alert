(function(){'use strict';
function slug(v){return String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'job'}
function makeUrl(j){const id=String(j&&j.id||'');if(!id)return new URL('jobs/view.html',location.origin+'/private-job-alert/').href;return new URL('jobs/'+slug(j.title||'job')+'-'+slug(j.company||'job')+'-'+id.slice(0,8)+'/',location.origin+'/private-job-alert/').href}
function getJob(card){const b=card.querySelector('.apply[onclick]');if(!b)return null;const s=b.getAttribute('onclick')||'',a=s.indexOf('openApply('),z=s.lastIndexOf(')');if(a<0||z<0)return null;try{return JSON.parse(s.slice(a+10,z).replace(/&#39;/g,"'"))}catch(e){return null}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function copy(url){try{await navigator.clipboard.writeText(url);return true}catch(e){try{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return true}catch(x){return false}}}
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}}
function wrap(c,text,x,y,maxWidth,lineHeight,maxLines,font,color){c.font=font;c.fillStyle=color;let line='',lines=[];for(const word of String(text||'').split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}lines.forEach((t,i)=>c.fillText(t,x,y+i*lineHeight));return y+lines.length*lineHeight}
async function posterBlob(j){
 const W=1080,H=1280,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 const c=canvas.getContext('2d');
 const company=String(j.company||j.company_name||'Hiring Company');
 const title=String(j.title||'Job Vacancy');
 const loc=[j.city,j.state].filter(Boolean).join(', ')||j.location||'All India';
 const salary=String(j.salary||'As per company');
 const qual=String(j.qualification||'Not specified');
 const exp=String(j.experience||'Not specified');
 const type=String(j.job_type||j.type||'Full Time');
 const vacancies=String(j.vacancies||j.openings||'As per requirement');
 const description=String(j.description||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const responsibilities=Array.isArray(j.responsibilities)?j.responsibilities:(description?description.split(/[.\n•]+/).map(x=>x.trim()).filter(x=>x.length>12).slice(0,4):[]);
 const benefits=Array.isArray(j.benefits)?j.benefits:(typeof j.benefits==='string'?j.benefits.split(/[\n•]+/).map(x=>x.trim()).filter(Boolean):[]);
 const jobUrl=makeUrl(j),navy='#07366e',blue='#0758a7',orange='#ff7900',ink='#102b4e';
 const rr=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}};
 const tx=(v,x,y,size,color,weight='700',align='left')=>{c.font=weight+' '+size+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(String(v),x,y);c.textAlign='left'};
 const fit=(value,x,y,maxWidth,size,color,weight='700',maxLines=2,align='left',gap=1.22)=>{
   let font=size,lines=[];
   const split=()=>{c.font=weight+' '+font+'px Arial,sans-serif';let line='';const out=[];for(const word of String(value||'').split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>maxWidth&&line){out.push(line);line=word}else line=test}if(line)out.push(line);return out};
   lines=split();while(lines.length>maxLines&&font>14){font-=2;lines=split()}
   if(lines.length>maxLines){lines=lines.slice(0,maxLines);c.font=weight+' '+font+'px Arial,sans-serif';let last=lines[maxLines-1];while(last.length&&c.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}
   c.font=weight+' '+font+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;lines.forEach((line,i)=>c.fillText(line,x,y+i*font*gap));c.textAlign='left';return y+lines.length*font*gap;
 };
 const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#f3f9ff');bg.addColorStop(.55,'#fff');bg.addColorStop(1,'#e7f2fd');c.fillStyle=bg;c.fillRect(0,0,W,H);
 // Header with Private Job Alert branding
 rr(0,0,W,130,0,'#fff');c.strokeStyle='#e5edf6';c.lineWidth=2;c.beginPath();c.moveTo(0,130);c.lineTo(W,130);c.stroke();
 c.strokeStyle=orange;c.lineWidth=9;c.beginPath();c.arc(105,62,47,.25,Math.PI*1.8);c.stroke();
 c.fillStyle=navy;c.beginPath();c.arc(86,55,12,0,Math.PI*2);c.arc(106,43,13,0,Math.PI*2);c.arc(126,55,12,0,Math.PI*2);c.fill();
 rr(63,70,84,31,15,navy);
 tx('PRIVATE',170,68,49,navy,'800');tx('JOB',352,68,49,orange,'800');tx('ALERT',455,68,49,navy,'800');
 tx('LATEST JOBS • RIGHT OPPORTUNITIES • BRIGHT FUTURE',173,101,16,'#303b4b','700');
 rr(748,0,332,130,0,navy);tx('Private & MNC Jobs',914,48,30,'#fff','800','center');rr(785,63,250,43,8,'#ffd52e');tx('ALL INDIA HIRING',910,93,24,'#081f40','800','center');
 // Hero background and people illustration on left
 c.fillStyle='#e7f2fb';c.fillRect(0,132,1080,360);
 const hg=c.createLinearGradient(0,132,1080,492);hg.addColorStop(0,'#d9eaf5');hg.addColorStop(.5,'#fff');hg.addColorStop(1,'#e9f3fc');c.fillStyle=hg;c.fillRect(0,132,1080,360);
 // Office window grid
 c.strokeStyle='#c2d8e7';c.lineWidth=4;for(let x=20;x<480;x+=115){c.beginPath();c.moveTo(x,145);c.lineTo(x,470);c.stroke()}
 // Two clean professional people silhouettes
 function person(cx,cy,scale,shirt,hair){
   c.save();c.translate(cx,cy);c.scale(scale,scale);
   c.fillStyle=hair;c.beginPath();c.arc(0,0,54,Math.PI,Math.PI*2);c.lineTo(53,32);c.quadraticCurveTo(0,60,-53,32);c.closePath();c.fill();
   c.fillStyle='#efc49f';c.beginPath();c.ellipse(0,12,42,50,0,0,Math.PI*2);c.fill();
   c.fillStyle=hair;c.beginPath();c.arc(0,-9,47,Math.PI*1.05,Math.PI*1.95);c.fill();
   c.fillStyle=shirt;c.beginPath();c.moveTo(-55,68);c.quadraticCurveTo(-100,90,-110,215);c.lineTo(110,215);c.quadraticCurveTo(100,90,55,68);c.closePath();c.fill();
   c.fillStyle='#fff';c.beginPath();c.moveTo(-18,70);c.lineTo(0,115);c.lineTo(18,70);c.closePath();c.fill();
   c.strokeStyle=navy;c.lineWidth=5;c.beginPath();c.moveTo(0,112);c.lineTo(0,190);c.stroke();
   c.restore();
 }
 person(145,250,1.02,'#f6f8fb','#1d2633');person(360,260,.92,'#eef2f7','#2a2424');
 // Hiring banner and dynamically fitted job title
 rr(500,158,530,72,16,navy);tx('WE ARE HIRING',765,207,38,'#fff','800','center');
 fit(title,765,302,520,52,orange,'800',2,'center',1.12);
 fit(company,765,365,520,27,navy,'800',2,'center');
 rr(510,402,520,62,14,'#fff','#dce8f4');tx('▦  COMPANY',540,440,18,blue,'800');fit(company,690,442,320,22,navy,'700',1);
 // Facts on left, responsibility panel on right
 const facts=[['●','Vacancy',vacancies],['₹','Salary',salary],['⌖','Location',loc],['◆','Qualification',qual],['▣','Experience',exp]];
 const factY=[558,632,706,780,854];
 facts.forEach((f,i)=>{const y=factY[i];tx(f[0],55,y,32,blue,'800');tx(f[1]+':',112,y,23,'#111827','800');fit(f[2],245,y,370,22,'#111827','700',1,'left',1.1);if(i<4){c.strokeStyle='#d8e4f0';c.lineWidth=2;c.beginPath();c.moveTo(112,y+19);c.lineTo(610,y+19);c.stroke()}});
 c.strokeStyle='#91acc8';c.lineWidth=2;c.beginPath();c.moveTo(625,520);c.lineTo(625,895);c.stroke();
 rr(654,520,386,375,20,'#fff','#d9e5f0');rr(675,520,330,48,16,blue);tx('KEY RESPONSIBILITIES',840,553,22,'#fff','800','center');
 const resp=responsibilities.length?responsibilities:['Please refer to the complete job description.'];
 resp.slice(0,4).forEach((line,i)=>{const y=608+i*58;c.fillStyle='#19b64a';c.beginPath();c.arc(700,y-7,12,0,Math.PI*2);c.fill();tx('✓',700,y-1,17,'#fff','800','center');fit(line,726,y,282,18,'#111827','600',2,'left',1.15)});
 rr(654,915,386,145,20,'#e3f6e5');tx('✿  BENEFITS',690,958,26,'#101820','800');
 const ben=benefits.length?benefits.slice(0,3):['Refer to employer details'];
 ben.forEach((line,i)=>{c.fillStyle='#19b64a';c.beginPath();c.arc(700,990+i*28,9,0,Math.PI*2);c.fill();tx('✓',700,996+i*28,13,'#fff','800','center');fit(line,720,996+i*28,295,16,'#101820','600',1,'left',1.1)});
 // Apply CTA
 rr(300,1080,480,76,40,orange);tx('APPLY NOW  →',540,1131,44,'#fff','800','center');
 // Bottom application strip, QR loaded from a real job URL; no fake QR if service is unavailable
 rr(16,1170,1048,92,18,'#dceafa');rr(16,1170,475,92,18,navy);
 tx('SCAN & APPLY',260,1225,28,'#fff','800','center');
 tx('For More Job Updates',540,1208,23,'#111827','800');tx('Visit Private Job Alert',540,1240,20,navy,'700');
 tx('privatejobalert',900,1227,21,blue,'800','center');
 try{
   const qrUrl='https://quickchart.io/qr?text='+encodeURIComponent(jobUrl)+'&size=220&margin=1&ecLevel=M&format=png';
   const qr=await new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=qrUrl});
   c.fillStyle='#fff';c.fillRect(62,1174,88,84);c.drawImage(qr,64,1176,84,84);
 }catch(e){rr(62,1174,88,84,6,'#fff');tx('OPEN',106,1209,17,navy,'800','center');tx('LINK',106,1232,17,navy,'800','center')}
 // Footer
 c.fillStyle=navy;c.fillRect(0,1270,W,10);tx('www.privatejobalert.in',55,1262,20,navy,'800');
 tx('FOLLOW  •  WhatsApp  •  Facebook  •  Instagram',1025,1262,17,navy,'700','right');
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