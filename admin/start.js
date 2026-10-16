import {GitHubDesk} from './backend.js?v=281ecef8919e';
const q=s=>document.querySelector(s),text=(element,value)=>element.textContent=value;
let desk;
const setup=q('#github-connection'),notice=q('#connection-notice');
try{const config=JSON.parse(localStorage.getItem('studio-github-config')||'null');if(config){q('#source-repo').value=config.sourceRepo;q('#pages-repo').value=config.pagesRepo;}}catch{}
async function loadScript(name){return new Promise((resolve,reject)=>{const script=document.createElement('script');const url=new URL(name,import.meta.url);url.search=new URL(import.meta.url).search;script.src=url;script.onload=resolve;script.onerror=()=>reject(new Error('Editor file could not load: '+name));document.head.append(script);});}
async function openEditor(){window.studioBackend=desk;setup.hidden=true;q('.desk-layout').hidden=false;for(const name of ['model.js','app.js','editor.js','github-ui.js'])await loadScript(name);}
function setupLinks(){const repo=q('#pages-repo').value.trim();if(/^[\w.-]+\/[\w.-]+$/.test(repo)){q('#create-pages-repo').href='https://github.com/new?name='+encodeURIComponent(repo.split('/')[1]);q('#pages-settings-link').href='https://github.com/'+repo+'/settings/pages';}}
q('#pages-repo').addEventListener('input',setupLinks);setupLinks();
q('#github-connect').addEventListener('submit',async event=>{event.preventDefault();const button=q('#connect-button');button.disabled=true;text(notice,'Checking GitHub access…');
 try{const config={sourceRepo:q('#source-repo').value.trim(),pagesRepo:q('#pages-repo').value.trim()};desk=new GitHubDesk(q('#github-token').value.trim(),config);q('#github-token').value='';await desk.connect();localStorage.setItem('studio-github-config',JSON.stringify(config));if(desk.state){await openEditor();return;}q('#migration-options').hidden=false;text(notice,desk.pagesReady?'Connected. Copy your existing portfolio privately, then install the offline editor.':'Connected to your private repository. Create the public Pages repository shown below, then reconnect.');}
 catch(error){text(notice,error.message);desk?.disconnect();desk=null;}finally{button.disabled=false;}
});
q('#copy-current-site').addEventListener('click',async()=>{if(!desk)return;const button=q('#copy-current-site');button.disabled=true;try{await desk.migrateFromCurrent(message=>text(notice,message));text(notice,'Portfolio copied privately. Opening Studio Desk…');await openEditor();}catch(e){text(notice,e.message);button.disabled=false;}});
q('#initial-backup').addEventListener('change',async event=>{if(!desk)return;try{const parsed=JSON.parse(await event.target.files[0].text());await desk.restoreInput(parsed);await openEditor();}catch(e){text(notice,e.message)}finally{event.target.value='';}});
q('#connection-signout').addEventListener('click',()=>{desk?.disconnect();location.reload();});
