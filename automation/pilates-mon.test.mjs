import test from 'node:test';
import assert from 'node:assert/strict';
import {makeHandler,validate,occupancy,SLOTS} from './pilates-mon.mjs';
const sample=()=>({nombre:'Prueba Pilates Mon',fecha_nacimiento:'1990-06-15',whatsapp:'+50760001234',correo:'henrylofiego+pf-mothers-qa@gmail.com',experiencia_pilates:'No, nunca.',notas:'',como_supiste_del_evento:'Instagram',confirmacion:true,terminos:true,terminos_version:'2026-10-13',horario:'07:10'});
const booked=(slot,student,state='booked',notes='Pilates Mom · x')=>({id:Math.floor(Math.random()*1e6),state,attributes:{time:new Date(SLOTS.find(s=>s.id===slot).time).toISOString(),notes},relations:{sesion_alumnos:{records:[{id:student}]}}});
function setup({open=true,students=[],existing=[],badRegistration=false,failCreate=false,appointments=[],failAppointment=false}={}){
 const calls=[],stateCalls=[];let registrations=existing;let agenda=[...appointments];
 const state=async(...args)=>{stateCalls.push(args);return args[0]==='SET'?'OK':args[0]==='EVAL'&&args[1].includes('INCR')?1:1;};
 const request=async(url,options)=>{
  const body=options.body?JSON.parse(options.body):null;calls.push({url,options,body});let result;
  if(url.includes('model=evento'))result={records:[{id:4501,custom_fields:{registro_abierto:open,booking_url:'https://pilates-luma-vitae.perfectflow.cloud/es/book?fijar=100'}}]};
  else if(url.includes('/records/Appointment')&&options.method==='GET')result={records:agenda};
  else if(url.includes('/records/Appointment')){if(failAppointment)return {ok:false,status:422};result={id:90,state:'booked',attributes:{time:new Date(body.record.time).toISOString(),notes:body.record.notes},relations:{sesion_alumnos:{records:body.record.subject_links.sesion_alumnos.map(id=>({id}))}}};agenda=[...agenda,result];}
  else if(url.includes('model=inscripcion_evento')&&options.method==='GET')result={records:registrations};
  else if(url.includes('model=alumno')&&options.method==='GET')result={records:students};
  else if(url.includes('model=alumno'))result={id:17,...body.record};
  else if(url.includes('model=inscripcion_evento')){
   if(failCreate)return {ok:false,status:422};
   result={id:20,...body.record,relations:badRegistration?{}:Object.fromEntries(Object.entries(body.record.subject_links).map(([code,id])=>[code,{records:[{id}]}]))};registrations=[result];
  }else throw new Error('Unexpected request');
  return {ok:true,json:async()=>result};
 };
 return {handler:makeHandler({state,request,now:()=>new Date('2026-11-26T18:00:00Z')}),calls,stateCalls};
}
const input=payload=>({payload,headers:{origin:'https://pilateslumavitae.com'},apiToken:'owned-test-only'});
test('validates the supplied required answers and retains optional notes',()=>{
 assert.ok(validate(sample()));for(const field of ['nombre','fecha_nacimiento','whatsapp','correo','experiencia_pilates','como_supiste_del_evento','terminos','confirmacion']){const data=sample();delete data[field];assert.equal(validate(data),null,field);}
 assert.ok(validate({...sample(),notas:'Información opcional'}));
});
test('rejects impossible dates, future dates, unexpected choices and missing terms version',()=>{
 for(const changes of [{fecha_nacimiento:'2026-02-30'},{fecha_nacimiento:'2099-01-01'},{como_supiste_del_evento:'unknown'},{experiencia_pilates:'unknown'},{terminos_version:''}])assert.equal(validate({...sample(),...changes}),null);
});
test('a closed event creates no student or registration',async()=>{const s=setup({open:false});assert.equal((await s.handler(input(sample()))).status,503);assert.equal(s.calls.filter(c=>c.options.method==='POST').length,0);});
test('creates and links a new student and event registration with fixed tenant and server token',async()=>{
 const s=setup();const result=await s.handler(input({...sample(),tenantHost:'other.perfectflow.cloud'}));assert.equal(result.status,200);
 const creates=s.calls.filter(c=>c.options.method==='POST');assert.equal(creates.length,3);assert.equal(creates[1].body.record.custom_fields.horario,'07:10');
 assert.equal(creates[2].body.record.time,'2026-12-05T07:10:00-05:00');assert.equal(creates[2].body.record.duration_minutes,80);assert.deepEqual(creates[2].body.record.subject_links,{sesion_alumnos:[17]});assert.ok(creates[2].body.record.notes.startsWith('Pilates Mom · 7:10 a 8:30 am'));assert.deepEqual(creates[1].body.record.subject_links,{inscripcion_alumna:17,inscripcion_evento:4501});
 for(const call of s.calls){assert.equal(call.options.headers.Host,'pilates-luma-vitae.perfectflow.cloud');assert.equal(call.options.headers['X-Forwarded-Host'],'pilates-luma-vitae.perfectflow.cloud');assert.ok(call.options.headers.Authorization.startsWith('Basic '));}
 assert.equal(creates[1].body.record.email,sample().correo);assert.equal(creates[1].body.record.custom_fields.acepta_terminos,true);assert.equal(creates[1].body.record.custom_fields.terminos_version,'2026-10-13');
});
test('reuses an existing exact-email student without editing their profile',async()=>{
 const s=setup({students:[{id:29,email:sample().correo,full_name:'Nombre guardado',phone:'+50769999999'}]});assert.equal((await s.handler(input(sample()))).status,200);
 const writes=s.calls.filter(c=>c.options.method!=='GET');assert.equal(writes.length,2);assert.equal(writes[0].body.record.subject_links.inscripcion_alumna,29);assert.deepEqual(writes[1].body.record.subject_links,{sesion_alumnos:[29]});
});
test('repeated submission does not create another registration',async()=>{const s=setup();assert.equal((await s.handler(input(sample()))).status,200);const count=s.calls.filter(c=>c.options.method==='POST').length;assert.equal((await s.handler(input(sample()))).status,200);assert.equal(s.calls.filter(c=>c.options.method==='POST').length,count);});
test('does not merge another student merely because their phone matches',async()=>{const s=setup({students:[{id:9,email:'different@example.com',phone:sample().whatsapp}]});assert.equal((await s.handler(input(sample()))).status,409);assert.equal(s.calls.filter(c=>c.options.method==='POST').length,0);});
test('rejects disallowed origins without contacting the CRM',async()=>{const s=setup();assert.equal((await s.handler({...input(sample()),headers:{origin:'https://example.com'}})).status,403);assert.equal(s.calls.length,0);});
test('a CRM rejection never becomes a success and releases both locks',async()=>{const s=setup({failCreate:true});assert.equal((await s.handler(input(sample()))).result.ok,false);assert.equal(s.stateCalls.filter(c=>c[0]==='EVAL'&&c[1].includes('DEL')).length,3);});
test('missing persisted links fail instead of claiming a successful registration',async()=>{const s=setup({badRegistration:true});assert.equal((await s.handler(input(sample()))).status,503);});
test('invalid payloads never write and honeypots do not reach the CRM',async()=>{const s=setup();assert.equal((await s.handler(input({}))).status,422);assert.equal((await s.handler(input({...sample(),website:'bot'}))).status,200);assert.equal(s.calls.length,0);});
test('status says if registration is open and, when open, the spots left per slot, without creating records',async()=>{
 const closed=setup({open:false});const off=await closed.handler(input({action:'status'}));assert.equal(off.result.registration_open,false);assert.equal(off.result.slots,undefined);assert.equal(closed.calls.length,1);
 const s=setup({appointments:[booked('07:10',1),booked('07:10',2),booked('08:40',3,'cancelled'),booked('10:10',4,'booked','Clase Reformer')]});
 const result=await s.handler(input({action:'status'}));assert.equal(result.status,200);assert.equal(result.result.registration_open,true);
 assert.deepEqual(result.result.slots.map(x=>x.remaining),[3,5,5,5]);assert.ok(s.calls.every(c=>c.options.method==='GET'));assert.equal(result.result.records,undefined);
});
test('counts only non-cancelled Pilates Mom appointments in each slot',()=>{
 const slots=occupancy([booked('11:40',1),booked('11:40',2,'cancelled'),booked('11:40',3,'booked','Otra cosa'),booked('08:40',4)]);
 assert.deepEqual(slots.map(x=>[x.id,x.remaining]),[['07:10',5],['08:40',4],['10:10',5],['11:40',4]]);
});
test('rejects a missing or unknown slot',()=>{for(const horario of ['', '09:00', undefined]){assert.equal(validate({...sample(),horario}),null);}});
test('a full slot creates no student, registration or appointment',async()=>{
 const s=setup({appointments:[1,2,3,4,5].map(id=>booked('07:10',id))});const result=await s.handler(input(sample()));
 assert.equal(result.status,409);assert.equal(result.result.slots[0].remaining,0);assert.equal(s.calls.filter(c=>c.options.method==='POST').length,0);
});
test('a slot with a cancelled seat accepts one more',async()=>{
 const s=setup({appointments:[...[1,2,3,4].map(id=>booked('07:10',id)),booked('07:10',5,'cancelled')]});assert.equal((await s.handler(input(sample()))).status,200);
});
test('a retry after a failed appointment books it in the slot already chosen',async()=>{
 const s=setup({failAppointment:true});assert.equal((await s.handler(input(sample()))).status,503);
 const retry=setup({existing:[{id:20,custom_fields:{horario:'07:10'},relations:{inscripcion_evento:{records:[{id:4501}]},inscripcion_alumna:{records:[{id:17}]}}}]});
 const result=await retry.handler(input({...sample(),horario:'11:40'}));assert.equal(result.status,200);
 const appointment=retry.calls.find(c=>c.url.includes('/records/Appointment')&&c.options.method==='POST');assert.equal(appointment.body.record.time,'2026-12-05T07:10:00-05:00');
});
test('a repeated submission does not book a second appointment',async()=>{
 const s=setup();await s.handler(input(sample()));await s.handler(input(sample()));
 assert.equal(s.calls.filter(c=>c.url.includes('/records/Appointment')&&c.options.method==='POST').length,1);
});
