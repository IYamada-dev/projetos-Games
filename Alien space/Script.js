
const NAVE_B64="data:image/png;base64,[STRIPPED]";
const ALIEN_B64="data:image/png;base64,[STRIPPED]";
const imgPlayer=new Image(); imgPlayer.src=NAVE_B64;
const imgAlien=new Image(); imgAlien.src=ALIEN_B64;
function hasImg(i){return i&&i.complete&&i.naturalWidth>0}

const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
let keys={},score=0,lives=3,phase=1,gameState='menu',player,bullets=[],enemies=[],eBullets=[],particles=[],powerups=[],boss=null,powerType=null,powerTimer=0,leftHold=false,rightHold=false,shootHold=false;
const W=800,H=600;

class Player{
 constructor(){this.w=48;this.h=48;this.x=W/2-24;this.y=H-70;this.speed=6;this.cool=0;this.shield=0}
 update(){if(keys['a']||keys['ArrowLeft']||leftHold)this.x-=this.speed;if(keys['d']||keys['ArrowRight']||rightHold)this.x+=this.speed;this.x=Math.max(0,Math.min(W-this.w,this.x));if(this.cool>0)this.cool--;if(this.shield>0)this.shield--;}
 draw(){ctx.imageSmoothingEnabled=false;ctx.drawImage(imgPlayer,this.x,this.y,this.w,this.h);if(this.shield>0){ctx.strokeStyle=`rgba(212,255,50,${0.5+Math.sin(Date.now()/80)*0.3})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x+24,this.y+24,34,0,6.28);ctx.stroke();}}
 shoot(){if(this.cool>0)return;if(powerType==='double'){bullets.push(new Bullet(this.x+6,this.y,-0.8,-9));bullets.push(new Bullet(this.x+this.w-10,this.y,0.8,-9));}else{bullets.push(new Bullet(this.x+22,this.y,0,-10));}this.cool=12;}
}
class Bullet{constructor(x,y,vx,vy){this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.w=4;this.h=12;this.dead=false}update(){this.x+=this.vx;this.y+=this.vy;if(this.y<-20)this.dead=true}draw(){ctx.fillStyle='#F3F1EB';ctx.fillRect(this.x,this.y,this.w,this.h)}}
class EBill{constructor(x,y){this.x=x;this.y=y;this.w=4;this.h=10;this.dead=false}update(){this.y+=3+phase*0.3;if(this.y>H+20)this.dead=true}draw(){ctx.fillStyle='#FF4D4D';ctx.fillRect(this.x,this.y,this.w,this.h)}}
class Enemy{constructor(x,y){this.x=x;this.y=y;this.w=36;this.h=36;this.dead=false;this.cool=60+Math.random()*80}update(d,s){this.x+=d*s;this.cool--;if(this.cool<=0&&Math.random()<0.02){eBullets.push(new EBill(this.x+16,this.y+20));this.cool=80}}draw(){ctx.drawImage(imgAlien,this.x,this.y,this.w,this.h);}}
class Boss{constructor(){this.x=W/2-90;this.y=45;this.w=180;this.h=80;this.hp=200;this.max=200;this.dir=1.5;this.cool=0}update(){this.x+=this.dir;if(this.x<0||this.x>W-this.w)this.dir*=-1;if(--this.cool<=0){for(let i=0;i<6;i++)eBullets.push(new EBill(this.x+15+i*28,this.y+this.h));this.cool=35}}draw(){ctx.drawImage(imgAlien,this.x,this.y,this.w,this.h);ctx.fillStyle='#ffffff15';ctx.fillRect(this.x,this.y-12,this.w,6);ctx.fillStyle='#D4FF32';ctx.fillRect(this.x,this.y-12,this.w*(this.hp/this.max),6);}}
class PowerUp{constructor(x,y){this.x=x;this.y=y;this.w=20;this.h=20;this.vy=1.5;this.dead=false;this.t=['double','speed','shield'][Math.floor(Math.random()*3)]}update(){this.y+=this.vy;if(this.y>H+30)this.dead=true;if(this.x<player.x+player.w&&this.x+this.w>player.x&&this.y<player.y+player.h&&this.y+this.h>player.y){powerType=this.t;powerTimer=500;if(this.t==='speed')player.speed=9;if(this.t==='shield')player.shield=500;document.getElementById('power').innerText=this.t.toUpperCase();this.dead=true;}}draw(){ctx.strokeStyle='#D4FF32';ctx.strokeRect(this.x,this.y,this.w,this.h);ctx.fillStyle='#D4FF32';ctx.font='10px monospace';ctx.fillText(this.t[0].toUpperCase(),this.x+6,this.y+14)}}
function spawn(p){enemies=[];eBullets=[];powerups=[];boss=null;if(p<5){const rows=2+Math.floor(p*0.8),cols=7+Math.floor(p*0.6);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)enemies.push(new Enemy(60+c*68,60+r*46))}else{boss=new Boss()}}
function reset(){score=0;lives=3;phase=1;bullets=[];eBullets=[];particles=[];powerups=[];powerType=null;powerTimer=0;player=new Player();spawn(1);}
function startGame(){reset();gameState='playing';document.getElementById('start').classList.add('hide');document.getElementById('gameover').classList.add('hide');document.getElementById('win').classList.add('hide');requestAnimationFrame(loop);}
let dir=1,edge=0;
function loop(){
 if(gameState!=='playing')return;player.update();if(keys[' ']||shootHold)player.shoot();if(powerTimer>0&&--powerTimer<=0){powerType=null;player.speed=6;document.getElementById('power').innerText='—';}
 bullets.forEach(b=>b.update());eBullets.forEach(b=>b.update());powerups.forEach(p=>p.update());
 if(boss)boss.update();else{let hit=false;enemies.forEach(e=>{e.update(dir,0.6+phase*0.25);if(e.x<=0||e.x>=W-e.w)hit=true});if(hit&&edge<=0){dir*=-1;enemies.forEach(e=>e.y+=18);edge=10}if(edge>0)edge--;}
 bullets.forEach(b=>{
  if(boss&&b.x<boss.x+boss.w&&b.x+b.w>boss.x&&b.y<boss.y+boss.h&&b.y+b.h>boss.y){boss.hp--;b.dead=true;score+=25;if(boss.hp<=0){phase++;if(phase>5){winGame();return}spawn(phase)}}
  enemies.forEach(e=>{if(!e.dead&&b.x<e.x+e.w&&b.x+b.w>e.x&&b.y<e.y+e.h&&b.y+b.h>e.y){e.dead=true;b.dead=true;score+=10;if(Math.random()<0.12)powerups.push(new PowerUp(e.x,e.y));for(let i=0;i<6;i++)particles.push({x:e.x+18,y:e.y+18,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:18})}})
 });
 eBullets.forEach(b=>{if(b.x<player.x+player.w&&b.x+4>player.x&&b.y<player.y+player.h&&b.y+10>player.y){if(player.shield>0){b.dead=true;player.shield=0}else{b.dead=true;if(--lives<=0){gameOver();return}}}});
 enemies=enemies.filter(e=>!e.dead);bullets=bullets.filter(b=>!b.dead);eBullets=eBullets.filter(b=>!b.dead);powerups=powerups.filter(p=>!p.dead);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life--;});particles=particles.filter(p=>p.life>0);
 if(!boss&&enemies.length===0){phase++;if(phase>5){winGame();return}spawn(phase)}
 ctx.clearRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,0.1)';for(let i=0;i<40;i++)ctx.fillRect((i*137)%W,(i*251+Date.now()*0.02)%H,1,1);
 player.draw();bullets.forEach(b=>b.draw());eBullets.forEach(b=>b.draw());enemies.forEach(e=>e.draw());if(boss)boss.draw();powerups.forEach(p=>p.draw());
 particles.forEach(p=>{ctx.globalAlpha=p.life/18;ctx.fillStyle='#D4FF32';ctx.fillRect(p.x,p.y,2,2);ctx.globalAlpha=1});
 document.getElementById('phase').innerText=phase;document.getElementById('score').innerText=score;document.getElementById('lives').innerText=lives;
 requestAnimationFrame(loop);
}
function gameOver(){gameState='over';document.getElementById('finalScore').innerText=score;document.getElementById('gameover').classList.remove('hide');}
function winGame(){gameState='win';document.getElementById('winScore').innerText=score;document.getElementById('win').classList.remove('hide');}
window.addEventListener('keydown',e=>{keys[e.key]=true;keys[e.key.toLowerCase()]=true});window.addEventListener('keyup',e=>{keys[e.key]=false;keys[e.key.toLowerCase()]=false});
const bind=(id,d,u)=>{const el=document.getElementById(id);el.addEventListener('touchstart',d);el.addEventListener('touchend',u);el.addEventListener('mousedown',d);el.addEventListener('mouseup',u);};
bind('left',()=>leftHold=true,()=>leftHold=false);bind('right',()=>rightHold=true,()=>rightHold=false);bind('shoot',()=>shootHold=true,()=>shootHold=false);
