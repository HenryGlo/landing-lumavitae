import fs from 'node:fs';
import {validateWorkflow} from './validate-workflow.mjs';
const file=new URL('./pilates-mon.template.json',import.meta.url);
const flow=JSON.parse(fs.readFileSync(file,'utf8'));
flow.trigger.nextAction.settings.sourceCode.code=fs.readFileSync(new URL('./pilates-mon.mjs',import.meta.url),'utf8');
validateWorkflow(flow);
fs.writeFileSync(file,JSON.stringify(flow,null,2)+'\n');
console.log('Built and validated the canonical workflow artifact.');
