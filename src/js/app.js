// ─── validação de input (Nível/Valor) ──────────────────────────────
function clampNivel(v){var n=parseInt(v,10);if(v===''||isNaN(n)||n<0||n>100)return null;return n;}
function clampValor(v){var n=parseFloat(v);if(v===''||isNaN(n)||n<0||n>999)return null;return n;}
function bindNumericGuard(id,clampFn){
  var el=document.getElementById(id);if(!el)return;
  el.addEventListener('focus',function(){el.dataset.lastValid=el.value;});
  el.addEventListener('blur',function(){
    if(el.value==='')return;
    var v=clampFn(el.value);
    if(v===null)el.value=el.dataset.lastValid||'';
    else{el.value=v;el.dataset.lastValid=v;}
  });
}

function closePl(){ST.epid=null;document.getElementById('modal-pl').style.display='none';}
function savePl(){
  const name=sanitizeText(document.getElementById('mpl-name').value.trim());if(!name){document.getElementById('mpl-name').focus();return;}
  const pos=document.getElementById('mpl-pos').value,age=+document.getElementById('mpl-age').value||22,nat=sanitizeText(document.getElementById('mpl-nat').value.trim()||'BRA'),status=document.getElementById('mpl-status').value,_nivelC=clampNivel(document.getElementById('mpl-nivel').value),nivel=_nivelC===null?nivelDef(status):_nivelC,_valorC=clampValor(document.getElementById('mpl-valor').value),valor=_valorC===null?0:_valorC,foto=document.getElementById('mpl-foto').value.trim(),obs=sanitizeText(document.getElementById('mpl-obs').value.trim()),selecionavel=mplSelVal;
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
  const name=sanitizeText(document.getElementById('mtgt-name').value.trim());if(!name){document.getElementById('mtgt-name').focus();return;}
  const pos=document.getElementById('mtgt-pos').value,age=+document.getElementById('mtgt-age').value||null,club=sanitizeText(document.getElementById('mtgt-club').value.trim()),val=clampValor(document.getElementById('mtgt-val').value),nivel=clampNivel(document.getElementById('mtgt-nivel').value),contract=sanitizeText(document.getElementById('mtgt-contract').value.trim()),obs=sanitizeText(document.getElementById('mtgt-obs').value.trim()),prio=mtgtPrio;
  if(ST.etid!==null){const t=gt(ST.etid);if(t)Object.assign(t,{name,pos,age,club,val,nivel,contract,obs,prio});}
  else ST.targets.push({id:nti(),name,pos,age,club,val,nivel,contract,obs,prio});
  closeTgt();save();renderMercado();renderBar();if(ST.rt==='analise')renderAnalise();
}
function updateTmkt(){const n=document.getElementById('mtgt-name').value.trim();document.getElementById('btn-tmkt').href='https://www.transfermarkt.com.br/schnellsuche/ergebnis/schnellsuche?query='+encodeURIComponent(n||'flamengo');}

function render(){renderFmTabs();renderFmtsDropdownBtn();renderField();renderBar();renderTable();renderMercado();initFilters();initSortBtns();if(ST.rt==='analise')renderAnalise();}

// EVENTS
document.querySelectorAll('[data-ft]').forEach(function(b){b.addEventListener('click',function(){ST.ft=b.dataset.ft;document.querySelectorAll('[data-ft]').forEach(function(x){x.classList.toggle('active',x===b);});fecharPopFuncao();renderFmTabs();renderField();renderBar();});});
document.querySelectorAll('[data-rt]').forEach(function(b){b.addEventListener('click',function(){ST.rt=b.dataset.rt;document.querySelectorAll('[data-rt]').forEach(function(x){x.classList.toggle('active',x===b);});document.getElementById('pane-elenco').style.display=ST.rt==='elenco'?'flex':'none';document.getElementById('pane-mercado').style.display=ST.rt==='mercado'?'flex':'none';document.getElementById('pane-analise').style.display=ST.rt==='analise'?'flex':'none';if(ST.rt==='analise')renderAnalise();});});
document.getElementById('btn-addpl').onclick=function(){openPl();};
document.getElementById('btn-addtgt').onclick=function(){openTgt();};
document.getElementById('btn-export-roster').onclick=exportRoster;
document.getElementById('btn-import-roster').onclick=importRoster;
document.getElementById('import-roster-input').addEventListener('change',handleImportFile);
document.getElementById('mpl-cancel').onclick=closePl;
document.getElementById('mpl-ok').onclick=savePl;
document.getElementById('mpl-delete').onclick=function(){if(ST.epid!==null)deletePlayerById(ST.epid);};
document.getElementById('modal-pl').onclick=function(e){if(e.target===e.currentTarget)closePl();};
document.getElementById('mpl-sel-toggle').onclick=function(){mplSelVal=!mplSelVal;this.classList.toggle('on',mplSelVal);document.getElementById('mpl-sel-lbl').textContent=mplSelVal?'Sim':'Não';};
document.getElementById('btn-fmts').onclick=abrirModalFmts;
document.getElementById('mfmts-close').onclick=fecharModalFmts;
document.getElementById('modal-fmts').onclick=function(e){if(e.target===e.currentTarget)fecharModalFmts();};
document.getElementById('mtgt-cancel').onclick=closeTgt;
document.getElementById('mtgt-ok').onclick=saveTgt;
document.getElementById('modal-tgt').onclick=function(e){if(e.target===e.currentTarget)closeTgt();};
document.getElementById('mtgt-name').addEventListener('input',updateTmkt);
bindNumericGuard('mpl-nivel',clampNivel);
bindNumericGuard('mpl-valor',clampValor);
bindNumericGuard('mtgt-nivel',clampNivel);
bindNumericGuard('mtgt-val',clampValor);
document.getElementById('si-search').oninput=function(e){ST.sf=e.target.value;renderTable();};
document.getElementById('tgt-search').oninput=function(e){ST.tsf=e.target.value;renderMercado();};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closePl();closeTgt();fecharPopFuncao();fecharModalFmts();}if(e.key==='Enter'){if(document.getElementById('modal-pl').style.display!=='none')savePl();else if(document.getElementById('modal-tgt').style.display!=='none')saveTgt();}});

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

  // Formações customizadas recebidas: validadas uma a uma (11 slots,
  // coordenadas 0–100 e função dentro das 9 de POSITIONS). Qualquer formação
  // fora do padrão é descartada em silêncio, como o resto deste bloco já faz.
  var _fmtsRecebidas=validarCustomFmts(dados.customFmts);

  // customFn recebido: só sobreposições de função válidas (slot 0–10 +
  // posição conhecida). Chave inesperada é ignorada.
  var _fnRecebido={};
  if(dados.customFn&&typeof dados.customFn==='object'&&!Array.isArray(dados.customFn)){
    Object.keys(dados.customFn).forEach(function(k){
      var v=dados.customFn[k];
      if(!v||typeof v!=='object'||Array.isArray(v))return;
      var limpo={};
      Object.keys(v).forEach(function(i){
        var idx=parseInt(i,10);
        if(isNaN(idx)||idx<0||idx>10)return;
        if(POSITIONS.indexOf(v[i])===-1)return;
        limpo[idx]=v[i];
      });
      if(Object.keys(limpo).length)_fnRecebido[k]=limpo;
    });
  }

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
    customPos:  JSON.parse(JSON.stringify(ST.customPos||{})),
    customFn:   JSON.parse(JSON.stringify(ST.customFn||{})),
    customFmts: JSON.parse(JSON.stringify(ST.customFmts||[]))
  };

  // Sobrescrever estado em memória com o recebido (sem salvar no localStorage)
  if(dados.players)   ST.players=dados.players;
  if(dados.slots)     ST.slots=dados.slots;
  if(dados.fmt)       ST.fmt=dados.fmt;
  if(dados.slotsByFmt)ST.slotsByFmt=dados.slotsByFmt;
  if(dados.customPos) ST.customPos=dados.customPos;
  ST.customFmts=_fmtsRecebidas;
  ST.customFn=_fnRecebido;
  // Se o link aponta para uma formação que não veio junto (ou veio inválida),
  // a aba cai na formação de fábrica em vez de ficar com o campo vazio.
  ['A','B','C'].forEach(function(t){
    if(!fmtExists(ST.fmt[t]))ST.fmt[t]=FMT_FALLBACK;
  });

  // Devolve o estado real do usuário (guardado acima) para a memória.
  function _restaurarLocal(){
    ST.players=_localBackup.players;
    ST.slots=_localBackup.slots;
    ST.fmt=_localBackup.fmt;
    ST.slotsByFmt=_localBackup.slotsByFmt;
    ST.customPos=_localBackup.customPos;
    ST.customFn=_localBackup.customFn;
    ST.customFmts=_localBackup.customFmts;
  }

  // Acrescenta as formações do link à lista de quem recebeu, sem apagar nada.
  // Cada uma ganha um id interno novo (para não colidir com os ids de quem
  // recebeu) e, se o nome já existir, um sufixo "(2)", "(3)"...
  function _mesclarFormacoes(destino,recebidas){
    var usados={};
    destino.forEach(function(f){usados[String(f.name).toLowerCase()]=true;});
    var maior=0;
    destino.forEach(function(f){
      var n=parseInt(String(f.id).replace('cf_',''),10);
      if(!isNaN(n)&&n>maior)maior=n;
    });
    var add=0;
    recebidas.forEach(function(f){
      var nome=String(f.name);
      if(usados[nome.toLowerCase()]){
        // Encurta a base para o sufixo caber dentro do limite de caracteres.
        var base=nome.slice(0,Math.max(1,FMT_NAME_MAX-5));
        var n=2,cand=base+' ('+n+')';
        while(usados[cand.toLowerCase()]&&n<99){n++;cand=base+' ('+n+')';}
        if(usados[cand.toLowerCase()])return; // caso extremo: desiste desta
        nome=cand;
      }
      usados[nome.toLowerCase()]=true;
      maior++;
      destino.push({id:'cf_'+maior,name:nome,slots:f.slots});
      add++;
    });
    return add;
  }

  // Exibir banner de aviso
  var banner=document.createElement('div');
  banner.id='shared-banner';
  banner.style.cssText=[
    'position:fixed','bottom:0','left:0','right:0','z-index:9999',
    'background:#b91c1c','color:#fff','text-align:center',
    'padding:10px 16px','font-size:14px','display:flex',
    'align-items:center','justify-content:center','gap:8px',
    'flex-wrap:wrap',
    'box-shadow:0 -2px 8px rgba(0,0,0,.5)'
  ].join(';');
  var texto=document.createElement('span');
  texto.textContent='👁 Você está vendo a escalação de outra pessoa.';
  banner.appendChild(texto);

  function _btnBanner(rotulo,acao){
    var b=document.createElement('button');
    b.textContent=rotulo;
    b.style.cssText=[
      'background:#fff','color:#b91c1c','border:none','border-radius:6px',
      'padding:5px 12px','font-size:13px','font-weight:700',
      'cursor:pointer','white-space:nowrap'
    ].join(';');
    b.onclick=acao;
    banner.appendChild(b);
    return b;
  }

  // 1) Volta para o que era do usuário. Nada é gravado.
  _btnBanner('Carregar minha escalação',function(){
    _restaurarLocal();
    banner.remove();
    render();
  });

  // 2) Fica só com o desenho tático das formações recebidas, somando à lista de
  //    quem recebeu. Elenco e escalações próprios continuam intactos.
  if(_fmtsRecebidas.length){
    _btnBanner('Salvar formações',function(){
      _restaurarLocal();
      var add=_mesclarFormacoes(ST.customFmts,_fmtsRecebidas);
      save();
      banner.remove();
      render();
      alert(add===1?'1 formação foi adicionada à sua lista.':add+' formações foram adicionadas à sua lista.');
    });
  }

  // 3) Substitui elenco, escalações e formações pelos do link. Destrutivo, por
  //    isso pede confirmação. Alvos de mercado e níveis da Série A não viajam
  //    no link, então os do usuário permanecem como estavam.
  _btnBanner('Salvar tudo',function(){
    if(!confirm('Isso vai substituir o seu elenco, as suas escalações e as suas formações pelos do link.\n\nSeus alvos de mercado e os níveis da Série A não são afetados.\n\nContinuar?'))return;
    save();
    banner.remove();
    render();
  });
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
