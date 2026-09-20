const C=document.getElementById('c'),X=C.getContext('2d');
let col='azul',vehicle='carro',soundOn=true,playing=false,pts=0,vel=5,dificuldade='facil';
let lanes=[95,285],player={lane:0,x:95,y:620,shield:3,nitro:0,boost:0,moving:false},cars=[],coins=[],nitros=[],off=0,map=0;
let maps=[{name:'NORMAL',road:'#252525',side:'#1d7a34',sky:['#12345f','#4a7abf']},{name:'DESERTO',road:'#3e3320',side:'#e3c57a',sky:['#ff7a2e','#ffb26e']},{name:'INVERNO',road:'#2f3f50',side:'#e6f2ff',sky:['#6aa8e0','#d0e8ff']},{name:'MONTANHA',road:'#222',side:'#3d4f3d',sky:['#1a2a3a','#3a5a6a']}];
let audio;
const colors={
azul:{base:'#2a8cff',dark:'#0a3a8a',nome:'AZUL'},
amarelo:{base:'#ffde21',dark:'#b89a00',nome:'AMARELO'},
rosa:{base:'#ff9ec8',dark:'#b24a73',nome:'ROSA'},
roxo:{base:'#c38cff',dark:'#6a3ba8',nome:'ROXO'}
};
const difConfig={
facil:{vel:4.5,spawn:1600,shield:3,enemySpeed:0.50,minGap:220,desc:'+ LENTO / 3 VIDAS / PISTA LIVRE'},
medio:{vel:6.5,spawn:1150,shield:2,enemySpeed:0.68,minGap:190,desc:'EQUILIBRADO / 2 VIDAS'},
dificil:{vel:9,spawn:800,shield:1,enemySpeed:0.90,minGap:160,desc:'RAPIDO / 1 VIDA / DESAFIADOR'}
};
function beep(f,d,ty='square'){if(!soundOn)return;if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();let o=audio.createOscillator(),g=audio.createGain();o.type=ty;o.frequency.value=f;o.connect(g);g.connect(audio.destination);g.gain.value=0.15;o.start();g.gain.exponentialRampToValueAtTime(0.0001,audio.currentTime+d);o.stop(audio.currentTime+d);}
function setDif(d){dificuldade=d;document.querySelectorAll('#dFacil,#dMedio,#dDificil').forEach(e=>e.classList.remove('sel'));document.getElementById(d=='facil'?'dFacil':d=='medio'?'dMedio':'dDificil').classList.add('sel');document.getElementById('difDesc').innerText=difConfig[d].desc;updateCur();beep(700,0.08);}
function setColor(c){col=c;updateCur();beep(600,0.1);}
function setVehicle(v){vehicle=v;updateCur();beep(800,0.1);}
function updateCur(){
let nomeCor=colors[col].nome;
let nomeVeiculo=vehicle.toUpperCase();
document.getElementById('cur').innerText=(nomeVeiculo+' '+nomeCor+' - '+dificuldade.toUpperCase());
}
function toggleSound(){soundOn=!soundOn;document.getElementById('sState').innerText=soundOn?'LIGADO':'DESLIGADO';}
function toggleOpt(){let o=document.getElementById('opt');o.style.display=o.style.display=='block'?'none':'block';}
function drawVehicle(x,y,c,type,isP){X.save();X.translate(x,y);if(type==='carro'){X.fillStyle=colors[c].base;X.fillRect(0,0,56,92);X.fillStyle=colors[c].dark;X.fillRect(0,0,56,10);X.fillRect(0,82,56,10);X.fillStyle='#111';X.fillRect(8,34,40,28);X.fillStyle='#000';X.fillRect(-4,20,6,20);X.fillRect(-4,60,6,20);X.fillRect(54,20,6,20);X.fillRect(54,60,6,20);X.fillStyle='#ffff99';X.fillRect(6,82,12,8);X.fillRect(38,82,12,8);}else{X.fillStyle='#222';X.fillRect(10,12,20,62);X.fillStyle=colors[c].base;X.fillRect(6,30,28,30);X.fillStyle='#111';X.fillRect(12,2,16,18);X.fillStyle=colors[c].base;X.fillRect(12,2,16,7);}if(isP&&player.shield>0){X.strokeStyle='#00ff88';X.lineWidth=2;X.setLineDash([6,4]);X.strokeRect(-6,-6,type==='carro'?68:40,104);X.setLineDash([]);}X.restore();}
function moveLeft(){if(!playing||player.moving)return;if(player.lane>0){player.lane--;player.moving=true;beep(400,0.06);setTimeout(()=>player.moving=false,160);}}
function moveRight(){if(!playing||player.moving)return;if(player.lane<1){player.lane++;player.moving=true;beep(400,0.06);setTimeout(()=>player.moving=false,160);}}
function start(){let cfg=difConfig[dificuldade];document.getElementById('menu').style.display='none';document.getElementById('hud').style.display='flex';document.getElementById('nitro').style.display='block';document.getElementById('nitro-label').style.display='block';document.getElementById('controls').style.display='flex';document.getElementById('difHud').innerText=dificuldade.toUpperCase();playing=true;pts=0;vel=cfg.vel;cars=[];coins=[];nitros=[];player.shield=cfg.shield;player.nitro=0;player.boost=0;player.lane=0;beep(900,0.15);requestAnimationFrame(loop);}
let lastCar=0,lastCoin=0,lastNitro=0,lastMap=0;
function canSpawn(lane){let cfg=difConfig[dificuldade];for(let c of cars){if(Math.abs(c.x - lanes[lane])<10 && c.y < cfg.minGap) return false;}return true;}
function loop(now){
if(!playing)return;
let cfg=difConfig[dificuldade];
player.x+=(lanes[player.lane]-player.x)*0.26;
let addVel=Math.floor(pts/700)*0.9;vel=cfg.vel+addVel+(player.boost>0?6:0);if(player.boost>0)player.boost--;
off=(off+vel)%40;
if(now-lastCar>cfg.spawn-vel*12){
lastCar=now;
let possibleLanes=[];
if(canSpawn(0)) possibleLanes.push(0);
if(canSpawn(1)) possibleLanes.push(1);
if(possibleLanes.length>0){
let l=possibleLanes[Math.floor(Math.random()*possibleLanes.length)];
let corSorteada=Object.keys(colors)[Math.floor(Math.random()*4)];
let tipoSorteado=Math.random()<0.6?'carro':'moto';
cars.push({x:lanes[l],y:-120,passed:false,type:tipoSorteado,col:corSorteada});
}
}
if(now-lastCoin>650){lastCoin=now;let l=Math.floor(Math.random()*2);if(canSpawn(l))coins.push({x:lanes[l]+18,y:-20});}
if(now-lastNitro>4200){lastNitro=now;let l=Math.floor(Math.random()*2);if(canSpawn(l))nitros.push({x:lanes[l]+14,y:-30});}
if(now-lastMap>20000){lastMap=now;map=(map+1)%4;}
cars.forEach(c=>c.y+=vel*cfg.enemySpeed);coins.forEach(c=>c.y+=vel*0.9);nitros.forEach(n=>n.y+=vel*0.9);
cars=cars.filter(c=>c.y<860);coins=coins.filter(c=>c.y<800);nitros=nitros.filter(n=>n.y<800);
cars.forEach(c=>{
if(Math.abs(c.x-player.x)<30 && Math.abs(c.y-player.y)<62){
if(player.shield>0){player.shield--;cars.splice(cars.indexOf(c),1);beep(150,0.3);}
else{playing=false;beep(80,0.8);document.getElementById('menu').style.display='flex';document.getElementById('controls').style.display='none';document.getElementById('nitro').style.display='none';document.getElementById('nitro-label').style.display='none';document.getElementById('menu').innerHTML=`<h1>GAME OVER<br><b>${pts} PTS</b><br><b style='font-size:10px'>${dificuldade.toUpperCase()}</b></h1><div class=dev>DESENVOLVIDO POR IYAMADA-DEV</div><div class=btns><div class=mbtn y onclick=location.reload()>JOGAR DE NOVO</div></div>`;}
}else if(!c.passed && c.y>player.y){c.passed=true;pts+=50;}
});
coins.forEach((c,i)=>{if(Math.abs(c.x-player.x)<28 && Math.abs(c.y-player.y)<58){coins.splice(i,1);pts+=25;player.nitro=Math.min(100,player.nitro+10);beep(1400,0.06,'sine');}});
nitros.forEach((n,i)=>{if(Math.abs(n.x-player.x)<30 && Math.abs(n.y-player.y)<62){nitros.splice(i,1);player.nitro=Math.min(100,player.nitro+40);beep(600,0.25,'sawtooth');if(player.nitro>=100){player.boost=240;player.nitro=0;}}});
let m=maps[map];let g=X.createLinearGradient(0,0,0,200);g.addColorStop(0,m.sky[0]);g.addColorStop(1,m.sky[1]);X.fillStyle=g;X.fillRect(0,0,460,760);
X.fillStyle=m.side;X.fillRect(0,0,70,760);X.fillRect(390,0,70,760);X.fillStyle=m.road;X.fillRect(70,0,320,760);
X.fillStyle='#fff';for(let y=-40+off;y<760;y+=40)X.fillRect(226,y,8,24);
coins.forEach(c=>{X.fillStyle='#ffeb3b';X.beginPath();X.arc(c.x+12,c.y+12,11,0,Math.PI*2);X.fill();X.fillStyle='#000';X.font='bold 13px monospace';X.fillText('$',c.x+6,c.y+15);});
nitros.forEach(n=>{X.fillStyle='#00e5ff';X.fillRect(n.x,n.y,28,28);X.fillStyle='#fff';X.font='bold 14px monospace';X.fillText('N',n.x+7,n.y+19);});
cars.forEach(c=>{drawVehicle(c.x,c.y,c.col,c.type,false);});
drawVehicle(player.x,player.y,col,vehicle,true);
document.getElementById('pts').innerText=pts;
document.getElementById('vel').innerText=Math.floor(vel*14);
document.getElementById('mapName').innerText=m.name;
document.getElementById('difHud').innerText=dificuldade.toUpperCase();
document.getElementById('shield').innerText=player.shield;
document.getElementById('fill').style.height=player.nitro+'%';
requestAnimationFrame(loop);
}
document.getElementById('leftBtn').addEventListener('touchstart',e=>{e.preventDefault();moveLeft();},{passive:false});
document.getElementById('rightBtn').addEventListener('touchstart',e=>{e.preventDefault();moveRight();},{passive:false});
document.getElementById('leftBtn').addEventListener('click',moveLeft);
document.getElementById('rightBtn').addEventListener('click',moveRight);
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')moveLeft();if(e.key==='ArrowRight'||e.key==='d')moveRight();});
