/* TYPE CLASH - levels. Level 1 = tiny lowercase words. Level 100+ = long, punctuated, tricky text.
   Paragraphs are generated fresh every fight, so they almost never repeat. */
window.Levels=(()=>{
const A="old big red tall fast dark calm bold cold warm tiny wild quick brave sharp silent strong heavy hidden fierce golden narrow broken patient relentless fearless ruthless reckless vigilant legendary formidable treacherous indestructible extraordinary".split(" ");
const N="man cat dog sun moon star road door gate rope wall fist wolf hawk king tiger fighter shadow street bridge hunter stranger warrior guardian champion assassin survivor rooftop warehouse opponent challenger strategist commander mastermind bodyguard adversary".split(" ");
const V="ran hit met led won fled beat held slid spun dove kicked struck waited turned blocked dodged chased tracked crossed guarded stalked climbed charged ambushed defeated outmaneuvered confronted intercepted pursued overpowered".split(" ");
const AV="fast hard well far quickly slowly quietly calmly boldly fiercely silently carefully relentlessly mercilessly".split(" ");
const PR="into behind beyond across beneath inside toward past near above".split(" ");
const NM="Kane Rhea Viktor Mara Dante Luca Nova Jax".split(" ");
const QT=["Never stop moving","Stay calm and strike first","Fear is only a shadow","Patience beats power","Keep your guard up","Speed means nothing without control","Every fall teaches a lesson","Finish what you start"];
const CA="fast-moving hard-hitting well-trained cold-blooded quick-handed sharp-eyed".split(" ");
const ZONES=["Training Grounds","Back Alley","Rooftop Chase","Harbor Docks","Neon Underground","Mountain Dojo","Desert Fortress","Skyscraper Heist","Shadow Syndicate","Final Arena"];
const FOES=["Training Bot","Street Thug","Rooftop Runner","Dock Enforcer","Neon Gangster","Dojo Master","Desert Mercenary","Heist Mastermind","Syndicate Elite","Arena Champion"];
const rnd=a=>a[Math.floor(Math.random()*a.length)],r=n=>Math.floor(Math.random()*n);
const cls=w=>w.length<=4?1:w.length<=6?2:w.length<=9?3:4;
function pk(pool,d){const x=Math.random(),p4=Math.max(0,(d-.4)*1.2),p3=Math.min(.6,Math.max(0,(d-.12)*1.0)),p2=Math.min(.75,.1+d*1.8);
 const t=x<p4?4:x<p4+p3?3:x<p4+p3+p2?2:1,f=pool.filter(w=>cls(w)===t);return rnd(f.length?f:pool)}
const an=w=>/^[aeiou]/.test(w)?"an":"a";
function sent(d,lv){
 const adj=()=>pk(A,d),noun=()=>pk(N,d),verb=()=>pk(V,d),adv=()=>pk(AV,d);
 const subj=()=>lv>=46&&Math.random()<.3?`${rnd(["Master","Agent","Captain"])} ${rnd(NM)}`:`the ${adj()} ${noun()}`;
 const obj=()=>{const a=adj();return `${an(a)} ${a} ${noun()}`},pp=()=>`${rnd(PR)} the ${adj()} ${noun()}`;
 const T=[()=>`${subj()} ${verb()} ${obj()}`,()=>`${subj()} ${verb()} ${pp()}`,()=>`${subj()} ${verb()} ${adv()}`,()=>`${subj()} ${verb()} ${obj()} ${pp()}`];
 if(lv>=6)T.push(()=>`${subj()} ${verb()} ${obj()} and ${verb()} ${pp()}`);
 if(lv>=10)T.push(()=>`when ${subj()} ${verb()}, ${subj()} ${verb()} ${adv()}`,()=>`${adv()}, ${subj()} ${verb()} ${obj()}`);
 if(lv>=18)T.push(()=>`"${rnd(QT)}," said ${subj()}`);
 if(lv>=28)T.push(()=>`${subj()} landed ${2+r(40)} ${rnd(["punches","kicks","strikes"])} in ${2+r(30)} seconds`);
 if(lv>=42)T.push(()=>`${subj()}'s ${rnd(CA)} ${noun()} ${verb()} ${pp()}`);
 if(lv>=55)T.push(()=>`${subj()} ${verb()} ${obj()}; ${subj()} ${verb()} ${pp()}`);
 if(lv>=68)T.push(()=>`${subj()} ${verb()} ${obj()} (round ${1+r(12)}) with ${50+r(50)}% focus`);
 return rnd(T)()}
function info(level){const lv=Math.max(1,level|0),d=Math.min(1,(lv-1)/99),z=Math.floor((lv-1)/10),boss=lv%10===0;
 return{level:lv,d,boss,zone:lv>100?"Endless Arena":ZONES[z],enemy:(lv>100?"Endless Challenger":FOES[z])+(boss?" ★ BOSS":""),hue:(z%10)*38,
  interval:Math.round(3000-1500*d),targetWpm:(15+55*Math.pow(d,.9))*(boss?1.1:1)}}
function text(level){const lv=Math.max(1,level|0),i=info(lv),d=i.d,wc=Math.round((8+56*Math.pow(d,.85))*(i.boss?1.2:1));
 let seen=[];try{seen=JSON.parse(localStorage.getItem("typeclash-seen")||"[]")}catch(e){}
 let out="";for(let t=0;t<6;t++){let parts=[],w=0;while(w<wc){let s=sent(d,lv);w+=s.split(" ").length;
   if(lv>=4){s=s[0].toUpperCase()+s.slice(1);s+=(lv>=26&&Math.random()<.2)?"!":"."}parts.push(s)}
  out=parts.join(" ");if(!seen.includes(out))break}
 seen.push(out);try{localStorage.setItem("typeclash-seen",JSON.stringify(seen.slice(-40)))}catch(e){}return out}
return{info,text}})();
