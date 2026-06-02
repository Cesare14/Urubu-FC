function idadeColor(v){
  if(v<=26)return'#60a5fa';   // jovem
  if(v<=29)return'#22c55e';   // equilibrado
  if(v<=32)return'#f59e0b';   // experiente
  return'#ef4444';             // envelhecido
}
function nivelBadge(v){
  if(v>=80)return{icon:'↑',label:'Excelente',bg:'rgba(96,165,250,.15)',col:'#60a5fa'};
  if(v>=70)return{icon:'↑',label:'Bom',bg:'rgba(34,197,94,.15)',col:'#22c55e'};
  if(v>=60)return{icon:'→',label:'Médio',bg:'rgba(245,158,11,.15)',col:'#f59e0b'};
  return{icon:'↓',label:'Preocupante',bg:'rgba(239,68,68,.15)',col:'#ef4444'};
}
function idadeBadge(v){
  if(v<=26)return{icon:'★',label:'Jovem',bg:'rgba(96,165,250,.15)',col:'#60a5fa'};
  if(v<=29)return{icon:'✓',label:'Equilibrado',bg:'rgba(34,197,94,.15)',col:'#22c55e'};
  if(v<=32)return{icon:'→',label:'Experiente',bg:'rgba(245,158,11,.15)',col:'#f59e0b'};
  return{icon:'↓',label:'Envelhecido',bg:'rgba(239,68,68,.15)',col:'#ef4444'};
}

// cores por seleção nacional — duplas via gradiente CSS
var NAT_COLORS={
  'BRA':'linear-gradient(90deg,#009c3b 55%,#ffdf00 55%)',
  'ARG':'linear-gradient(90deg,#74acdf 55%,#222 55%)',
  'COL':'linear-gradient(90deg,#fcd116 50%,#ce1126 50%)',
  'CHI':'linear-gradient(90deg,#d52b1e 55%,#f0f0f0 55%)',
  'ESP':'linear-gradient(90deg,#c60b1e 30%,#f1bf00 30% 70%,#c60b1e 70%)',
  'EQU':'linear-gradient(90deg,#003893 50%,#e40000 50%)',
  'URU':'linear-gradient(90deg,#5590cc 55%,#f0f0f0 55%)',
  'ITA':'linear-gradient(90deg,#009246 33%,#f0f0f0 33% 66%,#ce2b37 66%)',
  'POR':'linear-gradient(90deg,#006600 40%,#ff0000 40%)',
  'FRA':'linear-gradient(90deg,#002395 33%,#f0f0f0 33% 66%,#ed2939 66%)',
  'ALE':'linear-gradient(90deg,#222 33%,#dd0000 33% 66%,#ffce00 66%)',
  'ENG':'linear-gradient(135deg,#cf142b 40%,#f0f0f0 40%)',
};
function natGradient(nat){return NAT_COLORS[nat]||null;}
var NAT_SOL={'BRA':'#22c55e','ARG':'#74acdf','COL':'#fcd116','CHI':'#d52b1e','ESP':'#c60b1e','EQU':'#003893','URU':'#5590cc','ITA':'#009246','POR':'#006600','FRA':'#002395','ALE':'#222','ENG':'#cf142b'};
function natColor(nat){return NAT_SOL[nat]||PIE_COLS[nat?nat.charCodeAt(0)%PIE_COLS.length:0];}

// ─── ícones de posição ────────────────────────────────────────────
var POS_ICONS={GOL:'🥅',ZAG:'🛡️',LD:'➡️',LE:'⬅️',VOL:'⚙️',MEI:'🎯',PD:'⚡',PE:'⚡',CA:'⚽'};

// ─── desenho do pie ───────────────────────────────────────────────
function hexDarken(hex,amt){
  // amt 0-1: quanto escurecer. Suporta hex #rrggbb e nomes simples.
  try{
    var c=hex.replace('#','');
    if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    var r=Math.max(0,parseInt(c.slice(0,2),16)-Math.round(amt*255));
    var g=Math.max(0,parseInt(c.slice(2,4),16)-Math.round(amt*255));
    var b=Math.max(0,parseInt(c.slice(4,6),16)-Math.round(amt*255));
    return'rgb('+r+','+g+','+b+')';
  }catch(e){return hex;}
}
function drawPie(canvas,data,colors){
  const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,r=Math.min(W,H)/2-4;
  ctx.clearRect(0,0,W,H);
  const total=data.reduce(function(a,b){return a+b.val;},0);if(!total)return;
  let angle=-Math.PI/2;
  data.forEach(function(d,i){
    const slice=(d.val/total)*2*Math.PI;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+slice);ctx.closePath();
    ctx.fillStyle=colors[i%colors.length];ctx.fill();
    // borda da cor do segmento, mais escura
    ctx.strokeStyle=hexDarken(colors[i%colors.length],.35);ctx.lineWidth=2;ctx.stroke();
    angle+=slice;
  });
  // anel externo sutil
  ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);
  ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;ctx.stroke();
}

// ─── barChart v8 ─────────────────────────────────────────────────
// opts: {primary, tooltipFn, icon, customColors}
function barChart(parent,data,maxVal,colors,numFmt,opts){
  opts=opts||{};
  data.forEach(function(d,i){
    const pct=maxVal?Math.round(d.val/maxVal*100):0;
    const row=document.createElement('div');row.className='bar-row';

    // label
    const lbl=document.createElement('span');lbl.className='bar-lbl';lbl.title=d.lbl;
    if(opts.icon&&POS_ICONS[d.lbl]){
      const ico=document.createElement('span');ico.className='bar-pos-icon';ico.textContent=POS_ICONS[d.lbl];lbl.appendChild(ico);
    }
    const lt=document.createElement('span');lt.textContent=d.lbl;lbl.appendChild(lt);

    // track
    const track=document.createElement('div');
    track.className='bar-track '+(opts.primary?'primary':'secondary');

    // fill — animation via CSS
    const fill=document.createElement('div');fill.className='bar-fill';
    const col=d.customColor||(Array.isArray(colors)?(colors[i%colors.length]):(colors||'#60a5fa'));
    fill.style.background=col;
    fill.style.setProperty('--target-width',pct+'%');
    fill.style.width='0';
    track.appendChild(fill);

    // num
    const num=document.createElement('span');num.className='bar-num';num.textContent=numFmt?numFmt(d.val):d.val;

    // tooltip
    const tip=document.createElement('div');tip.className='bar-tooltip';tip.textContent=opts.tooltipFn?opts.tooltipFn(d):(numFmt?numFmt(d.val):d.val);

    row.appendChild(lbl);row.appendChild(track);row.appendChild(num);row.appendChild(tip);
    parent.appendChild(row);

    // trigger animation
    requestAnimationFrame(function(){requestAnimationFrame(function(){fill.style.transition='width .6s cubic-bezier(.25,.46,.45,.94)';fill.style.width=pct+'%';});});
  });
}

// ─── pieChart ────────────────────────────────────────────────────
function pieChart(parent,data,colors){
  const canvas=document.createElement('canvas');canvas.className='pie-canvas';canvas.width=140;canvas.height=140;parent.appendChild(canvas);
  drawPie(canvas,data,colors);
  const leg=document.createElement('div');leg.className='pie-legend';
  data.forEach(function(d,i){
    const li=document.createElement('div');li.className='pie-leg-item';
    const dot=document.createElement('div');dot.className='pie-leg-dot';dot.style.background=colors[i%colors.length];
    const txt=document.createElement('span');txt.textContent=d.lbl+': '+d.val+(d.unit?' '+d.unit:'');
    li.appendChild(dot);li.appendChild(txt);leg.appendChild(li);
  });
  parent.appendChild(leg);
}

// ─── toggleChart / makeCard ───────────────────────────────────────
function toggleChart(cardEl,type,buildFn){
  const cont=cardEl.querySelector('.chart-content');cont.innerHTML='';buildFn(cont,type);
}
function makeCard(full,title,types,buildFn){
  const c=document.createElement('div');c.className='acard'+(full?' full':'');
  const trow=document.createElement('div');trow.className='atitle';
  const tlbl=document.createElement('span');tlbl.textContent=title;trow.appendChild(tlbl);
  // controles da direita (toggle + compartilhar)
  const tright=document.createElement('div');tright.style.cssText='display:flex;align-items:center;gap:6px';
  if(types&&types.length>1){
    const btns=document.createElement('div');btns.className='chart-toggle';
    types.forEach(function(t,idx){
      const b=document.createElement('button');b.className='ct-btn'+(idx===0?' active':'');
      b.textContent=t==='bar'?'Barras':'Pizza';
      b.onclick=function(){btns.querySelectorAll('.ct-btn').forEach(function(x){x.classList.remove('active');});b.classList.add('active');toggleChart(c,t,buildFn);};
      btns.appendChild(b);
    });
    tright.appendChild(btns);
  }
  // botão compartilhar individual
  const sbtn=document.createElement('button');
  sbtn.className='btn-share';sbtn.title='Compartilhar este gráfico';
  sbtn.style.cssText='padding:3px 7px;font-size:10px;gap:3px';
  sbtn.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>📸';
  sbtn.onclick=function(){compartilharCardAnalise(c,title);};
  tright.appendChild(sbtn);
  trow.appendChild(tright);
  c.appendChild(trow);
  const cont=document.createElement('div');cont.className='chart-content';c.appendChild(cont);
  buildFn(cont,types?types[0]:'bar');
  return c;
}

// ─── hero number block ────────────────────────────────────────────
function heroBlock(cont,num,unit,badgeData,ctx){
  const hero=document.createElement('div');hero.className='a-hero';
  const n=document.createElement('div');n.className='a-hero-num';n.style.color=badgeData.col;n.textContent=num;
  const right=document.createElement('div');right.className='a-hero-right';
  const u=document.createElement('div');u.className='a-hero-unit';u.textContent=unit;
  const badge=document.createElement('div');badge.className='a-hero-badge';
  badge.style.cssText='background:'+badgeData.bg+';color:'+badgeData.col;
  badge.textContent=badgeData.icon+' '+badgeData.label;
  right.appendChild(u);right.appendChild(badge);
  hero.appendChild(n);hero.appendChild(right);
  cont.appendChild(hero);
  if(ctx){const c=document.createElement('div');c.className='a-ctx';c.textContent=ctx;cont.appendChild(c);}
}

// ─── separator + block label ──────────────────────────────────────
function sep(cont){const hr=document.createElement('hr');hr.className='a-sep';cont.appendChild(hr);}
function blkLbl(cont,txt){const d=document.createElement('div');d.className='a-block-lbl';d.textContent=txt;cont.appendChild(d);}

// ─── renderAnalise v8 ─────────────────────────────────────────────
