const canvas=document.getElementById('c'),ctx=canvas.getContext('2d'),W=1200,H=600;
let score=0,best=localStorage.getItem('jr_best')||0,speed=6,state='menu',frame=0;
let rabbit,obs=[],clouds=[],grass=[],day=0,pReady=false,pActive=false,pTime=0,nextP=0;
let soundOn=true, audioCtx=null;
document.getElementById('best').innerText=best;

document.getElementById('playBtn').onclick=()=>start();
document.getElementById('retryBtn').onclick=()=>start();
document.getElementById('powerBtn').onclick=()=>activate();
document.getElementById('soundBtn').onclick=()=>toggleSound();

function toggleSound(){soundOn=!soundOn;document.getElementById('soundBtn').innerText=soundOn?'🔊 SOM':'🔇 MUDO'}
function initAudio(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)()}
function beep(freq,dur,type='sine',vol=0.35){
 if(!soundOn||!audioCtx)return;
 const o=audioCtx.createOscillator();const g=audioCtx.createGain();
 o.type=type;o.frequency.value=freq;o.connect(g);g.connect(audioCtx.destination);
 g.gain.setValueAtTime(vol,audioCtx.currentTime);
 g.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+dur);
 o.start();o.stop(audioCtx.currentTime+dur);
}
function playJump(){beep(350,0.12,'sine',0.4);setTimeout(()=>beep(600,0.1,'sine',0.25),60)}
function playPower(){beep(200,0.15,'sawtooth',0.4);setTimeout(()=>beep(500,0.2,'sine',0.4),80);setTimeout(()=>beep(900,0.4,'sine',0.4),180)}
function playDead(){beep(250,0.3,'square',0.5);setTimeout(()=>beep(120,0.5,'square',0.5),150)}
function playScore(){beep(1000,0.08,'sine',0.2)}
function AABB(a,b){return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y}

class Rabbit{
 constructor(){this.x=180;this.y=H-140;this.w=58;this.h=44;this.vy=0;this.g=true}
 box(){return {x:this.x+14,y:this.y+12,w:30,h:26}}
 update(){this.vy+=0.7;this.y+=this.vy;if(this.y>=H-140){this.y=H-140;this.vy=0;this.g=true}else this.g=false}
 jump(){if(!this.g)return;this.vy=pActive?-23:-16;this.g=false;playJump()}
 draw(){
  ctx.save();ctx.translate(this.x+this.w/2,this.y+this.h/2);
  if(pActive){ctx.shadowColor='#FFE066';ctx.shadowBlur=20;ctx.globalAlpha=0.85+Math.sin(frame*0.5)*0.15}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,0,26,16,0,0,6.28);ctx.fill();
  ctx.fillStyle='#8B5A2B';ctx.beginPath();ctx.ellipse(-6,-2,14,10,0,0,6.28);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(12,-8,14,12,0,0,6.28);ctx.fill();
  ctx.fillStyle='#000';ctx.beginPath();ctx.arc(18,-10,3,0,6.28);ctx.fill();
  ctx.fillStyle='#FFB6C1';ctx.beginPath();ctx.ellipse(4,-14,5,16,0.2,0,6.28);ctx.ellipse(10,-14,5,16,-0.2,0,6.28);ctx.fill();
  ctx.restore();
 }
}
class Obs{
 constructor(){this.x=W+20;this.y=H-120;this.w=36;this.h=44;this.dead=false}
 box(){return {x:this.x+6,y:this.y+14,w:this.w-12,h:this.h-14}}
 update(){this.x-=speed;this.dead=this.x<-100}
 draw(){
  ctx.save();ctx.translate(this.x,this.y);
  ctx.fillStyle='#FF6B2B';ctx.beginPath();ctx.moveTo(this.w/2,0);ctx.lineTo(this.w,this.h*0.7);ctx.lineTo(this.w/2,this.h);ctx.lineTo(0,this.h*0.7);ctx.closePath();ctx.fill();
  ctx.fillStyle='#2A9D5A';ctx.beginPath();ctx.moveTo(this.w/2,-12);ctx.lineTo(2,-4);ctx.lineTo(10,-18);ctx.lineTo(this.w/2-2,-6);ctx.lineTo(this.w-10,-18);ctx.lineTo(this.w-2,-4);ctx.closePath();ctx.fill();
  ctx.restore();
 }
}
function init(){clouds=[];for(let i=0;i<8;i++)clouds.push({x:Math.random()*W,y:40+Math.random()*130,s:0.3+Math.random()*0.7,w:60+Math.random()*40});grass=[];for(let i=0;i<110;i++)grass.push({x:i*13,y:H-96+Math.random()*8,h:6+Math.random()*10})}
function start(){initAudio();score=0;speed=6;obs=[];frame=0;day=0;pReady=false;pActive=false;pTime=0;nextP=300;rabbit=new Rabbit();init();document.getElementById('start').classList.add('hide');document.getElementById('over').classList.add('hide');document.getElementById('powerBtn').classList.remove('active');state='play';requestAnimationFrame(loop)}
function activate(){if(!pReady)return;pActive=true;pTime=180;pReady=false;document.getElementById('powerBtn').classList.remove('active');playPower()}
function loop(){
 if(state!=='play')return;frame++;day+=0.002;if(day>1)day=0;score+=0.25;let si=Math.floor(score);
 if(si>0 && si%100==0 && Math.floor((score-0.25))%100!=0)playScore();
 document.getElementById('sc').innerText=si;document.getElementById('bar').style.width=(pActive?pTime/180*100:0)+'%';
 speed=6+Math.floor(si/100)*0.8;
 if(frame>=nextP && !pReady && !pActive){pReady=true;document.getElementById('powerBtn').classList.add('active');nextP=frame+300}
 if(pActive){pTime--;if(pTime<=0)pActive=false}
 if(frame%Math.max(55,110-Math.floor(speed*6))==0)obs.push(new Obs());
 rabbit.update();obs.forEach(o=>o.update());obs=obs.filter(o=>!o.dead);clouds.forEach(c=>{c.x-=speed*c.s*0.2;if(c.x<-120)c.x=W+50});
 if(!pActive){for(let o of obs){if(AABB(rabbit.box(),o.box())){playDead();state='over';if(si>best){best=si;localStorage.setItem('jr_best',best);document.getElementById('best').innerText=best}document.getElementById('final').innerText=si;document.getElementById('over').classList.remove('hide');return;}}}
 let isDay=Math.sin(day*Math.PI*2)>0;let t=(Math.sin(day*Math.PI*2)+1)/2;
 let r=Math.floor(10+t*125),g=Math.floor(25+t*181),b=Math.floor(49+t*186);
 canvas.style.background=`rgb(${r},${g},${b})`;
 ctx.clearRect(0,0,W,H);
 let sx=W*0.8+Math.cos(day*Math.PI*2)*W*0.3,sy=120+Math.sin(day*Math.PI*2)*90;
 ctx.fillStyle=isDay?'#FFE066':'#EDEEF7';ctx.beginPath();ctx.arc(sx,sy,isDay?34:26,0,6.28);ctx.fill();
 ctx.fillStyle=isDay?'rgba(255,255,255,.9)':'rgba(255,255,255,.15)';clouds.forEach(c=>{ctx.beginPath();ctx.ellipse(c.x,c.y,c.w,14,0,0,6.28);ctx.fill()});
 ctx.fillStyle=isDay?'#7AC74F':'#2A4A2E';ctx.fillRect(0,H-100,W,100);
 ctx.fillStyle=isDay?'#5FB233':'#1D3522';grass.forEach(gr=>{let x=gr.x-(frame*speed)%13;ctx.fillRect(x,gr.y,3,gr.h)});
 ctx.fillStyle='#2A3A2E';ctx.fillRect(0,H-100,W,4);
 obs.forEach(o=>o.draw());rabbit.draw();requestAnimationFrame(loop)
}
window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){initAudio();rabbit&&rabbit.jump();e.preventDefault()}});
canvas.addEventListener('touchstart',()=>{initAudio();rabbit&&rabbit.jump()});
canvas.addEventListener('mousedown',()=>{initAudio();rabbit&&rabbit.jump()});
