/* TYPE CLASH - fight engine (canvas) + synthesized music & SFX. No external assets. */
window.Sfx=(()=>{let ctx,mg,sg,mu,nb,on=true,mOn=true,timer,nt=0,st=0,playing=false;
const mf=n=>440*Math.pow(2,(n-69)/12);
function init(){if(ctx){if(ctx.state==="suspended")ctx.resume();return}
 try{ctx=new(window.AudioContext||window.webkitAudioContext)();mg=ctx.createGain();mg.connect(ctx.destination);
 sg=ctx.createGain();sg.gain.value=on?1:0;sg.connect(mg);mu=ctx.createGain();mu.gain.value=mOn?.2:0;mu.connect(mg);
 nb=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){ctx=null}}
function nz(dest,t,dur,type,f0,f1,v){const s=ctx.createBufferSource();s.buffer=nb;s.loop=true;const f=ctx.createBiquadFilter(),g=ctx.createGain();
 f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
 s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+.02)}
function o(dest,t,type,f0,f1,dur,v){const x=ctx.createOscillator(),g=ctx.createGain();x.type=type;x.frequency.setValueAtTime(f0,t);
 x.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
 x.connect(g);g.connect(dest);x.start(t);x.stop(t+dur+.02)}
const S=f=>()=>{if(!ctx||!on)return;f(ctx.currentTime)};
const roots=[45,45,41,43],arp=[0,7,12,7,15,12,7,3];
function step(s32,t){const s=s32%16,r=roots[Math.floor(s32/8)%4];
 if(s%4===0)o(mu,t,"sine",150,40,.18,1.3);
 if(s===4||s===12){nz(mu,t,.14,"highpass",1500,3000,.5);o(mu,t,"triangle",220,120,.08,.4)}
 if(s%2===0)nz(mu,t,.04,"highpass",7000,9000,s%4===2?.25:.12);
 if(s%2===0)o(mu,t,"sawtooth",mf(r),mf(r)*.99,.2,.45);
 o(mu,t,"square",mf(r+24+arp[s32%8]),mf(r+24+arp[s32%8])*.99,.09,.1)}
function sched(){while(nt<ctx.currentTime+.2){step(st,nt);nt+=60/140/4;st=(st+1)%32}}
return{init,
 setSfx(b){on=b;if(sg)sg.gain.value=b?1:0},setMusic(b){mOn=b;if(mu)mu.gain.value=b?.2:0},
 musicStart(){if(!ctx||playing)return;playing=true;nt=ctx.currentTime+.05;st=0;timer=setInterval(sched,40)},
 musicStop(){playing=false;clearInterval(timer)},
 punch:S(t=>{nz(sg,t,.12,"lowpass",1200,200,.9);o(sg,t,"sine",160,45,.14,.9)}),
 kick:S(t=>{nz(sg,t,.16,"lowpass",2000,150,1);o(sg,t,"sine",120,35,.2,1)}),
 whoosh:S(t=>nz(sg,t,.18,"bandpass",500,2500,.25)),
 special:S(t=>{o(sg,t,"sawtooth",150,1200,.45,.22);nz(sg,t,.5,"bandpass",300,3000,.35)}),
 boom:S(t=>{o(sg,t,"sine",90,25,.5,1.3);nz(sg,t,.4,"lowpass",1500,100,1)}),
 hurt:S(t=>o(sg,t,"square",260,90,.2,.15)),
 ko:S(t=>{o(sg,t,"sawtooth",400,30,1,.3);nz(sg,t,.8,"lowpass",2000,80,.8)}),
 win:S(t=>[72,76,79,84,88].forEach((n,i)=>o(sg,t+i*.12,"triangle",mf(n),mf(n),.3,.4)))}})();

window.Arena=(()=>{
const cv=document.getElementById("arena"),c=cv.getContext("2d"),R=Math.PI/180;
let W=0,H=0,L=150,gy=250,now=0,shake=0,flash=0,slow=0,parts=[],pend=[],n=0,prev=0,hue=0,pc="#b8f35a",ec="#ff5c75",zoom=1,zf=0,esc=1,rain=[],vig=null,grain=null;
const COL={shadow:"#b8f35a",ronin:"#ffc75e",volt:"#59d8ed",flame:"#ff7a45",frost:"#9ad7ff",legend:"#ff5ccf"};
// pose: [lean,a1u,a1l,a2u,a2l,l1u,l1l,l2u,l2l,dx,dy,rot]  angles: 0=down 90=forward 180=up
const G=[8,45,115,25,100,25,5,-25,-5,0,0,0],KO=[-70,-60,30,-50,30,5,-5,-15,-5,-.25,.04,1.45],FLY=[-40,100,60,120,70,70,40,40,20,0,0,0],BLK=[10,60,170,50,165,25,5,-25,-5,-.02,.03,0];
const mk=(d,h,s,k)=>({d,h,s,k:[[0,G],...k,[1,G]]});
const M={
 jab:mk(.26,.26,"p",[[.26,[18,95,95,25,100,25,5,-25,-5,.07,.01,0]]]),
 cross:mk(.34,.34,"p",[[.34,[28,40,110,100,95,20,3,-38,-10,.1,.01,0]]]),
 elbow:mk(.34,.34,"p",[[.34,[24,85,195,30,100,25,5,-25,-5,.09,.02,0]]]),
 hook:mk(.38,.36,"p",[[.36,[22,88,30,30,100,25,5,-25,-5,.08,0,0]]]),
 head:mk(.34,.3,"p",[[.3,[40,30,100,25,95,25,5,-25,-5,.08,.02,0]]]),
 knee:mk(.4,.38,"k",[[.38,[6,40,110,30,105,100,8,-4,-2,.06,0,0]]]),
 teep:mk(.4,.4,"k",[[.4,[-16,30,100,20,100,92,88,-4,-2,.07,0,0]]]),
 upper:mk(.42,.44,"h",[[.2,[-6,45,115,30,110,32,12,-30,-10,.02,.07,0]],[.44,[14,45,115,75,172,20,0,-20,-5,.06,-.03,0]]]),
 round:mk(.5,.46,"h",[[.46,[-30,25,95,15,95,132,126,-3,-2,.07,.02,0]]]),
 spin:mk(.62,.5,"h",[[.22,[34,60,100,50,95,30,10,-30,-8,-.05,.06,0]],[.5,[-48,40,100,35,95,96,92,-4,-2,.08,.02,0]]]),
 throw:mk(1.25,9,"",[[.25,[22,95,95,100,95,28,8,-30,-8,.1,.02,0]],[.5,[10,165,170,160,168,20,0,-20,-5,.08,-.01,0]],[.8,[28,110,60,105,60,30,5,-30,-8,.1,.07,0]]]),
 hit:mk(.38,9,"",[[.18,[-24,-20,60,-10,70,10,-5,-30,-10,-.05,.02,0]]]),
 block:mk(.45,9,"",[[.12,BLK],[.7,BLK]]),
 fly:mk(.8,9,"",[[.1,FLY],[.9,FLY]]),
 up:{d:1,h:9,k:[[0,KO],[.35,KO],[1,G]]},
 ko:{d:.9,h:9,hold:1,k:[[0,G],[.3,[-30,-40,40,-20,50,10,-5,-30,-10,-.12,.03,.25]],[1,KO]]},
 win:{d:.4,h:9,hold:1,k:[[0,G],[1,[-4,165,175,155,172,15,0,-15,0,0,0,0]]]}};
const mkF=d=>({dir:d,x:0,ox:0,a:null,t0:0,down:0,tw:null,th:[],tf:[]}),P=mkF(1),E=mkF(-1);
function samp(a,u){const k=a.k;let i=0;while(i<k.length-2&&u>k[i+1][0])i++;const[t0,p0]=k[i],[t1,p1]=k[i+1];
 let x=Math.min(1,Math.max(0,(u-t0)/(t1-t0)));x=x*x*(3-2*x);return p0.map((v,j)=>v+(p1[j]-v)*x)}
function play(f,nm){f.a=M[nm];f.t0=now}
function pose(f){if(f.a){const u=(now-f.t0)/f.a.d;if(u<1)return samp(f.a,u);if(f.a.hold)return f.a.k[f.a.k.length-1][1];f.a=null}
 const p=G.slice(),s=Math.sin(now*5+(f.dir>0?0:2));p[0]+=s*2;p[1]+=s*4;p[9]=Math.sin(now*2.2+f.dir)*.025;p[10]=s*.006;return p}
function twp(f){if(!f.tw)return[0,0,0];const u=Math.min(1,(now-f.tw.t0)/f.tw.d),s=u*u*(3-2*u);return[-f.dir*.55*s,-.45*Math.sin(Math.PI*u),1.5*s]}
function fig(f,col,sc){const p=pose(f),d=f.dir,l=L*sc,px=f.x+f.ox,x=px+p[9]*l*d,hy=gy-.5*l+p[10]*l,ln=p[0]*R,tl=.3*l,lw=.075*l,tw=twp(f);
 c.fillStyle="rgba(0,0,0,.45)";c.beginPath();c.ellipse(px,gy+.02*l,.26*l,.045*l,0,0,7);c.fill();
 c.save();c.translate(tw[0]*l,tw[1]*l);const cy=gy-.5*l;c.translate(px,cy);c.rotate(-tw[2]*d);c.translate(-px,-cy);
 c.translate(px,gy);c.rotate(-p[11]*d);c.translate(-px,-gy);c.lineCap=c.lineJoin="round";
 const pt=(q,a,len)=>[q[0]+Math.sin(a*R)*len*d,q[1]+Math.cos(a*R)*len];
 const hip=[x,hy],nk=[x+Math.sin(ln)*tl*d,hy-Math.cos(ln)*tl],sh=[x+Math.sin(ln)*tl*.9*d,hy-Math.cos(ln)*tl*.9];
 const seg=(q,w,cl,al)=>{c.globalAlpha=al;c.beginPath();c.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)c.lineTo(q[i][0],q[i][1]);
  c.strokeStyle="rgba(0,0,0,.7)";c.lineWidth=w+4;c.stroke();c.strokeStyle=cl;c.lineWidth=w;c.stroke();
  c.strokeStyle="rgba(255,255,255,.18)";c.lineWidth=w*.28;c.stroke();c.globalAlpha=1};
 const dot=(q,r,cl,al)=>{c.globalAlpha=al;c.fillStyle="rgba(0,0,0,.7)";c.beginPath();c.arc(q[0],q[1],r+2,0,7);c.fill();c.fillStyle=cl;c.beginPath();c.arc(q[0],q[1],r,0,7);c.fill();c.globalAlpha=1};
 const limb=(s,a,b,len,al,hand)=>{const m=pt(s,a,len),e=pt(m,b,len);seg([s,m,e],lw,col,al);dot(e,hand?lw*.62:lw*.58,hand?"#d8c3ae":"#1b202c",al);return e};
 limb(sh,p[3],p[4],.17*l,.75,1);limb(hip,p[7],p[8],.25*l,.75,0);seg([hip,nk],lw*1.3,col,1);
 const ft=limb(hip,p[5],p[6],.25*l,1,0);
 const hd=[nk[0]+Math.sin(ln)*.1*l*d,nk[1]-Math.cos(ln)*.1*l];
 c.fillStyle="#0e121b";c.strokeStyle=col;c.lineWidth=lw*.5;c.beginPath();c.arc(hd[0],hd[1],.085*l,0,7);c.fill();c.stroke();
 c.fillStyle="#fff";c.fillRect(hd[0]+d*.02*l-(d<0?.06*l:0),hd[1]-.02*l,.06*l,.014*l);
 const hand=limb(sh,p[1],p[2],.17*l,1,1);
 const atk=f.a&&f.a.s;[[f.th,hand],[f.tf,ft]].forEach(([t,e])=>{if(atk)t.push([e[0],e[1]]);else t.shift();while(t.length>7)t.shift();
  if(t.length>1){c.beginPath();c.moveTo(t[0][0],t[0][1]);t.forEach(q=>c.lineTo(q[0],q[1]));c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=lw*.5;c.stroke()}});
 c.restore()}
function bgDraw(){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${hue+205},40%,5%)`);g.addColorStop(.7,`hsl(${hue+195},32%,15%)`);g.addColorStop(1,`hsl(${hue+195},25%,9%)`);
 c.fillStyle=g;c.fillRect(0,0,W,H);const bw=W*.085,rh=L*.13;
 for(let i=0;i<14;i++){const bx=i*bw*1.08-W*.02,bh=H*(.22+.3*Math.abs(Math.sin(i*7.3)));
  c.fillStyle=`hsl(${hue+210},30%,${7+i%3}%)`;c.fillRect(bx,gy-.06*L-bh,bw,bh+.06*L);
  for(let r=0;r<bh/rh-1;r++)for(let q=0;q<3;q++)if(Math.sin(i*13+r*5+q*3.1)>.25){c.fillStyle=`hsla(${hue+45},85%,68%,.55)`;c.fillRect(bx+bw*(.12+q*.3),gy-.06*L-bh+rh*(.5+r),bw*.16,rh*.45)}}
 const f=c.createLinearGradient(0,gy-.06*L,0,H);f.addColorStop(0,"#2b3040");f.addColorStop(1,"#0b0d13");c.fillStyle=f;c.fillRect(0,gy-.06*L,W,H);
 c.fillStyle="rgba(130,170,200,.07)";c.fillRect(0,gy-.2*L,W,.18*L);
 c.strokeStyle="rgba(180,210,255,.06)";c.lineWidth=1;for(let i=-8;i<=8;i++){c.beginPath();c.moveTo(W/2+i*W*.04,gy-.06*L);c.lineTo(W/2+i*W*.16,H);c.stroke()}
 c.strokeStyle="rgba(200,220,255,.22)";c.lineWidth=1;rain.forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]-3,q[1]+14);c.stroke()})}
function burst(x,y,k,col){for(let i=0;i<k;i++){const a=Math.random()*6.28,v=80+Math.random()*260;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,l:.5,s:2+Math.random()*3,c:col})}}
function dust(x,k){for(let i=0;i<k;i++)parts.push({x:x+(Math.random()-.5)*L*.3,y:gy,vx:(Math.random()-.5)*220,vy:-Math.random()*90,l:.6,s:4+Math.random()*4,c:"rgba(200,205,215,.55)"})}
function hit(a,s,bl){const v=a===P?E:P;if(v.down||v.tw)return;const x=v.x+v.ox+v.dir*.08*L,y=gy-.62*L,h=s==="h";
 if(bl){play(v,"block");burst(x,y,6,"#9ad7ff");shake=Math.max(shake,4);Sfx.punch();return}
 play(v,"hit");v.ox+=-v.dir*L*(h?.16:.07);burst(x,y,h?30:14,h?"#ffd24a":"#fff");parts.push({star:1,x,y,l:.14,r:L*(h?.3:.17)});
 shake=Math.max(shake,h?20:s==="k"?12:8);flash=h?.7:.2;slow=h?.14:.05;if(h){zoom=1.14;zf=v.x;dust(v.x,8)}
 (s==="k"||h?Sfx.kick:Sfx.punch)();if(h)Sfx.boom();Sfx.hurt()}
const CH="jab jab cross elbow knee hook upper teep cross round jab cross knee spin head cross".split(" ");
function throwMove(){const m=M.throw;play(P,"throw");Sfx.whoosh();
 pend.push({at:now+.3*m.d,fn:()=>{play(E,"fly");E.tw={t0:now,d:.75};Sfx.punch();burst(E.x,gy-.6*L,8,"#fff")}},
  {at:now+.3*m.d+.75,fn:()=>{E.ox+=-E.dir*.55*L;E.tw=null;play(E,"up");dust(E.x+E.ox,24);shake=26;flash=.8;slow=.2;zoom=1.2;zf=E.x+E.ox;Sfx.boom();Sfx.hurt()}})}
function attack(sp){if(P.down||E.down||E.tw||E.a===M.up)return;if(P.a&&!P.a.hold&&now-P.t0<P.a.d*.5)return;
 if(sp){throwMove();return}const nm=CH[n++%CH.length],m=M[nm],bl=Math.random()<.18;play(P,nm);Sfx.whoosh();pend.push({at:now+m.h*m.d,fn:()=>hit(P,m.s,bl)})}
function enemyAttack(){if(P.down||E.down||E.tw)return 0;const nm=["jab","cross","hook","teep","elbow","knee"][n++%6],m=M[nm],bl=Math.random()<.3;
 play(E,nm);Sfx.whoosh();pend.push({at:now+m.h*m.d,fn:()=>hit(E,m.s,bl)});return bl?.35:1}
function end(win){pend.length=0;E.tw=null;const v=win?E:P,w=win?P:E;v.down=1;play(v,"ko");play(w,"win");slow=.6;shake=24;flash=1;zoom=1.35;zf=v.x;burst(v.x,gy-.5*L,50,"#ffd24a");dust(v.x,16)}
function layout(){L=Math.min(H*.52,W*.46);gy=H*.84;const gap=Math.min(W*.5,L*.58);P.x=W/2-gap/2;E.x=W/2+gap/2}
function resize(){const r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);if(!r.width||!r.height)return;W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;c.setTransform(d,0,0,d,0,0);layout();
 vig=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,0,.65)");
 rain=Array.from({length:Math.round(W/12)},()=>[Math.random()*W,Math.random()*H,500+Math.random()*300]);
 if(!grain){grain=document.createElement("canvas");grain.width=grain.height=96;const g=grain.getContext("2d");for(let i=0;i<1400;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.5})`;g.fillRect(Math.random()*96,Math.random()*96,1,1)}}}
function reset(key,h,boss){pc=COL[key]||COL.shadow;hue=h||0;ec=`hsl(${(350+hue)%360},80%,${boss?48:60}%)`;esc=boss?1.12:1;
 [P,E].forEach(f=>{f.down=0;f.a=null;f.ox=0;f.tw=null;f.th=[];f.tf=[]});pend.length=0;parts.length=0;shake=flash=slow=0;zoom=1;resize()}
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-prev)/1000||0);prev=t;if(!W)return;
 const k=slow>0?.18:1;slow=Math.max(0,slow-dt);const d=dt*k;now+=d;
 for(let i=pend.length-1;i>=0;i--)if(now>=pend[i].at)pend.splice(i,1)[0].fn();
 [P,E].forEach(f=>f.ox*=Math.exp(-6*d));zoom+=(1-zoom)*Math.min(1,2.2*dt);rain.forEach(q=>{q[1]+=q[2]*dt;if(q[1]>H){q[1]=-10;q[0]=Math.random()*W}});
 shake*=.88;flash*=.9;c.save();c.clearRect(0,0,W,H);c.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 const lim=W/2*(1-1/zoom),fx=W/2+Math.max(-lim,Math.min(lim,zf-W/2)),fy=gy-.3*L;c.translate(W/2,fy);c.scale(zoom,zoom);c.translate(-fx,-fy);
 bgDraw();if(E.a&&E.a.s){fig(P,pc,1);fig(E,ec,esc)}else{fig(E,ec,esc);fig(P,pc,1)}
 parts=parts.filter(p=>(p.l-=d)>0);parts.forEach(p=>{if(p.star){c.fillStyle="rgba(255,255,255,.9)";c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?p.r*.35:p.r;c.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r)}c.fill()}
  else{p.x+=p.vx*d;p.y+=p.vy*d;p.vy+=600*d;c.fillStyle=p.c;c.globalAlpha=Math.min(1,p.l*3);c.fillRect(p.x,p.y,p.s,p.s);c.globalAlpha=1}});
 c.restore();c.fillStyle="rgba(15,45,75,.14)";c.fillRect(0,0,W,H);c.fillStyle=vig;c.fillRect(0,0,W,H);
 c.globalAlpha=.08;c.drawImage(grain,-Math.random()*96,-Math.random()*96,W+96,H+96);c.globalAlpha=1;
 if(flash>.02){c.fillStyle=`rgba(255,255,255,${flash*.4})`;c.fillRect(0,0,W,H)}}
if(window.ResizeObserver)new ResizeObserver(resize).observe(cv);window.addEventListener("resize",resize);
requestAnimationFrame(frame);
return{attack,enemyAttack,end,reset,resize}})();
