import {mergeDrafts} from './draft-merge.js?v=c2fe1b99d129';
import {GitHubClient,decode64,decodeText,digest,bytes64} from './github-client.js?v=c2fe1b99d129';
import {pageHtml,makePublicTextFiles} from './site.js?v=c2fe1b99d129';
import {validate,normalize} from './runtime.js?v=c2fe1b99d129';
const STATE='studio/state.json',FILES='studio/files/';
const types={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',avif:'image/avif',svg:'image/svg+xml',mp4:'video/mp4',webm:'video/webm',mp3:'audio/mpeg',wav:'audio/wav'};
export function initialState(draft,published=draft){return {format:1,revision:0,draft:normalize(structuredClone(draft)),published:normalize(structuredClone(published)),savedAt:null,publishedAt:null};}
export class GitHubDesk{
 constructor(token,{sourceRepo,pagesRepo,assetBase=new URL('./',import.meta.url)},fetcher=fetch){this.client=new GitHubClient(token,fetcher);this.fetcher=fetcher.bind(globalThis);this.sourceRepo=sourceRepo;this.pagesRepo=pagesRepo;this.assetBase=assetBase;this.urls=new Map();this.mediaBytes=new Map();this.writeTail=Promise.resolve();}
 serial(fn){const next=this.writeTail.then(fn,fn);this.writeTail=next.catch(()=>{});return next;}
 async connect(){
  const source=await this.client.repo(this.sourceRepo);if(!source.private)throw new Error('The draft repository must be private. Choose your existing private portfolio repository.');if(!source.permissions?.push)throw new Error('Your token needs Contents read and write access to the private repository.');this.sourceBranch=source.default_branch;
  const saved=await this.client.json(this.sourceRepo,STATE);if(saved){this.state=saved.data;this.stateSha=saved.sha;validate(this.state.draft);validate(this.state.published);}
  try{const pages=await this.client.repo(this.pagesRepo);if(pages.private)throw new Error('The Pages repository must be public for GitHub Free. Keep drafts in the private repository.');if(!pages.permissions?.push)throw new Error('Your token needs Contents read and write access to the Pages repository.');this.pagesBranch=pages.default_branch||'main';this.pagesReady=true;}catch(e){if(e.status!==404)throw e;this.pagesReady=false;}
  this.basePath=this.pagesRepo.split('/')[1].toLowerCase()===this.pagesRepo.split('/')[0].toLowerCase()+'.github.io'?'/':'/'+this.pagesRepo.split('/')[1]+'/';
  this.siteUrl='https://'+this.pagesRepo.split('/')[0]+'.github.io'+this.basePath;
  this.assets=await this.localJson('site-assets.json');
  return this.state;
 }
 async localJson(path){const r=await this.fetcher(new URL(path,this.assetBase),{cache:'no-store'});if(!r.ok)throw new Error('Studio Desk files could not load. Reload this page.');return r.json();}
 async installFiles(){const names=await this.localJson('distribution.json'),files=new Map();for(const name of names){const response=await this.fetcher(new URL(name,this.assetBase),{cache:'no-store'});if(!response.ok)throw new Error('Editor file missing: '+name);files.set('admin/'+name,await response.text());}files.set('admin/distribution.json',JSON.stringify(names));return files;}
 async updateEditor(){
  if(!this.pagesReady)throw new Error('Set up the Pages repository first.');
  const head=await this.client.head(this.pagesRepo,this.pagesBranch),release=await this.client.json(this.pagesRepo,'studio-release.json',head);
  if(!release)throw new Error('Complete first-time Pages setup first.');
  const files=await this.installFiles();
  const manifest={...release.data,managedPaths:[...new Set([...(release.data.managedPaths||[]),...files.keys()])]};
  files.set('studio-release.json',JSON.stringify(manifest));
  const commit=await this.client.commitFiles(this.pagesRepo,this.pagesBranch,files,{expectedHead:head,message:'Update Studio Desk editor without changing portfolio publication'});
  this.pendingCommit=commit;this.pendingOperation='editor';return {commit,unchanged:commit===head};
 }
 async saveState(next){const result=await this.client.put(this.sourceRepo,STATE,JSON.stringify(next),this.stateSha,'Save Studio Desk draft');this.state=next;this.stateSha=result.content.sha;return {revision:next.revision,savedAt:next.savedAt,publishedAt:next.publishedAt};}
 mergeDraft(base,local,remote){return mergeDrafts(base,local,remote).draft;}
 conflictError(base,local,remote){const merged=mergeDrafts(base,local,remote.data.draft);this.draftConflict={base:structuredClone(base),remote,paths:merged.conflicts};return Object.assign(new Error('Some fields changed in both this tab and GitHub. Choose how to resolve them; your edits are still here.'),{code:'DRAFT_CONFLICT',paths:merged.conflicts});}
 async saveDraft(body){
  if(!this.state||body.revision!==this.state.revision)throw new Error('A newer draft exists in this session. Download this tab’s draft before reconnecting.');
  validate(body.data);const base=structuredClone(this.state.draft);
  for(let attempt=0;attempt<2;attempt++){
   const remote=await this.client.json(this.sourceRepo,STATE);if(!remote)throw new Error('The saved draft is missing. Download this tab’s draft before reconnecting.');
   validate(remote.data.draft);const merged=mergeDrafts(base,body.data,remote.data.draft);
   if(merged.conflicts.length)throw this.conflictError(base,body.data,remote);
   const next={...remote.data,draft:merged.draft,revision:remote.data.revision+1,savedAt:new Date().toISOString()};validate(next.draft);
   try{const result=await this.client.put(this.sourceRepo,STATE,JSON.stringify(next),remote.sha,'Save Studio Desk draft');this.state=next;this.stateSha=result.content.sha;this.draftConflict=null;return {revision:next.revision,savedAt:next.savedAt,publishedAt:next.publishedAt,draft:structuredClone(next.draft)};}catch(error){if(error.status!==409||attempt===1)throw error;}
  }
 }
 async resolveDraft(local,choice){
  if(!this.draftConflict)throw new Error('Save the draft again to check for conflicts.');validate(local);
  const head=await this.client.head(this.sourceRepo,this.sourceBranch),remote=await this.client.json(this.sourceRepo,STATE,head),base=this.draftConflict.base;
  if(!remote)throw new Error('The saved draft is missing.');validate(remote.data.draft);
  if(remote.sha!==this.draftConflict.remote.sha)throw this.conflictError(base,local,remote);
  const merged=choice==='local'?mergeDrafts(base,local,remote.data.draft):mergeDrafts(base,remote.data.draft,local);
  const next={...remote.data,draft:merged.draft,revision:remote.data.revision+1,savedAt:new Date().toISOString()};validate(next.draft);
  const stamp=new Date().toISOString().replaceAll(':','-')+'_'+crypto.randomUUID();
  const files=new Map([[STATE,JSON.stringify(next)],['studio/history/'+stamp+'_tab.json',JSON.stringify({data:local,createdAt:next.savedAt,kind:'Draft before conflict resolution'})],['studio/history/'+stamp+'_github.json',JSON.stringify({data:remote.data.draft,createdAt:next.savedAt,kind:'GitHub draft before conflict resolution'})]]);
  const commit=await this.client.commitFiles(this.sourceRepo,this.sourceBranch,files,{expectedHead:head,message:'Resolve draft conflict; preserve both drafts in private history'});
  this.state=next;this.stateSha=(await this.client.json(this.sourceRepo,STATE,commit)).sha;this.draftConflict=null;return {draft:structuredClone(next.draft),revision:next.revision,publishedAt:next.publishedAt};
 }

 async api(path,body){
  if(path==='state'){if(!this.state)throw new Error('Import your portfolio to start editing.');return {draft:structuredClone(this.state.draft),revision:this.state.revision,savedAt:this.state.savedAt,publishedAt:this.state.publishedAt};}
  if(path==='save')return this.serial(()=>this.saveDraft(body));
  if(path==='publish')return this.serial(async()=>{await this.saveDraft(body);await this.publish(true,this.state.draft);return {revision:this.state.revision,savedAt:this.state.savedAt,publishedAt:this.state.publishedAt,draft:structuredClone(this.state.draft)};});
  if(path.startsWith('media'))return {items:await this.media(),cursor:null};
  if(path==='history')return {items:await this.history()};
  if(path==='restore'){if(!/^studio\/history\/[\w.-]+\.json$/.test(body.key))throw new Error('Invalid history entry.');const record=await this.client.json(this.sourceRepo,body.key);if(!record)throw new Error('Version missing.');return {data:record.data.data};}
  throw new Error('Unknown editor operation.');
 }
 async filesTree(){const head=await this.client.head(this.sourceRepo,this.sourceBranch);return (await this.client.tree(this.sourceRepo,head)).entries;}
 async fileBytes(url){if(this.mediaBytes.has(url))return this.mediaBytes.get(url);if(!/^(assets|media)\/[\w./-]+$/.test(url)||url.includes('..'))throw new Error('Invalid media reference.');const value=await this.client.file(this.sourceRepo,FILES+url);if(!value)throw new Error('Media file missing: '+url);const bytes=decode64(value.content);this.mediaBytes.set(url,bytes);return bytes;}
 previewUrl(url){return this.urls.get(url)||'';}
 async media(){const entries=(await this.filesTree()).filter(f=>f.type==='blob'&&f.path.startsWith(FILES));const result=[];for(const item of entries){const url=item.path.slice(FILES.length),type=types[url.split('.').pop()]||'application/octet-stream';if(!this.urls.has(url)){const bytes=await this.fileBytes(url);this.urls.set(url,URL.createObjectURL(new Blob([bytes],{type})));}result.push({url,name:url.split('/').pop(),size:item.size,type,previewUrl:this.urls.get(url)});}return result;}
 async history(){return (await this.filesTree()).filter(x=>x.type==='blob'&&x.path.startsWith('studio/history/')).map(x=>({key:x.path,date:(x.path.match(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z/)?.[0]||'').replace(/T(\d+)-(\d+)-(\d+)/,'T$1:$2:$3')})).reverse();}
 async preview(data,page){
  let html=pageHtml(structuredClone(data),page);
  for(const name of ['styles.css','content.css'])html=html.replace(new RegExp('<link rel="stylesheet" href="'+name.replace('.','\\.')+'[^"\\s]*">','g'),()=>'<style>'+this.assets[name]+'</style>');
  for(const name of ['theme.js','site.js'])html=html.replace(new RegExp('<script src="'+name.replace('.','\\.')+'[^"\\s]*"[^>]*></script>','g'),()=>'<script>'+this.assets[name].replace(/<\/script/gi,'<\\/script')+'</script>');
  const refs=[...new Set([...html.matchAll(/(?:src|poster)="((?:assets|media)\/[^"<>]+)"/g)].map(m=>m[1]))];
  for(const ref of refs){const bytes=await this.fileBytes(ref),type=types[ref.split('.').pop()]||'application/octet-stream';if(!this.urls.has(ref))this.urls.set(ref,URL.createObjectURL(new Blob([bytes],{type})));html=html.replaceAll('"'+ref+'"','"data:'+type+';base64,'+bytes64(bytes)+'"');}
  return html.replace('</body>','<script>document.addEventListener("click",e=>{const a=e.target.closest("a");if(a&&!a.getAttribute("href").startsWith("#"))e.preventDefault()})</script></body>');
 }
 async upload(file){return this.serial(async()=>{const allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif','video/mp4':'mp4','video/webm':'webm','audio/mpeg':'mp3','audio/wav':'wav'};if(!allowed[file.type])throw new Error('Use JPG, PNG, WebP, GIF, AVIF, MP4, WebM, MP3 or WAV.');if(!file.size||file.size>25000000)throw new Error('Use files under 25 MB.');const url='media/'+crypto.randomUUID()+'.'+allowed[file.type],bytes=new Uint8Array(await file.arrayBuffer());await this.client.commitFiles(this.sourceRepo,this.sourceBranch,new Map([[FILES+url,bytes]]),{message:'Upload portfolio media'});this.urls.set(url,URL.createObjectURL(new Blob([bytes],{type:file.type})));return {url,name:file.name,size:file.size,type:file.type};});}
 async deleteMedia(url){return this.serial(async()=>{const latest=await this.client.json(this.sourceRepo,STATE);if(!latest)throw new Error('Draft missing.');const refs=[latest.data.draft,latest.data.published];for(const h of await this.history())refs.push((await this.client.json(this.sourceRepo,h.key)).data.data);if(refs.some(x=>JSON.stringify(x).includes(url)))throw new Error('This file is still used by a draft, published version or history. Remove those references before deleting it.');const f=await this.client.file(this.sourceRepo,FILES+url);if(!f)throw new Error('File already removed.');await this.client.request(this.client.repoPath(this.sourceRepo)+'/contents/'+(FILES+url).split('/').map(encodeURIComponent).join('/'),{method:'DELETE',body:{message:'Remove unused media',sha:f.sha}});if(this.urls.has(url)){URL.revokeObjectURL(this.urls.get(url));this.urls.delete(url);}});}
 async migrateFromCurrent(progress=()=>{}){
  if(this.state)throw new Error('A GitHub draft already exists. Migration will not replace it.');
  const response=await this.fetcher('/api/admin/migration',{cache:'no-store'});if(!response.ok)throw new Error('Open setup from your current signed-in Studio Desk to copy its content.');const source=await response.json();validate(source.draft);validate(source.published);
  const next=initialState(source.draft,source.published),files=new Map();let index=0;
  for(const item of source.media){progress('Copying media '+(++index)+' of '+source.media.length);const r=await this.fetcher('/'+item.url);if(!r.ok)throw new Error('Could not copy '+item.url);files.set(FILES+item.url,new Uint8Array(await r.arrayBuffer()));}
  for(const item of source.history||[])files.set(item.path,JSON.stringify(item.value));
  next.savedAt=new Date().toISOString();files.set(STATE,JSON.stringify(next));const head=await this.client.head(this.sourceRepo,this.sourceBranch);
  if(await this.client.file(this.sourceRepo,STATE))throw new Error('A draft was created elsewhere. Reload to use it.');
  progress('Saving your portfolio privately on GitHub…');await this.client.commitFiles(this.sourceRepo,this.sourceBranch,files,{expectedHead:head,message:'Import portfolio and media into private Studio Desk'});
  const saved=await this.client.json(this.sourceRepo,STATE);this.state=saved.data;this.stateSha=saved.sha;
 }
 async publish(online,data=this.state?.draft,{setup=false}={}){
  if(!this.pagesReady)throw new Error('Create the public Pages repository and reconnect first.');
  if(!this.state&&!setup)throw new Error('Import your portfolio first.');
  const snapshot=structuredClone(data||{copy:{}});if(online)validate(snapshot);
  const head=await this.client.head(this.pagesRepo,this.pagesBranch),previous=await this.client.json(this.pagesRepo,'studio-release.json',head);
  if(!previous){const tree=await this.client.tree(this.pagesRepo,head);if(tree.entries.some(x=>x.type==='blob'&&!/^(README(?:\.md)?|LICENSE(?:\.md)?|\.gitignore|\.nojekyll)$/i.test(x.path)))throw new Error('This Pages repository already has files. Use an empty dedicated repository so setup does not replace another site.');}
  const {files,media}=makePublicTextFiles(snapshot,online,this.basePath,this.assets);
  for(const [path,content]of await this.installFiles())files.set(path,content);
  for(const url of media)files.set(url,await this.fileBytes(url));
  const manifest={format:1,online,requestId:crypto.randomUUID(),contentHash:online?await digest(snapshot):null,requestedAt:new Date().toISOString(),managedPaths:[...files.keys(),'studio-release.json']};
  files.set('studio-release.json',JSON.stringify(manifest));
  const remove=(previous?.data.managedPaths||[]).filter(path=>!files.has(path));
  if(online&&this.state.published){const date=new Date().toISOString().replaceAll(':','-');await this.client.put(this.sourceRepo,'studio/history/'+date+'_'+crypto.randomUUID()+'.json',JSON.stringify({data:this.state.published,createdAt:new Date().toISOString()}),null,'Save previous published content');}
  const commit=await this.client.commitFiles(this.pagesRepo,this.pagesBranch,files,{message:online?'Publish portfolio from Studio Desk':'Take portfolio offline; keep Studio Desk available',expectedHead:head,remove});
  if(online){const next={...this.state,published:snapshot,publishedAt:manifest.requestedAt,revision:this.state.revision+1};try{await this.saveState(next);}catch(e){throw new Error('GitHub received the website update, but the private publication record could not save. Reload and check Publishing before retrying.');}}
  this.pendingCommit=commit;return {commit,manifest};
 }
 async status(draft=this.state?.draft){
  if(!this.pagesReady)return {kind:'setup',label:'Pages repository not connected'};
  const head=await this.client.head(this.pagesRepo,this.pagesBranch),release=await this.client.json(this.pagesRepo,'studio-release.json',head);
  if(!release)return {kind:'setup',label:'Studio Desk is not installed on Pages yet'};
  const pages=await this.client.request(this.client.repoPath(this.pagesRepo)+'/pages',{missing:true});if(!pages)return {kind:'setup',label:'Enable Pages: deploy from '+this.pagesBranch+' / root'};
  const latest=await this.client.request(this.client.repoPath(this.pagesRepo)+'/pages/builds/latest',{missing:true});
  if(latest?.commit!==head||['queued','building'].includes(latest?.status))return {kind:'pending',label:this.pendingOperation==='editor'?'Deploying Studio Desk update · portfolio visibility unchanged…':release.data.online?'Publishing portfolio…':'Taking portfolio offline…'};
  if(latest?.status==='errored')return {kind:'failed',label:'GitHub deployment failed. Retry the deployment.'};
  if(latest?.status!=='built')return {kind:'pending',label:'Waiting for GitHub deployment confirmation…'};
  if(!release.data.online)return {kind:'offline',label:'Portfolio offline · Studio Desk available'};
  const current=draft&&await digest(draft)===release.data.contentHash;
  return {kind:current?'current':'stale',label:current?'Live · up to date':'Live · unpublished changes'};
 }
 async retryBuild(){await this.client.request(this.client.repoPath(this.pagesRepo)+'/pages/builds',{method:'POST'});}
 async restoreInput(input){return this.serial(async()=>{
  const draft=structuredClone(input.studioDeskBundle===1?input.state?.draft:input);validate(draft);
  const next=this.state?{...this.state,draft,revision:this.state.revision+1,savedAt:new Date().toISOString()}:initialState(draft,input.state?.published||draft);
  const files=new Map();for(const item of input.media||[]){if(!/^studio\/files\/(assets|media)\/[\w./-]+$/.test(item.path)||item.path.includes('..'))throw new Error('Invalid backup media path.');files.set(item.path,decode64(item.content));}
  const head=await this.client.head(this.sourceRepo,this.sourceBranch),current=await this.client.json(this.sourceRepo,STATE);
  if((current?.sha||null)!==(this.stateSha||null))throw new Error('A newer draft exists. Reload before restoring.');
  for(const item of input.history||[]){if(!/^studio\/history\/[\w.-]+\.json$/.test(item.path))throw new Error('Invalid history path.');validate(item.value.data);files.set(item.path,JSON.stringify(item.value));}
  if(this.state)files.set('studio/history/'+new Date().toISOString().replaceAll(':','-')+'_'+crypto.randomUUID()+'_before-restore.json',JSON.stringify({data:this.state.draft,createdAt:new Date().toISOString(),kind:'Draft before backup restore'}));
  files.set(STATE,JSON.stringify(next));await this.client.commitFiles(this.sourceRepo,this.sourceBranch,files,{expectedHead:head,message:'Restore private Studio Desk backup'});
  const result=await this.client.json(this.sourceRepo,STATE);this.state=result.data;this.stateSha=result.sha;
  for(const url of this.urls.values())URL.revokeObjectURL(url);this.urls.clear();this.mediaBytes.clear();return {draft:this.state.draft,revision:this.state.revision};
 });}
 async downloadBackup(){const media=[];for(const file of (await this.filesTree()).filter(x=>x.type==='blob'&&x.path.startsWith(FILES))){const blob=await this.client.file(this.sourceRepo,file.path);media.push({path:file.path,content:blob.content});}const history=[];for(const item of await this.history()){const record=await this.client.json(this.sourceRepo,item.key);history.push({path:item.key,value:record.data});}const blob=new Blob([JSON.stringify({studioDeskBundle:1,state:this.state,media,history})],{type:'application/json'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='studio-desk-full-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
 disconnect(){this.client.clear();for(const url of this.urls.values())URL.revokeObjectURL(url);this.urls.clear();this.mediaBytes.clear();}
}
