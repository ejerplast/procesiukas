(()=>{
const d=document,root=d.documentElement;
root.classList.add('js');

/* ============================================================
   KONTAKTAS — vienintelė vieta, kurią reikia pakeisti.
   Įrašykite tikrą el. paštą (mailto:...), rezervacijos nuorodą
   (https://...) arba formos adresą. Visi mygtukai su atributu
   data-contact naudos šią reikšmę.
   ============================================================ */
const CONTACT_URL='mailto:labas@procesiukas.lt?subject=Noriu%20rezervuoti%20pokalb%C4%AF';
d.querySelectorAll('[data-contact]').forEach(a=>{a.href=CONTACT_URL;if(/^https?:/.test(CONTACT_URL)){a.target='_blank';a.rel='noopener'}});

d.getElementById('y').textContent=new Date().getFullYear();
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

/* nav */
const nav=d.getElementById('nav');
addEventListener('scroll',()=>nav.classList.toggle('on',scrollY>20),{passive:true});

/* reveal with stagger; classes removed afterwards so hover transforms stay snappy */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    const el=e.target;el.classList.add('in');io.unobserve(el);
    setTimeout(()=>el.classList.remove('reveal','in'),1300);
  }
}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
d.querySelectorAll('.reveal').forEach((el,i)=>{el.style.setProperty('--d',(i%6)*.07+'s');io.observe(el)});

/* card tilt + spotlight, magnetic buttons */
if(fine&&!reduce){
  d.querySelectorAll('.tilt').forEach(c=>{
    c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');
      c.style.transform=`perspective(800px) rotateX(${(.5-y)*5}deg) rotateY(${(x-.5)*6}deg) translateY(-3px)`;
    });
    c.addEventListener('pointerleave',()=>c.style.transform='');
  });
  d.querySelectorAll('.magnetic').forEach(b=>{
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.15}px,${(e.clientY-r.top-r.height/2)*.25}px)`});
    b.addEventListener('pointerleave',()=>b.style.transform='');
  });
}

/* hero: chaos (left) -> order (right) */
const cv=d.getElementById('flow'),ctx=cv.getContext('2d');
let W,H,P=[],dpr=1,mx=-999,my=-999,running=false,raf=0;
/* Jei sistemoje įjungtas sumažintas judesys, animacija pagal nutylėjimą išjungta; lankytojas gali ją įjungti mygtuku. */
let motionOn=!reduce;
const LANES=7;
function init(){
  dpr=Math.min(devicePixelRatio||1,2);
  const r=cv.getBoundingClientRect();W=r.width;H=r.height;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=W<700?60:130;
  P=Array.from({length:n},(_,i)=>({
    lane:i%LANES,x:Math.random()*W,s:.25+Math.random()*.6,
    a:Math.random()*6.28,f:.4+Math.random()*1.1,amp:20+Math.random()*60,
    ox:0,oy:0,r:1.2+Math.random()*1.6
  }));
  if(!running)draw(performance.now());
}
const ease=x=>x*x*(3-2*x);
function laneY(l){const top=H*(W<700?.62:.2),h=H*(W<700?.3:.6);return top+h*(l/(LANES-1))}
function draw(t){
  const time=t/1000;
  ctx.clearRect(0,0,W,H);
  const pts=[];
  for(const p of P){
    if(motionOn){p.x+=p.s;if(p.x>W+10)p.x=-10}
    const k=ease(Math.min(1,Math.max(0,(p.x/W-.28)/.5)));
    const chaos=1-k,y0=laneY(p.lane);
    let x=p.x+Math.cos(time*p.f+p.a)*p.amp*.5*chaos;
    let y=y0+Math.sin(time*p.f*1.3+p.a)*p.amp*chaos*2.2+(Math.sin(p.a*9)*H*.18)*chaos;
    const dx=x-mx,dy=y-my,dd=Math.hypot(dx,dy);
    if(dd<140&&dd>0){const f=(1-dd/140)*(chaos>.4?22:10);p.ox+=dx/dd*f*.08;p.oy+=dy/dd*f*.08}
    p.ox*=.92;p.oy*=.92;x+=p.ox;y+=p.oy;
    p.px=x;p.py=y;p.k=k;pts.push(p);
  }
  ctx.lineWidth=1;
  for(let i=0;i<pts.length;i++){
    const a=pts[i];
    for(let j=i+1;j<pts.length;j++){
      const b=pts[j],dx=a.px-b.px,dy=a.py-b.py,d2=dx*dx+dy*dy;
      const lim=a.k>.7&&b.k>.7?(a.lane===b.lane?130:0):80;
      if(lim&&d2<lim*lim){
        const o=(1-Math.sqrt(d2)/lim)*(a.k>.7?.45:.18);
        ctx.strokeStyle=`rgba(163,184,153,${o})`;
        ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.stroke();
      }
    }
  }
  for(const p of pts){
    ctx.fillStyle=`rgba(163,184,153,${.35+.6*p.k})`;
    ctx.beginPath();ctx.arc(p.px,p.py,p.r+p.k*.6,0,6.283);ctx.fill();
  }
}
function loop(t){draw(t);raf=requestAnimationFrame(loop)}
function start(){if(running||!motionOn)return;running=true;raf=requestAnimationFrame(loop)}
function stop(){running=false;cancelAnimationFrame(raf)}

const hero=d.querySelector('.hero');
init();
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(init,150)});
hero.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
hero.addEventListener('pointerleave',()=>{mx=my=-999});
/* animacija sustoja, kai hero nematomas arba skirtukas paslėptas */
let inView=true;
new IntersectionObserver(([e])=>{inView=e.isIntersecting;inView&&!d.hidden?start():stop()}).observe(hero);
d.addEventListener('visibilitychange',()=>{d.hidden?stop():(inView&&start())});
start();

/* mygtukas rodomas tik tada, kai naršyklė praneša apie sumažintą judesį */
const tg=d.getElementById('motion');
if(tg&&reduce){
  tg.hidden=false;
  tg.addEventListener('click',()=>{
    motionOn=!motionOn;
    tg.setAttribute('aria-pressed',motionOn);
    tg.textContent=motionOn?'Sustabdyti animaciją':'Įjungti animaciją';
    motionOn?(inView&&start()):(stop(),draw(performance.now()));
  });
}
})();
