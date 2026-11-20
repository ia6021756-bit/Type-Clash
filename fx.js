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
let W=0,H=0,L=150,gy=250,now=0,shake=0,flash=0,slow=0,parts=[],pend=[],balls=[],n=0,prev=0,hue=0,pc="#b8f35a",ec="#ff5c75";
const COL={shadow:"#b8f35a",ronin:"#ffc75e",volt:"#59d8ed",flame:"#ff7a45",frost:"#9ad7ff",legend:"#ff5ccf"};
// pose: [lean,a1u,a1l,a2u,a2l,l1u,l1l,l2u,l2l,dx,dy,rot]  (angles: 0=down, 90=forward, 180=up)
const G=[8,45,115,25,100,25,5,-25,-5,0,0,0];
const mk=(d,h,s,k)=>({d,h,s,k:[[0,G],...k,[1,G]]});
const M={
 jab:mk(.3,.3,"p",[[.3,[18,95,95,25,100,25,5,-25,-5,.07,.01,0]]]),
 cross:mk(.36,.36,"p",[[.36,[28,40,110,100,95,20,3,-38,-10,.1,.01,0]]]),
 hook:mk(.4,.38,"p",[[.38,[22,88,30,30,100,25,5,-25,-5,.08,0,0]]]),
 upper:mk(.45,.46,"p",[[.2,[-6,45,115,30,110,32,12,-30,-10,.02,.07,0]],[.46,[14,45,115,75,172,20,0,-20,-5,.06,-.03,0]]]),
 kick:mk(.45,.42,"k",[[.42,[-14,30,100,20,100,92,88,-4,-2,.07,0,0]]]),
 high:mk(.55,.46,"k",[[.46,[-30,25,95,15,95,132,126,-3,-2,.07,.02,0]]]),
 spec:mk(1,.85,"s",[[.35,[-6,30,60,20,55,25,5,-25,-5,-.06,.02,0]],[.55,[10,90,90,90,90,25,5,-28,-8,.05,.01,0]]]),
 hit:mk(.38,2,"",[[.18,[-24,-20,60,-10,70,10,-5,-30,-10,-.05,.02,0]]]),
 ko:{d:.9,h:2,hold:1,k:[[0,G],[.3,[-30,-40,40,-20,50,10,-5,-30,-10,-.12,.03,.25]],[1,[-70,-60,30,-50,30,5,-5,-15,-5,-.25,.04,1.45]]]},
 win:{d:.4,h:2,hold:1,k:[[0,G],[1,[-4,165,175,155,172,15,0,-15,0,0,0,0]]]}};
const P={dir:1,x:0,a:null,t0:0,down:0},E={dir:-1,x:0,a:null,t0:0,down:0};
const bg=Array.from({length:16},(_,i)=>[i/15-.03,.15+.3*Math.abs(Math.sin(i*7.3)),.07]);
function samp(a,u){const k=a.k;let i=0;while(i<k.length-2&&u>k[i+1][0])i++;const[t0,p0]=k[i],[t1,p1]=k[i+1];
 let x=Math.min(1,Math.max(0,(u-t0)/(t1-t0)));x=x*x*(3-2*x);return p0.map((v,j)=>v+(p1[j]-v)*x)}
function play(f,name){f.a=M[name];f.t0=now}
function pose(f){if(f.a){const u=(now-f.t0)/f.a.d;if(u<1)return samp(f.a,u);if(f.a.hold)return f.a.k[f.a.k.length-1][1];f.a=null}
 const p=G.slice(),s=Math.sin(now*5+(f.dir>0?0:2));p[0]+=s*2;p[1]+=s*4;p[10]=s*.006;return p}
function fig(f,col){const p=pose(f),d=f.dir,x=f.x+p[9]*L*d,hy=gy-.5*L+p[10]*L,ln=p[0]*R,tl=.3*L,lw=.062*L;
 c.fillStyle="rgba(0,0,0,.35)";c.beginPath();c.ellipse(f.x,gy+.02*L,.24*L,.045*L,0,0,7);c.fill();
 c.save();c.translate(f.x,gy);c.rotate(-p[11]*d);c.translate(-f.x,-gy);c.lineCap=c.lineJoin="round";
 const pt=(q,a,l)=>[q[0]+Math.sin(a*R)*l*d,q[1]+Math.cos(a*R)*l];
 const hip=[x,hy],nk=[x+Math.sin(ln)*tl*d,hy-Math.cos(ln)*tl],sh=[x+Math.sin(ln)*tl*.92*d,hy-Math.cos(ln)*tl*.92];
 const line=(q,w,cl,al)=>{c.globalAlpha=al;c.beginPath();c.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)c.lineTo(q[i][0],q[i][1]);
  c.strokeStyle="rgba(0,0,0,.55)";c.lineWidth=w+5;c.stroke();c.strokeStyle=cl;c.lineWidth=w;c.shadowColor=cl;c.shadowBlur=8;c.stroke();c.shadowBlur=0;c.globalAlpha=1};
 const limb=(s,a,b,l,al)=>{const m=pt(s,a,l),e=pt(m,b,l);line([s,m,e],lw,col,al)};
 limb(sh,p[3],p[4],.17*L,.7);limb(hip,p[7],p[8],.25*L,.7);line([hip,nk],lw*1.25,col,1);limb(hip,p[5],p[6],.25*L,1);
 const hd=[nk[0]+Math.sin(ln)*.1*L*d,nk[1]-Math.cos(ln)*.1*L];
 c.fillStyle="#0b0f19";c.strokeStyle=col;c.lineWidth=lw*.9;c.shadowColor=col;c.shadowBlur=8;c.beginPath();c.arc(hd[0],hd[1],.085*L,0,7);c.fill();c.stroke();c.shadowBlur=0;
 c.strokeStyle="#fff";c.lineWidth=3;c.beginPath();c.moveTo(hd[0]-.085*L,hd[1]-.015*L);c.lineTo(hd[0]+.085*L,hd[1]-.015*L);c.stroke();
 limb(sh,p[1],p[2],.17*L,1);c.restore()}
function bgDraw(){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${hue},55%,12%)`);g.addColorStop(.6,`hsl(${hue+30},60%,28%)`);g.addColorStop(1,`hsl(${hue+30},50%,20%)`);
 c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle=`hsla(${hue+40},90%,70%,.85)`;c.beginPath();c.arc(W*.5,H*.4,L*.3,0,7);c.fill();
 c.fillStyle="rgba(8,10,20,.85)";bg.forEach(b=>c.fillRect(b[0]*W,gy-.06*L-b[1]*L,b[2]*W+1,b[1]*L+.06*L));
 const f=c.createLinearGradient(0,gy-.06*L,0,H);f.addColorStop(0,"#3a4256");f.addColorStop(1,"#12151f");c.fillStyle=f;c.fillRect(0,gy-.06*L,W,H);
 c.strokeStyle="rgba(255,255,255,.07)";c.lineWidth=1;for(let i=-8;i<=8;i++){c.beginPath();c.moveTo(W/2+i*W*.04,gy-.06*L);c.lineTo(W/2+i*W*.16,H);c.stroke()}
 c.fillStyle="rgba(255,255,255,"+(.05+flash*.1)+")";[[.2,.05,.38],[.8,.95,.62]].forEach(s=>{c.beginPath();c.moveTo(W*s[0],0);c.lineTo(W*s[1],gy);c.lineTo(W*s[2],gy);c.fill()})}
function burst(x,y,k,col){for(let i=0;i<k;i++){const a=Math.random()*6.28,v=80+Math.random()*260;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,l:.5,s:2+Math.random()*3,c:col})}
 parts.push({x,y,ring:1,r:4,l:.3,c:col})}
function hit(a,s){const v=a===P?E:P;if(v.down)return;play(v,"hit");const x=v.x+v.dir*.08*L,y=gy-.62*L,big=s==="s";
 burst(x,y,big?40:16,big?"#ffd24a":"#fff");shake=Math.max(shake,big?22:s==="k"?12:8);flash=big?.9:.25;slow=big?.18:.05;
 (s==="k"?Sfx.kick:Sfx.punch)();if(big)Sfx.boom();Sfx.hurt()}
const SEQ=["jab","cross","jab","hook","kick","upper","cross","high"];
function attack(sp){if(P.down||E.down)return;if(P.a&&!P.a.hold&&now-P.t0<P.a.d*.55)return;
 const nm=sp?"spec":SEQ[n++%SEQ.length],m=M[nm];play(P,nm);Sfx.whoosh();pend.push({at:now+m.h*m.d,fn:()=>hit(P,sp?"s":m.s)});
 if(sp)pend.push({at:now+.5*m.d,fn:()=>{Sfx.special();balls.push({t0:now,x0:P.x+.3*L,x1:E.x-.1*L,y:gy-.62*L,dur:.35})}})}
function enemyAttack(){if(P.down||E.down)return;const nm=["jab","cross","kick","hook"][n++%4],m=M[nm];play(E,nm);Sfx.whoosh();pend.push({at:now+m.h*m.d,fn:()=>hit(E,m.s)})}
function end(win){pend.length=0;const v=win?E:P,w=win?P:E;v.down=1;play(v,"ko");play(w,"win");slow=.5;shake=24;flash=1;burst(v.x,gy-.5*L,50,"#ffd24a")}
function layout(){L=Math.min(H*.56,W*.5);gy=H*.84;const gap=Math.min(W*.5,L*.62);P.x=W/2-gap/2;E.x=W/2+gap/2}
function resize(){const r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);if(!r.width||!r.height)return;W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;c.setTransform(d,0,0,d,0,0);layout()}
function reset(key,h){pc=COL[key]||COL.shadow;hue=h||0;ec=`hsl(${(350+hue)%360},85%,62%)`;P.down=E.down=0;P.a=E.a=null;pend.length=0;parts.length=0;balls.length=0;shake=flash=slow=0;resize()}
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-prev)/1000||0);prev=t;if(!W)return;
 const k=slow>0?.18:1;slow=Math.max(0,slow-dt);const d=dt*k;now+=d;
 for(let i=pend.length-1;i>=0;i--)if(now>=pend[i].at)pend.splice(i,1)[0].fn();
 shake*=.88;flash*=.9;c.save();c.clearRect(0,0,W,H);c.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 bgDraw();fig(E,ec);fig(P,pc);
 balls=balls.filter(b=>now-b.t0<b.dur);balls.forEach(b=>{const u=(now-b.t0)/b.dur,x=b.x0+(b.x1-b.x0)*u,r=.13*L,g=c.createRadialGradient(x,b.y,0,x,b.y,r);
  g.addColorStop(0,"#fff");g.addColorStop(.4,pc);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.beginPath();c.arc(x,b.y,r,0,7);c.fill()});
 parts=parts.filter(p=>(p.l-=d)>0);parts.forEach(p=>{if(p.ring){p.r+=300*d;c.strokeStyle=p.c;c.globalAlpha=p.l/.3;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.stroke();c.globalAlpha=1}
  else{p.x+=p.vx*d;p.y+=p.vy*d;p.vy+=600*d;c.fillStyle=p.c;c.globalAlpha=Math.min(1,p.l*3);c.fillRect(p.x,p.y,p.s,p.s);c.globalAlpha=1}});
 c.restore();if(flash>.02){c.fillStyle=`rgba(255,255,255,${flash*.45})`;c.fillRect(0,0,W,H)}}
if(window.ResizeObserver)new ResizeObserver(resize).observe(cv);window.addEventListener("resize",resize);
requestAnimationFrame(frame);
return{attack,enemyAttack,end,reset,resize}})();
