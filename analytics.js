// Optional analytics: public site only; no admin credentials are ever included.
(async()=>{
 if(window.top!==window.self||location.protocol!=='https:'||window.__portfolioAnalyticsStarted)return;
 let config=document.querySelector('meta[name="portfolio-analytics"]');
 if(!config&&/\/morph(?:\/|$)/.test(location.pathname)){
  try{const url=new URL('analytics-config.json',document.currentScript?.src||window.__portfolioAnalyticsScript);const response=await fetch(url,{cache:'no-store'});if(!response.ok)return;const value=await response.json();if(!value.enabled||! /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(value.code))return;config={content:value.code,dataset:{host:value.hostname}}}catch{return}
 }
 if(!config||window.top!==window.self||location.protocol!=='https:'||location.hostname!==config.dataset.host||/^\/(admin|github-admin)(\/|$)/.test(location.pathname))return;
 try{if(localStorage.getItem('studio-analytics-exclude')==='1')return}catch{}
 window.__portfolioAnalyticsStarted=true;
 window.goatcounter={path:()=>location.pathname};
 const script=document.createElement('script');script.async=true;script.src='https://gc.zgo.at/count.js';script.dataset.goatcounter='https://'+config.content+'.goatcounter.com/count';document.head.appendChild(script);
 document.addEventListener('click',event=>{
  const a=event.target.closest('a');if(!a||!window.goatcounter?.count)return;
  const kind=a.matches('.dot')?'skill-evidence':a.matches('.role-word')?'rotating-role':a.href.startsWith('mailto:')?'email-contact':null;
  if(kind)window.goatcounter.count({path:kind,title:kind.replaceAll('-',' '),event:true});
 });
})();
