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
 const navy='#082f68',blue='#0757b8',orange='#ff7900',ink='#102b50';
 const rounded=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}};
 const text=(v,x,y,size,color,weight='700',align='left')=>{c.font=weight+' '+size+'px Arial,sans-serif';c.fillStyle=color;c.textAlign=align;c.fillText(String(v),x,y);c.textAlign='left'};
 const fit=(v,x,y,max,size,color,weight='700',maxLines=2)=>{c.font=weight+' '+size+'px Arial,sans-serif';let words=String(v||'').split(/\\s+/),line='',rows=[];for(const word of words){const t=line?line+' '+word:word;if(c.measureText(t).width>max&&line){rows.push(line);line=word}else line=t}if(line)rows.push(line);rows=rows.slice(0,maxLines);rows.forEach((t,i)=>text(t,x,y+i*(size+13),size,color,weight));return y+rows.length*(size+13)};
 c.fillStyle='#eef5fb';c.fillRect(0,0,W,H);
 const bg=c.createLinearGradient(0,0,W,520);bg.addColorStop(0,'#dceefa');bg.addColorStop(.55,'#fff');bg.addColorStop(1,'#d8e9f7');c.fillStyle=bg;c.fillRect(0,0,W,H);
 // blue edge panels and orange accent curves echo the supplied sample
 c.fillStyle=navy;c.beginPath();c.moveTo(0,0);c.lineTo(270,0);c.bezierCurveTo(150,180,165,390,270,565);c.lineTo(0,565);c.closePath();c.fill();
 c.fillStyle=blue;c.beginPath();c.moveTo(1080,0);c.lineTo(930,0);c.bezierCurveTo(1015,180,1010,380,930,565);c.lineTo(1080,565);c.closePath();c.fill();
 c.strokeStyle=orange;c.lineWidth=24;c.beginPath();c.arc(1030,280,155,Math.PI*.55,Math.PI*1.48);c.stroke();
 // portal header
 rounded(38,35,1004,105,20,'#fff','#d9e7f4');
 rounded(62,54,68,68,16,navy);text('PJA',96,99,23,'#fff','800','center');
 text('PRIVATE JOB ALERT',154,88,36,navy,'800');text('ALL INDIA PRIVATE JOBS',157,116,16,'#657991','700');
 text('INDIA’S TRUSTED PRIVATE JOB PORTAL',1005,96,18,navy,'700','right');
 // main hiring panel
 rounded(38,165,1004,780,28,'#fff','#d6e5f3');
 rounded(70,195,365,86,17,'#eaf4ff');text('WE ARE HIRING',252,251,38,blue,'800','center');
 text('✦',472,257,54,orange,'800');
 fit(title,485,365,500,62,orange,'800',2);
 fit(company,485,465,500,31,navy,'800',2);
 // employer / candidate image placeholder panel
 rounded(70,320,340,500,24,'#eaf4fb');
 const photoUrl=String(j.company_logo||j.logo_url||'');
 let loaded=false;if(photoUrl){try{const im=await new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=photoUrl});c.save();c.beginPath();c.roundRect(88,340,304,460,18);c.clip();c.drawImage(im,88,340,304,460);c.restore();loaded=true}catch(e){}}
 if(!loaded){const g=c.createLinearGradient(80,340,390,800);g.addColorStop(0,'#c5e2f8');g.addColorStop(1,'#eaf4fb');rounded(88,340,304,460,18,g);text(company.split(/\\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase(),240,560,92,blue,'800','center');text('HIRING COMPANY',240,610,20,navy,'700','center')}
 // four key job facts, aligned like sample
 const facts=[['⌖','Location',loc],['♟','Vacancies',String(j.vacancies||'Multiple')],['◆','Qualification',qual],['₹','Salary',salary]];
 facts.forEach((f,i)=>{const x=465+i%2*275,y=570+Math.floor(i/2)*150;rounded(x,y,250,124,14,'#f5f9fd','#e0eaf4');text(f[0],x+125,y+42,34,i===1?orange:blue,'800','center');text(f[1],x+125,y+69,17,'#52677f','600','center');fit(f[2],x+125,y+99,220,18,ink,'800',1);});
 rounded(480,875,500,64,14,orange);text('APPLY NOW  →',730,919,28,'#fff','800','center');
 // role details footer
 rounded(38,975,1004,290,22,navy);
 text('JOB DETAILS',75,1030,24,'#ffb35c','800');
 text('Experience',78,1080,17,'#d9eaff','600');fit(exp,78,1118,250,22,'#fff','800',1);
 text('Job Type',390,1080,17,'#d9eaff','600');fit(type,390,1118,250,22,'#fff','800',1);
 text('About the Role',700,1080,17,'#d9eaff','600');fit(desc||'Explore this opportunity and apply through Private Job Alert.',700,1118,290,18,'#fff','600',3);
 text('PRIVATE JOB ALERT  •  VERIFY DETAILS WITH THE EMPLOYER',540,1312,16,'#52677f','700','center');
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