(() => {
  const $ = id => document.getElementById(id);
  const paragraphs = [
    "A calm mind and quick fingers can turn the tide of any battle. Focus on every letter and strike with perfect timing.",
    "The brave stick fighter stepped into the arena, raised a shining blade, and promised to protect the champion title.",
    "Speed is powerful, but accuracy is the true secret. Build your rhythm, keep your focus, and never waste a movement.",
    "Across the silent training ground, a mysterious warrior appeared. One perfect combo could decide the entire match.",
    "Legends are not born in a single fight. They practice every day, learn from every mistake, and rise after every defeat.",
    "The final opponent is stronger than before. Stay patient, read each word, and unleash your special attack at the right moment."
  ];
  const fighters = [
    {id:"shadow",name:"Shadow Rookie",emoji:"🥷",style:"Balanced starter",clear:0},
    {id:"straw",name:"Straw Hat Sailor",emoji:"👒",style:"Free-spirited brawler",clear:5},
    {id:"racer",name:"Street Racer",emoji:"🧢",style:"Fast hoodie fighter",clear:10},
    {id:"boxer",name:"Iron Boxer",emoji:"🥊",style:"Heavy gloves",clear:15},
    {id:"cowboy",name:"Desert Cowboy",emoji:"🤠",style:"Dusty duelist",clear:20},
    {id:"ninja",name:"Night Ninja",emoji:"🌙",style:"Silent shadow",clear:25},
    {id:"chef",name:"Chef Chaos",emoji:"👨‍🍳",style:"Kitchen knockout",clear:30},
    {id:"pirate",name:"Pirate Captain",emoji:"🏴‍☠️",style:"Sea-dog scrapper",clear:35},
    {id:"ronin",name:"Wandering Ronin",emoji:"🗡️",style:"Calm blade master",clear:40},
    {id:"suit",name:"Agent Suit",emoji:"🕴️",style:"Cool-headed pro",clear:45},
    {id:"knight",name:"Steel Knight",emoji:"🛡️",style:"Armored tank",clear:50},
    {id:"viking",name:"Viking Raider",emoji:"🪓",style:"Horned warrior",clear:55},
    {id:"volt",name:"Volt Runner",emoji:"⚡",style:"Electric speedster",clear:60},
    {id:"flame",name:"Flame Monk",emoji:"🔥",style:"Burning discipline",clear:65},
    {id:"wizard",name:"Star Wizard",emoji:"🧙",style:"Mystic robes",clear:70},
    {id:"punk",name:"Neon Punk",emoji:"🎸",style:"Street-rock rebel",clear:75},
    {id:"frost",name:"Frost Warrior",emoji:"❄️",style:"Icy armor",clear:80},
    {id:"cat",name:"Cat Hero",emoji:"🐱",style:"Agile superhero",clear:85},
    {id:"king",name:"Crimson King",emoji:"👑",style:"Royal fury",clear:90},
    {id:"legend",name:"Dragon Legend",emoji:"🐉",style:"Golden champion",clear:95}
  ];
  const achievements = [
    {id:"first",name:"First Blood",emoji:"🥇",desc:"Win your first battle",test:s=>s.wins>=1},
    {id:"speed",name:"Speed Demon",emoji:"💨",desc:"Reach 40 WPM in a match",test:s=>s.bestWpm>=40},
    {id:"streak",name:"Combo Starter",emoji:"⚡",desc:"Build a 15 character streak",test:s=>s.bestCombo>=15},
    {id:"veteran",name:"Arena Veteran",emoji:"🏟️",desc:"Win 10 battles",test:s=>s.wins>=10},
    {id:"level5",name:"Rising Fighter",emoji:"🌟",desc:"Reach level 5",test:s=>s.level>=5},
    {id:"perfect",name:"Clean Technique",emoji:"🎯",desc:"Finish a match with 98% accuracy",test:s=>s.perfect>=1}
  ];
  const defaults = {name:"Shadow Rookie",level:1,xp:0,wins:0,bestWpm:0,bestCombo:0,perfect:0,selected:"shadow",unlocked:["shadow"],achievements:[]};
  let state = loadState(), supabase = null, user = null, running=false, startedAt=0, elapsed=0, typed=0, correct=0, combo=0, power=0, playerHP=100, enemyHP=100, target="", lastTick=0, soundOn=true;
  const sounds = {ctx:null};
  function loadState(){try{return {...defaults,...JSON.parse(localStorage.getItem("typeclash-save")||"{}")}}catch{return {...defaults}}}
  function saveState(){localStorage.setItem("typeclash-save",JSON.stringify(state)); renderProfile();}
  function setupSupabase(){const c=window.APP_CONFIG||{};if(window.supabase&&c.SUPABASE_URL?.startsWith("https://")&&!c.SUPABASE_URL.includes("YOUR-PROJECT")&&c.SUPABASE_ANON_KEY&&!c.SUPABASE_ANON_KEY.includes("YOUR_")){supabase=window.supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY);supabase.auth.getSession().then(({data})=>{if(data.session){user=data.session.user;loadCloud()}});supabase.auth.onAuthStateChange((_e,session)=>{user=session?.user||null;updateAuthUI();if(user)loadCloud()})}}
  function tone(freq=180,duration=.09,type="sine"){if(!soundOn)return;try{sounds.ctx ||= new (window.AudioContext||window.webkitAudioContext)();const o=sounds.ctx.createOscillator(),g=sounds.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.07,sounds.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,sounds.ctx.currentTime+duration);o.connect(g);g.connect(sounds.ctx.destination);o.start();o.stop(sounds.ctx.currentTime+duration)}catch{}}
  function renderProfile(){ $("fighter-name").textContent=state.name; $("level").textContent=state.level; $("xp").textContent=state.xp; $("wins").textContent=`${state.wins} wins`; $("best-wpm").textContent=`Best: ${state.bestWpm} WPM`; {const rk=rankOf(state.level);$("rank-name").textContent=rk.icon+" "+rk.name}if(typeof renderMeta==="function")renderMeta(); $("profile-avatar").textContent=fighters.find(f=>f.id===state.selected)?.emoji||"🥷"; $("xp-fill").style.width=`${state.xp%100}%`; }
  function setTab(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===`${name}-panel`));if(name==="leaderboard")loadLeaderboard();if(name==="home"){renderHome();loadHomeBoard()}}
  function renderPrompt(){if(document.body.classList.contains("fighting")){showWord();return}let html="";for(let i=0;i<target.length;i++){let cls=i<typed?(i<typed&&$("typing-input").value[i]===target[i]?"correct":"wrong"):"";if(i===typed)cls+=" current";html+=`<span class="${cls}">${escapeHtml(target[i])}</span>`}$("prompt-text").innerHTML=html;{const pt=$("prompt-text"),cu=pt.querySelector(".current");if(cu)pt.scrollTop=Math.max(0,cu.offsetTop-pt.clientHeight/2)}showWord();$("typing-progress").textContent=`${typed} / ${target.length} characters`}
  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function startFight(){if(running)return;maybeShowAd();running=true;enterFight();playerHP=100;enemyHP=eMax=100;combo=0;power=0;typed=0;correct=0;elapsed=0;{const lv=fightLevel(),inf=Levels.info(lv);target=fightText(lv,0);hitGap=inf.interval;L0=target.length;dmgPerChar=100/(L0*.9);
      const tk=(L0*.9/1.25)/(Math.max(8,inf.targetWpm*(.95-.2*inf.d))*5/60);enemyDmg=Math.min(32,Math.max(3,100*(inf.interval/1000)/tk*1.05));
      lineEnds=computeLines(target,0);li=0;paraN=0;pool=0;stamps=[];pendingSp=null;Arena.setSpeed(1+inf.d*.6,inf.d*.5)}$("typing-input").value="";$("typing-input").disabled=false;$("typing-input").placeholder="Type the paragraph here...";$("typing-input").focus({preventScroll:true});$("start-btn").classList.add("hidden");$("next-btn").classList.add("hidden");$("status-message").textContent="Fight started! Type accurately to attack.";startedAt=Date.now();lastTick=startedAt;renderPrompt();updateBattle();requestAnimationFrame(tick)}
  function tick(){if(!running)return;const now=Date.now();elapsed=(now-startedAt)/1000;$("timer").textContent=formatTime(elapsed);const wpm=elapsed>0?Math.round((correct/5)/(elapsed/60)):0;$("wpm").textContent=wpm;Arena.setTempo(tempoNow());if(now-lastTick>hitGap&&enemyHP>0){lastTick=now;Arena.enemyAttack()}requestAnimationFrame(tick)}
  function formatTime(s){return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}`}
  function updateBattle(){$("player-health").style.width=playerHP+"%";$("enemy-health").style.width=enemyHP+"%";$("combo").textContent=combo+"×";$("power-fill").style.width=power+"%";$("power-label").textContent="Finish the line to unleash a special move!";$("accuracy").textContent=(typed?Math.round(correct/typed*100):100)+"%"}
  function attack(sp){Arena.attack(sp);const t=$("impact-text");t.textContent=sp?"ULTIMATE!":combo>=10?"MEGA HIT!":"HIT!";t.classList.remove("show");void t.offsetWidth;t.classList.add("show")}
  function onType(){if(!running)return;const value=$("typing-input").value,prev=typed;typed=value.length;correct=0;combo=0;
    for(let i=0;i<Math.min(value.length,target.length);i++){if(value[i]===target[i]){correct++;combo++}else combo=0}
    state.bestCombo=Math.max(state.bestCombo,combo);Arena.setAura(combo>=15);
    $("accuracy").textContent=Math.round((typed?correct/typed:1)*100)+"%";$("wpm").textContent=elapsed>0?Math.round((correct/5)/(elapsed/60)):0;
    let hitAny=false,missed=false;
    for(let i=prev;i<typed;i++){
      if(value[i]===target[i]){hitAny=true;stamps.push(performance.now());const w=liveWpm(),tw=Levels.info(fightLevel()).targetWpm,crit=w>tw?1+Math.min(.25,(w/tw-1)*.5):1;
        pool+=dmgPerChar*(1+Math.min(combo,40)/80)*crit}else missed=true;
      if(lineEnds[li]!==undefined&&i+1>=lineEnds[li])fireLine(value)}
    if(missed){lastTick-=450;say("MISS!","#ff9aa8")}
    if(hitAny)Arena.attack();
    if(pendingSp!==null&&hitAny&&Arena.special(SPID[pendingSp]))pendingSp=null;
    {const ls=li>0?lineEnds[li-1]:0,le=lineEnds[li]||target.length;power=Math.max(0,Math.min(100,(typed-ls)/Math.max(1,le-ls)*100))}
    if(typed>target.length-40)appendPara();
    renderPrompt();updateBattle()}
  function endFightCore(win){running=false;$("typing-input").disabled=true;const wpm=Math.round((correct/5)/(Math.max(1,elapsed)/60));const acc=typed?correct/typed:1;state.bestWpm=Math.max(state.bestWpm,wpm);if(win){state.wins++;const gained=gainXp(wpm);advanceLevel();state.xp+=gained;$("status-message").textContent=`VICTORY! +${gained} XP · ${wpm} WPM · ${Math.round(acc*100)}% accuracy`;tone(520,.2,"sine");if(acc>=.98)state.perfect++;while(state.xp>=100){state.xp-=100;state.level++}unlockFighters();checkAchievements();$("next-btn").classList.remove("hidden");saveState();saveCloud()}else{$("status-message").textContent="Defeat! The opponent got you. Try again and build a steadier rhythm.";$("start-btn").classList.remove("hidden");tone(100,.3,"sawtooth")}updateBattle();renderFighters();renderAchievements()}
  function unlockFighters(){const cl=(state.stage||1)-1;state.unlocked=fighters.filter(f=>cl>=f.clear).map(f=>f.id);if(!state.unlocked.includes(state.selected))state.selected=state.unlocked[0]}
  function checkAchievements(){achievements.forEach(a=>{if(!state.achievements.includes(a.id)&&a.test(state)){state.achievements.push(a.id);$("status-message").textContent+=" Achievement unlocked: "+a.name+"!"}})}
  function renderFighters(){$("fighter-grid").innerHTML=fighters.map(f=>{const un=state.unlocked.includes(f.id),sel=state.selected===f.id;return `<article class="fighter-tile ${sel?"selected":""} ${un?"":"locked"}"><canvas class="fighter-cv" width="150" height="190" data-cv="${f.id}"></canvas><h3>${f.name}</h3><p>${f.style}</p><small>${un?"UNLOCKED":`CLEAR LEVEL ${f.clear} TO UNLOCK`}</small><button class="${sel?"small-btn":"primary-btn"}" data-fighter="${f.id}" ${un?"":"disabled"}>${sel?"SELECTED":un?"SELECT FIGHTER":"LOCKED"}</button></article>`}).join("");
    document.querySelectorAll("[data-cv]").forEach(cv=>{Arena.preview(cv,cv.dataset.cv);if(!state.unlocked.includes(cv.dataset.cv))cv.style.filter="brightness(.18) saturate(0)"});
    document.querySelectorAll("[data-fighter]").forEach(b=>b.onclick=()=>{state.selected=b.dataset.fighter;saveState();renderFighters();resetArena()})}
  function renderAchievements(){$("achievement-grid").innerHTML=achievements.map(a=>{const done=state.achievements.includes(a.id);return `<article class="achievement-tile"><div class="achievement-icon">${a.emoji}</div><h3>${a.name}</h3><p>${a.desc}</p><small>${done?"✓ UNLOCKED":"LOCKED"}</small></article>`}).join("")}
  async function loadCloud(){if(!supabase||!user)return;const {data}=await supabase.from("player_profiles").select("*").eq("id",user.id).maybeSingle();if(data){state={...state,name:data.display_name||state.name,level:data.level||1,xp:data.xp||0,wins:data.wins||0,bestWpm:data.best_wpm||0};saveState()}updateAuthUI()}
  async function saveCloud(){if(!supabase||!user)return;const payload={id:user.id,display_name:state.name,level:state.level,xp:state.xp,wins:state.wins,best_wpm:state.bestWpm,updated_at:new Date().toISOString()};const {error}=await supabase.from("player_profiles").upsert(payload);if(error)console.warn("Cloud save:",error.message)}
  async function loadLeaderboard(){if(!supabase){$("leaderboard-body").innerHTML='<tr><td colspan="5">Add your Supabase settings to config.js to enable global rankings.</td></tr>';return}const {data,error}=await supabase.from("player_profiles").select("display_name,level,best_wpm,wins").order("best_wpm",{ascending:false}).limit(20);if(error){$("leaderboard-body").innerHTML=`<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`;return}$("leaderboard-body").innerHTML=(data||[]).map((p,i)=>`<tr><td>#${i+1}</td><td>${escapeHtml(p.display_name||"Fighter")}</td><td>${p.level}</td><td>${p.best_wpm}</td><td>${p.wins}</td></tr>`).join("")||'<tr><td colspan="5">No scores yet. Be the first!</td></tr>'}
  function updateAuthUI(){$("user-label").textContent=user?(user.email||"Signed in"):"Guest fighter";$("auth-open").textContent=user?"Account":"Sign in";$("signout-btn").classList.toggle("hidden",!user)}
  async function auth(mode){if(!supabase){$("auth-message").textContent="First add your Supabase URL and anon key in config.js, then refresh.";return}const email=$("email").value,password=$("password").value;let result;if(mode==="signup")result=await supabase.auth.signUp({email,password,options:{data:{display_name:$("display-name").value||"Shadow Rookie"}}});else result=await supabase.auth.signInWithPassword({email,password});$("auth-message").textContent=result.error?result.error.message:(mode==="signup"?"Account created. Check your email if confirmation is enabled.":"Signed in successfully.");if(!result.error&&mode==="signup"&&result.data.user){user=result.data.user;state.name=$("display-name").value||"Shadow Rookie";saveState();await saveCloud();updateAuthUI()}}
  $("typing-input").addEventListener("input",onType);$("start-btn").onclick=startFight;$("next-btn").onclick=startFight;document.querySelectorAll(".snd-btn").forEach(b=>b.onclick=()=>{soundOn=!soundOn;Sfx.setSfx(soundOn);document.querySelectorAll(".snd-btn").forEach(x=>x.textContent=soundOn?"🔊":"🔇")});document.querySelectorAll(".mus-btn").forEach(b=>b.onclick=()=>{musicOn=!musicOn;Sfx.setMusic(musicOn);document.querySelectorAll(".mus-btn").forEach(x=>x.textContent=musicOn?"🎵":"🔕")});document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));$("auth-open").onclick=()=>{$("auth-modal").classList.remove("hidden");$("auth-message").textContent=""};$("auth-close").onclick=()=>$("auth-modal").classList.add("hidden");$("auth-form").onsubmit=e=>{e.preventDefault();auth("signup")};$("login-btn").onclick=()=>auth("login");$("signout-btn").onclick=async()=>{await supabase?.auth.signOut();user=null;updateAuthUI()};$("refresh-board").onclick=loadLeaderboard;
  // ---------- Ads ----------
  const AD=window.AD_CONFIG||{};let fightsStarted=0;
  function openAd(){try{const w=window.open(AD.LINK,"_blank","noopener,noreferrer");localStorage.setItem("typeclash-lastad",String(Date.now()));return !!w||true}catch{return false}}
  function adReady(){const last=Number(localStorage.getItem("typeclash-lastad")||0);return Date.now()-last>=(AD.COOLDOWN_SECONDS||0)*1000}
  function maybeShowAd(){if(!AD.ENABLED||!AD.LINK)return;fightsStarted++;if(fightsStarted%(AD.EVERY_N_FIGHTS||2)===0&&adReady())openAd()}
  function setupSupportButton(){const b=$("support-btn");if(!b)return;if(!AD.ENABLED||!AD.SUPPORT_BUTTON||!AD.LINK){b.classList.add("hidden");return}b.onclick=()=>{openAd();const xp=AD.SUPPORT_REWARD_XP||0;if(xp>0){state.xp+=xp;while(state.xp>=100){state.xp-=100;state.level++}unlockFighters();saveState();$("status-message").textContent=`Thanks for supporting the game! +${xp} XP`}else{$("status-message").textContent="Thanks for supporting the game! ❤"}}}
  // ---------- Fight screen ----------
  const ESET=[["bot","thug"],["thug","racer"],["racer","boxer"],["pirate","viking"],["punk","volt"],["flame","ronin"],["cowboy","ninja"],["suit","chef"],["ninja","frost"],["king","knight"]],
    EBOSS=["knight","viking","pirate","punk","legend","wizard","cowboy","suit","ninja","king"];
  let eMax=100,musicOn=true,enemyDmg=4,hitGap=3500,mode=null;tone=function(){};
  function updateStageUI(){const i=Levels.info(fightLevel());$("stage-title").textContent=i.zone;$("stage-badge").textContent="LEVEL "+String(i.level).padStart(3,"0");$("enemy-name").textContent=i.enemy}
  const ENEMIES=["TRAINING BOT","STREET BRAWLER","NINJA ACOLYTE","IRON MONK","SHADOW LORD","DRAGON KING"];
  function fitFight(){const v=window.visualViewport,vh=v?v.height:innerHeight,vt=v?v.offsetTop:0,w=innerWidth,s=document.documentElement.style;
    s.setProperty("--vvh",vh+"px");s.setProperty("--vvt",vt+"px");s.setProperty("--ah",Math.round(Math.min(vh,Math.max(280,Math.min(w>900?vh:560,w*1.15))))+"px")}
  function enterFight(){if(!document.body.classList.contains("fighting")){const a=document.querySelector(".tab.active");lastTab=(a&&a.dataset.tab)||"home"}setTab("arena");document.body.classList.add("fighting");$("result").classList.add("hidden");window.scrollTo(0,0);fitFight();
    updateStageUI();resetArena();Arena.intro();say("FIGHT!","#ffd24a");Sfx.init();Sfx.musicStart()}
  function showResult(win){$("result-title").textContent=win?"VICTORY":"DEFEAT";$("result-sub").textContent=$("status-message").textContent;
    $("result-btn").textContent=win?"NEXT OPPONENT →":"TRY AGAIN";$("result").classList.remove("hidden")}
  function endFight(win){const pre=beforeFight();endFightCore(win);afterFight(win,pre);updateStageUI();Arena.word(null);if(win)enemyHP=0;updateBattle();Arena.end(win);Sfx.musicStop();win?Sfx.win():Sfx.ko();setTimeout(()=>showResult(win),1700)}
  function showWord(){if(!running){Arena.word(null);return}const v=$("typing-input").value,ws=target.split(" ");let st=0,wi=0;
    for(;wi<ws.length-1;wi++){const e=st+ws[wi].length;if(typed<=e)break;st=e+1}
    const w=ws[wi],ch=[];for(let j=0;j<w.length;j++){const i=st+j;ch.push([w[j],i<typed?(v[i]===target[i]?1:2):0])}
    Arena.word(ch,Math.max(0,Math.min(w.length,typed-st)),wi,ws.length)}
  {const ti=$("typing-input"),kf=()=>{if(running)ti.focus({preventScroll:true})},hint=document.createElement("button");
    hint.id="kb-hint";hint.className="kb-hint hidden";hint.textContent="⌨ TAP HERE TO TYPE";document.body.appendChild(hint);
    const sync=()=>hint.classList.toggle("hidden",!(running&&document.body.classList.contains("fighting")&&document.activeElement!==ti));
    // keep keyboard open: a tap on the arena / sound buttons must not steal focus from the typing input
    [$("arena"),document.querySelector(".hud-btns")].forEach(el=>el.addEventListener("mousedown",e=>{if(running)e.preventDefault()}));
    $("arena").addEventListener("click",()=>{kf();sync()});hint.addEventListener("click",()=>{kf();sync()});
    ti.addEventListener("focus",sync);ti.addEventListener("blur",()=>setTimeout(sync,60));document.addEventListener("visibilitychange",()=>setTimeout(sync,200));setInterval(sync,500)}
  $("result-btn").onclick=startFight;
  $("exit-btn").onclick=()=>{document.body.classList.remove("fighting");setTab(lastTab||"home");$("result").classList.add("hidden");window.scrollTo(0,0);resetArena()};
  if(window.visualViewport){const f=()=>document.body.classList.contains("fighting")&&fitFight();visualViewport.addEventListener("resize",f);visualViewport.addEventListener("scroll",f)}
  window.addEventListener("resize",()=>document.body.classList.contains("fighting")&&fitFight());
  updateStageUI();resetArena();
  // ---------- Combat v7: health race, speed-based attacks, line specials ----------
  let pool=0,L0=100,dmgPerChar=1,lineEnds=[],li=0,paraN=0,stamps=[],pendingSp=null,spIdx=0;
  const SPID=["beam","flurry","dive","smash","flip","choke","throw"],SPN=["ENERGY BEAM!","LIGHTNING FLURRY!","FLYING KICK!","GROUND SMASH!","BACKFLIP KICK!","CHOKEHOLD!","SLAM!"];
  function computeLines(text,off){const out=[],re=/\S+/g;let m,c=0,last=0;
    while((m=re.exec(text))){c++;last=m.index+m[0].length;if((/[.!?]["']?$/.test(m[0])&&c>=3)||c>=8){out.push(off+last);c=0}}
    if(c>=3)out.push(off+last);return out}
  function appendPara(){const t=fightText(fightLevel(),++paraN),off=target.length+1;target+=" "+t;lineEnds.push(...computeLines(t,off))}
  function liveWpm(){const t=performance.now();while(stamps.length&&t-stamps[0]>3000)stamps.shift();return stamps.length/Math.max(1.5,Math.min(3,elapsed))*12}
  function tempoNow(){return Math.max(.9,Math.min(2.2,.9+liveWpm()/45))}
  function say(t,col){const e=$("impact-text");e.textContent=t;e.style.color=col||"";e.classList.remove("show");void e.offsetWidth;e.classList.add("show")}
  function fireLine(value){const ls=li>0?lineEnds[li-1]:0,le=lineEnds[li];let ok=0;for(let k=ls;k<le;k++)if(value[k]===target[k])ok++;
    const idx=li%SPID.length;li++;if(ok/Math.max(1,le-ls)>=.85){spIdx=idx;if(!Arena.special(SPID[idx]))pendingSp=idx}else say("SLOPPY LINE!","#ff9aa8")}
  Arena.onHit=(who,kind,bl,mag)=>{if(!running)return;
    if(who==="p"){let d=pool;pool=0;if(kind==="S")d+=eMax*.06*mag;else if(kind==="c")d+=eMax*.018*mag;if(bl)d*=(bl==="d"?.45:.35);
      enemyHP=Math.max(0,enemyHP-d);updateBattle();say(kind==="S"?SPN[spIdx]:`-${Math.round(d)}`,kind==="S"?"#ffd24a":"");if(enemyHP<=0)endFight(true)}
    else{const d=enemyDmg*(bl?.35:1)*(kind==="h"?1.5:1);playerHP=Math.max(0,playerHP-d);updateBattle();say(`-${Math.round(d)}`,"#ff5c75");if(playerHP<=0)endFight(false)}};
  // ---------- Characters (v8) ----------
  function enemyId(lv){const z=Math.min(9,Math.floor((lv-1)/10));let id=lv%10===0?EBOSS[z]:ESET[z][lv%2];if(id===state.selected)id=ESET[z][(lv+1)%2];if(id===state.selected)id="bot";return id}
  function resetArena(){const lv=fightLevel(),i=Levels.info(lv);Arena.reset(state.selected,i.hue,i.boss,enemyId(lv))}
  // ---------- Retention features (v5): streak, daily challenge, stars + level picker, personal best, ranks ----------
  const RANKS=[[1,"ROOKIE","🥉"],[3,"BRAWLER","🥊"],[6,"FIGHTER","⚔️"],[10,"WARRIOR","🛡️"],[15,"ELITE","💎"],[22,"CHAMPION","🏆"],[30,"LEGEND","👑"],[40,"MYTHIC","🔥"]];
  function rankOf(lv){let r=0;RANKS.forEach((x,i)=>{if(lv>=x[0])r=i});return{idx:r,name:RANKS[r][1],icon:RANKS[r][2]}}
  const pad2=n=>String(n).padStart(2,"0"),dayStr=o=>{const d=new Date(Date.now()+o*864e5);return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`};
  const todayStr=()=>dayStr(0),hashS=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const dailyLevel=()=>15+hashS(todayStr())%30,starStr=n=>"★".repeat(n)+"☆".repeat(3-n);
  function seeded(seed,fn){const keep=Math.random,seen=localStorage.getItem("typeclash-seen");let a=seed>>>0;
    Math.random=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    try{localStorage.removeItem("typeclash-seen");return fn()}finally{Math.random=keep;if(seen!==null)localStorage.setItem("typeclash-seen",seen);else localStorage.removeItem("typeclash-seen")}}
  function fightLevel(){return mode?mode.level:Math.min(state.pick||state.stage||1,state.stage||1)}
  function fightText(lv,i){return mode&&mode.type==="daily"?seeded(hashS("daily"+todayStr()+(i?"#"+i:"")),()=>Levels.text(lv)):Levels.text(lv)}
  function addXp(n){state.xp+=n;while(state.xp>=100){state.xp-=100;state.level++}unlockFighters();saveState();renderFighters()}
  let lastGain=0,R=null;
  function gainXp(wpm){let g=35+Math.round(wpm/2);if(!(mode&&mode.type==="daily")&&fightLevel()<(state.stage||1))g=Math.round(g/2);lastGain=g;return g}
  function advanceLevel(){if(mode&&mode.type==="daily")return;const l=fightLevel();if(l>=(state.stage||1))state.stage=l+1;state.pick=Math.min(l+1,state.stage)}
  function starsFor(lv,wpm,acc){const t=Levels.info(lv).targetWpm;return acc>=.97&&wpm>=t?3:(acc>=.92||wpm>=t)?2:1}
  function beforeFight(){return{lvl:fightLevel(),m:mode,best:state.bestWpm,rank:rankOf(state.level).idx,chars:state.unlocked.length}}
  function afterFight(win,pre){const wpm=Math.round((correct/5)/(Math.max(1,elapsed)/60)),acc=typed?correct/typed:1,daily=!!(pre.m&&pre.m.type==="daily");
    R={win,lvl:pre.lvl,wpm,acc:Math.round(acc*100),daily,gain:win?lastGain:0,stars:0,note:"",prevBest:pre.best};
    state.fights=(state.fights||0)+1;if(typed>=12)state.accs=[...(state.accs||[]),R.acc].slice(-20);
    if(typed>=12&&elapsed>=4)state.hist=[...(state.hist||[]),wpm].slice(-12);
    if(win){R.stars=starsFor(pre.lvl,wpm,acc);
      if(!daily){state.stars=state.stars||{};state.stars[pre.lvl]=Math.max(state.stars[pre.lvl]||0,R.stars)}
      else{const t=todayStr(),d=state.daily;if(!d||d.date!==t){addXp(40);R.note+="Daily bonus +40 XP. "}if(!d||d.date!==t||wpm>d.wpm)state.daily={date:t,wpm,acc:R.acc,stars:R.stars}}
      if(pre.best>0&&wpm>pre.best)R.note+=`NEW RECORD +${wpm-pre.best} WPM! `}
    if(state.unlocked.length>pre.chars){const nf=fighters[state.unlocked.length-1];R.note+=`NEW CHARACTER: ${nf.name} ${nf.emoji}! Tap Character to use it. `}
    const rk=rankOf(state.level);if(rk.idx>pre.rank)R.note+=`RANK UP: ${rk.name} ${rk.icon}`;
    mode=null;saveState()}
  function spark(){const h=(state.hist||[]).slice(-10);if(h.length<2)return"";const mx=Math.max(...h),mn=Math.min(...h),w=140,ht=28;
    const pts=h.map((v,i)=>`${(i/(h.length-1)*w).toFixed(1)},${(ht-2-(mx===mn?.5:(v-mn)/(mx-mn))*(ht-4)).toFixed(1)}`).join(" ");
    return `<svg class="r-spark" viewBox="0 0 ${w} ${ht}" width="${w}" height="${ht}"><polyline points="${pts}" fill="none" stroke="#59d8ed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  function renderResultExtra(){if(!R)return;const r=R,info=Levels.info(r.lvl);
    $("result-title").textContent=r.daily?(r.win?"DAILY COMPLETE":"DAILY FAILED"):(r.win?`LEVEL ${r.lvl} CLEARED`:"DEFEAT");
    $("result-sub").textContent=r.win?`+${r.gain} XP`:`Aim for about ${Math.round(info.targetWpm)} WPM on this level`;
    const df=r.prevBest>0?` · ${r.wpm-r.prevBest>=0?"+":""}${r.wpm-r.prevBest} vs best`:"";
    $("result-extra").innerHTML=`${r.win?`<div class="r-stars">${starStr(r.stars)}</div>`:""}<div class="r-line"><b>${r.wpm}</b> WPM · <b>${r.acc}%</b> accuracy${df}</div>${spark()}${r.note?`<div class="r-note">${r.note}</div>`:""}`;
    $("r-share").classList.toggle("hidden",!(r.daily&&r.win));
    $("result-btn").textContent=r.daily?(r.win?"CONTINUE CAMPAIGN →":"TRY DAILY AGAIN"):(r.win?"NEXT LEVEL →":"TRY AGAIN")}
  { const sr=showResult;showResult=function(w){sr(w);renderResultExtra()} }
  // --- UI injected by JS, so index.html (and your verification tags) stay untouched ---
  function mkEl(tag,id,cls,html){const e=document.createElement(tag);if(id)e.id=id;if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
  $("start-btn").before(mkEl("div",null,"lvl-row",'<button id="lv-prev" class="lv-arrow">◀</button><button id="lv-label" class="lv-label"></button><button id="lv-next" class="lv-arrow">▶</button>'));
  $("lv-prev").parentNode.after(mkEl("button","char-btn","small-btn daily-btn"));
  $("status-message").after(mkEl("button","daily-btn","small-btn daily-btn"),mkEl("button","daily-share","small-btn daily-btn hidden","📤 Share today's result"));
  document.querySelector(".xp-track").after(mkEl("div","streak-badge","streak"));
  document.querySelector(".result-btns").before(mkEl("div","result-extra","result-extra"));
  $("exit-btn").before(mkEl("button","r-share","small-btn hidden","📤 SHARE"));
  function toast(m){let t=$("toast");if(!t){t=mkEl("div","toast","toast");document.body.appendChild(t)}t.textContent=m;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),2600)}
  function closeModal(){document.querySelectorAll(".modal").forEach(m=>m.remove())}
  function modal(html,init){closeModal();const m=mkEl("div",null,"modal",`<div class="modal-box">${html}</div>`);m.addEventListener("pointerdown",e=>{if(e.target===m)closeModal()});document.body.appendChild(m);if(init)init(m.firstChild)}
  function applyPick(){saveState();resetArena()}
  $("lv-prev").onclick=()=>{if(running)return;state.pick=Math.max(1,fightLevel()-1);applyPick()};
  $("lv-next").onclick=()=>{if(running)return;state.pick=Math.min(state.stage||1,fightLevel()+1);applyPick()};
  $("lv-label").onclick=()=>{if(running)return;const mx=Math.max(100,state.stage||1);let h="<h2>Choose level</h2><div class='lv-grid'>";
    for(let i=1;i<=mx;i++){const lk=i>(state.stage||1),n=(state.stars||{})[i]||0;h+=`<button class="lv-cell${lk?" lock":""}${i===fightLevel()?" cur":""}" data-l="${i}"${lk?" disabled":""}><b>${i}</b><i>${lk?"🔒":n?"★".repeat(n):"–"}</i></button>`}
    modal(h+"</div>",box=>box.querySelectorAll(".lv-cell").forEach(b=>b.onclick=()=>{state.pick=+b.dataset.l;closeModal();applyPick()}))};
  function openChars(){if(running)return;const h="<h2>Choose character</h2><div class='char-grid'>"+fighters.map(f=>{const un=state.unlocked.includes(f.id);
      return `<button class="char-cell${un?"":" lock"}${f.id===state.selected?" cur":""}" data-id="${f.id}"${un?"":" disabled"}><canvas width="120" height="150" data-cv="${f.id}"></canvas><b>${f.name}</b><i>${un?"":`🔒 clear level ${f.clear}`}</i></button>`}).join("")+"</div>";
    modal(h,box=>{box.querySelectorAll("canvas").forEach(cv=>{Arena.preview(cv,cv.dataset.cv);if(!state.unlocked.includes(cv.dataset.cv))cv.style.filter="brightness(.18) saturate(0)"});
      box.querySelectorAll(".char-cell").forEach(b=>b.onclick=()=>{state.selected=b.dataset.id;saveState();renderFighters();resetArena();closeModal()})})}
  $("char-btn").onclick=openChars;
  $("daily-btn").onclick=()=>{if(running)return;mode={type:"daily",level:dailyLevel()};startFight()};
  $("result-btn").onclick=()=>{if(R&&R.daily&&!R.win)mode={type:"daily",level:dailyLevel()};startFight()};
  async function shareDaily(){const d=state.daily;if(!d)return;const url=location.href.split("#")[0],st=(state.streak||0);
    const text=`TYPE CLASH Daily ${d.date}\n${starStr(d.stars)} ${d.wpm} WPM · ${d.acc}% accuracy\n🔥 ${st}-day streak\nBeat me: ${url}`;
    const cv=document.createElement("canvas");cv.width=1080;cv.height=1350;const x=cv.getContext("2d"),g=x.createLinearGradient(0,0,0,1350);g.addColorStop(0,"#0e111b");g.addColorStop(1,"#1d2a44");x.fillStyle=g;x.fillRect(0,0,1080,1350);
    x.strokeStyle="#59d8ed";x.lineWidth=8;x.strokeRect(40,40,1000,1270);x.textAlign="center";
    const t=(s,y,f,c)=>{x.font=`800 ${f}px sans-serif`;x.fillStyle=c;x.fillText(s,540,y)};
    t("TYPE CLASH",230,120,"#b8f35a");t("DAILY CHALLENGE",320,52,"#59d8ed");t(d.date,390,44,"#929bb1");t(starStr(d.stars),600,170,"#ffc75e");
    t(String(d.wpm),870,260,"#ffffff");t("WPM",950,70,"#929bb1");t(`${d.acc}% accuracy`,1050,60,"#f4f6ff");t(`🔥 ${st}-day streak`,1140,56,"#ffc75e");t(url.replace(/^https?:\/\//,""),1250,40,"#59d8ed");
    try{const blob=await new Promise(r=>cv.toBlob(r,"image/png")),f=new File([blob],"type-clash-daily.png",{type:"image/png"});
      if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text});return}
      if(navigator.share){await navigator.share({text});return}}catch(e){if(e&&e.name==="AbortError")return}
    try{await navigator.clipboard.writeText(text);toast("Result copied! Paste it anywhere 📋")}catch(e){toast("Sharing isn't supported on this browser")}}
  $("daily-share").onclick=shareDaily;$("r-share").onclick=shareDaily;
  function renderMeta(){if(!$("lv-label"))return;const l=fightLevel(),n=(state.stars||{})[l]||0;
    $("lv-label").innerHTML=`LEVEL ${l} <span class="lv-st">${starStr(n)}</span>`;$("lv-prev").disabled=l<=1;$("lv-next").disabled=l>=(state.stage||1);
    const d=state.daily,done=d&&d.date===todayStr();$("daily-btn").textContent=done?`✅ Daily done · ${d.wpm} WPM ${starStr(d.stars)}`:"⚡ Daily Challenge · same text for everyone · +40 XP";$("daily-share").classList.toggle("hidden",!done);
    {const cf=fighters.find(f=>f.id===state.selected);$("char-btn").textContent=`👤 ${cf?cf.name:"Character"} · change`}$("streak-badge").textContent=(state.streak||0)>0?`🔥 ${state.streak}-day streak`:"🔥 Claim your daily reward to start a streak";updateStageUI();renderHome()}
  function dailyClaim(){const t=todayStr();if(state.lastDay===t)return;const ns=state.lastDay===dayStr(-1)?(state.streak||0)+1:1,xp=20+Math.min(ns,7)*10+(ns%7===0?100:0);
    modal(`<h2>🔥 Day ${ns}</h2><p>${ns>1?"Your streak continues!":"Your streak starts today!"}${ns%7===0?" 7-day bonus!":""}</p><p class="modal-big">+${xp} XP</p><button id="claim-btn" class="primary-btn">CLAIM</button>`,
      box=>box.querySelector("#claim-btn").onclick=()=>{state.streak=ns;state.bestStreak=Math.max(state.bestStreak||0,ns);state.lastDay=t;addXp(xp);closeModal();toast(`+${xp} XP · ${ns}-day streak 🔥`)})}
  // ---------- Home dashboard (v10) ----------
  let lastTab="home",fi=-1,heroKey="",lastDayRendered="";
  const AP={first:[s=>s.wins,1],speed:[s=>s.bestWpm,40],streak:[s=>s.bestCombo,15],veteran:[s=>s.wins,10],level5:[s=>s.level,5],perfect:[s=>s.perfect,1]};
  const rar=c=>c<20?["COMMON","#9aa3c7"]:c<50?["RARE","#38d3ff"]:c<80?["EPIC","#a855f7"]:["LEGENDARY","#ffc23e"];
  const dOff=s=>{if(!s)return -99;const[p,q,r]=s.split("-").map(Number),n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate());return Math.round((new Date(p,q-1,r)-t)/864e5)};
  function quick(){if(!running)startFight()}
  function doMode(m){if(m==="camp")quick();else if(m==="daily")$("daily-btn").click();else if(m==="lv")$("lv-label").click();else toast("Coming soon! 🚧")}
  function modeModal(){const lv=fightLevel();modal(`<h2>Choose mode</h2><div class="mode-list">
    <button data-m="camp"><b>⚔ Campaign</b><small>Level ${lv} · ${Levels.info(lv).zone}</small></button>
    <button data-m="daily"><b>⚡ Daily Challenge</b><small>Same text for everyone · +40 XP</small></button>
    <button data-m="lv"><b>🗺 Level select</b><small>Replay any level you have cleared</small></button>
    <button class="soon" data-m="soon"><b>🏆 Ranked</b><small>Coming soon</small></button>
    <button class="soon" data-m="soon"><b>🤝 1v1 Room</b><small>Coming soon</small></button></div>`,
    box=>box.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{closeModal();doMode(b.dataset.m)}))}
  function menuModal(){modal(`<h2>Menu</h2><div class="mode-list">
    <button data-g="achievements"><b>🏅 Achievements</b></button><button data-g="leaderboard"><b>📊 Leaderboard</b></button>
    <button data-g="arena"><b>⚔ Battle setup</b><small>Level picker · daily challenge</small></button>
    <button data-g="auth"><b>👤 ${user?"Account":"Sign in"}</b><small>Save your progress across devices</small></button></div>`,
    box=>box.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{closeModal();if(b.dataset.g==="auth")$("auth-open").click();else setTab(b.dataset.g)}))}
  function renderFeat(){if(fi<0){fi=fighters.findIndex(f=>!state.unlocked.includes(f.id));if(fi<0)fi=0}
    const f=fighters[fi],un=state.unlocked.includes(f.id),sel=state.selected===f.id,[rn,rc]=rar(f.clear);
    $("f-name").textContent=f.name.toUpperCase();$("f-rare").textContent=rn;$("f-rare").style.color=rc;$("f-desc").textContent=f.style;
    $("f-lock").textContent=un?"UNLOCKED":`Clear level ${f.clear} to unlock`;const b=$("f-select");b.disabled=!un||sel;b.textContent=sel?"SELECTED":un?"SELECT":"LOCKED";
    $("f-cv").classList.toggle("locked",!un);Arena.preview($("f-cv"),f.id);$("f-count").textContent=`${fi+1} / ${fighters.length}`}
  function renderHome(){const hp=$("home-panel");if(!hp||!hp.classList.contains("active")||!$("h-wpm"))return;
    const t=todayStr(),fights=Math.max(state.fights||0,state.wins),accs=state.accs||[],claimed=state.lastDay===t,last=claimed?0:dOff(state.lastDay),st=last>=-1?(state.streak||0):0,lv=fightLevel(),inf=Levels.info(lv);
    lastDayRendered=t;$("h-wpm").textContent=state.bestWpm;$("h-acc").textContent=accs.length?Math.round(accs.reduce((a,b)=>a+b,0)/accs.length)+"%":"–";
    $("h-wins").textContent=state.wins;$("h-rate").textContent=fights?Math.round(state.wins/fights*100)+"%":"–";
    $("h-streak").textContent=st+(st===1?" DAY":" DAYS");$("h-streak-msg").textContent=claimed?"Keep it up!":"Claim today's reward!";
    let wk="";for(let o=-6;o<=0;o++){const d=new Date(Date.now()+o*864e5),done=st>0&&o<=last&&o>last-st;wk+=`<span class="${done?"done":""}${o===0?" today":""}"><i>${done?"✓":o===0&&!claimed?"🎁":""}</i><em>${"SMTWTFS"[d.getDay()]}</em></span>`}
    $("h-week").innerHTML=wk;$("h-claim").disabled=claimed;$("h-claim").textContent=claimed?"CLAIMED ✓":"CLAIM REWARD";$("bell-btn").classList.toggle("has",!claimed);
    const em=(fighters.find(f=>f.id===state.selected)||{}).emoji||"🥷";$("chip-avatar").textContent=em;$("chip-name").textContent=state.name;$("chip-level").textContent=state.level;$("chip-fill").style.width=`${state.xp%100}%`;
    $("h-quick-sub").textContent=`Level ${lv} · ${inf.zone}`;
    const d=state.daily,done=d&&d.date===t;
    $("h-modes").innerHTML=[["camp","⚔","CAMPAIGN",`Level ${lv}`],["daily","⚡","DAILY",done?`✓ ${d.wpm} WPM`:"+40 XP bonus"],["lv","🗺","LEVELS","Replay & stars"],["soon","🏆","RANKED","Coming soon",1],["soon","🤝","1v1 ROOM","Coming soon",1]]
      .map(m=>`<button class="mode${m[4]?" soon":""}" data-m="${m[0]}"><i>${m[1]}</i><b>${m[2]}</b><small>${m[3]}</small></button>`).join("");
    $("h-ach").innerHTML=achievements.slice(0,5).map(a=>{const[fn,goal]=AP[a.id]||[()=>0,1],cur=Math.min(goal,fn(state)),ok=state.achievements.includes(a.id);
      return `<div class="ac"><span class="ai">${a.emoji}</span><div><b>${a.name}</b><small>${a.desc}</small><div class="ab"><i style="width:${cur/goal*100}%"></i></div><em class="${ok?"ok":""}">${ok?"✓ COMPLETED":cur+" / "+goal}</em></div></div>`}).join("");
    const key=state.selected+"|"+enemyId(lv);if(key!==heroKey){heroKey=key;Arena.preview($("hero-l"),state.selected);Arena.preview($("hero-r"),enemyId(lv))}
    renderFeat()}
  async function loadHomeBoard(){const ul=$("h-board");if(!ul)return;const em=(fighters.find(f=>f.id===state.selected)||{}).emoji||"🥷";
    const me=`<li class="me"><span class="rk">–</span><span class="ra">${em}</span><b>${escapeHtml(state.name)}</b><em>${state.bestWpm} WPM</em></li>`;
    if(!supabase){ul.innerHTML='<li class="note">Global rankings open soon. Your best so far:</li>'+me;return}
    try{const{data,error}=await supabase.from("player_profiles").select("display_name,best_wpm").order("best_wpm",{ascending:false}).limit(4);if(error)throw error;
      ul.innerHTML=(data||[]).map((p,i)=>`<li><span class="rk r${i+1}">${i+1}</span><span class="ra">🥷</span><b>${escapeHtml(p.display_name||"Fighter")}</b><em>${p.best_wpm} WPM</em></li>`).join("")+me}
    catch(e){ul.innerHTML='<li class="note">Rankings are unavailable right now.</li>'+me}}
  $("h-quick").onclick=quick;$("h-mode").onclick=modeModal;$("menu-btn").onclick=menuModal;$("h-claim").onclick=dailyClaim;
  $("bell-btn").onclick=()=>{if(state.lastDay===todayStr())toast("No new rewards right now 🎁");else dailyClaim()};
  $("h-modes").onclick=e=>{const b=e.target.closest("[data-m]");if(b)doMode(b.dataset.m)};
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>setTab(b.dataset.go));
  $("f-prev").onclick=()=>{fi=(fi+fighters.length-1)%fighters.length;renderFeat()};$("f-next").onclick=()=>{fi=(fi+1)%fighters.length;renderFeat()};
  $("f-select").onclick=()=>{const b=document.querySelector(`[data-fighter="${fighters[fi].id}"]`);if(b&&!b.disabled)b.click()};
  setInterval(()=>{const e=$("h-reset");if(!e)return;const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1),s=Math.max(0,Math.floor((m-n)/1000));
    e.textContent=[s/3600|0,(s/60)%60|0,s%60].map(pad2).join(":");if(todayStr()!==lastDayRendered)renderHome()},1000);
  loadHomeBoard();
  setTimeout(dailyClaim,900);
  unlockFighters();
  setupSupportButton();renderProfile();renderFighters();renderAchievements();updateBattle();updateAuthUI();setupSupabase();
})();