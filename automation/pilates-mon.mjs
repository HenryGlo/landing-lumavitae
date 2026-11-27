import crypto from 'node:crypto';
import net from 'node:net';
function decode(buffer,offset=0){
  const end=buffer.indexOf('\r\n',offset);if(end<0)return;
  const prefix=String.fromCharCode(buffer[offset]),line=buffer.subarray(offset+1,end).toString(),next=end+2;
  if(prefix==='+')return[line,next];if(prefix===':')return[Number(line),next];
  if(prefix==='-')throw new Error('State unavailable');
  if(prefix==='$'){const size=Number(line);if(size===-1)return[null,next];if(buffer.length<next+size+2)return;return[buffer.subarray(next,next+size).toString(),next+size+2];}
  if(prefix==='*'){let at=next;const values=[];for(let i=0;i<Number(line);i++){const item=decode(buffer,at);if(!item)return;values.push(item[0]);at=item[1];}return[values,at];}
  throw new Error('Invalid state response');
}
export function redis(...args){
  return new Promise((resolve,reject)=>{
    const socket=net.createConnection({host:'redis',port:6379});let buffer=Buffer.alloc(0);
    const fail=()=>{socket.destroy();reject(new Error('State unavailable'));};
    socket.setTimeout(5000,fail);socket.on('error',fail);
    socket.on('connect',()=>socket.write('*'+args.length+'\r\n'+args.map(value=>{const text=String(value);return '$'+Buffer.byteLength(text)+'\r\n'+text+'\r\n';}).join('')));
    socket.on('data',chunk=>{try{buffer=Buffer.concat([buffer,chunk]);const result=decode(buffer);if(result){socket.end();resolve(result[0]);}}catch{fail();}});
  });
}
const prefix='pf:pilates-luma-vitae:event-registration:';
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const reply=(status,message,extra={})=>({status,result:{ok:status===200,message,...extra}});
const release="if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end;return 0";
const rate="local n=redis.call('INCR',KEYS[1]);if n==1 then redis.call('EXPIRE',KEYS[1],3600) end;return n";
const yes=value=>value===true;
// Sábado 05/12/2026 en Panamá (UTC-5). Cada horario dura 1 h 20 min, clase y compartir.
// Los cupos se cuentan sobre las citas de ese día que llevan MARK en la nota y no
// están canceladas: si el estudio cancela una cita, el cupo vuelve solo.
export const SLOTS=[
 {id:'07:10',label:'7:10 a 8:30 am',time:'2026-12-05T07:10:00-05:00'},
 {id:'08:40',label:'8:40 a 10:00 am',time:'2026-12-05T08:40:00-05:00'},
 {id:'10:10',label:'10:10 a 11:30 am',time:'2026-12-05T10:10:00-05:00'},
 {id:'11:40',label:'11:40 am a 1:00 pm',time:'2026-12-05T11:40:00-05:00'}];
export const CAPACITY=5,DURATION=80,MARK='Pilates Mom',STUDENT_RELATION='sesion_alumnos';
const slotOf=id=>SLOTS.find(slot=>slot.id===id);
export function occupancy(appointments){
 const taken=Object.fromEntries(SLOTS.map(slot=>[slot.id,0]));
 for(const appointment of appointments||[]){
  if(appointment.state==='cancelled'||!String(appointment.attributes?.notes||'').startsWith(MARK))continue;
  const at=new Date(appointment.attributes?.time).getTime();
  const slot=SLOTS.find(item=>new Date(item.time).getTime()===at);if(slot)taken[slot.id]++;
 }
 return SLOTS.map(slot=>({id:slot.id,label:slot.label,remaining:Math.max(CAPACITY-taken[slot.id],0)}));
}
const dayAppointments='/records/Appointment?time_after=2026-12-04&time_before=2026-12-06&limit=500';
function crm(inputs,request,track=()=>{}){
 return async(method,path,data,idempotency)=>{
  track(method+' '+path.split('?')[0]);
  const body=data?JSON.stringify(data):undefined;
  const response=await request('http://fs:3000/api/v1/automation'+path,{method,signal:AbortSignal.timeout(8000),headers:{
   Host:'pilates-luma-vitae.perfectflow.cloud','X-Forwarded-Host':'pilates-luma-vitae.perfectflow.cloud','X-Forwarded-Proto':'https','Content-Type':'application/json',
   Authorization:'Basic '+Buffer.from('activepieces:'+inputs.apiToken).toString('base64'),...(idempotency?{'Idempotency-Key':idempotency}:{})},body});
  if(!response.ok)throw new Error('CRM request failed '+response.status);return response.json();
 };
}
const experiences=['No, nunca.','Sí, alguna vez.','Sí, actualmente.'];
const sources=['Instagram','Tiktok','TikTok','Recomendación','Otro'];
export function validate(payload,now=new Date()){
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||typeof payload.notas==='string'&&payload.notas.length>3000)return null;
 const text=(key,max)=>typeof payload[key]==='string'&&payload[key].trim().length<=max?payload[key].trim():'';
 const form={name:text('nombre',160),email:text('correo',254).toLowerCase(),phone:text('whatsapp',20),
  birth:text('fecha_nacimiento',10),experience:text('experiencia_pilates',80),notes:text('notas',3000),source:text('como_supiste_del_evento',80),
  terms:text('terminos_version',20),confirmation:yes(payload.confirmacion),accepted:yes(payload.terminos),slot:text('horario',5)};
 const date=new Date(form.birth+'T12:00:00Z');
 if(!form.name||!/^\S+@\S+\.\S+$/.test(form.email)||!/^\+[1-9]\d{6,14}$/.test(form.phone)||
  !/^\d{4}-\d{2}-\d{2}$/.test(form.birth)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==form.birth||form.birth>now.toISOString().slice(0,10)||
  !experiences.includes(form.experience)||!sources.includes(form.source)||!form.confirmation||!form.accepted||form.terms!=='2026-10-13'||!slotOf(form.slot))return null;
 return form;
}
export function makeHandler({state=redis,request=fetch,now=()=>new Date()}={}){
 return async inputs=>{
  let payload;let headers;
  try {payload=typeof inputs.payload==='string'?JSON.parse(inputs.payload):inputs.payload;headers=typeof inputs.headers==='string'?JSON.parse(inputs.headers):inputs.headers||{};}catch{return reply(422,'Revisa tus respuestas e intenta de nuevo.');}
  const origin=headers.origin||headers.Origin;
  if(origin&&!['https://pilateslumavitae.com','https://www.pilateslumavitae.com'].includes(origin))return reply(403,'No se pudo enviar el formulario.');
  if(payload?.action==='status'){
   if(!inputs.apiToken)return reply(503,'El registro todavía no está disponible.');
   try{
    const call=crm(inputs,request);
    const result=await call('GET','/records/Entity?model=evento&event_code=pilates-mon-2026&limit=2');
    if(result.records?.length!==1)throw new Error('Event missing');
    const open=[true,'true','1'].includes(result.records[0].custom_fields?.registro_abierto);
    if(!open)return reply(200,'El registro abrirá pronto.',{registration_open:false});
    const slots=occupancy((await call('GET',dayAppointments)).records);
    const full=slots.every(slot=>slot.remaining===0);
    return reply(200,full?'Todos los horarios están completos. Escríbenos por WhatsApp para la lista de espera.':'Elige tu horario y completa tus datos.',{registration_open:!full,slots});
   }catch{return reply(503,'No pudimos consultar el registro. Intenta de nuevo.');}
  }
  if(payload?.website)return reply(200,'Recibimos tu registro.');
  const form=validate(payload,now());
  if(!form)return reply(422,'Completa tus datos, elige un horario, revisa las respuestas y acepta las políticas y los términos.');
  if(!inputs.apiToken)return reply(503,'El registro todavía no está disponible. Escríbenos por WhatsApp.');
  const eventCode='pilates-mon-2026';
  const key=digest(eventCode+':'+form.email),owner=crypto.randomUUID();
  // El lock del horario va con los demás: dos personas no pueden tomar el último cupo a la vez.
  const locks=[prefix+'email:'+digest(form.email),prefix+'phone:'+digest(form.phone),prefix+'slot:'+form.slot].sort();
  const held=[];let stage='locks';
  try{
   for(const lock of locks){if(!await state('SET',lock,owner,'NX','EX',180))return reply(503,'Estamos procesando tu registro. Intenta de nuevo en unos segundos.');held.push(lock);}
   const call=crm(inputs,request,value=>{stage=value;});
   const slot=slotOf(form.slot);
   const book=student=>call('POST','/records/Appointment',{record:{time:slot.time,duration_minutes:DURATION,
    notes:MARK+' · '+slot.label+' · '+form.name+' · '+form.email+' · pendiente de pago',subject_links:{[STUDENT_RELATION]:[student]}}},'pilates-mon-appointment-'+key+'-'+slot.id);
   const hasBooking=(appointments,student)=>(appointments||[]).some(item=>item.state!=='cancelled'&&String(item.attributes?.notes||'').startsWith(MARK)&&linked(item,STUDENT_RELATION,student));
   const events=await call('GET','/records/Entity?model=evento&event_code='+eventCode+'&limit=2');
   if(events.records?.length!==1)return reply(503,'El registro todavía no está disponible.');
   const event=events.records[0],settings=event.custom_fields||{};
   if(![true,'true','1'].includes(settings.registro_abierto))return reply(503,'El registro abrirá pronto. Escríbenos por WhatsApp si necesitas ayuda.');
   const existing=await call('GET','/records/Entity?model=inscripcion_evento&registration_key='+key+'&limit=2');
   const bookingURL=safeBookingURL(settings.booking_url);
   const appointments=(await call('GET',dayAppointments)).records;
   if(existing.records?.length){
    if(existing.records.length!==1||!linked(existing.records[0],'inscripcion_evento',event.id)||!existing.records[0].relations?.inscripcion_alumna?.records?.length)throw new Error('Registration needs review');
    const studentId=existing.records[0].relations.inscripcion_alumna.records[0].id;
    // Un reintento después de que la cita no se pudo crear la crea ahora, en el horario que eligió.
    const saved=slotOf(existing.records[0].custom_fields?.horario)||slot;
    if(!hasBooking(appointments,studentId)){
     if(occupancy(appointments).find(item=>item.id===saved.id).remaining<1)return reply(409,'Ese horario se completó. Escríbenos por WhatsApp y te ayudamos a cambiarlo.',{slots:occupancy(appointments)});
     await call('POST','/records/Appointment',{record:{time:saved.time,duration_minutes:DURATION,
      notes:MARK+' · '+saved.label+' · '+form.name+' · '+form.email+' · pendiente de pago',subject_links:{[STUDENT_RELATION]:[studentId]}}},'pilates-mon-appointment-'+key+'-'+saved.id);
    }
    return reply(200,'Tu registro ya está guardado.',{booking_url:bookingURL,slot:saved.label});
   }
   if(occupancy(appointments).find(item=>item.id===slot.id).remaining<1)return reply(409,'Ese horario se acaba de completar. Elige otro.',{slots:occupancy(appointments)});
   if(await state('EVAL',rate,1,prefix+'rate:'+digest(form.email))>10)return reply(429,'Has realizado varios intentos. Intenta más tarde o escríbenos por WhatsApp.');
   let student=null,phoneConflict=false,after=0,finished=false;
   for(let page=0;page<10;page++){
    const result=await call('GET','/records/Entity?model=alumno&limit=500&after_id='+after);
    const records=result.records||[];
    student=records.find(record=>String(record.email||'').trim().toLowerCase()===form.email)||student;
    phoneConflict ||= records.some(record=>String(record.phone||'').replace(/\D/g,'')===form.phone.replace(/\D/g,'')&&String(record.email||'').trim().toLowerCase()!==form.email);
    if(student||records.length<500){finished=true;break;}after=records.at(-1).id;
   }
   if(!finished)return reply(503,'Necesitamos revisar tu registro. Escríbenos por WhatsApp.');
   if(!student&&phoneConflict)return reply(409,'Ese WhatsApp ya está asociado a otro registro. Escríbenos para ayudarte sin duplicar tus datos.');
   if(!student){
    student=await call('POST','/records/Entity?model=alumno',{record:{full_name:form.name,email:form.email,phone:form.phone,
     custom_fields:{nacimiento:form.birth,a_considerar:form.notes,origen:'evento:'+eventCode,acepta_politicas:true}}},'pilates-mon-student-'+digest(form.email));
    if(String(student.email||'').trim().toLowerCase()!==form.email)return reply(409,'Necesitamos revisar tus datos. Escríbenos por WhatsApp.');
   }
   const registration=await call('POST','/records/Entity?model=inscripcion_evento',{record:{full_name:form.name,email:form.email,phone:form.phone,subject_links:{inscripcion_alumna:student.id,inscripcion_evento:event.id},custom_fields:{
    event_code:eventCode,email_participante:form.email,fecha_nacimiento:form.birth,experiencia_pilates:form.experience,
    a_considerar:form.notes,como_supiste:form.source,acepta_politicas:true,acepta_terminos:true,terminos_version:form.terms,
    registrado_en:now().toISOString(),origen:'landing:pilates-mon',registration_key:key,horario:slot.id}}},'pilates-mon-registration-'+key);
   if(registration.custom_fields?.registration_key!==key||!linked(registration,'inscripcion_alumna',student.id)||!linked(registration,'inscripcion_evento',event.id))throw new Error('Registration not linked');
   await book(student.id);
   return reply(200,'Recibimos tu registro.',{booking_url:bookingURL,slot:slot.label});
  }catch(error){return {...reply(503,'No pudimos guardar tu registro. Intenta de nuevo o escríbenos por WhatsApp.'),diagnostic:{stage,reason:error.message}};}
  finally {for(const lock of held){try{await state('EVAL',release,1,lock,owner);}catch{/* Locks expire even when state is unavailable. */}}}
 };
}
function linked(record,code,id){return record.relations?.[code]?.records?.some(item=>Number(item.id)===Number(id));}
function safeBookingURL(value){try{const url=new URL(value);return url.protocol==='https:'&&['pilates-luma-vitae.perfectflow.cloud','pilateslumavitae.com','www.pilateslumavitae.com'].includes(url.hostname)?url.href:null;}catch{return null;}}
export const code=makeHandler();
