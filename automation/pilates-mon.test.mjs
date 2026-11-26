import test from 'node:test';
import assert from 'node:assert/strict';
import {makeHandler,validate} from './pilates-mon.mjs';
const sample=()=>({nombre:'Prueba Pilates Mon',fecha_nacimiento:'1990-06-15',whatsapp:'+50760001234',correo:'henrylofiego+pf-mothers-qa@gmail.com',experiencia_pilates:'No, nunca.',notas:'',como_supiste_del_evento:'Instagram',confirmacion:true,terminos:true,terminos_version:'2026-10-13'});
function setup({open=true,students=[],existing=[],badRegistration=false,failCreate=false}={}){
 const calls=[],stateCalls=[];let registrations=existing;
 const state=async(...args)=>{stateCalls.push(args);return args[0]==='SET'?'OK':args[0]==='EVAL'&&args[1].includes('INCR')?1:1;};
 const request=async(url,options)=>{
  const body=options.body?JSON.parse(options.body):null;calls.push({url,options,body});let result;
  if(url.includes('model=evento'))result={records:[{id:4501,custom_fields:{registro_abierto:open,booking_url:'https://pilates-luma-vitae.perfectflow.cloud/es/book?fijar=100'}}]};
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
 const creates=s.calls.filter(c=>c.options.method==='POST');assert.equal(creates.length,2);assert.deepEqual(creates[1].body.record.subject_links,{inscripcion_alumna:17,inscripcion_evento:4501});
 for(const call of s.calls){assert.equal(call.options.headers.Host,'pilates-luma-vitae.perfectflow.cloud');assert.equal(call.options.headers['X-Forwarded-Host'],'pilates-luma-vitae.perfectflow.cloud');assert.ok(call.options.headers.Authorization.startsWith('Basic '));}
 assert.equal(creates[1].body.record.email,sample().correo);assert.equal(creates[1].body.record.custom_fields.acepta_terminos,true);assert.equal(creates[1].body.record.custom_fields.terminos_version,'2026-10-13');
});
test('reuses an existing exact-email student without editing their profile',async()=>{
 const s=setup({students:[{id:29,email:sample().correo,full_name:'Nombre guardado',phone:'+50769999999'}]});assert.equal((await s.handler(input(sample()))).status,200);
 const writes=s.calls.filter(c=>c.options.method!=='GET');assert.equal(writes.length,1);assert.equal(writes[0].body.record.subject_links.inscripcion_alumna,29);
});
test('repeated submission does not create another registration',async()=>{const s=setup();assert.equal((await s.handler(input(sample()))).status,200);const count=s.calls.filter(c=>c.options.method==='POST').length;assert.equal((await s.handler(input(sample()))).status,200);assert.equal(s.calls.filter(c=>c.options.method==='POST').length,count);});
test('does not merge another student merely because their phone matches',async()=>{const s=setup({students:[{id:9,email:'different@example.com',phone:sample().whatsapp}]});assert.equal((await s.handler(input(sample()))).status,409);assert.equal(s.calls.filter(c=>c.options.method==='POST').length,0);});
test('rejects disallowed origins without contacting the CRM',async()=>{const s=setup();assert.equal((await s.handler({...input(sample()),headers:{origin:'https://example.com'}})).status,403);assert.equal(s.calls.length,0);});
test('a CRM rejection never becomes a success and releases both locks',async()=>{const s=setup({failCreate:true});assert.equal((await s.handler(input(sample()))).result.ok,false);assert.equal(s.stateCalls.filter(c=>c[0]==='EVAL'&&c[1].includes('DEL')).length,2);});
test('missing persisted links fail instead of claiming a successful registration',async()=>{const s=setup({badRegistration:true});assert.equal((await s.handler(input(sample()))).status,503);});
test('invalid payloads never write and honeypots do not reach the CRM',async()=>{const s=setup();assert.equal((await s.handler(input({}))).status,422);assert.equal((await s.handler(input({...sample(),website:'bot'}))).status,200);assert.equal(s.calls.length,0);});
test('status exposes only whether registration is open, without creating records',async()=>{for(const open of [true,false]){const s=setup({open});const result=await s.handler(input({action:'status'}));assert.equal(result.status,200);assert.equal(result.result.registration_open,open);assert.equal(s.calls.length,1);assert.equal(s.calls[0].options.method,'GET');assert.equal(result.result.records,undefined);}});
