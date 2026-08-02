import pkg from '/opt/node22/lib/node_modules/playwright/index.js'; const { chromium } = pkg;
import { writeFileSync, mkdirSync, rmSync } from 'fs';
const base='/tmp/claude-0/-home-user-saaspsicologia/d1a94b43-68f8-50b0-b955-37c3429067bd/scratchpad';
const fdir=base+'/frames'; rmSync(fdir,{recursive:true,force:true}); mkdirSync(fdir,{recursive:true});
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1920,height:1080}}); const err=[];
p.on('pageerror',e=>err.push(e.message));
await p.setContent('<canvas id="tela" width="1920" height="1080"></canvas><style>html,body{margin:0;background:transparent}</style>',{waitUntil:'load'});

const N = await p.evaluate(() => {
  const cv=document.getElementById('tela'), C=cv.getContext('2d'), W=1920,H=1080;
  // ORDEM CRESCENTE: index 0 => nº1 ... index 11 => nº12
  const ARM=[
    'A dor de pagar','O viés do presente','Compra por impulso','Assinaturas fantasma',
    'Gasto formiga','Ancoragem e promoções','A comparação social','Aversão à perda',
    'O efeito avestruz','Inflação do estilo de vida','A conta mental do bônus','O seu "eu do futuro"'
  ];
  const GOLD='#FFD700';
  const INTRO=1600, CARD=1500; window._INTRO=INTRO; window._CARD=CARD; window._ARM=ARM;
  const TOTAL=INTRO+ARM.length*CARD+400; window._TOTAL=TOTAL;
  const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
  const back=t=>{const s=1.7;t=Math.min(1,Math.max(0,t));return 1+(s+1)*Math.pow(t-1,3)+s*Math.pow(t-1,2);};

  function card(n,title,local){
    const inA=ease(local/380), out=local>CARD-260?ease((local-(CARD-260))/260):0;
    const sc=0.62+0.38*back(local/420)-out*0.06;
    const alpha=Math.min(inA,1)*(1-out);
    C.save(); C.globalAlpha=alpha; C.textAlign='center';
    C.font='700 46px Arial'; C.fillStyle=GOLD; C.shadowColor=GOLD; C.shadowBlur=24;
    C.fillText('A R M A D I L H A', W/2, 300); C.shadowBlur=0;
    C.save(); C.translate(W/2,600); C.scale(sc,sc);
    C.font='900 380px Arial'; C.textBaseline='middle';
    C.shadowColor=GOLD; C.shadowBlur=60; C.fillStyle=GOLD;
    C.fillText('#'+n,0,0);
    C.lineWidth=7; C.strokeStyle='rgba(80,55,0,0.9)'; C.strokeText('#'+n,0,0);
    C.restore(); C.textBaseline='alphabetic';
    C.font='800 76px Arial'; C.fillStyle=GOLD; C.lineWidth=5; C.strokeStyle='rgba(40,28,0,0.85)';
    C.strokeText(title,W/2,900); C.fillText(title, W/2, 900);
    C.restore();
    const feitos=n, total=12, gap=54, x0=W/2-(total-1)*gap/2;
    for(let i=0;i<total;i++){ C.beginPath(); C.arc(x0+i*gap,1010,10,0,7); C.fillStyle=i<feitos?GOLD:'rgba(255,215,0,0.22)'; C.fill(); }
  }
  function intro(local){
    const a=ease(local/500)*(local>INTRO-350?ease((INTRO-local)/350):1);
    C.save(); C.globalAlpha=a; C.textAlign='center';
    C.font='900 150px Arial'; C.fillStyle=GOLD; C.shadowColor=GOLD; C.shadowBlur=40;
    C.lineWidth=6; C.strokeStyle='rgba(40,28,0,0.8)';
    C.strokeText('AS 12 ARMADILHAS',W/2,520); C.fillText('AS 12 ARMADILHAS', W/2, 520); C.shadowBlur=0;
    C.font='800 66px Arial'; C.fillText('do seu dinheiro', W/2, 620);
    C.restore();
  }
  window.frame=(t)=>{
    C.clearRect(0,0,W,H); // FUNDO TRANSPARENTE
    if(t<INTRO){ intro(t); return; }
    let tt=t-INTRO; const idx=Math.min(ARM.length-1, Math.floor(tt/CARD)); const local=tt-idx*CARD;
    card(idx+1, ARM[idx], local);
    C.textAlign='right'; C.font='800 40px Arial'; C.fillStyle='rgba(255,215,0,0.55)';
    C.fillText('SURTO FINANCEIRO', W-60, H-50); C.textAlign='center';
  };
  return Math.ceil(TOTAL/1000*30);
});

for(let i=0;i<N;i++){
  const durl=await p.evaluate((i)=>{ window.frame(i/30*1000); return document.getElementById('tela').toDataURL('image/png'); }, i);
  writeFileSync(`${fdir}/f${String(i).padStart(5,'0')}.png`, Buffer.from(durl.split(',')[1],'base64'));
}
console.log('FRAMES:', N, '| ERROS:', err.length?err:'nenhum'); await b.close();
