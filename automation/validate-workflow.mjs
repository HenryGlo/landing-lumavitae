import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
export function validateWorkflow(flow){
 const source=fs.readFileSync(new URL('./pilates-mon.mjs',import.meta.url),'utf8');
 if(flow?.trigger?.nextAction?.settings?.sourceCode?.code!==source)throw new Error('Workflow source differs from tested implementation');
 if(flow?.trigger?.nextAction?.nextAction?.settings?.actionName!=='return_response')throw new Error('Missing form response');
 return true;
}
if(process.argv[1]&&fs.realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 for(const file of process.argv.slice(2))validateWorkflow(JSON.parse(fs.readFileSync(file,'utf8')));
 console.log('Workflow artifact matches tested source.');
}
