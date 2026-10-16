export const encodeText=text=>bytes64(new TextEncoder().encode(text));
export function bytes64(bytes){let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary)}
export const decode64=content=>Uint8Array.from(atob(content.replace(/\s/g,'')),c=>c.charCodeAt(0));
export const decodeText=content=>new TextDecoder().decode(decode64(content));
export const safePath=path=>{if(!path||path.startsWith('/')||path.split('/').some(x=>!x||x==='.'||x==='..')||/[\\\x00-\x1f]/.test(path))throw new Error('Invalid file path.');return path.split('/').map(encodeURIComponent).join('/')};
export async function digest(value){const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('')}
export class GitHubClient{
 #token;#fetch;
 constructor(token,fetcher=fetch){this.#token=token;this.#fetch=fetcher.bind(globalThis);}
 clear(){this.#token=''}
 async request(path,{method='GET',body,missing=false}={}){
  if(!this.#token)throw new Error('Connect to GitHub to continue.');
  if(!path.startsWith('/')||path.startsWith('//'))throw new Error('Invalid GitHub endpoint.');
  const response=await this.#fetch('https://api.github.com'+path,{method,headers:{Authorization:'Bearer '+this.#token,Accept:'application/vnd.github+json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(response.status===404&&missing)return null;
  if(!response.ok){const status=response.status;const message=status===401?'Your GitHub token has expired or is invalid. Reconnect with a valid token.':status===403?'GitHub denied this request. Check repository permissions or API usage limits.':status===404?'Repository or file not found. Check the name and that your token can access it.':[409,422].includes(status)?'GitHub changed since this editor loaded. Reload before saving; your current text is still here.':'GitHub could not complete the request ('+status+'). Try again.';throw Object.assign(new Error(message),{status});}
  return response.status===204?null:response.json();
 }
 repoPath(repo){if(!/^[\w.-]+\/[\w.-]+$/.test(repo))throw new Error('Use owner/repository.');return '/repos/'+repo}
 async repo(repo){return this.request(this.repoPath(repo))}
 async file(repo,path,ref){const value=await this.request(this.repoPath(repo)+'/contents/'+safePath(path)+(ref?'?ref='+encodeURIComponent(ref):''),{missing:true});if(!value)return null;if(value.type!=='file')throw new Error('Expected a file.');if(value.content===undefined||value.encoding==='none'){const blob=await this.request(this.repoPath(repo)+'/git/blobs/'+value.sha);value.content=blob.content;}return value;}
 async json(repo,path,ref){const f=await this.file(repo,path,ref);return f?{data:JSON.parse(decodeText(f.content)),sha:f.sha}:null}
 async put(repo,path,text,sha,message){return this.request(this.repoPath(repo)+'/contents/'+safePath(path),{method:'PUT',body:{message,content:encodeText(text),...(sha?{sha}:{})}})}
 async head(repo,branch){return (await this.request(this.repoPath(repo)+'/git/ref/heads/'+safePath(branch))).object.sha}
 async tree(repo,ref){const commit=await this.request(this.repoPath(repo)+'/git/commits/'+ref);const tree=await this.request(this.repoPath(repo)+'/git/trees/'+commit.tree.sha+'?recursive=1');if(tree.truncated)throw new Error('This repository is too large to list safely.');return {sha:commit.tree.sha,entries:tree.tree};}
 async commitFiles(repo,branch,files,{message,expectedHead,remove=[]}={}){
  const head=await this.head(repo,branch);if(expectedHead&&head!==expectedHead)throw new Error('The repository changed. Reload before publishing.');
  const base=await this.tree(repo,head),entries=[];
  for(const [path,value] of files){safePath(path);const blob=await this.request(this.repoPath(repo)+'/git/blobs',{method:'POST',body:{encoding:'base64',content:typeof value==='string'?encodeText(value):bytes64(value)}});entries.push({path,mode:'100644',type:'blob',sha:blob.sha});}
  for(const path of remove){safePath(path);if(base.entries.some(x=>x.path===path))entries.push({path,mode:'100644',type:'blob',sha:null});}
  const tree=await this.request(this.repoPath(repo)+'/git/trees',{method:'POST',body:{base_tree:base.sha,tree:entries}});
  const commit=await this.request(this.repoPath(repo)+'/git/commits',{method:'POST',body:{message,tree:tree.sha,parents:[head]}});
  // Never force a ref. A concurrent save must fail rather than replace another edit.
  await this.request(this.repoPath(repo)+'/git/refs/heads/'+safePath(branch),{method:'PATCH',body:{sha:commit.sha,force:false}});
  return commit.sha;
 }
}
