const icons={phone:'M7 3H4a1 1 0 0 0-1 1c0 10 7 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a16 16 0 0 1-7-7l2-2z',tool:'M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4z',home:'M3 11l9-8 9 8M5 10v11h14V10M9 21v-7h6v7',pet:'M8 14c-5 5-1 8 4 5 5 3 9 0 4-5-2-3-6-3-8 0M6 6c-3-3-5 3-2 4 3 2 4-2 2-4M11 3c-3-2-4 4-1 5 3 1 3-3 1-5M16 3c-3-2-4 4-1 5 3 1 3-3 1-5M21 6c-3-3-5 3-2 4 3 2 4-2 2-4',people:'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M2 21v-3c0-5 12-5 12 0v3M16 4a4 4 0 0 1 0 8M17 15c4 0 5 1 5 6',file:'M6 3h9l4 4v14H5V3zM14 3v5h5M8 12h8M8 16h6'};
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+icons[el.dataset.icon]+'"/></svg>');
const reportingUrl='https://bomidtvest.dk/beboere/ansoegningsskemaer-beboerservice/beboerservice/';
const storageKey='bomidtvest.department.v1';
let departments=[],selected=null,updatedAt='';
const $=s=>document.querySelector(s);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,text)=>'<a href="'+escapeHtml(url)+'" target="_blank" rel="noopener">'+escapeHtml(text)+'</a>';
const phoneLink=p=>'<a href="tel:'+escapeHtml(p.replace(/[^+\d]/g,''))+'">Ring '+escapeHtml(p)+'</a>';
const dialog=$('#detail');
function closeDialog(){dialog.close()}
dialog.querySelector('.close').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()}});
function contactMarkup(){return selected.personnel.length?selected.personnel.map(p=>'<p><strong>'+escapeHtml(p.name)+'</strong><br>'+escapeHtml(p.hours.join(' · '))+'</p>'+(p.phone?phoneLink(p.phone):link(selected.url,'Se kontaktoplysninger'))).join(''):'<p>Kontaktoplysningerne kunne ikke hentes for denne afdeling.</p>'+link(selected.url,'Se afdelingens kontaktoplysninger');}
function showPanel(key){
 if(!selected)return;
 const d=selected;
 const sectionText={changes:d.documents.find(x=>/råderet/i.test(x.name))?.name||'Afdelingens regler',board:'Afdelingsbestyrelsen',pets:'Husdyr',rules:'Afdelingens regler'}[key];
 const sectionUrl=sectionText?d.url.split('#')[0]+'#:~:text='+encodeURIComponent(sectionText).replace(/-/g,'%2D'):d.url;
 const sourceLink=link(sectionUrl,'Se afdelingens side på bomidtvest.dk');
 const sourceNote=(sectionText?'<p class="note">Åbner siden ved “'+escapeHtml(sectionText)+'”, hvis din browser understøtter det. Åbner siden øverst, så rul ned til afsnittet.</p>':'');
 const source=sourceLink+sourceNote;
 const docNames=predicate=>{const docs=d.documents.filter(predicate);return docs.length?'<ul>'+docs.map(x=>'<li>'+escapeHtml(x.name)+'</li>').join('')+'</ul>':''};
 const panels={
 report:['Meld en fejl','<p>Genvejen til fejlmeldingsappen er på vej. Der er ikke sendt en fejlmelding.</p><p>Indtil da kan du kontakte din vicevært eller dit servicecenter:</p>'+contactMarkup()+'<p class="note">Ved akutte problemer skal du bruge “Akut hjælp” på forsiden.</p>'],
 pets:['Husdyr i din bolig','<p>'+escapeHtml(d.pets||'Se afdelingens hjemmeside og ordensreglement for regler om husdyr. Vi har ikke en bekræftet regel at vise her.')+'</p><p>Læs alle betingelser i ordensreglementet, før du anskaffer et husdyr. Afdelingens regler er ikke en personlig tilladelse.</p>'+sourceLink+'<p>'+link('https://bomidtvest.dk/beboere/ansoegningsskemaer-beboerservice/ansoegning-om-husdyrhold/','Ansøg om husdyrhold')+'</p>'+sourceNote],
 changes:['Ændringer i din bolig','<p>Find afdelingens vejledning om boligændringer og råderet på hjemmesiden. Kontakt Bomidtvest, hvis du er i tvivl om dit projekt eller behovet for en ansøgning.</p>'+docNames(x=>/råderet/i.test(x.name))+sourceLink+'<p>'+link('https://bomidtvest.dk/beboere/ansoegningsskemaer-beboerservice/','Find ansøgningsskemaer og beboerservice')+'</p>'+sourceNote],
 board:['Din afdelingsbestyrelse',(d.key.startsWith('3_')&&d.department===600?'<ul><li><strong>Allan Erik Helstrup</strong><br>Formand</li><li><strong>Simon Wegert</strong><br>Bestyrelsesmedlem</li><li><strong>Amandah Munch</strong><br>Suppleant</li></ul>':'<p>Se afdelingens bestyrelsesmedlemmer og eventuelle kontaktoplysninger på hjemmesiden.</p>')+'<p>Du finder også de offentliggjorte referater på afdelingens side.</p>'+source],
 rules:['Regler og dokumenter',docNames(x=>!/referat/i.test(x.group||''))||'<p>Se afdelingens dokumenter på hjemmesiden.</p>'],
 urgent:['Akut hjælp','<p>Ved akutte problemer uden for normal telefontid skal du følge Bomidtvests vejledning for dit område.</p><p>Vagtordningen er forskellig for lejere i Skive Kommune og de øvrige områder. Brug den aktuelle kontaktvej på hjemmesiden.</p>'+link('https://bomidtvest.dk/om-bomidtvest/kontakt-din-vicevaert/','Find akut hjælp og vagttelefon')]
 };
 panels.rules[1]+=source;
 const p=panels[key];if(!p)return;
 $('#dialog-content').innerHTML='<h2 id="dialog-title">'+p[0]+'</h2>'+p[1];dialog.showModal();
}
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.panel)));
$('#report').addEventListener('click',()=>{if(reportingUrl)location.href=reportingUrl;else showPanel('report')});
function renderDepartment(d,focus=true){
 selected=d;$('#welcome').hidden=true;$('#resident').hidden=false;$('#logout').hidden=false;
 $('.department strong').textContent='Afdeling '+d.department;
 $('.department small').textContent=d.name.replace(/^.*?Afd\.\s*\d+\s*-\s*/,'');
 const service=$('.service'),p=d.personnel[0];
 service.querySelector('h2').textContent=p?.name||'Kontakt din afdeling';
 service.querySelector('p:not(.eyebrow)').textContent=d.personnel.length>1?'Se kontaktoplysninger for afdelingens viceværter.':'Vi hjælper med det praktiske i din bolig.';
 service.querySelector('.hours').textContent=p?.hours.join(' · ')||'Se træffetider på afdelingens hjemmeside.';
 const call=service.querySelector('.call');call.textContent=p?.phone?'Ring '+p.phone:'Se kontaktoplysninger';call.href=p?.phone?'tel:'+p.phone.replace(/[^+\d]/g,''):d.url;
 const mail=service.querySelector('.mail');mail.hidden=!p?.email;mail.textContent=p?.email||'';mail.href=p?.email?'mailto:'+p.email:d.url;
 let more=$('#more-contacts');if(!more){more=document.createElement('button');more.id='more-contacts';more.className='more-contacts';service.append(more)}more.hidden=d.personnel.length<2;more.textContent='Se alle kontaktpersoner';more.onclick=()=>{$('#dialog-content').innerHTML='<h2 id="dialog-title">Kontakt din afdeling</h2>'+contactMarkup();dialog.showModal()};
 const source=$('#department-source');source.href=d.url;source.target='_blank';source.rel='noopener';
 $('#source-note').textContent='Du ser oplysninger for afdeling '+d.department+'. Hentet fra bomidtvest.dk '+new Date(updatedAt).toLocaleDateString('da-DK')+'. Oplysningerne opdateres endnu ikke automatisk.';
 if(focus){const heading=$('#resident h1');heading.tabIndex=-1;heading.focus();window.scrollTo(0,0)}
}
function chooseDepartment(key){
 const d=departments.find(d=>d.key===key);if(!d)return;
 try{localStorage.setItem(storageKey,JSON.stringify({key:d.key}));}catch(e){$('#search-status').textContent='Browseren kan ikke gemme dit valg. Tillad lokal lagring for at blive på din afdeling næste gang.';return;}
 renderDepartment(d);
}
function showWelcome(){selected=null;dialog.close();$('#resident').hidden=true;$('#logout').hidden=true;$('#welcome').hidden=false;$('#address-results').replaceChildren();$('#search-status').textContent='';$('#address-form').reset();$('#city').focus();window.scrollTo(0,0)}
$('#logout').addEventListener('click',()=>{try{localStorage.removeItem(storageKey)}catch(e){$('#dialog-content').innerHTML='<h2 id="dialog-title">Dit valg kunne ikke slettes</h2><p>Browseren tillader ikke adgang til lokal lagring. Prøv igen, eller ryd webstedets data i browseren.</p>';dialog.showModal();return}showWelcome()});
window.addEventListener('storage',e=>{if(e.key!==storageKey)return;if(!e.newValue){showWelcome();return}try{const d=departments.find(d=>d.key===JSON.parse(e.newValue).key);if(d)renderDepartment(d,false);else showWelcome()}catch{showWelcome()}});
function search(){
 const city=$('#city').value.trim(),address=$('#address').value.trim();const found=ResidentAddress.findDepartments(departments,city,address);
 const results=$('#address-results');results.replaceChildren();
 if(!found.length){$('#search-status').textContent='Vi fandt ikke adressen. Kontrollér by og vejnavn, eller prøv kun vejnavnet. Vælg ikke en anden adresse, hvis din mangler.';const a=document.createElement('a');a.href='https://bomidtvest.dk/';a.target='_blank';a.rel='noopener';a.textContent='Find din afdeling på bomidtvest.dk';results.append(a);return;}
 $('#search-status').textContent=found.length===1?'Vi fandt dette adresseområde. Kontrollér, at din bolig hører til her.':'Flere adresseområder passer. Vælg det, som din bolig hører til.';
 found.forEach(d=>{const b=document.createElement('button');b.type='button';b.className='address-option';const title=document.createElement('strong');title.textContent=d.name;const action=document.createElement('span');action.textContent='Åbn min beboerside';b.append(title,action);b.addEventListener('click',()=>chooseDepartment(d.key));results.append(b)});
}
$('#address-form').addEventListener('submit',e=>{e.preventDefault();if(departments.length)search()});
['#city','#address'].forEach(id=>$(id).addEventListener('input',()=>{$('#address-results').replaceChildren();$('#search-status').textContent=''}));
async function init(){try{
 const r=await fetch('departments.json');if(!r.ok)throw Error('data');const data=await r.json();if(!Array.isArray(data.departments)||!data.departments.length)throw Error('data');departments=data.departments;updatedAt=data.updatedAt;
 const cities=[...new Set(departments.map(d=>d.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'da'));cities.forEach(c=>{const o=document.createElement('option');o.value=c;$('#cities').append(o)});
 $('#find').disabled=false;$('#find').textContent='Find min afdeling';
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){const d=departments.find(d=>d.key===saved.key);if(d)renderDepartment(d,false);else localStorage.removeItem(storageKey)}}catch(e){$('#search-status').textContent='Dit tidligere valg kunne ikke læses. Vælg din adresse igen.';}
 }catch(e){$('#find').textContent='Prøv igen';$('#find').disabled=false;$('#search-status').textContent='Adresserne kunne ikke hentes. Prøv igen om lidt.';$('#find').onclick=e=>{if(!departments.length){e.preventDefault();$('#find').disabled=true;init()}};}}
init();
