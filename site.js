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
 function position(){if(panel.hidden)return;const trigger=menu.querySelector('.work-trigger').getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight;const width=Math.min(320,vw-24),left=Math.max(12,Math.min(trigger.right-width,vw-width-12)),top=Math.max(12,Math.min(trigger.bottom+4,vh-100));Object.assign(panel.style,{position:'fixed',left:left+'px',right:'auto',top:top+'px',width:width+'px',maxHeight:Math.max(80,vh-top-12)+'px'});}
 function setOpen(open){clearTimeout(leaveTimer);panel.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open)position();else panel.querySelectorAll('.work-group').forEach(group=>group.open=false)}
 menu.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')setOpen(true)});
 menu.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')leaveTimer=setTimeout(()=>{if(!menu.contains(document.activeElement))setOpen(false)},160)});
 button.addEventListener('click',()=>setOpen(panel.hidden));
 panel.querySelectorAll('.work-group').forEach(group=>{group.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')group.open=true});group.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!group.contains(document.activeElement))group.open=false})});
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

// Pointer entry gives the card a flick. The hit area never rotates.
(()=>{
 const cards=document.querySelectorAll('[data-portrait-flip]');if(!cards.length)return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let samples=[];
 document.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse')return;const now=performance.now();samples=samples.filter(p=>now-p.time<100);samples.push({x:event.clientX,y:event.clientY,time:now});},{passive:true,capture:true});
 function entrySpeed(event){const now=performance.now(),recent=samples.filter(p=>now-p.time<120),first=recent[0];if(!first)return .6;const elapsed=now-first.time;return elapsed>0?Math.hypot(event.clientX-first.x,event.clientY-first.y)/Math.max(8,elapsed):.6;}
 cards.forEach(card=>{
  const button=card.querySelector('.portrait-toggle'),turn=card.querySelector('.portrait-turn'),front=card.querySelector('.portrait-front'),back=card.querySelector('.portrait-back'),photo=back.querySelector('img');
  let angle=0,frame=0,available=true,landingBack=false;
  function draw(){turn.style.transform='rotateY('+angle+'deg)';}
  function settle(){cancelAnimationFrame(frame);frame=0;angle=landingBack?-180:0;draw();front.setAttribute('aria-hidden',String(landingBack));back.setAttribute('aria-hidden',String(!landingBack));button.setAttribute('aria-pressed',String(landingBack));}
  function spin(speed=.9){
   if(!available)return;
   cancelAnimationFrame(frame);
   const strength=Math.min(1,Math.max(0,speed)/2.5),turns=2+Math.round(strength*5),duration=1800+strength*1400,start=angle,started=performance.now();
   landingBack=Math.random()<.5;
   const target=-360*(Math.ceil(-start/360)+turns)-(landingBack?180:0);
   if(motion.matches){settle();return;}
   function tick(now){const progress=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-progress,3);angle=start+(target-start)*ease;draw();if(progress<1)frame=requestAnimationFrame(tick);else settle();}
   frame=requestAnimationFrame(tick);
  }
  function unavailable(){available=false;landingBack=false;settle();button.hidden=true;}
  photo.addEventListener('error',unavailable);
  if(photo.complete&&!photo.naturalWidth)unavailable();else button.hidden=false;
  card.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')spin(entrySpeed(event));});
  button.addEventListener('click',()=>{
   if(!available)return;
   cancelAnimationFrame(frame);
   // Interrupt any hover spin and turn to the opposite of the visible face.
   const face=Math.round(-angle/180),start=angle,target=-(face+1)*180,started=performance.now();
   landingBack=Math.abs(face+1)%2===1;
   if(motion.matches){settle();return;}
   function tick(now){const progress=Math.min(1,(now-started)/550),ease=progress*progress*(3-2*progress);angle=start+(target-start)*ease;draw();if(progress<1)frame=requestAnimationFrame(tick);else settle();}
   frame=requestAnimationFrame(tick);
  });
  button.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();settle();}});
  motion.addEventListener('change',()=>{if(motion.matches&&frame)settle();});
 });
})();
