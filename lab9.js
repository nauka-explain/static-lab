'use strict';
let X;const C=document.getElementById('c'),CX=C.getContext('2d'),$=id=>document.getElementById(id);
const W=1000,H=620,PX=16,P={x:500,y:230},TBL=585,G=9.8,HY=21,STEP=46,I0=6,DAMP=8,FRIC=.5;
const HOOKS=[];for(let s=-20;s<=20;s+=2)if(s)HOOKS.push(s);
const KIT=[
 {t:'lever',n:'Рычаг',max:1,c:'#f2a93b'},{t:'weight',n:'Груз 100 г',max:3,c:'#c4c9cf'},
 {t:'dyn',n:'Динамометр 5 Н',max:1,c:'#9a9ea6'},{t:'ruler',n:'Линейка 300 мм',max:1,c:'#d63a3a'},
 {t:'thread',n:'Нить',max:1,c:'#bfe3f7'},{t:'pul1',n:'Блок подвижный',max:1,c:'#707882'},
 {t:'pul2',n:'Блок неподвижный',max:1,c:'#707882'},{t:'prot',n:'Транспортир',max:1,c:'#dff0f5'}];
const SP={lever:[500,545],dyn:[950,380],ruler:[250,40],thread:[690,560],pul1:[745,560],pul2:[800,560],prot:[870,548]};
let items,hang,th,om,grab,work=9,z=0,CM=16;
const M={x:620,y:150},DY0=170,WY0=TBL-46,RP=26;
const wL=()=>items.find(i=>i.t==='weight'&&i.h==='L'),dR=()=>items.find(i=>i.t==='dyn'&&i.h==='R'),pul=()=>items.find(i=>i.t===(work===11?'pul1':'pul2')&&i.m),thr=()=>items.some(i=>i.t==='thread');
const lever=()=>items.find(i=>i.t==='lever'),mounted=()=>{const l=lever();return !!(l&&l.m)};
const hw=s=>({x:P.x+s*PX*Math.cos(th)-HY*Math.sin(th),y:P.y+s*PX*Math.sin(th)+HY*Math.cos(th)});
const dynAt=s=>items.find(i=>i.t==='dyn'&&i.h===s);
const force=d=>{if(d.h==null)return 0;if(work===11){const W2=(hang.P||[]).reduce((a,w)=>a+w.m*G/1000,0)/2;return d.h==='R'?Math.min(Math.max(0,251-d.dy),W2*18)/18:0}if(work===10){const w=wL();return w&&d.h==='R'?Math.min(Math.max(0,d.dy-(DY0+144)),w.m*G/1000*18)/18:0}return Math.min(5,Math.max(0,(d.dy-(d.y+144))/18))};
const ringY=d=>d.y+144+force(d)*18;

function init(){items=[];hang={};th=0;om=0;grab=null;z=0;$('res').innerHTML=''}
function spawn(t){const k=KIT.find(a=>a.t===t),n=items.filter(i=>i.t===t).length;if(n>=k.max)return;
 const it={t,x:0,y:0,a:0,vy:0};
 if(t==='weight'){it.x=100+n*70;it.y=90;it.m=98+Math.random()*4;it.h=null}else[it.x,it.y]=SP[t];
 if(t==='lever')it.m=false;
 if(t==='dyn'){it.h=null;it.dy=0;it.y=90}
 items.push(it)}
function removeItem(i){
 if(i.t==='lever'){items.forEach(a=>{if(a.t==='weight'||a.t==='dyn')a.h=null});hang={};th=om=0}
 if(i.t==='weight'&&work!==10&&i.h!=null){const st=hang[i.h];st.splice(st.indexOf(i),1);st.forEach(w=>w.h=i.h)}
 items=items.filter(a=>a!==i)}

function hit(i,p,d){switch(i.t){
 case'weight':return Math.abs(p.x-i.x)<=16&&p.y>=i.y-8&&p.y<=i.y+STEP;
 case'dyn':return Math.abs(p.x-i.x)<=18&&p.y>=i.y-8&&p.y<=ringY(i)+8;
 case'ruler':{const a=i.ang||0,dx=p.x-i.x,dy=p.y-i.y,lx=dx*Math.cos(a)+dy*Math.sin(a),ly=-dx*Math.sin(a)+dy*Math.cos(a);return lx>=0&&lx<=12+30*CM&&ly>=0&&ly<=42}
 case'lever':return(!i.m||d)&&Math.abs(p.x-i.x)<=324&&Math.abs(p.y-i.y)<=14;
 default:return Math.hypot(p.x-i.x,p.y-i.y)<=24}}
const pt=e=>{const r=C.getBoundingClientRect();return{x:Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height))}};

C.onpointerdown=e=>{const p=pt(e);C.setPointerCapture(e.pointerId);
 for(let k=items.length-1;k>=0;k--){const i=items[k];if(!hit(i,p))continue;
  items.splice(k,1);items.push(i);
  if(i.t==='dyn'&&i.h!=null&&(work===11||Math.hypot(p.x-i.x,p.y-ringY(i))<14)){grab={m:'pull',i,o:(work===11?i.dy:ringY(i))-p.y,ty:i.dy};return}
  let g=[i];
  if(i.t==='weight'&&work!==10&&i.h!=null){const st=hang[i.h];g=st.splice(st.indexOf(i))}
  g.forEach(w=>{w.h=null;w.vy=0;if(w.t==='pul2'||w.t==='pul1')w.m=false});
  grab={m:'drag',g,dx:i.x-p.x,dy:i.y-p.y,tx:i.x,ty:i.y};return}};
C.onpointermove=e=>{const p=pt(e);
 if(!grab){C.style.cursor=items.some(i=>hit(i,p))?'grab':'default';return}
 C.style.cursor='grabbing';
 if(grab.m==='pull'){grab.ty=p.y+grab.o;return}
 grab.tx=p.x+grab.dx;grab.ty=p.y+grab.dy};
C.onpointerup=C.onpointercancel=()=>{if(!grab)return;const{g,m}=grab;grab=null;if(m!=='pull')drop(g)};
C.onwheel=e=>{const p=pt(e),r=items.find(i=>i.t==='ruler'&&hit(i,p));if(!r)return;e.preventDefault();if(!r.cd||Date.now()>r.cd){r.cd=Date.now()+300;r.tr=r.tr?0:-Math.PI/2}};
C.ondblclick=e=>{const p=pt(e);
 const t=[...items].reverse().find(i=>i.t!=='lever'&&hit(i,p))||(lever()&&hit(lever(),p,1)?lever():null);if(t)removeItem(t)};

const a10=s=>s==='L'?{x:M.x-RP,y:WY0-z}:{x:M.x+RP,y:DY0+z};
const a11=t=>t==='weight'?{x:620,y:403-z+44+(hang.P||[]).length*STEP}:{x:646,y:395-2*z};
function snap(a){
 if(work===11){if(!pul()||!thr())return null;
  if(a.t==='weight'){const q=a11('weight');return(hang.P||[]).length<3&&Math.hypot(a.x-q.x,a.y-q.y)<34?'P':null}
  if(a.t==='dyn'){const q=a11('dyn');return!dR()&&Math.hypot(a.x-q.x,a.y+144-q.y)<34?'R':null}
  return null}
 if(work===10){if(!pul()||!thr())return null;const s=a.t==='weight'?'L':a.t==='dyn'?'R':null;if(!s||items.some(i=>i.h===s))return null;const q=a10(s);return Math.hypot(a.x-q.x,a.y-q.y)<34?s:null}
 if(!mounted())return null;let best=null,bd=30;
 for(const s of HOOKS){const q=hw(s);
  if(a.t==='weight'){if(dynAt(s))continue;const n=(hang[s]||[]).length,d=Math.hypot(a.x-q.x,a.y-(q.y+n*STEP));if(d<bd){bd=d;best=s}}
  else if(a.t==='dyn'){if(dynAt(s)||(hang[s]||[]).length)continue;const d=Math.hypot(a.x-q.x,a.y-q.y);if(d<bd){bd=d;best=s}}}
 return best}
function drop(g){const a=g[0];
 if(a.t==='lever'){a.m=work===9&&Math.hypot(a.x-P.x,a.y-P.y)<50;return}
 if(a.t==='pul2'){a.m=work===10&&Math.hypot(a.x-M.x,a.y-M.y)<45;return}
 if(a.t==='pul1'){a.m=work===11&&thr()&&Math.hypot(a.x-620,a.y-403)<45;return}
 const best=snap(a);if(best==null)return;
 if(work===11){if(a.t==='weight'){const n=(hang.P||[]).length;if(n+g.length>3)return;g.forEach((w,k)=>{w.ox=w.x-620;w.oy=w.y-(403-z+44+(n+k)*STEP)});(hang.P=hang.P||[]).push(...g);g.forEach(w=>w.h='P')}
  else if(a.t==='dyn'){a.ox=a.x-646;a.oy=a.y-251;a.h='R';a.dy=251}return}
 if(work===10){const q=a10(best);a.ox=a.x-q.x;a.oy=a.y-q.y;a.h=best;if(a.t==='dyn')a.dy=DY0+144;return}
 const q=hw(best);
 if(a.t==='weight'){const n=(hang[best]||[]).length;g.forEach((w,k)=>{w.ox=w.x-q.x;w.oy=w.y-(q.y+(n+k)*STEP)});(hang[best]=hang[best]||[]).push(...g);g.forEach(w=>w.h=best)}
 else if(a.t==='dyn'){a.ox=a.x-q.x;a.oy=a.y-q.y;a.h=best;a.dy=q.y+144}}
function sub(dt){
 if(work===10){const w=wL(),d=dR();
  if(w&&d){const Fw=w.m*G/1000,ext=d.dy-(DY0+144);z+=(Math.min(Math.max(0,ext-Fw*18),330)-z)*.08}else z=0;
  if(w){w.x=M.x-RP+(w.ox||0);w.y=WY0-z+(w.oy||0)}
  if(d){d.x=M.x+RP+(d.ox||0);d.y=DY0+z+(d.oy||0)}
  return}
 if(work===11){const ws=hang.P||[],W2=ws.reduce((a,w)=>a+w.m*G/1000,0)/2,d=dR();
  if(pul()&&d)z+=(Math.min(Math.max(0,(251-d.dy-W2*18)/2),100)-z)*.08;else z=0;
  ws.forEach((w,k)=>{w.x=620+(w.ox||0);w.y=403-z+44+k*STEP+(w.oy||0)});
  if(d){d.x=646+(d.ox||0);d.y=395-2*z-144-force(d)*18+(d.oy||0)}
  return}
 for(const s in hang)hang[s].forEach((w,k)=>{const q=hw(+s);w.x=q.x+(w.ox||0);w.y=q.y+k*STEP+(w.oy||0)});
 items.forEach(i=>{if(i.t==='dyn'&&i.h!=null){const q=hw(i.h);i.x=q.x+(i.ox||0);i.y=q.y+(i.oy||0)}});
 if(!mounted()){th=om=0;return}
 let tq=0;
 for(const s in hang)tq+=hang[s].reduce((a,w)=>a+w.m*G/1000,0)*s;
 items.forEach(i=>{if(i.t==='dyn'&&i.h!=null)tq+=force(i)*i.h});
 tq*=Math.cos(th);
 let a=-DAMP*om;const f=Math.abs(tq)-FRIC;if(f>0)a+=Math.sign(tq)*f/I0;
 om+=a*dt;th+=om*dt;if(Math.abs(th)>.21){th=Math.sign(th)*.21;om=0}}

const dpr=Math.min(2,window.devicePixelRatio||1),T=$('tray'),TX=T.getContext('2d'),TW=300,TH=400;
C.width=W*dpr;C.height=H*dpr;T.width=TW*dpr;T.height=TH*dpr;
const rr=(x,y,w,h,r)=>{X.beginPath();X.roundRect(x,y,w,h,r);X.fill()};
const lg=(x0,y0,x1,y1,st)=>{const g=X.createLinearGradient(x0,y0,x1,y1);st.forEach((c,k)=>g.addColorStop(k/(st.length-1),c));return g};
const circ=(x,y,r)=>{X.beginPath();X.arc(x,y,r,0,7)};
const metal=(a,b)=>lg(a,0,b,0,['#666c74','#e7eaed','#fff','#9aa1a9','#585e66']);
const shadow=on=>{X.shadowColor=on?'rgba(0,0,0,.4)':'transparent';X.shadowBlur=on?9:0;X.shadowOffsetY=on?5:0};
const FONT='"Segoe UI",sans-serif';

function stand(){
 X.fillStyle=lg(0,TBL-18,0,TBL,['#2c2e34','#0f1012']);rr(370,TBL-18,260,18,4);
 X.fillStyle='rgba(255,255,255,.14)';X.fillRect(374,TBL-17,252,1.5);
 X.strokeStyle='#3a3d43';X.lineWidth=1;
 for(let x=384;x<616;x+=12){X.beginPath();X.moveTo(x,TBL-15);X.lineTo(x+6,TBL-3);X.moveTo(x+6,TBL-15);X.lineTo(x,TBL-3);X.stroke()}
 X.fillStyle=metal(P.x-5,P.x+5);X.fillRect(P.x-5,92,10,TBL-18-92);
 X.fillStyle='#d5d9de';rr(P.x-5,88,10,6,3);
 if(work>9){const y=110;if(work===11){X.strokeStyle='#9aa0a8';X.lineWidth=2;circ(M.x-RP,117,4);X.stroke()}X.fillStyle=lg(0,y-3,0,y+3,['#4a4e56','#0b0c0e']);rr(P.x+10,y-3,M.x-P.x-10,6,3);
  X.fillStyle=lg(P.x-17,0,P.x+17,0,['#0b0c0e','#3b3e45','#0b0c0e']);rr(P.x-17,y-17,34,34,6);
  X.fillStyle=lg(0,y-6,0,y+6,['#6b92ff','#2548c4']);rr(P.x-31,y-6,14,12,4)}
 else{X.fillStyle=lg(P.x-17,0,P.x+17,0,['#0b0c0e','#3b3e45','#0b0c0e']);rr(P.x-17,P.y-30,34,60,7);
 [[P.x+17,P.y+17],[P.x-37,P.y-26]].forEach(([x,y])=>{X.fillStyle='#8a8f98';X.fillRect(x+2,y+3,9,3);X.fillStyle=lg(0,y,0,y+10,['#6b92ff','#2548c4']);rr(x+9,y-1,12,11,4)})}}
function drawLever(cx,cy,a){X.save();X.translate(cx,cy);X.rotate(a);
 X.fillStyle=lg(0,-13,0,13,['#ffd682','#f2a23a','#d6811b']);rr(-324,-13,648,26,4);
 X.fillStyle='rgba(255,255,255,.4)';X.fillRect(-320,-12,640,2);
 X.strokeStyle='rgba(90,50,5,.6)';X.fillStyle='#4a2d05';X.lineWidth=1;X.font='600 10px '+FONT;X.textAlign='center';
 for(let k=-20;k<=20;k++){const x=k*PX;X.beginPath();X.moveTo(x,-13);X.lineTo(x,k%5?-9:-5);X.stroke();if(k%5==0&&k)X.fillText(Math.abs(k),x,9)}
 HOOKS.forEach(s=>{X.strokeStyle='#e03a36';X.lineWidth=2.6;circ(s*PX,17,4.5);X.stroke();X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=.8;X.beginPath();X.arc(s*PX,17,4.5,3.6,4.8);X.stroke()});
 X.fillStyle=lg(-6,-6,6,6,['#f4f6f8','#7d838b']);circ(0,0,6.5);X.fill();X.fillStyle='#3a3e45';circ(0,0,2);X.fill();X.restore()}
function drawWeight(w){const{x,y}=w;X.strokeStyle='#9aa0a8';X.lineWidth=2;circ(x,y+4,3.5);X.stroke();
 X.fillStyle=metal(x-14,x+14);rr(x-14,y+8,28,30,4);
 X.fillStyle='rgba(0,0,0,.25)';X.fillRect(x-14,y+13,28,1.5);X.fillRect(x-14,y+31,28,1.5);
 X.fillStyle='#2b2f35';X.font='600 9px '+FONT;X.textAlign='center';X.fillText('100 г',x,y+25);
 X.strokeStyle='#9aa0a8';circ(x,y+42,3.5);X.stroke()}
function drawDyn(d){const{x,y}=d,F=force(d),ry=ringY(d);
 X.strokeStyle='#8a9098';X.lineWidth=2;circ(x,y+4,4);X.stroke();
 X.fillStyle=lg(x-17,0,x+17,0,['#7d838b','#dfe2e6','#8a9098']);rr(x-17,y+10,34,120,6);
 X.fillStyle='#2a2d33';rr(x-17,y+10,34,6,3);rr(x-17,y+124,34,6,3);
 X.fillStyle='#fbfbf8';rr(x-12,y+17,24,102,2);
 X.strokeStyle='#222';X.fillStyle='#222';X.lineWidth=1;X.font='8px '+FONT;X.textAlign='right';
 for(let k=0;k<=50;k++){const yy=y+22+k*1.8;X.beginPath();X.moveTo(x+12,yy);X.lineTo(x+12-(k%10?(k%5?6:3):9),yy);X.stroke();if(k%10==0)X.fillText(k/10,x-2,yy+3)}
 X.strokeStyle='#e5262a';X.lineWidth=2.5;X.beginPath();X.moveTo(x-12,y+22+F*18);X.lineTo(x+12,y+22+F*18);X.stroke();
 X.fillStyle='#2a2d33';X.fillRect(x-2,y+130,4,Math.max(0,ry-6-(y+130)));
 X.strokeStyle='#3d4148';X.lineWidth=3;circ(x,ry,6);X.stroke()}
function drawRuler(r){X.save();X.translate(r.x,r.y);X.rotate(r.ang||0);const L=12+30*CM;X.fillStyle=lg(0,0,0,42,['#f05555','#c42b2b']);rr(0,0,L,42,3);
 X.fillStyle='rgba(255,255,255,.25)';X.fillRect(3,1,L-6,1.5);
 X.strokeStyle='#fff';X.fillStyle='#fff';X.lineWidth=1;X.font='600 10px '+FONT;X.textAlign='center';
 for(let k=0;k<=300;k++){const x=6+k*CM/10;X.beginPath();X.moveTo(x,0);X.lineTo(x,k%10?(k%5?6:9):13);X.stroke();if(k%10==0)X.fillText(k/10,x,26)}
 X.restore()}
function drawProp(i){const{x,y}=i;if((i.t==='pul2'||i.t==='pul1')&&i.m){X.save();X.translate(x,y);X.scale(1.625,1.625);X.translate(-x,-y);drawProp({...i,m:0,rot:z/RP});X.restore();return}X.lineWidth=2;
 if(i.t==='thread'){X.fillStyle='#c9e8fa';rr(x-14,y-18,28,36,5);X.fillStyle='#8fb8d4';rr(x-14,y-18,28,5,2);rr(x-14,y+13,28,5,2);X.strokeStyle='#fff';for(let k=-9;k<=9;k+=3){X.beginPath();X.moveTo(x-11,y+k);X.lineTo(x+11,y+k);X.stroke()}}
 else if(i.t==='prot'){X.fillStyle='rgba(225,242,248,.5)';X.strokeStyle='#e8f3f8';X.beginPath();X.arc(x,y+20,38,Math.PI,0);X.closePath();X.fill();X.stroke();X.lineWidth=1;for(let a=0;a<=180;a+=10){const c=Math.cos(a*Math.PI/180),s=Math.sin(a*Math.PI/180);X.beginPath();X.moveTo(x+c*38,y+20-s*38);X.lineTo(x+c*(a%30?33:29),y+20-s*(a%30?33:29));X.stroke()}}
 else{X.fillStyle=lg(x-16,y-16,x+16,y+16,['#c3c9d0','#6d747d']);X.strokeStyle='#2c3036';circ(x,y,16);X.fill();X.stroke();X.save();X.translate(x,y);X.rotate(i.rot||0);X.strokeStyle='#2c3036';X.lineWidth=1.5;for(let k=0;k<3;k++){X.rotate(Math.PI/3);X.beginPath();X.moveTo(-12,0);X.lineTo(12,0);X.stroke()}X.restore();X.fillStyle='#2c3036';circ(x,y,4);X.fill();
  X.beginPath();if(i.t==='pul1')X.arc(x,y+22,5,0,7);else{X.moveTo(x,y-16);X.lineTo(x,y-24)}X.stroke()}}
function drawItem(i){const f=()=>({lever:()=>drawLever(i.x,i.y,0),weight:()=>drawWeight(i),dyn:()=>drawDyn(i),ruler:()=>drawRuler(i)}[i.t]||(()=>drawProp(i)))();
 if(i.a<1){X.save();X.globalAlpha=i.a;X.translate(i.x,i.y);const s=.85+.15*i.a;X.scale(s,s);X.translate(-i.x,-i.y);f();X.restore()}else f()}

function drawThread11(){const d=dR(),Yc=403-z,e=d?ringY(d):Yc-90;X.strokeStyle='#eaf6ff';X.lineWidth=2;X.beginPath();
 X.moveTo(M.x-RP,114);X.lineTo(M.x-RP,Yc);X.arc(M.x,Yc,RP,Math.PI,0,true);X.lineTo(M.x+RP,e);X.stroke()}
function drawThread(){const w=wL(),d=dR(),lx=M.x-RP,rx=M.x+RP;X.strokeStyle='#eaf6ff';X.lineWidth=2;X.beginPath();
 X.moveTo(lx,w?w.y:M.y+70);X.lineTo(lx,M.y);X.arc(M.x,M.y,RP,Math.PI,0);X.lineTo(rx,d?d.y:M.y+70);X.stroke()}
function draw(t){X=CX;X.setTransform(dpr,0,0,dpr,0,0);
 const bg=X.createRadialGradient(W/2,260,60,W/2,300,720);bg.addColorStop(0,'#757b84');bg.addColorStop(1,'#2d3137');X.fillStyle=bg;X.fillRect(0,0,W,H);
 X.fillStyle=lg(0,TBL,0,H,['#5d4b3a','#382c22']);X.fillRect(0,TBL,W,H-TBL);
 X.fillStyle='rgba(255,255,255,.2)';X.fillRect(0,TBL,W,2);
 X.strokeStyle='rgba(0,0,0,.13)';X.lineWidth=1;for(let y=TBL+9;y<H;y+=9){X.beginPath();X.moveTo(0,y);X.lineTo(W,y);X.stroke()}
 if(work===9){X.save();X.setLineDash([6,6]);X.strokeStyle='rgba(255,255,255,.25)';X.beginPath();X.moveTo(140,P.y);X.lineTo(860,P.y);X.stroke();X.restore()}
 shadow(1);stand();
 const l=lever();if(l&&l.m)drawLever(l.x,l.y,th);
 items.forEach(i=>{if(!(i.t==='lever'&&i.m))drawItem(i)});
 if(work===10&&thr()&&pul())drawThread();
 if(work===11&&thr()&&pul())drawThread11();
 shadow(0);
 if(grab&&grab.m==='drag'){const a=grab.g[0],pl=.55+.35*Math.sin(t/120);X.lineWidth=2.5;X.strokeStyle=`rgba(120,255,170,${pl})`;
  if(a.t==='lever'&&work===9&&Math.hypot(a.x-P.x,a.y-P.y)<50){circ(P.x,P.y,16);X.stroke()}
  else if(a.t==='pul2'&&work===10&&Math.hypot(a.x-M.x,a.y-M.y)<45){circ(M.x,M.y,30);X.stroke()}
  else if(a.t==='pul1'&&work===11&&thr()&&Math.hypot(a.x-620,a.y-403)<45){circ(620,403,30);X.stroke()}
  else if(a.t==='weight'||a.t==='dyn'){const s=snap(a);if(s!=null){const q=work===11?a11(a.t):work===10?a10(s):hw(s),n=work===9&&a.t==='weight'?(hang[s]||[]).length:0;circ(q.x,q.y+n*STEP,13);X.stroke()}}}}

const foam=document.createElement('canvas');foam.width=TW;foam.height=TH;
{const g=foam.getContext('2d');g.fillStyle='#17181b';g.fillRect(0,0,TW,TH);for(let k=0;k<2600;k++){g.fillStyle=`rgba(255,255,255,${Math.random()*.08})`;g.fillRect(Math.random()*TW,Math.random()*TH,1.5,1.5)}}
const R=-Math.PI/2;
const TRS=[
 {t:'thread',x:46,y:54,s:1,hx:46,hy:54,hw:22,hh:22},{t:'pul1',x:104,y:50,s:1,hx:104,hy:58,hw:20,hh:28},
 {t:'pul2',x:162,y:56,s:1,hx:162,hy:50,hw:20,hh:28},{t:'prot',x:238,y:52,s:.8,hx:238,hy:56,hw:30,hh:22},
 {t:'ruler',x:15,y:98,s:.55,hx:150,hy:110,hw:135,hh:12},{t:'lever',x:150,y:170,s:.4,hx:150,hy:170,hw:130,hh:9},
 {t:'dyn',x:76,y:236,s:.95,r:R,hx:148,hy:236,hw:76,hh:17},
 {t:'weight',k:0,x:42,y:318,s:1.3,r:R,hx:72,hy:318,hw:32,hh:20},{t:'weight',k:1,x:128,y:318,s:1.3,r:R,hx:158,hy:318,hw:32,hh:20},
 {t:'weight',k:2,x:214,y:318,s:1.3,r:R,hx:244,hy:318,hw:32,hh:20}];
let trHover=null;
const avail=k=>{const s=TRS[k],n=items.filter(i=>i.t===s.t).length;return s.k!=null?s.k>=n:n<1};
const slotAt=e=>{const r=T.getBoundingClientRect(),x=(e.clientX-r.left)*TW/r.width,y=(e.clientY-r.top)*TH/r.height;return TRS.findIndex(s=>Math.abs(x-s.hx)<=s.hw&&Math.abs(y-s.hy)<=s.hh)};
T.onpointermove=e=>{const k=slotAt(e);trHover=k>=0&&avail(k)?k:null;T.style.cursor=trHover!=null?'pointer':'default'};
T.onpointerleave=()=>{trHover=null};
T.onclick=e=>{const k=slotAt(e);if(k>=0&&avail(k))spawn(TRS[k].t)};
function trayDraw(){X=TX;X.setTransform(dpr,0,0,dpr,0,0);X.clearRect(0,0,TW,TH);
 X.fillStyle=lg(0,0,0,TH,['#3a86f5','#1a53c2']);rr(0,0,TW,TH,18);
 X.save();X.beginPath();X.roundRect(14,14,TW-28,TH-28,9);X.clip();X.drawImage(foam,0,0,TW,TH);X.restore();
 const c0=CM;CM=16;TRS.forEach((s,k)=>{const used=!avail(k);X.save();X.globalAlpha=used?.2:1;X.translate(s.x,s.y);X.rotate(s.r||0);
  const sc=s.s*(trHover===k?1.08:1);X.scale(sc,sc);shadow(!used);drawItem({t:s.t,x:0,y:0,h:null,dy:0,a:1});X.restore()});CM=c0;
 if(trHover!=null){const n=KIT.find(a=>a.t===TRS[trHover].t).n;X.fillStyle='#fff';X.font='600 13px '+FONT;X.textAlign='center';X.fillText(n,TW/2,TH-26)}}

function ui(){const d=items.find(i=>i.t==='dyn'),eq=mounted()&&Math.abs(th)<.021&&Math.abs(om)<.03;
 $('dyn').textContent=d&&d.h!=null?(Math.round(force(d)*10)/10).toFixed(1)+' Н':'—';
 const w10=work>9,up=w10&&(work===10?wL():pul())&&dR();
 $('l2').textContent=w10?'Груз поднят':'Рычаг';
 $('lv').textContent=w10?(up?(z/CM).toFixed(1)+' см':'—'):!mounted()?'перетащите на ось штатива':eq?'горизонтален, равновесие':'наклонён';
 $('lv').className=!w10&&eq?'ok':''}
function loop(t){
 if(grab){if(grab.m==='drag')grab.g.forEach((w,j)=>{w.x+=(grab.tx-w.x)*.35;w.y+=(grab.ty+j*STEP-w.y)*.35});else grab.i.dy+=(grab.ty-grab.i.dy)*.35}
 items.forEach(i=>{
  if(i.a<1)i.a=Math.min(1,i.a+.07);
  if(i.ox!=null){i.ox*=.82;i.oy*=.82}
  if((i.t==='weight'||i.t==='dyn')&&i.h==null&&!(grab&&grab.g&&grab.g.includes(i))){const fl=TBL-(i.t==='dyn'?152:48);i.vy+=.7;i.y+=i.vy;if(i.y>fl){i.y=fl;i.vy=Math.abs(i.vy)>2?-i.vy*.3:0}}
  if(i.t==='lever'&&i.m){i.x+=(P.x-i.x)*.25;i.y+=(P.y-i.y)*.25}
  if(i.t==='pul2'&&i.m){i.x+=(M.x-i.x)*.25;i.y+=(M.y-i.y)*.25}
  if(i.t==='pul1'&&i.m){i.x+=(620-i.x)*.25;i.y+=(403-z-i.y)*.25}
  if(i.t==='ruler'){i.ang=i.ang||0;i.ang+=((i.tr||0)-i.ang)*.2}});
 if(work===11&&!(pul()&&thr())){items.forEach(a=>{if(a.h==='P'||a.h==='R')a.h=null});hang={}}
 if(work===10&&!(pul()&&thr()))items.forEach(a=>{if(a.h==='L'||a.h==='R')a.h=null});
 for(let k=0;k<4;k++)sub(1/240);
 draw(t);trayDraw();ui();requestAnimationFrame(loop)}

const num=id=>parseFloat(($(id).value||'').replace(',','.'));
const fld=(id,l,ph)=>`<label>${l}<input id="${id}" placeholder="${ph||''}" autocomplete="off"></label>`;
const pair=(a,b)=>`<div class="row">${fld(...a)}<span>±</span>${fld(...b)}</div>`;
const WORKS={
 9:{ttl:'Лабораторная работа № 9 «Измерение момента силы»',nm:'Измерение момента силы',cm:16,
  task:'<p>Используя рычаг, три груза, штатив и динамометр, соберите установку для исследования равновесия рычага. Подвесьте слева от оси два груза на расстоянии 6 см и один груз на расстоянии 12 см. Определите момент силы, который нужно приложить к правому концу рычага на расстоянии 6 см от оси, чтобы он остался в равновесии в горизонтальном положении.</p><p class="dim">Погрешность силы ±0,1 Н, погрешность расстояния ±2 мм.</p>',
  hint:'Нажмите на предмет в лотке, и он окажется на столе. Рычаг перетащите на ось штатива. Динамометр зацепите за кольцо рычага и потяните за нижнее кольцо. Колесо мыши над линейкой поворачивает её. Двойной щелчок возвращает предмет в лоток.',
  form:fld('fm','Формула момента силы','M = …')+pair(['f','F, Н'],['df','ΔF, Н'])+pair(['l','L, см'],['dl','ΔL, см'])+fld('m','Момент силы M, Н·см'),
  chk(ok){const n=s=>(hang[s]||[]).length,total=Object.values(hang).reduce((a,x)=>a+x.length,0);
   const Mt=HOOKS.filter(s=>s<0).reduce((a,s)=>a+(hang[s]||[]).reduce((q,w)=>q+w.m*G/1000,0)*-s,0);
   const setup=mounted()&&n(-6)===2&&n(-12)===1&&total===3,d=items.find(i=>i.t==='dyn');
   ok(setup,'Грузы: два на расстоянии 6 см и один на 12 см слева от оси');
   ok(!!d&&d.h===6,'Динамометр прикреплён справа на расстоянии 6 см');
   ok(setup&&Math.abs(th)<.021,'Рычаг в горизонтальном положении');
   const f=num('f'),df=num('df'),l=num('l'),dl=num('dl'),m=num('m');
   const fm=$('fm').value.toLowerCase().replace(/[\s·*×⋅.]/g,'').replace(/м/g,'m').replace(/ф/g,'f').replace(/л/g,'l').replace(/д/g,'d');
   ok(/^m=(f[ld]|[ld]f)$/.test(fm),'Формула момента силы M = F·L');
   ok(setup&&Math.abs(f-Mt/6)<=.25,'Значение силы F измерено верно');
   ok(Math.abs(df-.1)<.001,'Погрешность силы ΔF = 0,1 Н');
   ok(Math.abs(l-6)<=.3,'Плечо силы L ≈ 6 см');
   ok(Math.abs(dl-.2)<.001,'Погрешность расстояния ΔL = 0,2 см (2 мм)');
   ok(setup&&Math.abs(m-f*l)<=.03*f*l+.3&&Math.abs(m-Mt)<=.1*Mt+.5,'Момент силы M = F·L найден верно (в Н·см)')}},
 10:{ttl:'Лабораторная работа № 10 «Измерение работы силы упругости с помощью неподвижного блока»',nm:'Работа силы упругости, неподвижный блок',cm:12,
  task:'<p>Используя штатив с держателем, неподвижный блок, нить, один груз и динамометр, соберите экспериментальную установку для измерения работы силы упругости при равномерном подъёме груза с использованием неподвижного блока. Определите работу, совершаемую силой упругости при подъёме груза на высоту 20 см.</p><p class="dim">Погрешность силы ±0,1 Н, погрешность расстояния ±0,2 см.</p>',
  hint:'Закрепите блок в держателе штатива и добавьте нить. Груз вешается слева от блока, динамометр справа. Потяните динамометр за нижнее кольцо вниз, и груз поднимется. Колесо мыши над линейкой ставит её вертикально. Двойной щелчок возвращает предмет в лоток.',
  form:fld('fm','Формула работы силы упругости','A = …')+pair(['f','F, Н'],['df','ΔF, Н'])+pair(['l','s, см'],['dl','Δs, см'])+fld('m','Работа силы упругости A, Дж'),
  chk(ok){const w=wL(),d=dR(),s0=z/CM,Fw=w?w.m*G/1000:1;
   ok(!!pul()&&thr(),'Блок закреплён в держателе штатива, нить на месте');
   ok(!!(w&&d),'Груз и динамометр подвешены на нити через блок');
   ok(!!(w&&d)&&Math.abs(s0-20)<=1,'Груз поднят на 20 см');
   const f=num('f'),df=num('df'),s=num('l'),ds=num('dl'),A=num('m');
   const fm=$('fm').value.toLowerCase().replace(/упр|[\s_·*×⋅.]/g,'').replace(/а/g,'a').replace(/ф/g,'f').replace(/с/g,'s');
   ok(/^a=(fs|sf)$/.test(fm),'Формула работы силы упругости A = F·s');
   ok(Math.abs(f-Fw)<=.15,'Сила упругости F измерена верно');
   ok(Math.abs(df-.1)<.001,'Погрешность силы ΔF = 0,1 Н');
   ok(Math.abs(s-20)<=.6,'Путь s ≈ 20 см');
   ok(Math.abs(ds-.2)<.001,'Погрешность расстояния Δs = 0,2 см');
   ok(Math.abs(A-f*s/100)<=.03*A+.005&&Math.abs(A-Fw*.2)<=.03,'Работа A = F·s найдена верно (в Дж)')}},
 11:{ttl:'Лабораторная работа № 11 «Измерение работы силы упругости с помощью подвижного блока»',nm:'Работа силы упругости, подвижный блок',cm:9,
  task:'<p>Используя штатив с муфтой, подвижный блок, нить, 3 груза и динамометр, соберите экспериментальную установку для измерения работы силы упругости при подъёме трёх грузов с использованием подвижного блока. Определите работу, совершаемую силой упругости при подъёме грузов на высоту 10 см.</p><p class="dim">Погрешность силы ±0,1 Н, погрешность расстояния ±0,2 см.</p>',
  hint:'Добавьте нить: она крепится к держателю штатива слева. Подвесьте на неё подвижный блок, на его крючок повесьте три груза. Динамометр цепляется за нижнее кольцо к свободному концу нити справа. Поднимайте динамометр вверх, потянув за его корпус. Колесо мыши над линейкой ставит её вертикально. Двойной щелчок возвращает предмет в лоток.',
  form:fld('fm','Формула работы силы упругости','A = …')+pair(['f','F, Н'],['df','ΔF, Н'])+pair(['l','s, см'],['dl','Δs, см'])+fld('m','Работа силы упругости A, Дж'),
  chk(ok){const ws=hang.P||[],W2=ws.reduce((a,w)=>a+w.m*G/1000,0)/2,d=dR(),s0=z/CM;
   ok(!!pul()&&thr(),'Подвижный блок подвешен на нити, закреплённой на штативе');
   ok(ws.length===3,'На крючке блока висят три груза');
   ok(!!d,'Динамометр прикреплён к свободному концу нити');
   ok(!!d&&ws.length===3&&Math.abs(s0-10)<=.6,'Грузы подняты на 10 см');
   const f=num('f'),df=num('df'),s=num('l'),ds=num('dl'),A=num('m');
   const fm=$('fm').value.toLowerCase().replace(/упр|[\s_·*×⋅.]/g,'').replace(/а/g,'a').replace(/ф/g,'f').replace(/с/g,'s');
   ok(/^a=(fs|sf)$/.test(fm),'Формула работы силы упругости A = F·s');
   ok(ws.length===3&&Math.abs(f-W2)<=.2,'Сила упругости F измерена верно');
   ok(Math.abs(df-.1)<.001,'Погрешность силы ΔF = 0,1 Н');
   ok(Math.abs(s-20)<=.6,'Путь s: динамометр поднимается вдвое выше груза');
   ok(Math.abs(ds-.2)<.001,'Погрешность расстояния Δs = 0,2 см');
   ok(Math.abs(A-f*s/100)<=.03*A+.005&&Math.abs(A-W2*.2)<=.04,'Работа A = F·s найдена верно (в Дж)')}}};
$('chk').onclick=()=>{const r=[],ok=(c,t)=>{r.push((c?'✓ ':'✗ ')+t);return c};WORKS[work].chk(ok);
 const all=r.every(x=>x[0]==='✓');
 $('res').innerHTML=r.map((x,k)=>`<div class="li ${x[0]==='✓'?'g':'b'}" style="animation-delay:${k*70}ms">${x}</div>`).join('')+(all?'<div class="li g" style="animation-delay:700ms"><b>Работа выполнена!</b></div>':'')};
function setWork(n){work=n;const k=WORKS[n];CM=k.cm;init();$('ttl').textContent=k.ttl;$('task').innerHTML=k.task;$('form').innerHTML=k.form;$('hint').textContent=k.hint;
 document.querySelectorAll('#works button').forEach(b=>b.classList.toggle('on',+b.dataset.w===n))}
$('works').innerHTML=Object.keys(WORKS).map(k=>`<button data-w="${k}"><b>№ ${k}</b>${WORKS[k].nm}</button>`).join('');
$('works').onclick=e=>{const b=e.target.closest('button');if(b)setWork(+b.dataset.w)};
$('reset').onclick=()=>setWork(work);
$('shot').onclick=()=>C.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='lab9-scheme.png';a.click()});
setWork(9);requestAnimationFrame(loop);
