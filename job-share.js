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
 const company=String(j.company||j.company_name||'Hiring Company'),title=String(j.title||'Job Vacancy'),loc=[j.city,j.state].filter(Boolean).join(', ')||j.location||'All India',salary=String(j.salary||'As per company'),qual=String(j.qualification||'Not specified'),type=String(j.job_type||j.type||'Full Time'),exp=String(j.experience||'Not specified'),desc=String(j.description||'');
 const navy='#082e65',blue='#0758b8',orange='#ff7900',ink='#0b2852';
 const rounded=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}};
 const text=(v,x,y,size,color,weight='700',align='left')=>{c.font=weight+' '+size+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(String(v),x,y);c.textAlign='left'};
 const fit=(v,x,y,max,size,color,weight='700',maxLines=2)=>{c.font=weight+' '+size+'px Arial,sans-serif';let line='',rows=[];for(const word of String(v||'').split(/\s+/)){const t=line?line+' '+word:word;if(c.measureText(t).width>max&&line){rows.push(line);line=word}else line=t}if(line)rows.push(line);rows=rows.slice(0,maxLines);rows.forEach((t,i)=>text(t,x,y+i*(size+13),size,color,weight));return y+rows.length*(size+13)};
 const gradient=c.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#e7f3ff');gradient.addColorStop(.5,'#fff');gradient.addColorStop(1,'#d8ebfb');c.fillStyle=gradient;c.fillRect(0,0,W,H);
 // branded curved blue frame with orange accent
 c.fillStyle=navy;c.beginPath();c.moveTo(0,0);c.lineTo(300,0);c.bezierCurveTo(145,190,165,400,310,600);c.lineTo(0,600);c.closePath();c.fill();
 c.fillStyle=blue;c.beginPath();c.moveTo(W,0);c.lineTo(900,0);c.bezierCurveTo(1010,180,1000,400,875,600);c.lineTo(W,600);c.closePath();c.fill();
 c.strokeStyle=orange;c.lineWidth=26;c.beginPath();c.arc(1015,300,150,Math.PI*.55,Math.PI*1.48);c.stroke();
 // top portal brand
 rounded(38,34,1004,112,22,'#fff','#d4e4f4');rounded(62,55,72,72,17,navy);text('PJA',98,101,25,'#fff','800','center');
 text('PRIVATE JOB ALERT',158,91,38,navy,'800');text('ALL INDIA PRIVATE JOBS',161,122,17,'#667a91','700');
 text('INDIA’S TRUSTED PRIVATE JOB PORTAL',1007,103,18,navy,'700','right');
 // company brand in top-left of hero
 rounded(62,177,340,112,18,'#fff','#dce8f4');
 if(/genus/i.test(company)){text('G',92,253,78,blue,'800');text('e',145,253,78,orange,'800');text('nus',188,253,78,blue,'800');text('POWER INFRASTRUCTURES',95,278,15,navy,'700')}
 else{fit(company,88,230,285,30,navy,'800',2)}
 // hiring banner and role title
 rounded(490,180,480,82,18,navy);text('WE ARE HIRING',730,237,42,'#fff','800','center');
 text(title,730,355,62,orange,'800','center');fit(company,730,414,520,31,navy,'800',2);
 // real technician image from an electrical maintenance reference; safe fallback illustration if remote image is blocked
 rounded(55,315,370,525,24,'#d9edfb');
 const photoUrl=String(j.poster_photo_url||j.technician_photo||'https://shubhamelectricalworks.com/assets/images/services/substation.png');
 let loaded=false;
 try{const im=await new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=photoUrl});c.save();c.beginPath();c.roundRect(70,330,340,495,18);c.clip();const scale=Math.max(340/im.width,495/im.height),iw=im.width*scale,ih=im.height*scale;c.drawImage(im,70+(340-iw)/2,330+(495-ih)/2,iw,ih);c.restore();loaded=true}catch(e){}
 if(!loaded){const g=c.createLinearGradient(70,330,410,825);g.addColorStop(0,'#d6efff');g.addColorStop(1,'#86bce8');rounded(70,330,340,495,18,g);c.fillStyle=navy;c.beginPath();c.arc(240,475,83,0,Math.PI*2);c.fill();c.fillStyle='#f1c69f';c.beginPath();c.arc(240,480,58,0,Math.PI*2);c.fill();c.fillStyle=orange;c.beginPath();c.arc(240,418,75,Math.PI,Math.PI*2);c.fill();rounded(130,560,220,230,55,navy);rounded(120,390,240,30,14,'#ffdf28');text('FIELD TECHNICIAN',240,800,19,navy,'800','center')}
 // facts panel in sample-like four-column strip
 const facts=[['⌖','Location',loc],['♟','Vacancies',String(j.vacancies||'Multiple')],['◆','Qualification',qual],['₹','Salary',salary]];
 facts.forEach((f,i)=>{const x=450+i*145; if(i) {c.strokeStyle='#a9bfd8';c.lineWidth=2;c.setLineDash([7,7]);c.beginPath();c.moveTo(x-8,520);c.lineTo(x-8,675);c.stroke();c.setLineDash([])}text(f[0],x+60,558,38,i===1?orange:blue,'800','center');text(f[1],x+60,595,17,ink,'600','center');fit(f[2],x+60,630,130,17,ink,'800',2)});
 c.setLineDash([9,7]);c.strokeStyle='#7899bd';c.beginPath();c.moveTo(455,710);c.lineTo(1010,710);c.stroke();c.setLineDash([]);
 rounded(570,745,365,74,16,orange);text('APPLY NOW  →',752,794,32,'#fff','800','center');
 // footer panel
 rounded(38,885,1004,340,24,navy);text('JOB DETAILS',78,948,28,'#ffb35c','800');
 text('Experience',80,1005,18,'#d8e9ff','600');fit(exp,80,1045,255,22,'#fff','800',2);
 text('Job Type',390,1005,18,'#d8e9ff','600');fit(type,390,1045,255,22,'#fff','800',2);
 text('About the Role',700,1005,18,'#d8e9ff','600');fit(desc||'Explore this opportunity and apply through Private Job Alert.',700,1045,290,19,'#fff','600',4);
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