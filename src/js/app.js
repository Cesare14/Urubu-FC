function closePl(){ST.epid=null;document.getElementById('modal-pl').style.display='none';}
function savePl(){
  const name=document.getElementById('mpl-name').value.trim();if(!name){document.getElementById('mpl-name').focus();return;}
  const pos=document.getElementById('mpl-pos').value,age=+document.getElementById('mpl-age').value||22,nat=document.getElementById('mpl-nat').value.trim()||'BRA',status=document.getElementById('mpl-status').value,nivel=+document.getElementById('mpl-nivel').value||nivelDef(status),valor=parseFloat(document.getElementById('mpl-valor').value)||0,foto=document.getElementById('mpl-foto').value.trim(),obs=document.getElementById('mpl-obs').value.trim(),selecionavel=mplSelVal;
  if(ST.epid!==null){const p=gp(ST.epid);if(p)Object.assign(p,{name,pos,age,nat,status,nivel,valor,foto,obs,selecionavel});}
  else ST.players.push({id:npi(),name,pos,age,nat,status,nivel,valor,foto,obs,selecionavel});
  closePl();save();render();
}

function openTgt(id){
  ST.etid=id||null;mtgtPrio=0;
  document.getElementById('modal-tgt').style.display='flex';
  document.getElementById('mtgt-title').textContent=id?'Editar Alvo':'Novo Alvo de Mercado';
  if(id){const t=gt(id);document.getElementById('mtgt-name').value=t.name;document.getElementById('mtgt-pos').value=t.pos;document.getElementById('mtgt-age').value=t.age||'';document.getElementById('mtgt-club').value=t.club||'';document.getElementById('mtgt-val').value=t.val||'';document.getElementById('mtgt-nivel').value=t.nivel||'';document.getElementById('mtgt-contract').value=t.contract||'';document.getElementById('mtgt-obs').value=t.obs||'';mtgtPrio=t.prio||0;}
  else{['mtgt-name','mtgt-club','mtgt-obs','mtgt-contract','mtgt-nivel'].forEach(function(x){document.getElementById(x).value='';});document.getElementById('mtgt-pos').value='CA';document.getElementById('mtgt-age').value='';document.getElementById('mtgt-val').value='';setTimeout(function(){document.getElementById('mtgt-name').focus();},50);}
  buildStarSelect();updateTmkt();
}
function buildStarSelect(){
  const wrap=document.getElementById('star-select');wrap.innerHTML='';
  // 3 yellow + 1 blue
  for(let i=1;i<=4;i++){
    const s=document.createElement('span');s.className='star';
    const isBlue=i===4;s.style.color=i<=mtgtPrio?(isBlue?'#60a5fa':'#f59e0b'):'var(--dark4)';
    s.textContent='★';s.dataset.v=i;
    s.onclick=function(){mtgtPrio=mtgtPrio===+s.dataset.v?0:+s.dataset.v;buildStarSelect();};
    wrap.appendChild(s);
  }
  const lbl=document.createElement('span');lbl.style.cssText='font-size:11px;color:var(--gray);margin-left:4px';lbl.textContent=mtgtPrio?prioLabel(mtgtPrio):'Nenhuma';wrap.appendChild(lbl);
}
function closeTgt(){ST.etid=null;document.getElementById('modal-tgt').style.display='none';}
function saveTgt(){
  const name=document.getElementById('mtgt-name').value.trim();if(!name){document.getElementById('mtgt-name').focus();return;}
  const pos=document.getElementById('mtgt-pos').value,age=+document.getElementById('mtgt-age').value||null,club=document.getElementById('mtgt-club').value.trim(),val=parseFloat(document.getElementById('mtgt-val').value)||null,nivel=+document.getElementById('mtgt-nivel').value||null,contract=document.getElementById('mtgt-contract').value.trim(),obs=document.getElementById('mtgt-obs').value.trim(),prio=mtgtPrio;
  if(ST.etid!==null){const t=gt(ST.etid);if(t)Object.assign(t,{name,pos,age,club,val,nivel,contract,obs,prio});}
  else ST.targets.push({id:nti(),name,pos,age,club,val,nivel,contract,obs,prio});
  closeTgt();save();renderMercado();renderBar();if(ST.rt==='analise')renderAnalise();
}
function updateTmkt(){const n=document.getElementById('mtgt-name').value.trim();document.getElementById('btn-tmkt').href='https://www.transfermarkt.com.br/schnellsuche/ergebnis/schnellsuche?query='+encodeURIComponent(n||'flamengo');}

function render(){renderFmTabs();renderField();renderBar();renderTable();renderMercado();initFilters();initSortBtns();if(ST.rt==='analise')renderAnalise();}

// EVENTS
document.querySelectorAll('[data-ft]').forEach(function(b){b.addEventListener('click',function(){ST.ft=b.dataset.ft;document.querySelectorAll('[data-ft]').forEach(function(x){x.classList.toggle('active',x===b);});document.getElementById('ftlbl').textContent={A:'Formação',B:'Formação — Reservas',C:'Formação — Projeção'}[ST.ft];renderFmTabs();renderField();renderBar();});});
document.querySelectorAll('[data-rt]').forEach(function(b){b.addEventListener('click',function(){ST.rt=b.dataset.rt;document.querySelectorAll('[data-rt]').forEach(function(x){x.classList.toggle('active',x===b);});document.getElementById('pane-elenco').style.display=ST.rt==='elenco'?'flex':'none';document.getElementById('pane-mercado').style.display=ST.rt==='mercado'?'flex':'none';document.getElementById('pane-analise').style.display=ST.rt==='analise'?'flex':'none';if(ST.rt==='analise')renderAnalise();});});
document.getElementById('btn-addpl').onclick=function(){openPl();};
document.getElementById('btn-addtgt').onclick=function(){openTgt();};
document.getElementById('btn-autofill').onclick=function(){autoFill(ST.ft);save();renderField();renderBar();renderTable();};
document.getElementById('btn-clear').onclick=function(){ST.slots[ST.ft]=Array(11).fill(null);save();renderField();renderBar();renderTable();};
document.getElementById('mpl-cancel').onclick=closePl;
document.getElementById('mpl-ok').onclick=savePl;
document.getElementById('modal-pl').onclick=function(e){if(e.target===e.currentTarget)closePl();};
document.getElementById('mpl-sel-toggle').onclick=function(){mplSelVal=!mplSelVal;this.classList.toggle('on',mplSelVal);document.getElementById('mpl-sel-lbl').textContent=mplSelVal?'Sim':'Não';};
document.getElementById('mtgt-cancel').onclick=closeTgt;
document.getElementById('mtgt-ok').onclick=saveTgt;
document.getElementById('modal-tgt').onclick=function(e){if(e.target===e.currentTarget)closeTgt();};
document.getElementById('mtgt-name').addEventListener('input',updateTmkt);
document.getElementById('si-search').oninput=function(e){ST.sf=e.target.value;renderTable();};
document.getElementById('tgt-search').oninput=function(e){ST.tsf=e.target.value;renderMercado();};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closePl();closeTgt();}if(e.key==='Enter'){if(document.getElementById('modal-pl').style.display!=='none')savePl();else if(document.getElementById('modal-tgt').style.display!=='none')saveTgt();}});

// ── TEMA CLARO / ESCURO ─────────────────────────────────────────────────────
(function initTheme(){
  var saved=localStorage.getItem('ufc_theme');
  var isLight=saved==='light';
  if(isLight)document.body.classList.add('light-mode');
  var btn=document.getElementById('btn-theme');
  if(btn)btn.textContent=isLight?'🌙':'☀️';
})();

document.getElementById('btn-theme').addEventListener('click',function(){
  var isLight=document.body.classList.toggle('light-mode');
  localStorage.setItem('ufc_theme',isLight?'light':'dark');
  this.textContent=isLight?'🌙':'☀️';
  // spin animation feedback
  this.style.animation='themeToggleSpin .4s ease';
  var self=this;
  setTimeout(function(){self.style.animation='';},420);
});

load();render();
