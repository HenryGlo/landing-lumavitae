(() => {
'use strict';
const form = document.getElementById('form');
const button = document.getElementById('send');
const message = document.getElementById('sendmsg');
const done = document.getElementById('done');
const config = {webhook: 'https://lite-nyc1-d8b48383.automation.perfectflow.cloud/api/v1/webhooks/B79EXUO8U8oB9ijmrkBbK/sync', event: 'pilates-mon-2026', terms: '2026-10-13'};
  var PAISES = [
    ['PA','Panamá','507'],['VE','Venezuela','58'],['CO','Colombia','57'],['CR','Costa Rica','506'],
    ['US','Estados Unidos','1'],['ES','España','34'],['MX','México','52'],['AR','Argentina','54'],
    ['AL','Albania','355'],['DE','Alemania','49'],['AD','Andorra','376'],['AO','Angola','244'],
    ['SA','Arabia Saudita','966'],['DZ','Argelia','213'],['AM','Armenia','374'],['AW','Aruba','297'],
    ['AU','Australia','61'],['AT','Austria','43'],['BS','Bahamas','1'],['BD','Bangladés','880'],
    ['BB','Barbados','1'],['BE','Bélgica','32'],['BZ','Belice','501'],['BY','Bielorrusia','375'],
    ['BO','Bolivia','591'],['BA','Bosnia y Herzegovina','387'],['BR','Brasil','55'],['BG','Bulgaria','359'],
    ['CV','Cabo Verde','238'],['CA','Canadá','1'],['QA','Catar','974'],['CL','Chile','56'],
    ['CN','China','86'],['CY','Chipre','357'],['KR','Corea del Sur','82'],['HR','Croacia','385'],
    ['CU','Cuba','53'],['CW','Curazao','599'],['DK','Dinamarca','45'],['DM','Dominica','1'],
    ['EC','Ecuador','593'],['EG','Egipto','20'],['SV','El Salvador','503'],['AE','Emiratos Árabes Unidos','971'],
    ['SK','Eslovaquia','421'],['SI','Eslovenia','386'],['EE','Estonia','372'],['PH','Filipinas','63'],
    ['FI','Finlandia','358'],['FR','Francia','33'],['GE','Georgia','995'],['GH','Ghana','233'],
    ['GR','Grecia','30'],['GD','Granada','1'],['GT','Guatemala','502'],['GY','Guyana','592'],
    ['HT','Haití','509'],['HN','Honduras','504'],['HK','Hong Kong','852'],['HU','Hungría','36'],
    ['IN','India','91'],['ID','Indonesia','62'],['IE','Irlanda','353'],['IS','Islandia','354'],
    ['IL','Israel','972'],['IT','Italia','39'],['JM','Jamaica','1'],['JP','Japón','81'],
    ['JO','Jordania','962'],['KZ','Kazajistán','7'],['KE','Kenia','254'],['KW','Kuwait','965'],
    ['LV','Letonia','371'],['LB','Líbano','961'],['LT','Lituania','370'],['LU','Luxemburgo','352'],
    ['MY','Malasia','60'],['MT','Malta','356'],['MA','Marruecos','212'],['MD','Moldavia','373'],
    ['MC','Mónaco','377'],['ME','Montenegro','382'],['NI','Nicaragua','505'],['NG','Nigeria','234'],
    ['NO','Noruega','47'],['NZ','Nueva Zelanda','64'],['NL','Países Bajos','31'],['PK','Pakistán','92'],
    ['PY','Paraguay','595'],['PE','Perú','51'],['PL','Polonia','48'],['PT','Portugal','351'],
    ['PR','Puerto Rico','1'],['GB','Reino Unido','44'],['CZ','República Checa','420'],['DO','República Dominicana','1'],
    ['RO','Rumania','40'],['RU','Rusia','7'],['RS','Serbia','381'],['SG','Singapur','65'],
    ['ZA','Sudáfrica','27'],['SE','Suecia','46'],['CH','Suiza','41'],['SR','Surinam','597'],
    ['TH','Tailandia','66'],['TW','Taiwán','886'],['TT','Trinidad y Tobago','1'],['TN','Túnez','216'],
    ['TR','Turquía','90'],['UA','Ucrania','380'],['UY','Uruguay','598'],['VN','Vietnam','84']
  ];
  var pais = form.elements.pais;
  function flag(iso) {
    return String.fromCodePoint.apply(null, iso.split('').map(function (c) { return 0x1F1A5 + c.charCodeAt(0); }));
  }
  PAISES.forEach(function (c, i) {
    var o = document.createElement('option');
    o.value = c[0];
    o.textContent = flag(c[0]) + '  ' + c[1] + ' (+' + c[2] + ')';
    pais.appendChild(o);
    if (i === 7) {
      var sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = '──────────';
      pais.appendChild(sep);
    }
  });
  function dial() {
    for (var i = 0; i < PAISES.length; i++) if (PAISES[i][0] === pais.value) return PAISES[i][2];
    return '507';
  }
  function syncCountry() {
    document.getElementById('ccflag').textContent = flag(pais.value);
    document.getElementById('cccode').textContent = '+' + dial();
  }
  pais.addEventListener('change', syncCountry);
syncCountry();
let registrationOpen=false;
const slotsBox=document.getElementById('slots');
function renderSlots(slots){
 slotsBox.textContent='';
 if(!Array.isArray(slots)||!slots.length){const p=document.createElement('p');p.className='note';p.textContent='Los horarios se publican al abrir el registro.';slotsBox.appendChild(p);return;}
 const chosen=choice('horario');
 for(const slot of slots){
  const label=document.createElement('label');label.className='opt'+(slot.remaining<1?' full':'');
  const input=document.createElement('input');input.type='radio';input.name='horario';input.value=slot.id;input.required=true;input.disabled=slot.remaining<1;input.checked=chosen===slot.id&&slot.remaining>0;
  const mark=document.createElement('span');mark.className='mark';
  const txt=document.createElement('span');txt.className='txt';txt.textContent=slot.label;
  const left=document.createElement('span');left.className='left';left.textContent=slot.remaining<1?'completo':slot.remaining===1?'queda 1 cupo':'quedan '+slot.remaining+' cupos';
  label.append(input,mark,txt,left);slotsBox.appendChild(label);
 }
}
const status=document.getElementById('registration-status');
const retry=document.querySelector('[data-action="retry-registration"]');
async function loadStatus(){
 button.disabled=true;retry.hidden=true;status.textContent='Consultando el registro…';
 try{
  const response=await fetch(config.webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'status'}),signal:AbortSignal.timeout(25000)});
  const result=await response.json();if(!response.ok||!result.ok)throw new Error();
  registrationOpen=result.registration_open===true;button.disabled=!registrationOpen;status.textContent=result.message;renderSlots(result.slots);
 }catch{registrationOpen=false;status.textContent='No pudimos consultar el registro. Intenta de nuevo.';retry.hidden=false;}
}
retry.addEventListener('click',loadStatus);loadStatus();
const notes=form.elements.notas;
notes.addEventListener('input',()=>{notes.style.height='auto';notes.style.height=Math.min(notes.scrollHeight,320)+'px';});
const value = name => String(form.elements[name]?.value || '').trim();
function choice(name){return form.querySelector(`input[name="${name}"]:checked`)?.value || '';}
form.querySelectorAll('input').forEach(input => {
 if (['nombre','nacimiento','whatsapp','correo','experiencia','conociste','confirmacion','terminos'].includes(input.name)) input.required = true;
});
form.elements.nacimiento.max = new Date().toISOString().slice(0,10);
form.addEventListener('submit', async event => {
 event.preventDefault(); message.hidden = true;
 if (value('website')) { form.hidden = true; done.hidden = false; done.focus(); return; }
 if (!registrationOpen) return;
 if (!form.reportValidity()) return;
 if (!config.webhook) { message.textContent = 'El registro abrirá pronto. Escríbenos por WhatsApp si necesitas ayuda.'; message.hidden = false; return; }
 button.disabled = true; document.getElementById('sendtxt').textContent = 'enviando…';
 const rawPhone=value('whatsapp');
 const phone=rawPhone.startsWith('+')?'+'+rawPhone.replace(/\D/g,''):'+'+dial()+rawPhone.replace(/\D/g,'');
 const data = {nombre:value('nombre'),fecha_nacimiento:value('nacimiento'),whatsapp:phone,correo:value('correo').toLowerCase(),experiencia_pilates:choice('experiencia'),notas:value('notas'),como_supiste_del_evento:choice('conociste'),confirmacion:form.elements.confirmacion.checked,terminos:form.elements.terminos.checked,terminos_version:config.terms,horario:choice('horario'),website:value('website')};
 try {
  const response = await fetch(config.webhook, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data), signal:AbortSignal.timeout(25000)});
  const result = await response.json();
  if (Array.isArray(result.slots)) renderSlots(result.slots);
  if (!response.ok || result.ok !== true) throw new Error(result.message || 'No pudimos guardar tu registro. Intenta de nuevo.');
  if (result.slot) document.getElementById('done-text').textContent='Apartamos tu lugar el sábado 05 de diciembre, '+result.slot+'. Queda confirmado cuando recibamos tu pago.';
  form.hidden = true; done.hidden = false;
  if (result.booking_url) { const link = document.getElementById('booking-link'); const url = new URL(result.booking_url); if (url.protocol === 'https:') {link.href=url.href;link.hidden=false;} }
  done.focus(); done.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 } catch(error) { message.textContent = error.name === 'TimeoutError' ? 'La respuesta está tardando. Puedes intentar de nuevo; conservamos tus datos y no duplicaremos tu registro.' : error.message; message.hidden = false; }
 finally { button.disabled=!registrationOpen; document.getElementById('sendtxt').textContent='enviar mi registro'; }
});
})();
