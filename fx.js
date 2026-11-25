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
const cv=document.getElementById("arena"),R=Math.PI/180;let c=cv.getContext("2d");
let W=0,H=0,L=150,gy=250,now=0,shake=0,flash=0,slow=0,parts=[],pend=[],n=0,prev=0,hue=0,pc="#b8f35a",ec="#ff5c75",zoom=1,zf=0,esc=1,rain=[],vig=null,grain=null,word=null,wordT=0,wordIdx=-1,banT=0,tempo=1,eSp=1,cb=null,SP=null,SE=null,aid=0,GA=1,ghosts=[],beams=[],cracks=[],auraOn=false;
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
 slip:mk(.38,9,"",[[.15,[-8,60,110,50,100,55,-5,-50,-8,-.06,.1,0]],[.2,[-8,60,110,50,100,55,-5,-50,-8,-.06,.1,0]]]),
 up:{d:1,h:9,k:[[0,KO],[.35,KO],[1,G]]},
 ko:{d:.9,h:9,hold:1,k:[[0,G],[.3,[-30,-40,40,-20,50,10,-5,-30,-10,-.12,.03,.25]],[1,KO]]},
 win:{d:.4,h:9,hold:1,k:[[0,G],[1,[-4,165,175,155,172,15,0,-15,0,0,0,0]]]},
 epunch:mk(1,.62,"S",[[.4,[6,-55,40,-35,50,22,6,-26,-6,-.04,.06,0]],[.5,[6,-55,40,-35,50,22,6,-26,-6,-.04,.06,0]],[.62,[26,95,92,20,100,22,3,-34,-8,.15,.01,0]]]),
 choke:mk(1.5,9,"",[[.25,[20,100,92,40,100,25,5,-25,-5,.13,.01,0]],[.85,[20,100,92,40,100,25,5,-25,-5,.13,.01,0]],[.95,[26,95,95,95,95,25,5,-28,-8,.16,.01,0]]]),
 chk:{d:.1,h:9,hold:1,k:[[0,G],[1,[-12,115,70,105,75,45,15,10,5,.02,0,0]]]},
 flip:mk(.7,9,"",[[.15,[-15,60,110,40,90,40,10,-30,-8,0,.1,0]],[.5,[-25,70,100,45,95,150,148,-20,-10,0,0,0]]])};
const JB=[20,95,95,25,100,25,5,-25,-5,.07,.01,0],CR=[28,40,110,100,95,20,3,-38,-10,.1,.01,0],UP=[14,45,115,75,172,20,0,-20,-5,.06,-.03,0],CHG=[8,-40,45,-30,50,25,6,-26,-6,-.05,.06,0],THR=[14,92,92,90,90,25,5,-28,-8,.03,.02,0],DV=[0,85,90,60,100,100,95,-40,-20,0,0,0];
Object.assign(M,{
 beam:mk(1.3,9,"",[[.3,CHG],[.45,CHG],[.6,THR],[.95,THR]]),
 flurry:mk(.95,9,"",[[.1,JB],[.2,CR],[.3,JB],[.4,CR],[.5,JB],[.6,CR],[.7,UP]]),
 dive:mk(.75,9,"",[[.2,DV],[.8,DV]]),
 sweep:mk(.46,.42,"k",[[.42,[-8,60,100,40,100,70,70,-60,-10,.08,.15,0]]])});
M.epunch.sp=M.choke.sp=M.flip.sp=M.throw.sp=M.beam.sp=M.flurry.sp=M.dive.sp=1;
const mkF=d=>({dir:d,x:0,ox:0,a:null,t0:0,down:0,tw:null,th:[],tf:[],sp:1,lift:0,shk:0,chg:0,hp:[0,0],lg:0,lgT:0,lgTok:0,gh:0,aura:0}),P=mkF(1),E=mkF(-1);
function samp(a,u){const k=a.k;let i=0;while(i<k.length-2&&u>k[i+1][0])i++;const[t0,p0]=k[i],[t1,p1]=k[i+1];
 let x=Math.min(1,Math.max(0,(u-t0)/(t1-t0)));x=x*x*(3-2*x);return p0.map((v,j)=>v+(p1[j]-v)*x)}
function play(f,nm,sp){f.a=M[nm];f.t0=now;f.sp=sp||1}
function pose(f){if(f.a){const u=(now-f.t0)*f.sp/f.a.d;if(u<1)return samp(f.a,u);if(f.a.hold)return f.a.k[f.a.k.length-1][1];f.a=null}
 const p=G.slice(),s=Math.sin(now*5+(f.dir>0?0:2));p[0]+=s*2;p[1]+=s*4;p[9]=Math.sin(now*2.2+f.dir)*.025;p[10]=s*.006;
 const mv=Math.abs(f.ox)/L+Math.abs(f.lgT-f.lg)/L;if(mv>.1){const r=Math.sin(now*18),k=Math.min(1,mv*3),m=1-k;
  p[0]=14*k+8*m;p[1]=-40*r*k+45*m;p[2]=(60+30*r)*k+115*m;p[3]=40*r*k+25*m;p[4]=(70-30*r)*k+100*m;p[5]=55*r*k+25*m;p[6]=(-30+30*Math.abs(r))*k+5*m;p[7]=-55*r*k-25*m;p[8]=-30*k-5*m;p[10]=.03*k}return p}
function twp(f){if(!f.tw)return[0,0,0];const u=Math.min(1,(now-f.tw.t0)/f.tw.d),s=u*u*(3-2*u);if(f.tw.type==="flip")return[f.dir*.3*s,-.5*Math.sin(Math.PI*u),2*Math.PI*s];if(f.tw.type==="tumble")return[-f.dir*.8*s,-.7*Math.sin(Math.PI*u),(2*Math.PI+1.5)*s];if(f.tw.type==="smash")return[f.dir*f.tw.dx*s,-1.0*4*u*(1-u),-.9*u*u];if(f.tw.type==="dive")return[f.dir*f.tw.dx*s,-.42*Math.sin(Math.PI*u),-1.15*Math.sin(Math.PI*u)];return[-f.dir*.55*s,-.45*Math.sin(Math.PI*u),1.5*s]}
const el=(x,y,rx,ry,cl)=>{c.fillStyle=cl;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()},
 rc=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(x-w/2,y-h/2,w,h)},
 tri=(q,cl)=>{c.fillStyle=cl;c.beginPath();c.moveTo(q[0][0],q[0][1]);c.lineTo(q[1][0],q[1][1]);c.lineTo(q[2][0],q[2][1]);c.fill()},
 dome=(x,y,rx,ry,cl)=>{c.fillStyle=cl;c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI,0);c.fill()};
const HAT={
 straw:(x,y,r,d,a,b)=>{el(x,y-.55*r,1.95*r,.38*r,a);dome(x,y-.6*r,.95*r,.85*r,a);rc(x,y-.72*r,1.7*r,.22*r,b)},
 cap:(x,y,r,d,a,b)=>{dome(x,y-.2*r,1.05*r,1.0*r,a);el(x+d*.95*r,y-.38*r,.8*r,.2*r,b||a)},
 backcap:(x,y,r,d,a,b)=>{dome(x,y-.2*r,1.05*r,1.0*r,a);el(x-d*.95*r,y-.38*r,.7*r,.18*r,b||a)},
 beanie:(x,y,r,d,a,b)=>{dome(x,y-.25*r,1.08*r,1.05*r,a);rc(x,y-.3*r,2.1*r,.3*r,b);el(x,y-1.3*r,.28*r,.28*r,b)},
 cowboy:(x,y,r,d,a,b)=>{el(x,y-.6*r,2.3*r,.34*r,a);dome(x,y-.65*r,.95*r,.95*r,a);rc(x,y-.8*r,1.85*r,.18*r,b)},
 crown:(x,y,r,d,a,b)=>{rc(x,y-.95*r,1.7*r,.4*r,a);for(let i=-1;i<=1;i++)tri([[x+i*.6*r-.3*r,y-1.15*r],[x+i*.6*r,y-1.85*r],[x+i*.6*r+.3*r,y-1.15*r]],a);el(x,y-.95*r,.15*r,.15*r,b)},
 ninja:(x,y,r,d,a,b)=>{el(x,y,1.1*r,1.1*r,a);rc(x+d*.25*r,y-.1*r,1.3*r,.3*r,"#f3d3ae");rc(x-d*1.35*r,y-.3*r,1.1*r,.16*r,b)},
 helmet:(x,y,r,d,a,b)=>{dome(x,y,1.15*r,1.15*r,a);rc(x+d*.35*r,y-.05*r,.95*r,.2*r,"#222");el(x,y-1.25*r,.2*r,.45*r,b)},
 viking:(x,y,r,d,a,b)=>{dome(x,y,1.12*r,1.1*r,a);for(const s of[-1,1])tri([[x+s*.9*r,y-.5*r],[x+s*1.75*r,y-1.5*r],[x+s*.55*r,y-.95*r]],"#f1e6c8")},
 wizard:(x,y,r,d,a,b)=>{el(x,y-.65*r,1.8*r,.3*r,a);tri([[x-1.1*r,y-.65*r],[x-d*.3*r,y-3*r],[x+1.1*r,y-.65*r]],a);el(x+.1*r,y-1.7*r,.22*r,.22*r,b)},
 chef:(x,y,r,d,a)=>{rc(x,y-.95*r,1.5*r,.5*r,a);el(x-.5*r,y-1.5*r,.65*r,.6*r,a);el(x+.5*r,y-1.5*r,.65*r,.6*r,a);el(x,y-1.7*r,.7*r,.65*r,a)},
 pirate:(x,y,r,d,a,b)=>{tri([[x-1.7*r,y-.55*r],[x,y-1.6*r],[x+1.7*r,y-.55*r]],a);rc(x,y-.65*r,2*r,.2*r,b);el(x,y-1.0*r,.18*r,.18*r,b)},
 hood:(x,y,r,d,a)=>{c.strokeStyle=a;c.lineWidth=.45*r;c.beginPath();c.arc(x-d*.08*r,y,1.15*r,0,7);c.stroke()},
 ears:(x,y,r,d,a,b)=>{for(const s of[-1,1]){tri([[x+s*.95*r,y-.5*r],[x+s*.8*r,y-1.55*r],[x+s*.15*r,y-.95*r]],a);tri([[x+s*.8*r,y-.75*r],[x+s*.72*r,y-1.3*r],[x+s*.35*r,y-.95*r]],b)}},
 mohawk:(x,y,r,d,a)=>{for(let i=-2;i<=2;i++)tri([[x+i*.38*r-.3*r,y-.95*r],[x+i*.38*r,y-1.95*r+Math.abs(i)*.3*r],[x+i*.38*r+.3*r,y-.95*r]],a)},
 spiky:(x,y,r,d,a)=>{dome(x,y,1.05*r,1.0*r,a);for(let i=-2;i<=2;i++)tri([[x+i*.45*r-.3*r,y-.85*r],[x+i*.5*r,y-1.8*r+Math.abs(i)*.2*r],[x+i*.45*r+.3*r,y-.85*r]],a)},
 topknot:(x,y,r,d,a)=>{dome(x,y,1.08*r,1.0*r,a);el(x-d*.2*r,y-1.3*r,.42*r,.42*r,a)},
 slick:(x,y,r,d,a)=>dome(x,y-.05*r,1.08*r,.95*r,a),
 headband:(x,y,r,d,a)=>{rc(x,y-.35*r,2.1*r,.22*r,a);rc(x-d*1.4*r,y-.3*r,.9*r,.14*r,a)}};
const STY={
 shadow:{col:"#b8f35a",skin:"#e8cfae",hat:"headband",hc:"#ffffff"},
 straw:{col:"#f2d3b0",skin:"#f2d3b0",top:"#d63a3a",pants:"#2d4a8a",wide:1,hat:"straw",hc:"#e8c05a",hc2:"#c0392b",belt:"#f0e6c0"},
 racer:{col:"#ff7a2f",skin:"#d9b08c",pants:"#2a2f3d",wide:1,hat:"backcap",hc:"#1f6feb",hc2:"#1f6feb",shoe:"#ffffff"},
 boxer:{col:"#e8bfa0",skin:"#e8bfa0",top:"#f4f4f4",pants:"#d62828",hand:"#d62828",hat:"headband",hc:"#d62828",belt:"#f4f4f4"},
 cowboy:{col:"#e1b98e",skin:"#e1b98e",top:"#8b5a2b",pants:"#3a5a8c",wide:1,hat:"cowboy",hc:"#7a4a21",hc2:"#d4a017",belt:"#d4a017",shoe:"#5a3a1a"},
 ninja:{col:"#2b2f44",skin:"#2b2f44",pants:"#1c1f2e",hat:"ninja",hc:"#1c1f2e",hc2:"#e63946",scarf:"#e63946"},
 chef:{col:"#f5f5f5",skin:"#f0c9a0",pants:"#4a4f66",wide:1,hat:"chef",hc:"#ffffff",tie:"#2b6cb0"},
 pirate:{col:"#e9e2d0",skin:"#d9a679",pants:"#3b2f2f",wide:1,hat:"pirate",hc:"#1a1a1a",hc2:"#e8e8e8",belt:"#6b4423",scarf:"#c0392b",shoe:"#2a1a0a"},
 ronin:{col:"#3b4a7a",skin:"#e8cfae",robe:1,hat:"topknot",hc:"#1a1a1a",belt:"#c9a227",shoe:"#222"},
 suit:{col:"#2f3545",skin:"#e8cfae",wide:1,hat:"slick",hc:"#222",tie:"#c1121f",shoe:"#111"},
 knight:{col:"#aeb8c9",skin:"#e8cfae",pants:"#8d98aa",wide:1,armor:1,hat:"helmet",hc:"#aeb8c9",hc2:"#d62828"},
 viking:{col:"#e0b48a",skin:"#e0b48a",top:"#7a4e2a",pants:"#4a3a2a",wide:1,hat:"viking",hc:"#9aa3b2",beard:"#c96a1e",belt:"#c9a227",shoe:"#3a2a1a"},
 volt:{col:"#ffd60a",skin:"#e8cfae",pants:"#1b2b4b",wide:1,hat:"spiky",hc:"#59d8ed",shoe:"#59d8ed"},
 flame:{col:"#e86a10",skin:"#d9a679",robe:1,hat:"none",belt:"#6b3e1e",shoe:"#6b3e1e"},
 wizard:{col:"#5b3fa0",skin:"#e8cfae",robe:1,hat:"wizard",hc:"#5b3fa0",hc2:"#ffd60a",beard:"#eeeeee",belt:"#ffd60a"},
 punk:{col:"#1a1a24",skin:"#e8cfae",pants:"#5a1a6a",hat:"mohawk",hc:"#ff3d9a",belt:"#ff3d9a",scarf:"#ff3d9a",shoe:"#ff3d9a"},
 frost:{col:"#7fc8f8",skin:"#cfeaff",pants:"#4a7fb0",armor:1,hat:"spiky",hc:"#e8f6ff",wide:1},
 cat:{col:"#f2c94c",skin:"#f2c94c",pants:"#f2c94c",hat:"ears",hc:"#f2c94c",hc2:"#ff9ab0",scarf:"#e63946",hand:"#ffffff",shoe:"#ffffff"},
 king:{col:"#b5121b",skin:"#e8cfae",robe:1,cape:"#7a0c12",hat:"crown",hc:"#ffd60a",hc2:"#2ec4b6",beard:"#d9d9d9",belt:"#ffd60a"},
 legend:{col:"#ffd60a",skin:"#ffe08a",pants:"#c98a00",wide:1,armor:1,cape:"#ff4d00",hat:"spiky",hc:"#ff7a00",belt:"#fff3b0",shoe:"#fff3b0"},
 bot:{col:"#7b8597",skin:"#aab3c5",wide:1,hat:"helmet",hc:"#c0c8d6",hc2:"#e63946",armor:1},
 thug:{col:"#3a3f4b",skin:"#d9a679",wide:1,hat:"beanie",hc:"#d64545",hc2:"#d64545",pants:"#232733"}};
function fig(f,st,sc,pp,tv){const p=pp||pose(f),d=f.dir,l=L*sc,px=f.x+f.ox+f.dir*(f.lg||0)+(f.shk?(Math.random()-.5)*.03*l:0),x=px+p[9]*l*d,hy=gy-.5*l+p[10]*l,ln=p[0]*R,tl=.3*l,lw=.075*l,tw=tv||twp(f),
 arm=st.arm||st.col,top=st.top||st.col,pants=st.pants||st.col,skin=st.skin||"#e8cfae",hnd=st.hand||skin,shoe=st.shoe||"#1b202c";
 c.fillStyle="rgba(0,0,0,.45)";c.beginPath();c.ellipse(px,gy+.02*l,.26*l,.045*l,0,0,7);c.fill();
 c.save();c.globalAlpha=GA;c.translate(tw[0]*l,(tw[1]-(f.lift||0))*l);const cy=gy-.5*l;c.translate(px,cy);c.rotate(-tw[2]*d);c.translate(-px,-cy);
 c.translate(px,gy);c.rotate(-p[11]*d);c.translate(-px,-gy);c.lineCap=c.lineJoin="round";
 const pt=(q,a,len)=>[q[0]+Math.sin(a*R)*len*d,q[1]+Math.cos(a*R)*len];
 const hip=[x,hy],nk=[x+Math.sin(ln)*tl*d,hy-Math.cos(ln)*tl],sh=[x+Math.sin(ln)*tl*.9*d,hy-Math.cos(ln)*tl*.9];
 const seg=(q,w,cl,al)=>{c.globalAlpha=al*GA;c.beginPath();c.moveTo(q[0][0],q[0][1]);for(let i=1;i<q.length;i++)c.lineTo(q[i][0],q[i][1]);
  c.strokeStyle="rgba(0,0,0,.7)";c.lineWidth=w+4;c.stroke();c.strokeStyle=cl;c.lineWidth=w;c.stroke();
  c.strokeStyle="rgba(255,255,255,.18)";c.lineWidth=w*.28;c.stroke();c.globalAlpha=GA};
 const dot=(q,r,cl,al)=>{c.globalAlpha=al*GA;c.fillStyle="rgba(0,0,0,.7)";c.beginPath();c.arc(q[0],q[1],r+2,0,7);c.fill();c.fillStyle=cl;c.beginPath();c.arc(q[0],q[1],r,0,7);c.fill();c.globalAlpha=GA};
 const limb=(s,a,b,len,al,cl,ec,er)=>{const m=pt(s,a,len),e=pt(m,b,len);seg([s,m,e],lw,cl,al);dot(e,lw*er,ec,al);return e};
 if(st.cape){const fl=Math.sin(now*6+f.dir)*.03*l;c.fillStyle=st.cape;c.beginPath();c.moveTo(sh[0],sh[1]);c.lineTo(nk[0]-d*.05*l,nk[1]);c.lineTo(hip[0]-d*(.5*l+fl*3),hip[1]+.3*l);c.lineTo(hip[0]-d*.2*l,hip[1]+.38*l+fl);c.closePath();c.fill()}
 limb(sh,p[3],p[4],.17*l,.75,arm,hnd,.62);limb(hip,p[7],p[8],.25*l,.75,pants,shoe,.58);
 seg([hip,nk],st.wide?lw*1.9:lw*1.3,top,1);
 const ft=limb(hip,p[5],p[6],.25*l,1,pants,shoe,.58);
 if(st.robe){c.fillStyle=top;c.beginPath();c.moveTo(hip[0]-.14*l,hip[1]-.02*l);c.lineTo(hip[0]+.14*l,hip[1]-.02*l);c.lineTo(hip[0]+.22*l,hip[1]+.36*l);c.lineTo(hip[0]-.22*l,hip[1]+.36*l);c.fill()}
 if(st.belt)rc(hip[0],hip[1]-.02*l,lw*1.7,lw*.5,st.belt);
 if(st.tie){c.fillStyle=st.tie;c.beginPath();c.moveTo(nk[0],nk[1]+.01*l);c.lineTo(nk[0]-lw*.35,nk[1]+.1*l);c.lineTo(nk[0],nk[1]+.17*l);c.lineTo(nk[0]+lw*.35,nk[1]+.1*l);c.fill()}
 if(st.armor)dot(sh,lw*.95,"#d7deea",1);
 if(st.scarf){const fl=Math.sin(now*7+f.dir)*.03*l;seg([nk,[nk[0]-d*.15*l,nk[1]+.04*l+fl],[nk[0]-d*.34*l,nk[1]+.01*l-fl]],lw*.5,st.scarf,1)}
 const hd=[nk[0]+Math.sin(ln)*.1*l*d,nk[1]-Math.cos(ln)*.1*l],r=.085*l;
 c.fillStyle=skin;c.strokeStyle="rgba(0,0,0,.75)";c.lineWidth=2.5;c.beginPath();c.arc(hd[0],hd[1],r,0,7);c.fill();c.stroke();
 if(st.beard){c.fillStyle=st.beard;c.beginPath();c.ellipse(hd[0]+d*.2*r,hd[1]+.5*r,.85*r,.75*r,0,0,Math.PI);c.fill()}
 c.fillStyle="#12151f";c.fillRect(hd[0]+d*.38*r-.08*r,hd[1]-.15*r,.17*r,.2*r);
 const H2=HAT[st.hat];if(H2)H2(hd[0],hd[1],r,d,st.hc,st.hc2);
 const hand=limb(sh,p[1],p[2],.17*l,1,arm,hnd,.62);f.hp=hand;
 const atk=f.a&&f.a.s;[[f.th,hand],[f.tf,ft]].forEach(([t,e])=>{if(atk)t.push([e[0],e[1]]);else t.shift();while(t.length>7)t.shift();
  if(t.length>1){c.beginPath();c.moveTo(t[0][0],t[0][1]);t.forEach(q=>c.lineTo(q[0],q[1]));c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=lw*.5;c.stroke()}});
 c.restore()}
function preview(cvs,id){const st=STY[id]||STY.shadow,k=cvs.getContext("2d"),sv={c,L,gy,W,H},w=cvs.width,h=cvs.height;
 c=k;W=w;H=h;L=h*.58;gy=h*.9;c.clearRect(0,0,w,h);const g=c.createRadialGradient(w/2,h*.55,5,w/2,h*.55,h*.7);g.addColorStop(0,"#2a3350");g.addColorStop(1,"#0e121b");c.fillStyle=g;c.fillRect(0,0,w,h);
 const f=mkF(1);f.x=w/2;fig(f,st,1);({c,L,gy,W,H}=sv)}
function bgDraw(){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${hue+205},40%,5%)`);g.addColorStop(.7,`hsl(${hue+195},32%,15%)`);g.addColorStop(1,`hsl(${hue+195},25%,9%)`);
 c.fillStyle=g;c.fillRect(0,0,W,H);const bw=W*.085,rh=L*.13;
 for(let i=0;i<14;i++){const bx=i*bw*1.08-W*.02,bh=H*(.22+.3*Math.abs(Math.sin(i*7.3)));
  c.fillStyle=`hsl(${hue+210},30%,${7+i%3}%)`;c.fillRect(bx,gy-.06*L-bh,bw,bh+.06*L);
  for(let r=0;r<bh/rh-1;r++)for(let q=0;q<3;q++)if(Math.sin(i*13+r*5+q*3.1)>.25){c.fillStyle=`hsla(${hue+45},85%,68%,.55)`;c.fillRect(bx+bw*(.12+q*.3),gy-.06*L-bh+rh*(.5+r),bw*.16,rh*.45)}}
 const f=c.createLinearGradient(0,gy-.06*L,0,H);f.addColorStop(0,"#2b3040");f.addColorStop(1,"#0b0d13");c.fillStyle=f;c.fillRect(0,gy-.06*L,W,H);
 c.fillStyle="rgba(130,170,200,.07)";c.fillRect(0,gy-.2*L,W,.18*L);
 c.strokeStyle="rgba(180,210,255,.06)";c.lineWidth=1;for(let i=-8;i<=8;i++){c.beginPath();c.moveTo(W/2+i*W*.04,gy-.06*L);c.lineTo(W/2+i*W*.16,H);c.stroke()}
 c.strokeStyle="rgba(200,220,255,.22)";c.lineWidth=1;rain.forEach(q=>{c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]-3,q[1]+14);c.stroke()});drawCracks()}
function burst(x,y,k,col){for(let i=0;i<k;i++){const a=Math.random()*6.28,v=80+Math.random()*260;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,l:.5,s:2+Math.random()*3,c:col})}}
function dust(x,k){for(let i=0;i<k;i++)parts.push({x:x+(Math.random()-.5)*L*.3,y:gy,vx:(Math.random()-.5)*220,vy:-Math.random()*90,l:.6,s:4+Math.random()*4,c:"rgba(200,205,215,.55)"})}
const rgba=(h,a)=>{if(!h||h.length!==7)h="#59d8ed";return `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`};
function accent(st){for(const h of[st.hc,st.col]){if(h&&h.length===7){const lum=parseInt(h.slice(1,3),16)*.3+parseInt(h.slice(3,5),16)*.59+parseInt(h.slice(5,7),16)*.11;if(lum>60&&lum<215)return h}}return"#59d8ed"}
function speedLines(f,k){for(let i=0;i<k;i++)parts.push({line:1,x:f.x+f.ox+f.dir*(f.lg||0)-f.dir*L*(.1+Math.random()*.3),y:gy-L*(.1+Math.random()*.85),len:L*(.35+Math.random()*.5),dir:f.dir,l:.2})}
function lunge(f,o,dur){const gp=Math.abs((o.x+o.ox+o.dir*o.lg)-(f.x+f.ox+f.dir*f.lg)),reach=Math.max(0,Math.min(.75*L,gp-.5*L));f.lgT=Math.min(.8*L,f.lg+reach);if(reach>.2*L)speedLines(f,5);
 const tok=++f.lgTok;pend.push({at:now+dur+.12,fn:()=>{if(f.lgTok===tok)f.lgT=0}})}
function crater(x){cracks.push({x,t0:now,r:Array.from({length:9},()=>[(Math.random()*2-1)*Math.PI,.5+Math.random()*.9])});dust(x,18);
 for(let i=0;i<14;i++)parts.push({x:x+(Math.random()-.5)*L*.3,y:gy,vx:(Math.random()-.5)*340,vy:-120-Math.random()*320,l:.9,s:4+Math.random()*6,c:"#7a8396"});parts.push({ring:1,x,y:gy,r:6,l:.35,c:"rgba(255,255,255,.7)"})}
function drawCracks(){cracks=cracks.filter(k=>now-k.t0<3);cracks.forEach(k=>{const al=Math.min(1,(3-(now-k.t0))/1.2),y0=gy+.02*L;el(k.x,y0,L*.3,L*.055,`rgba(0,0,0,${.5*al})`);
 c.strokeStyle=`rgba(0,0,0,${.8*al})`;c.lineWidth=2.5;c.beginPath();k.r.forEach(([a,m])=>{const ex=k.x+Math.cos(a)*m*L*.7,ey=y0+Math.sin(a)*m*L*.09;c.moveTo(k.x,y0);c.lineTo((k.x+ex)/2+Math.sin(a*7)*.03*L,(y0+ey)/2);c.lineTo(ex,ey)});c.stroke()})}
function drawGhosts(){ghosts=ghosts.filter(g=>now-g.t<.22);ghosts.forEach(g=>{GA=.32*(1-(now-g.t)/.22);fig(g.f,g.st,g.sc,g.p,g.tv);GA=1})}
function drawAura(f,st,sc){const l=L*sc,px=f.x+f.ox+f.dir*(f.lg||0),col=accent(st);c.save();c.globalCompositeOperation="lighter";
 for(let i=0;i<8;i++){const ph=now*8+i*1.7,fx=px+(i-3.5)*.07*l,h=l*(.75+.3*Math.abs(Math.sin(ph))),g=c.createLinearGradient(0,gy,0,gy-h);g.addColorStop(0,rgba(col,.55));g.addColorStop(1,rgba(col,0));
  c.fillStyle=g;c.beginPath();c.moveTo(fx-.07*l,gy);c.quadraticCurveTo(fx-.1*l,gy-h*.55,fx+Math.sin(ph)*.05*l,gy-h);c.quadraticCurveTo(fx+.1*l,gy-h*.55,fx+.07*l,gy);c.fill()}c.restore()}
function drawBeams(){beams=beams.filter(b=>now-b.t0<b.dur+.3);beams.forEach(b=>{const u=Math.min(1,(now-b.t0)/(b.dur*.35)),fd=Math.min(1,(b.t0+b.dur+.3-now)/.3),x0=b.who.hp[0],y=b.who.hp[1],x1=x0+(b.x1-x0)*u,th=L*.17*fd*(1+Math.sin(now*40)*.1);
 if(x1-x0<2||th<1)return;const g=c.createLinearGradient(0,y-th*1.6,0,y+th*1.6);g.addColorStop(0,rgba(b.col,0));g.addColorStop(.5,rgba(b.col,.9));g.addColorStop(1,rgba(b.col,0));
 c.fillStyle=g;c.fillRect(x0,y-th*1.6,x1-x0,th*3.2);c.fillStyle="rgba(255,255,255,.95)";c.fillRect(x0,y-th*.35,x1-x0,th*.7);
 const og=c.createRadialGradient(x1,y,0,x1,y,th*2.4);og.addColorStop(0,"#fff");og.addColorStop(.4,rgba(b.col,.8));og.addColorStop(1,rgba(b.col,0));c.fillStyle=og;c.beginPath();c.arc(x1,y,th*2.4,0,7);c.fill();
 if(Math.random()<.8)parts.push({x:x0+Math.random()*(x1-x0),y:y+(Math.random()-.5)*th*2,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60,l:.25,s:3,c:"#fff"})})}
function tumble(v){play(v,"fly");v.tw={t0:now,d:.7,type:"tumble"};pend.push({at:now+.7,fn:()=>{if(!v.tw||v.down)return;v.ox+=-v.dir*.8*L;v.tw=null;play(v,"up");crater(v.x+v.ox);shake=Math.max(shake,22);flash=.5;slow=Math.max(slow,.12);Sfx.boom()}})}
function hit(a,s,bl,mag,id){const v=a===P?E:P;if(v.down||v.tw)return;const vx=v.x+v.ox+v.dir*v.lg,x=vx+v.dir*.08*L,y=gy-.62*L,S=s==="S",h=s==="h"||S,who=a===P?"p":"e";
 if(s==="c"){burst(x,y,8,"#fff");parts.push({star:1,x,y,l:.1,r:L*.12});shake=Math.max(shake,6);Sfx.punch();if(cb)cb(who,s,false,mag||1);return}
 if(bl==="d"){play(v,"slip");Sfx.whoosh();if(cb)cb(who,s,"d",1);return}
 if(bl){play(v,"block");burst(x,y,6,"#9ad7ff");shake=Math.max(shake,4);Sfx.punch();if(cb)cb(who,s,true,1);return}
 play(v,"hit");v.ox+=-v.dir*L*(S?.2:h?.16:.07);burst(x,y,S?44:h?30:14,h?"#ffd24a":"#fff");parts.push({star:1,x,y,l:.14,r:L*(S?.4:h?.3:.17)});if(h)parts.push({rays:1,x,y,r:L*(S?.8:.55),l:.22});
 if(S)parts.push({ring:1,x,y,r:6,l:.35,c:id==="beam"?"#9ee8ff":"#ffd24a"});
 shake=Math.max(shake,S?26:h?20:s==="k"?12:8);flash=S?.9:h?.7:.2;slow=S?.2:h?.14:.05;if(h){zoom=S?1.2:1.14;zf=v.x;dust(v.x,8)}
 if((S&&id!=="choke")||(h&&Math.random()<.4))tumble(v);
 (s==="k"||h?Sfx.kick:Sfx.punch)();if(h)Sfx.boom();Sfx.hurt();if(cb)cb(who,s,false,mag||1)}
const CH="jab jab cross elbow knee hook upper teep cross round sweep jab cross knee spin head cross sweep".split(" ");
function throwMove(){const m=M.throw;play(P,"throw");Sfx.whoosh();
 pend.push({at:now+.3*m.d,fn:()=>{play(E,"fly");E.tw={t0:now,d:.75};Sfx.punch();burst(E.x,gy-.6*L,8,"#fff")}},
  {at:now+.3*m.d+.75,fn:()=>{E.ox+=-E.dir*.55*L;E.tw=null;play(E,"up");dust(E.x+E.ox,24);shake=26;flash=.8;slow=.2;zoom=1.2;zf=E.x+E.ox;Sfx.boom();Sfx.hurt();if(cb)cb("p","S",false,.9)}})}
M.smash=mk(.75,9,"",[[.35,[-10,160,170,155,168,40,10,-30,-10,0,0,0]],[.7,[40,60,40,55,40,10,-5,-20,-5,.05,.05,0]]]);M.smash.sp=1;
function special(id){if(P.down||E.down||E.tw||P.tw||E.lift||E.a===M.up||(P.a&&P.a.sp))return false;
 if(id==="throw"){lunge(P,E,1);throwMove();return true}
 if(id==="smash"){const dx=Math.max(.25,((E.x+E.ox)-(P.x+P.ox)-.5*L)/L);play(P,"smash");P.tw={t0:now,d:.75,type:"smash",dx};P.gh=now+.75;P.aura=now+.75;Sfx.whoosh();speedLines(P,6);
  pend.push({at:now+.75,fn:()=>{P.ox+=P.dir*dx*L;P.tw=null;crater(P.x+P.ox+P.dir*.45*L);shake=30;Sfx.boom();hit(P,"S",false,1.2,"smash")}});return true}
 if(id==="beam"){const m=M.beam;play(P,"beam");P.chg=now+.7;P.aura=now+1.6;Sfx.special();
  pend.push({at:now+.75,fn:()=>{beams.push({t0:now,dur:.6,who:P,x1:E.x+E.ox-.15*L,col:accent(SP)});Sfx.special();shake=12}},{at:now+.85,fn:()=>{P.chg=0;hit(P,"S",false,1.4,"beam")}});return true}
 if(id==="flurry"){play(P,"flurry");lunge(P,E,.65);P.gh=now+.7;P.aura=now+.9;Sfx.whoosh();
  [.19,.285,.38,.475,.57].forEach(t=>pend.push({at:now+t,fn:()=>hit(P,"c",false,.6)}));pend.push({at:now+.665,fn:()=>hit(P,"S",false,.9,"flurry")});return true}
 if(id==="dive"){const dx=Math.max(.3,((E.x+E.ox)-(P.x+P.ox)-.55*L)/L);play(P,"dive");P.tw={t0:now,d:.6,type:"dive",dx};P.gh=now+.6;speedLines(P,8);Sfx.whoosh();
  pend.push({at:now+.4,fn:()=>hit(P,"S",false,1.1,"dive")},{at:now+.6,fn:()=>{P.ox+=P.dir*dx*L;P.tw=null}});return true}
 if(id==="choke"){const m=M.choke;lunge(P,E,1.4);play(P,"choke");Sfx.whoosh();
  pend.push({at:now+.25*m.d,fn:()=>{if(E.down)return;play(E,"chk");E.lift=.12;E.shk=1;Sfx.punch()}},
   ...[.45,.65,.85].map(t=>({at:now+t*m.d,fn:()=>hit(P,"c",false,1)})),
   {at:now+m.d*.95,fn:()=>{E.lift=0;E.shk=0;hit(P,"S",false,.5,"choke")}});return true}
 if(id==="flip"){play(P,"flip");P.tw={t0:now,d:.7,type:"flip"};Sfx.whoosh();
  pend.push({at:now+.38,fn:()=>hit(P,"S",false,1,"flip")},{at:now+.7,fn:()=>{P.ox+=P.dir*.3*L;P.tw=null}});return true}
 return false}
function attack(){if(P.down||E.down||E.tw||P.tw||E.a===M.up||E.lift)return;if(P.a&&P.a.sp)return;if(P.a&&!P.a.hold&&(now-P.t0)*P.sp<P.a.d*.5)return;
 const nm=CH[n++%CH.length],m=M[nm],bl=Math.random()<Math.min(.28,aid*.3)?"d":Math.random()<.12+aid*.2,sp=tempo;play(P,nm,sp);lunge(P,E,m.h*m.d/sp);if(sp>1.5)P.gh=now+.14;Sfx.whoosh();pend.push({at:now+m.h*m.d/sp,fn:()=>hit(P,m.s,bl)})}
function enemyAttack(){if(P.down||E.down||E.tw||E.lift||P.tw||(P.a&&P.a.sp))return 0;
 const list=esc>1?["cross","round","spin","upper","hook","knee"]:["jab","cross","hook","teep","elbow","knee"],nm=list[n++%6],m=M[nm],bl=Math.random()<.3;
 play(E,nm,eSp);lunge(E,P,m.h*m.d/eSp);Sfx.whoosh();pend.push({at:now+m.h*m.d/eSp,fn:()=>hit(E,m.s,bl)});
 if(Math.random()<aid*.6)pend.push({at:now+(m.d+.12)/eSp,fn:()=>{if(P.down||E.down||E.tw||E.lift||(P.a&&P.a.sp))return;const n2=list[n++%6],m2=M[n2];play(E,n2,eSp);Sfx.whoosh();pend.push({at:now+m2.h*m2.d/eSp,fn:()=>hit(E,m2.s,Math.random()<.3)})}});return 1}
function end(win){banT=performance.now();pend.length=0;E.tw=null;P.tw=null;E.lift=E.shk=0;P.chg=0;const v=win?E:P,w=win?P:E;v.down=1;P.gh=E.gh=0;P.lgT=E.lgT=0;beams=[];crater(v.x+v.ox);play(v,"ko");play(w,"win");slow=.6;shake=24;flash=1;zoom=1.35;zf=v.x;burst(v.x,gy-.5*L,50,"#ffd24a");dust(v.x,16)}
function setWord(ch,cur,wi,tot){if(!ch){word=null;return}if(wi!==wordIdx){wordIdx=wi;wordT=performance.now()}word={ch,cur,wi,tot}}
function drawWord(fx,fy){if(!word||!word.ch.length||P.down)return;const n=word.ch.length;let fs=Math.max(20,Math.min(34,L*.17));fs=Math.min(fs,(W-44)/(.62*n));
 const cw=fs*.62,tw=cw*n,bh=fs*1.7,bw=tw+fs*1.1,pop=Math.max(0,1-(performance.now()-wordT)/160);
 let bx=W/2+(P.x-fx)*zoom;bx=Math.max(bw/2+6,Math.min(W-bw/2-6,bx));const by=fy+((gy-1.3*L)-fy)*zoom;
 c.save();c.translate(bx,by);const s=1+pop*.18;c.scale(s,s);
 c.fillStyle="rgba(8,12,22,.86)";c.strokeStyle="#59d8ed";c.lineWidth=2;c.beginPath();if(c.roundRect)c.roundRect(-bw/2,-bh/2,bw,bh,fs*.5);else c.rect(-bw/2,-bh/2,bw,bh);c.fill();c.stroke();
 c.beginPath();c.moveTo(-fs*.35,bh/2);c.lineTo(0,bh/2+fs*.5);c.lineTo(fs*.35,bh/2);c.fill();
 c.font=`700 ${fs}px ui-monospace,Menlo,Consolas,monospace`;c.textAlign="center";c.textBaseline="middle";
 word.ch.forEach(([ch,st],i)=>{const x=-tw/2+cw*(i+.5);
  if(st===2){c.fillStyle="#ff5c75";c.fillRect(x-cw/2,-fs*.62,cw,fs*1.24)}
  c.fillStyle=st===1?"#b8f35a":st===2?"#fff":i===word.cur?"#fff":"#c9d3ea";c.fillText(ch,x,0);
  if(i===word.cur){c.fillStyle="#59d8ed";c.fillRect(x-cw/2,fs*.58,cw,3)}});
 c.font=`600 ${Math.max(10,fs*.38)}px sans-serif`;c.fillStyle="rgba(255,255,255,.55)";c.fillText(`${word.wi+1}/${word.tot}`,0,-bh/2-fs*.3);c.restore()}
function layout(){L=Math.min(H*.52,W*.46);gy=H*.84;const gap=Math.min(W*.56,L*1.0);P.x=W/2-gap/2;E.x=W/2+gap/2}
function resize(){const r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);if(!r.width||!r.height)return;W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;c.setTransform(d,0,0,d,0,0);layout();
 vig=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,0,0,.65)");
 rain=Array.from({length:Math.round(W/12)},()=>[Math.random()*W,Math.random()*H,500+Math.random()*300]);
 if(!grain){grain=document.createElement("canvas");grain.width=grain.height=96;const g=grain.getContext("2d");for(let i=0;i<1400;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.5})`;g.fillRect(Math.random()*96,Math.random()*96,1,1)}}}
function intro(){P.ox=-W*.55;E.ox=W*.55;Sfx.whoosh()}
function reset(key,h,boss,ek){banT=0;SP=STY[key]||STY.shadow;SE=STY[ek]||STY.bot;hue=h||0;esc=boss?1.12:1;
 [P,E].forEach(f=>{f.down=0;f.a=null;f.ox=0;f.tw=null;f.th=[];f.tf=[];f.sp=1;f.lift=0;f.shk=0;f.chg=0;f.lg=0;f.lgT=0;f.gh=0;f.aura=0});ghosts=[];beams=[];cracks=[];auraOn=false;pend.length=0;parts.length=0;shake=flash=slow=0;zoom=1;word=null;resize()}
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-prev)/1000||0);prev=t;if(!W)return;
 const k=slow>0?.18:1;slow=Math.max(0,slow-dt);const d=dt*k;now+=d;
 for(let i=pend.length-1;i>=0;i--){const q=pend[i];if(q&&now>=q.at){pend.splice(i,1);q.fn()}}
 [P,E].forEach(f=>f.ox*=Math.exp(-6*d));
 [P,E].forEach(f=>{f.lg+=(f.lgT-f.lg)*Math.min(1,16*d);f._gt=(f._gt||0)-d;
  if(f.gh>now&&f._gt<=0){f._gt=.035;ghosts.push({f:{dir:f.dir,x:f.x,ox:f.ox,lg:f.lg,a:null,tw:null,th:[],tf:[],sp:1,lift:0,shk:0,hp:[0,0]},p:pose(f),tv:twp(f),st:f===P?SP:SE,sc:f===P?1:esc,t:now})}
  if(Math.abs(f.lgT-f.lg)>.12*L&&Math.random()<.5)speedLines(f,1)});zoom+=(1-zoom)*Math.min(1,2.2*dt);rain.forEach(q=>{q[1]+=q[2]*dt;if(q[1]>H){q[1]=-10;q[0]=Math.random()*W}});
 shake*=.88;flash*=.9;c.save();c.clearRect(0,0,W,H);c.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 const lim=W/2*(1-1/zoom),fx=W/2+Math.max(-lim,Math.min(lim,zf-W/2)),fy=gy-.3*L;c.translate(W/2,fy);c.scale(zoom,zoom);c.translate(-fx,-fy);
 bgDraw();drawGhosts();if(P.aura>now||auraOn)drawAura(P,SP,1);if(E.aura>now)drawAura(E,SE,esc);
 if(E.a&&E.a.s){fig(P,SP,1);fig(E,SE,esc)}else{fig(E,SE,esc);fig(P,SP,1)}
 drawBeams();
 if(P.chg>now){const u=Math.max(0,1-(P.chg-now)/.7),hx=P.hp[0],hy2=P.hp[1],r=L*(.05+.13*u),g=c.createRadialGradient(hx,hy2,0,hx,hy2,r*2);g.addColorStop(0,"#fff");g.addColorStop(.35,"#59d8ed");g.addColorStop(1,"rgba(89,216,237,0)");
  c.fillStyle=g;c.beginPath();c.arc(hx,hy2,r*2,0,7);c.fill();if(Math.random()<.7){const a=Math.random()*6.28,rr=L*.35;parts.push({x:hx+Math.cos(a)*rr,y:hy2+Math.sin(a)*rr,vx:-Math.cos(a)*rr*3,vy:-Math.sin(a)*rr*3,l:.3,s:3,c:"#9ee8ff"})}}
 parts=parts.filter(p=>(p.l-=d)>0);parts.forEach(p=>{if(p.ring){p.r+=L*3.2*d;c.strokeStyle=p.c;c.globalAlpha=Math.max(0,p.l/.35);c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,p.r,0,7);c.stroke();c.globalAlpha=1}else if(p.rays){c.strokeStyle="rgba(255,255,255,.85)";c.globalAlpha=Math.max(0,p.l/.22);c.lineWidth=3;c.beginPath();for(let i=0;i<14;i++){const a=i*Math.PI/7+(i%2)*.1,r0=p.r*.35,r1=p.r*(i%2?.8:1);c.moveTo(p.x+Math.cos(a)*r0,p.y+Math.sin(a)*r0);c.lineTo(p.x+Math.cos(a)*r1,p.y+Math.sin(a)*r1)}c.stroke();c.globalAlpha=1}else if(p.line){c.strokeStyle="rgba(255,255,255,.7)";c.globalAlpha=Math.max(0,p.l/.2);c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.dir*p.len,p.y);c.stroke();c.globalAlpha=1}else if(p.star){c.fillStyle="rgba(255,255,255,.9)";c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?p.r*.35:p.r;c.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r)}c.fill()}
  else{p.x+=p.vx*d;p.y+=p.vy*d;p.vy+=600*d;c.fillStyle=p.c;c.globalAlpha=Math.min(1,p.l*3);c.fillRect(p.x,p.y,p.s,p.s);c.globalAlpha=1}});
 c.restore();c.fillStyle="rgba(15,45,75,.14)";c.fillRect(0,0,W,H);c.fillStyle=vig;c.fillRect(0,0,W,H);
 c.globalAlpha=.08;c.drawImage(grain,-Math.random()*96,-Math.random()*96,W+96,H+96);c.globalAlpha=1;
 if(banT){const u=(performance.now()-banT)/1000;if(u<1.8){const sz=Math.min(W*.34,L*1.05)*(1+.25*Math.max(0,1-u*5));c.save();c.globalAlpha=Math.min(1,(1.8-u)*3);c.translate(W/2,H*.4);c.rotate(-.08);
  c.font=`900 ${sz}px Impact,'DM Sans',sans-serif`;c.textAlign="center";c.textBaseline="middle";c.lineJoin="round";c.lineWidth=sz*.14;c.strokeStyle="#000";c.strokeText("K.O.!",0,0);c.fillStyle="#ffd24a";c.fillText("K.O.!",0,0);c.restore()}}
 drawWord(fx,fy);
 if(flash>.02){c.fillStyle=`rgba(255,255,255,${flash*.4})`;c.fillRect(0,0,W,H)}}
if(window.ResizeObserver)new ResizeObserver(resize).observe(cv);window.addEventListener("resize",resize);
requestAnimationFrame(frame);
return{intro,attack,enemyAttack,end,reset,resize,special,preview,setAura:v=>{auraOn=v},word:setWord,setTempo:v=>{tempo=v},setSpeed:(v,dd)=>{eSp=v;aid=dd||0},set onHit(fn){cb=fn}}})();
