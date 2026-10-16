import {sealConnection,unlockConnection,vaultStorageKey} from './vault.js?v=4857c046d54b';
import {GitHubDesk} from './backend.js?v=4857c046d54b';
const q=s=>document.querySelector(s),text=(element,value)=>element.textContent=value;
let desk;
const setup=q('#github-connection'),notice=q('#connection-notice');
try{const config=JSON.parse(localStorage.getItem('studio-github-config')||'null');if(config){q('#source-repo').value=config.sourceRepo;q('#pages-repo').value=config.pagesRepo;}}catch{}
async function loadScript(name){return new Promise((resolve,reject)=>{const script=document.createElement('script');const url=new URL(name,import.meta.url);url.search=new URL(import.meta.url).search;script.src=url;script.onload=resolve;script.onerror=()=>reject(new Error('Editor file could not load: '+name));document.head.append(script);});}
async function openEditor(){window.studioBackend=desk;setup.hidden=true;q('.desk-layout').hidden=false;for(const name of ['model.js','app.js','editor.js','github-ui.js'])await loadScript(name);}
function setupLinks(){const repo=q('#pages-repo').value.trim();if(/^[\w.-]+\/[\w.-]+$/.test(repo)){q('#create-pages-repo').href='https://github.com/new?name='+encodeURIComponent(repo.split('/')[1]);q('#pages-settings-link').href='https://github.com/'+repo+'/settings/pages';}}
q('#pages-repo').addEventListener('input',setupLinks);setupLinks();
let savedEnvelope;
try{savedEnvelope=JSON.parse(localStorage.getItem(vaultStorageKey)||'null');}catch{}
function showUnlock(show){q('#github-unlock').hidden=!show;q('#github-connect').hidden=show;}
showUnlock(!!savedEnvelope);
q('#use-token').addEventListener('click',()=>showUnlock(false));
q('#forget-connection').addEventListener('click',()=>{try{localStorage.removeItem(vaultStorageKey);savedEnvelope=null;showUnlock(false);text(notice,'Saved connection removed from this browser.');}catch{text(notice,'Browser storage is unavailable. Clear this site’s data in your browser settings.');}});
q('#remember-connection').addEventListener('change',event=>{const enabled=event.target.checked;q('#remember-fields').hidden=!enabled;for(const id of ['#vault-password','#vault-confirm']){q(id).required=enabled;if(!enabled)q(id).value='';}});
async function connect(token,config,password){
 desk=new GitHubDesk(token,config);await desk.connect();
 let warning='';
 try{localStorage.setItem('studio-github-config',JSON.stringify(config));if(password){const envelope=await sealConnection(token,config,password);localStorage.setItem(vaultStorageKey,JSON.stringify(envelope));savedEnvelope=envelope;}}catch{warning='Connected for this session, but this browser could not save the connection. You will need your token next time.';}
 if(warning)alert(warning);
 if(desk.state){await openEditor();return;}
 q('#migration-options').hidden=false;text(notice,desk.pagesReady?'Connected. Copy your existing portfolio privately, then install the offline editor.':'Connected to your private repository. Create the public Pages repository shown below, then reconnect.');
}
q('#github-connect').addEventListener('submit',async event=>{event.preventDefault();const button=q('#connect-button');button.disabled=true;text(notice,'Checking GitHub access…');
 try{const config={sourceRepo:q('#source-repo').value.trim(),pagesRepo:q('#pages-repo').value.trim()};const password=q('#remember-connection').checked?q('#vault-password').value:null;if(password!==null&&(password.length<12||password!==q('#vault-confirm').value))throw Error('Use a password of at least 12 characters and make sure both passwords match.');const token=q('#github-token').value.trim();q('#github-token').value='';await connect(token,config,password);}
 catch(error){text(notice,error.message);desk?.disconnect();desk=null;}finally{q('#vault-password').value='';q('#vault-confirm').value='';button.disabled=false;}
});
q('#github-unlock').addEventListener('submit',async event=>{event.preventDefault();const button=event.submitter;button.disabled=true;text(notice,'Unlocking saved connection…');try{const password=q('#unlock-password').value;q('#unlock-password').value='';const {token,config}=await unlockConnection(savedEnvelope,password);await connect(token,config);}catch(error){text(notice,error.message);desk?.disconnect();desk=null;}finally{button.disabled=false;}});
q('#copy-current-site').addEventListener('click',async()=>{if(!desk)return;const button=q('#copy-current-site');button.disabled=true;try{await desk.migrateFromCurrent(message=>text(notice,message));text(notice,'Portfolio copied privately. Opening Studio Desk…');await openEditor();}catch(e){text(notice,e.message);button.disabled=false;}});
q('#initial-backup').addEventListener('change',async event=>{if(!desk)return;try{const parsed=JSON.parse(await event.target.files[0].text());await desk.restoreInput(parsed);await openEditor();}catch(e){text(notice,e.message)}finally{event.target.value='';}});
q('#connection-signout').addEventListener('click',()=>{desk?.disconnect();location.reload();});
