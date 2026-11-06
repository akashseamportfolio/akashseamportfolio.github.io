(() => {
const root=document.documentElement,button=document.querySelector('.theme-toggle');
function apply(theme){root.dataset.theme=theme;root.style.colorScheme=theme;button.setAttribute('aria-pressed',String(theme==='dark'));button.setAttribute('aria-label',theme==='dark'?document.body.dataset.themeLight:document.body.dataset.themeDark);button.title=button.getAttribute('aria-label');}
apply(root.dataset.theme);button.addEventListener('click',()=>{const theme=root.dataset.theme==='dark'?'light':'dark';apply(theme);try{localStorage.setItem('akash-theme',theme)}catch{}});
window.addEventListener('storage',e=>{if(e.key==='akash-theme')apply(e.newValue==='dark'?'dark':'light')});
const roleData=document.getElementById('portfolio-roles');
if(!roleData)return;
const delay=Math.min(60000,Math.max(1000,Number(roleData.dataset.delay)||5000)),transition=Math.min(3000,Math.max(100,Number(roleData.dataset.transition)||550));
const roles=JSON.parse(roleData.textContent),article=document.getElementById('role-article'),identity=document.getElementById('hero-identity');
let word=document.querySelector('.role-word');
if(!word||!roles.length)return;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let current=roles[0],timer,animations=[],switching=false,paused=motion.matches;
const history=[current];let cursor=0;
const controls=document.createElement('div');controls.className='role-controls';
const pause=document.createElement('button');pause.type='button';pause.className='role-pause';
const previous=document.createElement('button'),nextButton=document.createElement('button');
for(const [button,direction,label]of [[previous,-1,document.body.dataset.previousRole||'Previous role'],[nextButton,1,document.body.dataset.nextRole||'Next role']]){
 button.type='button';button.className='role-arrow '+(direction<0?'role-previous':'role-next');button.setAttribute('aria-label',label);button.title=label;
 button.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
 button.addEventListener('click',()=>rotate(direction,true));
 button.disabled=roles.length<2;
}
controls.append(pause,previous,nextButton);word.closest('.hero-title').after(controls);
function pauseLabel(){pause.textContent=paused?document.body.dataset.resumeRoles:document.body.dataset.pauseRoles;pause.setAttribute('aria-pressed',String(paused))}
pauseLabel();pause.addEventListener('click',()=>{paused=!paused;pauseLabel();schedule()});
function nextRole(){
 const candidates=roles.filter(role=>role.role!==current.role&&role.weight>0);
 if(!candidates.length)return current;
 let ticket=Math.random()*candidates.reduce((sum,role)=>sum+role.weight,0);
 for(const role of candidates){ticket-=role.weight;if(ticket<0)return role}
 return candidates[candidates.length-1];
}
function selectRole(direction){
 if(direction<0){if(cursor>0)return history[--cursor];history.unshift(nextRole());if(history.length>200)history.pop();return history[0];}
 if(cursor<history.length-1)return history[++cursor];
 history.push(nextRole());cursor++;if(history.length>200){history.shift();cursor--;}return history[cursor];
}
function show(role){current=role;word.textContent=role.role;word.setAttribute('href',role.href);article.textContent=role.article;identity.textContent=`${document.body.dataset.rolePrefix} ${role.article} `}
function schedule(){clearTimeout(timer);if(!paused&&!document.hidden&&!switching&&document.activeElement!==word&&!word.matches(':hover')&&roles.length>1)timer=setTimeout(()=>rotate(1),delay)}
async function rotate(direction=1,manual=false){
 if(switching||(!manual&&(paused||document.hidden)))return;
 clearTimeout(timer);switching=true;
 const next=selectRole(direction);
 // Keep the same link node so keyboard focus and its destination stay together.
 if(!motion.matches&&word.animate){
  animations=[word.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction*30}%)`,opacity:0}],{duration:transition/2,easing:'ease-in',fill:'both'})];
  await Promise.allSettled(animations.map(a=>a.finished));
  show(next);animations.forEach(a=>a.cancel());
  animations=[word.animate([{transform:`translateX(${direction*30}%)`,opacity:0},{transform:'translateX(0)',opacity:1}],{duration:transition/2,easing:'ease-out',fill:'both'})];
  await Promise.allSettled(animations.map(a=>a.finished));animations.forEach(a=>a.cancel());animations=[];
 }else show(next);
 switching=false;schedule();
}
word.addEventListener('focus',()=>{clearTimeout(timer)});word.addEventListener('blur',schedule);
word.addEventListener('pointerenter',()=>clearTimeout(timer));word.addEventListener('pointerleave',schedule);
show(current);schedule();
document.addEventListener('visibilitychange',schedule);
motion.addEventListener('change',()=>{if(motion.matches){paused=true;animations.forEach(animation=>animation.cancel());pauseLabel();schedule()}});

})();
// Clamp the expanded panel to the viewport, including narrow screens and zoom.
document.querySelectorAll('.work-menu').forEach(menu=>{
 const button=menu.querySelector('.work-toggle'),panel=menu.querySelector('.work-dropdown');let leaveTimer;
 const groups=[...panel.querySelectorAll('.work-group')];let categoryTimer;
 const animations=new WeakMap();
 function setGroup(group,open){
  const list=group.querySelector('.work-group-projects'),previous=animations.get(group);
  if(!previous&&group.open===open)return;
  previous?.cancel();animations.delete(group);
  if(!list?.animate||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||panel.hidden){group.open=open;if(list)list.inert=!open;return;}
  group.open=true;list.inert=!open;list.style.zIndex=open?'2':'1';
  const offset=panel.classList.contains('submenu-left')?6:-6;
  const hidden={opacity:0,transform:'translateX('+offset+'px)'},shown={opacity:1,transform:'translateX(0)'};
  const animation=list.animate(open?[hidden,shown]:[shown,hidden],{duration:open?180:120,easing:'ease-out',fill:'both'});
  animations.set(group,animation);
  animation.onfinish=()=>{if(animations.get(group)!==animation)return;group.open=open;animations.delete(group);animation.cancel();};
 }

 function position(){
  if(panel.hidden)return;
  const trigger=menu.querySelector('.work-trigger').getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight;
  const narrow=vw<580,width=narrow?Math.floor((vw-24)/2):240,subWidth=narrow?vw-24-width:280;
  const left=narrow?12:Math.max(12,Math.min(trigger.right-width,vw-width-12)),top=Math.max(12,Math.min(trigger.bottom+4,vh-100));
  const count=Math.max(1,Math.min(6,Math.floor((vh-top-70)/44)));
  groups.forEach((g,i)=>{g.hidden=i>=count;const links=[...g.querySelectorAll('.work-group-projects a:not(.work-more)')],more=g.querySelector('.work-more');links.forEach((a,j)=>a.hidden=j>=count);if(more){more.dataset.fullLabel ||= more.textContent;more.textContent=links.some(a=>a.hidden)?'And more ↗':more.dataset.fullLabel;}});
  panel.classList.toggle('submenu-left',!narrow&&left+width+subWidth>vw-12);
  panel.style.setProperty('--submenu-width',subWidth+'px');
  Object.assign(panel.style,{position:'fixed',left:left+'px',right:'auto',top:top+'px',width:width+'px',maxHeight:'none'});
 }
 function closeCategories(){clearTimeout(categoryTimer);groups.forEach(group=>setGroup(group,false));}
 function setOpen(open){clearTimeout(leaveTimer);panel.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open)position();else closeCategories();}
 menu.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')setOpen(true)});
 menu.querySelector('.work-trigger').addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')closeCategories()});
 menu.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')leaveTimer=setTimeout(()=>{if(!menu.contains(document.activeElement))setOpen(false)},160)});
 button.addEventListener('click',()=>setOpen(panel.hidden));
 groups.forEach(group=>{
  const summary=group.querySelector('summary');
  const activate=()=>{clearTimeout(categoryTimer);groups.forEach(other=>setGroup(other,other===group));position();};
  summary.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')activate()});
  group.addEventListener('pointerenter',()=>clearTimeout(categoryTimer));
  group.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')categoryTimer=setTimeout(()=>{if(!group.matches(':hover')&&!group.contains(document.activeElement))setGroup(group,false);},140)});
  summary.addEventListener('click',e=>{e.preventDefault();if(group.open)setGroup(group,false);else activate()});
  summary.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();activate();group.querySelector('.work-group-projects a:not([hidden])')?.focus();}});
  group.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();setGroup(group,false);summary.focus();}});
  group.addEventListener('focusout',()=>setTimeout(()=>{if(!group.contains(document.activeElement)&&!group.matches(':hover'))setGroup(group,false);},0));
 });

 menu.addEventListener('focusout',()=>setTimeout(()=>{if(!menu.contains(document.activeElement)&&!menu.matches(':hover'))setOpen(false)},0));
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);button.focus()}if(e.key==='ArrowDown'&&e.target===button){e.preventDefault();setOpen(true);panel.querySelector('summary')?.focus()}});
 document.addEventListener('click',e=>{if(!menu.contains(e.target))setOpen(false)});window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});
});
// One reusable tooltip, available to mouse and keyboard users. Touch users can
// follow dot links directly without an extra disclosure control.
(()=>{const dots=document.querySelectorAll('[data-tooltip]');if(!dots.length)return;const tip=document.createElement('div');tip.id='project-tooltip';tip.className='project-tooltip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.append(tip);let active,timer;
 const hide=()=>{tip.hidden=true;active?.removeAttribute('aria-describedby');active=null};
 const show=dot=>{clearTimeout(timer);active?.removeAttribute('aria-describedby');active=dot;tip.textContent=dot.dataset.tooltip;tip.hidden=false;dot.setAttribute('aria-describedby',tip.id);const r=dot.getBoundingClientRect(),w=tip.offsetWidth;tip.style.left=Math.max(12,Math.min(r.left+r.width/2-w/2,document.documentElement.clientWidth-w-12))+'px';tip.style.top=(r.top>tip.offsetHeight+16?r.top-tip.offsetHeight-8:r.bottom+8)+'px'};
 dots.forEach(dot=>{dot.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show(dot)});dot.addEventListener('pointerleave',()=>timer=setTimeout(hide,160));dot.addEventListener('focus',()=>show(dot));dot.addEventListener('blur',hide)});tip.addEventListener('pointerenter',()=>clearTimeout(timer));tip.addEventListener('pointerleave',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});window.addEventListener('scroll',hide,{passive:true});window.addEventListener('resize',hide);
})();
const siteHeader=document.querySelector('.site-header');if(siteHeader){const measure=()=>document.documentElement.style.setProperty('--header-height',siteHeader.getBoundingClientRect().height+'px');measure();window.addEventListener('resize',measure);}

// Gesture-driven card momentum. New input interrupts at the current angle.
(()=>{
 const cards=document.querySelectorAll('[data-portrait-flip]');if(!cards.length)return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 cards.forEach(card=>{
  const button=card.querySelector('.portrait-toggle'),turn=card.querySelector('.portrait-turn'),front=card.querySelector('.portrait-front'),back=card.querySelector('.portrait-back'),photo=back.querySelector('img');
  let angle=180,frame=0,available=true,gesture=null,suppressClickUntil=0,targetAngle=180;
  // A short, in-view touch introduction; desktop hints only appear on hover/focus.
  let hintTimer;
  const dismissHint=()=>{clearTimeout(hintTimer);card.classList.remove('hint-visible');};
  if(window.matchMedia('(hover: none)').matches){
   const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){card.classList.add('hint-visible');hintTimer=setTimeout(dismissHint,4000);observer.disconnect();}},{threshold:.6});
   observer.observe(card);
  }
  button.addEventListener('pointerdown',dismissHint);
  button.addEventListener('click',dismissHint);

  function draw(){turn.style.transform='rotateY('+angle+'deg)';}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  function settle(target){stop();angle=((target%360)+360)%360;draw();const photoVisible=Math.round(angle/180)%2===1;front.setAttribute('aria-hidden',String(photoVisible));back.setAttribute('aria-hidden',String(!photoVisible));button.setAttribute('aria-pressed',String(photoVisible));}
  function animate(target,duration,click=false){
   stop();targetAngle=target;const start=angle,started=performance.now();
   if(motion.matches){settle(target);return;}
   function tick(now){const t=Math.min(1,(now-started)/duration),ease=click?t*t*(3-2*t):1-Math.pow(1-t,3);angle=start+(target-start)*ease;draw();if(t<1)frame=requestAnimationFrame(tick);else settle(target);}
   frame=requestAnimationFrame(tick);
  }
  function coast(velocity){
   if(!available)return;
   const direction=Math.sign(velocity||1),speed=Math.min(850,Math.max(180,Math.abs(velocity)));
   const strength=(speed-180)/670;
   // Two full turns for a light flick, rising to four for a strong flick.
   const travel=direction*(720+720*strength+(Math.random()-.5)*120);
   const target=Math.round((angle+travel)/180)*180;
   animate(target,3200+800*strength);
  }
  function unavailable(){available=false;gesture=null;settle(0);button.hidden=true;}
  photo.addEventListener('error',unavailable);
  if(photo.complete&&!photo.naturalWidth)unavailable();else{button.hidden=false;settle(180);}
  // An outside-origin mouse sweep flicks the card without capturing the pointer.
  let sweep=null;
  document.addEventListener('pointerdown',event=>{
   if(event.pointerType!=='mouse'||event.button!==0||card.contains(event.target)||event.target.closest('a,button,input,textarea,select,[contenteditable="true"]'))return;
   sweep={id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now(),inside:false,direction:0};
  });
  document.addEventListener('pointermove',event=>{
   if(!sweep||event.pointerId!==sweep.id)return;
   if(!(event.buttons&1)){sweep=null;return;}
   const now=performance.now(),r=card.getBoundingClientRect(),dx=event.clientX-sweep.x,dy=event.clientY-sweep.y;
   const inside=event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;
   const edge=dx>0?r.left:r.right,t=dx?(edge-sweep.x)/dx:-1,y=sweep.y+t*dy;
   const crossed=t>=0&&t<=1&&y>=r.top&&y<=r.bottom;
   const direction=Math.sign(dx);
   if((inside||crossed)&&Math.abs(dx)>3&&Math.abs(dx)>Math.abs(dy)&&(!sweep.inside||direction!==sweep.direction)){
    suppressClickUntil=now+500;coast(dx/Math.max(16,now-sweep.time)*850);sweep.direction=direction;
   }
   Object.assign(sweep,{x:event.clientX,y:event.clientY,time:now,inside});
  });
  document.addEventListener('pointerup',()=>sweep=null);
  document.addEventListener('pointercancel',()=>sweep=null);
  button.addEventListener('pointerdown',event=>{
   if(event.button!==0||!available)return;
   stop();gesture={id:event.pointerId,x:event.clientX,y:event.clientY,start:angle,moved:false,samples:[{x:event.clientX,time:performance.now()}]};
   button.setPointerCapture?.(event.pointerId);
  });
  button.addEventListener('pointermove',event=>{
   if(!gesture||event.pointerId!==gesture.id)return;
   const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y,now=performance.now();
   if(!gesture.moved&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*1.3)gesture.moved=true;
   if(gesture.moved){if(event.cancelable)event.preventDefault();angle=gesture.start+dx*.85;if(!motion.matches)draw();}
   gesture.samples=gesture.samples.filter(p=>now-p.time<100);gesture.samples.push({x:event.clientX,time:now});
  },{passive:false});
  button.addEventListener('pointerup',event=>{
   if(!gesture||event.pointerId!==gesture.id)return;
   const drag=gesture;gesture=null;
   if(drag.moved){const now=performance.now(),first=drag.samples.find(p=>now-p.time<120);suppressClickUntil=now+500;const velocity=first?(event.clientX-first.x)/Math.max(16,now-first.time)*850:0;if(Math.abs(velocity)<40)animate(Math.round(angle/180)*180,300,true);else coast(velocity);}
  });
  button.addEventListener('pointercancel',()=>{gesture=null;animate(Math.round(angle/180)*180,250,true);});
  button.addEventListener('click',event=>{
   if(!available||(event?.detail!==0&&performance.now()<suppressClickUntil))return;
   gesture=null;animate((Math.round(angle/180)+1)*180,450,true);
  });
  button.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();gesture=null;settle(Math.round(angle/180)*180);}});
  motion.addEventListener('change',()=>{if(motion.matches){gesture=null;settle(frame?targetAngle:Math.round(angle/180)*180);}});
 });
})();

// Native image/link dragging competes with the portrait's held-pointer gestures.
document.addEventListener('dragstart',event=>{if(!event.target.closest('input,textarea,[contenteditable="true"]'))event.preventDefault();});
// Reading aids appear only on project pages. The gradient follows the page theme.
(()=>{const page=document.querySelector('.case-page');if(!page)return;const top=page.querySelector('.case-back-top'),hint=page.querySelector('.case-scroll-hint');let pending=false;function measure(){pending=false;const root=document.documentElement,bottom=window.scrollY+window.innerHeight>=root.scrollHeight-8;if(top)top.hidden=window.scrollY<300;if(hint)hint.classList.toggle('at-bottom',bottom)}function schedule(){if(!pending){pending=true;requestAnimationFrame(measure)}}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);if(typeof ResizeObserver!=='undefined')new ResizeObserver(schedule).observe(document.body);measure();})();

// Skill links enter at the overview, then visibly scroll to the chosen evidence.
(()=>{
 const key='portfolio-evidence-scroll';
 document.addEventListener('click',event=>{
  const link=event.target.closest('.dot[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!url.hash||url.pathname===location.pathname)return;
  try{sessionStorage.setItem(key,JSON.stringify({path:url.pathname,hash:url.hash,time:Date.now()}));event.preventDefault();location.assign(url.pathname+url.search);}catch{}
 });
 const page=document.querySelector('.case-page');if(!page)return;
 let pending=null;try{pending=JSON.parse(sessionStorage.getItem(key));sessionStorage.removeItem(key);}catch{}
 let cleanup=()=>{};
 function navigate(hash=location.hash,animate=false){
  cleanup();let id;try{id=decodeURIComponent(hash.slice(1))}catch{return}
  const section=document.getElementById(id);if(!section?.matches('.case-story section'))return;
  const heading=section.querySelector('h2')||section,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active=true,frame=0,started=0,origin=window.scrollY,timeout;
  const destination=()=>{const header=document.querySelector('.site-header');return Math.max(0,window.scrollY+heading.getBoundingClientRect().top-(header?.getBoundingClientRect().height||0)-12);};
  const stop=()=>{active=false;cancelAnimationFrame(frame);clearTimeout(timeout);observer?.disconnect();for(const e of ['wheel','touchstart','pointerdown','keydown'])window.removeEventListener(e,stop,true);};
  const tick=now=>{if(!active)return;if(!started)started=now;const t=animate&&!reduced?Math.min(1,(now-started)/850):1,ease=1-Math.pow(1-t,3);window.scrollTo({top:origin+(destination()-origin)*ease,behavior:'instant'});if(t<1)frame=requestAnimationFrame(tick);else{animate=false;frame=0;}};
  const schedule=()=>{if(active&&!frame)frame=requestAnimationFrame(tick)};
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(!animate)schedule()}):null;
  cleanup=stop;timeout=setTimeout(stop,12000);observer?.observe(page);
  for(const e of ['wheel','touchstart','pointerdown','keydown'])window.addEventListener(e,stop,{capture:true,passive:true});
  for(const img of page.querySelectorAll('img'))if(img.compareDocumentPosition(section)&Node.DOCUMENT_POSITION_FOLLOWING)img.loading='eager';
  document.fonts?.ready.then(schedule);schedule();
 }
 if(pending?.path===location.pathname&&Date.now()-pending.time<30000){history.replaceState(null,'',location.pathname+location.search+pending.hash);requestAnimationFrame(()=>navigate(pending.hash,true));}
 else navigate();
 window.addEventListener('hashchange',()=>navigate(location.hash,true));
 document.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(!link)return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname===location.pathname&&url.hash===location.hash)requestAnimationFrame(()=>navigate(url.hash,true));});
})();

// Project previews share motion preferences and stop when they leave the viewport.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const controllers=[];
 function play(video){if(video?.tagName==='VIDEO'){video.muted=true;video.play().catch(()=>{});}}
 document.querySelectorAll('[data-project-preview]').forEach(tile=>{
  const media=tile.querySelector('.preview-motion'),button=tile.querySelector('.preview-toggle');let visible=false,hover=false,manual=null;
  const update=()=>{const on=visible&&(manual??(!reduced.matches&&(tile.dataset.projectPreview==='auto'||hover)));tile.classList.toggle('preview-playing',on);if(media?.tagName==='VIDEO'){if(on)play(media);else media.pause();}button.textContent=on?button.dataset.pauseLabel:button.dataset.playLabel;button.setAttribute('aria-label',button.textContent+' · '+tile.querySelector('.project-title').textContent);button.setAttribute('aria-pressed',String(on));};
  tile.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;update();}});tile.addEventListener('pointerleave',()=>{hover=false;if(tile.dataset.projectPreview==='hover')manual=null;update();});
  tile.addEventListener('focusin',()=>{hover=true;update();});tile.addEventListener('focusout',e=>{if(!tile.contains(e.relatedTarget)){hover=false;update();}});
  button.addEventListener('click',()=>{manual=!tile.classList.contains('preview-playing');update();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.15}).observe(tile);controllers.push(()=>{manual=null;update();});
 });
 document.querySelectorAll('[data-carousel]').forEach(carousel=>{
  const slides=[...carousel.querySelectorAll('[data-slide]')],motion=carousel.querySelector('[data-carousel-motion]');let index=0,visible=false,manual=null,start=null;
  function update(){slides.forEach((slide,i)=>{slide.hidden=i!==index;const video=slide.querySelector('video');if(video){if(i===index&&visible&&(manual??!reduced.matches))play(video);else video.pause();}});const video=slides[index].querySelector('video');motion.hidden=!video;const on=visible&&(manual??!reduced.matches);motion.textContent=on?motion.dataset.pauseLabel:motion.dataset.playLabel;motion.setAttribute('aria-pressed',String(on));carousel.querySelector('[data-carousel-count]').textContent=`${index+1} / ${slides.length}`;}
  new ResizeObserver(()=>{const frame=slides[index].querySelector('.carousel-frame');carousel.style.setProperty('--carousel-mid',`${frame.getBoundingClientRect().height/2}px`);}).observe(carousel);
  function step(amount){index=(index+amount+slides.length)%slides.length;manual=null;const video=slides[index].querySelector('video');if(video)video.currentTime=0;update();}
  carousel.querySelectorAll('[data-carousel-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.carouselStep))));
  carousel.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}});
  carousel.addEventListener('pointerdown',e=>{if(!e.target.closest('button'))start={x:e.clientX,y:e.clientY};});carousel.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)step(dx<0?1:-1);});carousel.addEventListener('pointercancel',()=>start=null);
  motion.addEventListener('click',()=>{manual=!(manual??!reduced.matches);update();});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.1}).observe(carousel);controllers.push(()=>{manual=null;update();});update();
 });
 reduced.addEventListener('change',()=>controllers.forEach(update=>update()));
})();

// Pointer velocity and held arrows feed one interruptible, snapping carousel.
(()=>{
 document.querySelectorAll('[data-work-carousel]').forEach(carousel=>{
  const track=carousel.querySelector('.projects'),cards=[...track.children],viewport=carousel.querySelector('.work-carousel-window'),controls=carousel.querySelector('.work-carousel-controls'),status=carousel.querySelector('.work-carousel-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let position=0,base=0,velocity=0,frame=0,last=0,drag=null,held=null,snap=null,suppressUntil=0,active=false;
  carousel.classList.add('is-ready');
  const count=()=>Math.min(cards.length,Number(getComputedStyle(carousel).getPropertyValue('--cards-visible'))||3);
  const width=()=>track.firstElementChild.getBoundingClientRect().width+(parseFloat(getComputedStyle(track).gap)||0);
  function draw(){
   const nextBase=Math.floor(position+1e-7);
   while(base<nextBase){track.append(track.firstElementChild);base++;}
   while(base>nextBase){track.prepend(track.lastElementChild);base--;}
   const fraction=position-base;track.style.transform=`translateX(${-fraction*width()}px)`;
   [...track.children].forEach((card,i)=>{const shown=i<count()||(fraction>.001&&i===count());card.inert=!shown;card.setAttribute('aria-hidden',String(!shown));});
   status.textContent=`${((Math.round(position)%cards.length)+cards.length)%cards.length+1} / ${cards.length}`;
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;velocity=0;snap=null;}
  function settle(target=Math.round(position)){if(reduced.matches){position=target;draw();stop();return;}snap={from:position,to:target,start:performance.now()};run();}
  function tick(now){const dt=Math.min(.035,(now-(last||now))/1000);last=now;
   if(held){if(!reduced.matches&&now-held.start>260){velocity=held.direction*Math.min(4,.8+(now-held.start-260)/500);position+=velocity*dt;}}
   else if(snap){const t=Math.min(1,(now-snap.start)/260);position=snap.from+(snap.to-snap.from)*(1-Math.pow(1-t,3));if(t===1){position=snap.to;snap=null;velocity=0;draw();frame=0;last=0;return;}}
   else{position+=velocity*dt;velocity*=Math.exp(-4.8*dt);if(Math.abs(velocity)<.12){frame=0;settle();return;}}
   draw();frame=requestAnimationFrame(tick);
  }
  function run(){if(!frame)frame=requestAnimationFrame(tick);}
  function advance(direction){if(!active)return;stop();settle(Math.round(position)+direction);}
  function resize(){stop();drag=null;held=null;position=Math.round(position);active=cards.length>count();controls.hidden=!active;carousel.classList.toggle('is-scrollable',active);draw();}
  controls.querySelectorAll('button').forEach(button=>{
   button.addEventListener('pointerdown',event=>{if(event.button!==0||!active)return;stop();held={direction:Number(button.dataset.workStep),start:performance.now()};button.setPointerCapture(event.pointerId);run();});
   const release=()=>{if(!held)return;const h=held;held=null;const elapsed=performance.now()-h.start;cancelAnimationFrame(frame);frame=0;last=0;if(elapsed<=260||reduced.matches)advance(h.direction);else run();};
   button.addEventListener('pointerup',release);button.addEventListener('pointercancel',()=>{held=null;stop();settle();});button.addEventListener('lostpointercapture',release);
   button.addEventListener('click',event=>{if(event.detail===0)advance(Number(button.dataset.workStep));});
  });
  viewport.addEventListener('pointerdown',event=>{if(!active||event.button!==0||event.target.closest('button'))return;stop();drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,time:performance.now(),origin:position,moved:false};});
  viewport.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.moved){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return;}if(Math.abs(dx)<6)return;drag.moved=true;viewport.setPointerCapture(event.pointerId);carousel.classList.add('is-dragging');}const now=performance.now(),dt=Math.max(.008,(now-drag.time)/1000),delta=-(event.clientX-drag.lastX)/width();position+=delta;velocity=Math.max(-6,Math.min(6,.25*velocity+.75*delta/dt));drag.lastX=event.clientX;drag.time=now;draw();});
  function releaseDrag(event){if(!drag||drag.id!==event.pointerId)return;const d=drag;drag=null;carousel.classList.remove('is-dragging');if(!d.moved)return;suppressUntil=performance.now()+500;if(performance.now()-d.time>100)velocity=0;const travel=position-d.origin;if(reduced.matches||Math.abs(velocity)<.4)settle(Math.abs(travel)>.08?Math.round(d.origin)+Math.sign(travel):Math.round(position));else run();}
  viewport.addEventListener('pointerup',releaseDrag);viewport.addEventListener('pointercancel',()=>{drag=null;carousel.classList.remove('is-dragging');stop();settle();});
  viewport.addEventListener('click',event=>{if(performance.now()<suppressUntil){event.preventDefault();event.stopPropagation();}},true);
  carousel.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}if(event.key==='Escape'){held=null;stop();settle();}});
  new ResizeObserver(resize).observe(viewport);reduced.addEventListener('change',resize);resize();
 });
 if(location.hash.startsWith('#group-'))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant',block:'start'}));
})();

