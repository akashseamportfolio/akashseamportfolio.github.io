import {renderHome,renderWork,renderSkills,renderProject,validate,escape} from './runtime.js?v=281ecef8919e';
import {templates} from './templates.js?v=281ecef8919e';
export function renderPages(data){validate(data);return new Map([['index.html',renderHome(data,templates)],['work/index.html',renderWork(data,templates)],['skills/index.html',renderSkills(data,templates)],...data.projects.filter(p=>p.status==='published'&&p.pageEnabled).map(p=>[p.slug+'/index.html',renderProject(data,p,templates)])]);}
export function pageHtml(data,id){validate(data);if(id==='home')return renderHome(data,templates);if(id==='work')return renderWork(data,templates);if(id==='skills')return renderSkills(data,templates);const p=data.projects.find(p=>p.id===id);if(!p)throw new Error('Project not found.');p.status='published';p.pageEnabled=true;return renderProject(data,p,templates);}
export function cleanLinks(html,base='/'){
 if(!/^\/(?:[\w.-]+\/)*$/.test(base))throw new Error('Invalid site base path.');
 html=html.replace(/(["'])((?:[\w-]+)\.html)(#[^"']*)?\1/g,(_,quote,file,hash='')=>quote+base+(file==='index.html'?'':file.slice(0,-5)+'/')+hash+quote);
 return html.replace(/\b(href|src|poster)="((?:assets\/|media\/|styles\.css|content\.css|site\.js|theme\.js)[^"]*)"/g,(_,attr,path)=>`${attr}="${base}${path}"`);
}
export function mediaReferences(pages){const files=new Set();for(const html of pages.values())for(const m of html.matchAll(/(?:src|poster|href)="(?:\/?)(assets\/[^"<>?#]+|media\/[^"<>?#]+)"/g))files.add(m[1]);return files;}
export function offlinePage(copy={}){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escape(copy.offlineTitle||'Portfolio unavailable')}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F0F3F5;color:#182731;font:18px/1.6 system-ui}main{max-width:34rem;padding:32px}h1{font-size:clamp(28px,6vw,44px);line-height:1.2}</style></head><body><main><h1>${escape(copy.offlineTitle||'Portfolio unavailable')}</h1><p>${escape(copy.offlineMessage||'This portfolio is currently offline.')}</p></main></body></html>`;}
export function makePublicTextFiles(data,online,base,assets){
 const pages=online?renderPages(structuredClone(data)):new Map([['index.html',offlinePage(data.copy)]]);
 const files=new Map([...pages].map(([path,html])=>[path,cleanLinks(html,base)]));
 files.set('404.html',online?`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found</title></head><body><h1>${escape(data.copy.pageMissing)}</h1><a href="${base}">${escape(data.copy.backPortfolio)}</a></body></html>`:offlinePage(data.copy));
 files.set('.nojekyll','');files.set('robots.txt','User-agent: *\nDisallow: /\n');
 if(online)for(const [path,content]of Object.entries(assets))files.set(path,content);
 return {files,media:online?mediaReferences(pages):new Set()};
}
