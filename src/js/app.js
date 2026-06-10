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

// ── CARREGAR ESCALAÇÃO VIA HASH ──────────────────────────────────────────────
(function _carregarHashEscalacao(){
  var hash=window.location.hash;
  if(!hash||hash.indexOf('#d=')!==0)return;

  // 1. Limite de tamanho — ignorar silenciosamente se muito grande
  if(hash.length>50000)return;

  var json='';
  try{json=decodeURIComponent(hash.slice(3));}catch(e){return;}

  var dados;
  try{dados=JSON.parse(json);}catch(e){return;}

  // 2. Validação de schema — ignorar silenciosamente se inválido
  if(!dados||typeof dados!=='object'||Array.isArray(dados))return;
  if(!Array.isArray(dados.players))return;
  if(!dados.fmt||typeof dados.fmt!=='object'||Array.isArray(dados.fmt))return;

  var TEXT_FIELDS=['name','obs','club','nat'];
  var MAX_TEXT=100;
  var schemaOk=dados.players.every(function(p){
    if(!p||typeof p!=='object')return false;
    return TEXT_FIELDS.every(function(f){
      if(!(f in p))return true; // campo ausente é permitido
      return typeof p[f]==='string'&&p[f].length<=MAX_TEXT;
    });
  });
  if(!schemaOk)return;

  // 3. Sanitização de campos de texto via sanitizeText() (definida em roster.js)
  dados.players=dados.players.map(function(p){
    var clone={};
    Object.keys(p).forEach(function(k){
      clone[k]=TEXT_FIELDS.indexOf(k)!==-1?sanitizeText(String(p[k])):p[k];
    });
    return clone;
  });

  // Limpar hash da URL sem recarregar a página
  history.replaceState(null,'',window.location.pathname+window.location.search);

  // Carregar o estado real do usuário primeiro (sem renderizar)
  load();

  // Guardar backup do estado real do usuário em memória
  var _localBackup={
    players:  JSON.parse(JSON.stringify(ST.players||[])),
    slots:    JSON.parse(JSON.stringify(ST.slots||{})),
    fmt:      JSON.parse(JSON.stringify(ST.fmt||{})),
    slotsByFmt: JSON.parse(JSON.stringify(ST.slotsByFmt||{})),
    customPos:  JSON.parse(JSON.stringify(ST.customPos||{}))
  };

  // Sobrescrever estado em memória com o recebido (sem salvar no localStorage)
  if(dados.players)   ST.players=dados.players;
  if(dados.slots)     ST.slots=dados.slots;
  if(dados.fmt)       ST.fmt=dados.fmt;
  if(dados.slotsByFmt)ST.slotsByFmt=dados.slotsByFmt;
  if(dados.customPos) ST.customPos=dados.customPos;

  // Exibir banner de aviso
  var banner=document.createElement('div');
  banner.id='shared-banner';
  banner.style.cssText=[
    'position:fixed','bottom:0','left:0','right:0','z-index:9999',
    'background:#b91c1c','color:#fff','text-align:center',
    'padding:10px 16px','font-size:14px','display:flex',
    'align-items:center','justify-content:center','gap:12px',
    'box-shadow:0 -2px 8px rgba(0,0,0,.5)'
  ].join(';');
  var texto=document.createElement('span');
  texto.textContent='👁 Você está vendo a escalação de outra pessoa.';
  var btn=document.createElement('button');
  btn.textContent='Carregar minha escalação';
  btn.style.cssText=[
    'background:#fff','color:#b91c1c','border:none','border-radius:6px',
    'padding:5px 12px','font-size:13px','font-weight:700',
    'cursor:pointer','white-space:nowrap'
  ].join(';');
  btn.onclick=function(){
    ST.players=_localBackup.players;
    ST.slots=_localBackup.slots;
    ST.fmt=_localBackup.fmt;
    ST.slotsByFmt=_localBackup.slotsByFmt;
    ST.customPos=_localBackup.customPos;
    banner.remove();
    render();
  };
  banner.appendChild(texto);
  banner.appendChild(btn);
  document.body.appendChild(banner);

  render();
  return;
})();

// Inicialização padrão (executada apenas quando não há hash de escalação)
if(!document.getElementById('shared-banner')){load();render();}
// Bottom sheet compartilhar
document.getElementById('btn-share-menu').addEventListener('click',function(){
  document.getElementById('share-menu-sheet').style.display='block';
  document.getElementById('share-menu-overlay').style.display='block';
});
function fecharShareMenu(){
  document.getElementById('share-menu-sheet').style.display='none';
  document.getElementById('share-menu-overlay').style.display='none';
}
document.getElementById('btn-share-menu-close').addEventListener('click',fecharShareMenu);
document.getElementById('share-menu-overlay').addEventListener('click',fecharShareMenu);
document.getElementById('btn-share-site-opt').addEventListener('click',function(){
  fecharShareMenu();
  compartilharLinkLimpo();
});
document.getElementById('btn-share-team-opt').addEventListener('click',function(){
  fecharShareMenu();
  compartilharLinkEscalacao();
});
// ────────────────────────────────────────────────────────────────────────────
