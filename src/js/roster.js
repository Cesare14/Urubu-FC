// ─── sanitização XSS ─────────────────────────────────────────────
function sanitizeText(str){
  return String(str==null?'':str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#x27;');
}

const STATUS_ORDER = { 'Titular': 0, 'Importante': 1, 'Compõe elenco': 2, 'Vender': 3, 'Dispensável': 4 };
function sortArr(arr,key,asc){
  if(!key)return arr;
  return arr.slice().sort(function(a,b){
    let va,vb;
    if(key==='pos'){va=POS_ORDER[a.pos]!==undefined?POS_ORDER[a.pos]:99;vb=POS_ORDER[b.pos]!==undefined?POS_ORDER[b.pos]:99;}
    else if(key==='status'){va=STATUS_ORDER[a.status]!==undefined?STATUS_ORDER[a.status]:99;vb=STATUS_ORDER[b.status]!==undefined?STATUS_ORDER[b.status]:99;}
    else{va=typeof a[key]==='string'?a[key]:(a[key]||0);vb=typeof b[key]==='string'?b[key]:(b[key]||0);}
    if(va<vb)return asc?-1:1;if(va>vb)return asc?1:-1;return 0;
  });
}

// ── DRAG POR TOQUE (segurar e arrastar a linha até o campo tático) ──────────
// Convive com o toque-toque (onRowTap) e com a rolagem manual da tabela:
// só vira arrasto após um long-press parado; qualquer deslocamento do dedo
// antes disso é tratado como rolagem normal (cancela o long-press).
function addRowTouchDrag(tr, p) {
  var LONGPRESS_DELAY = 350; // ms parado até armar o arrasto
  var JITTER_TOLERANCE = 8;  // px de tolerância antes de cancelar o long-press
  var pressTimer = null;
  var armed = false;   // true assim que o long-press disparou
  var dragged = false; // true se o dedo de fato moveu após armar (houve arrasto)
  var startX = 0, startY = 0;
  var clone = null;

  // Desabilita o gesto nativo de seleção de texto por toque longo (e o menu
  // de contexto que ele dispara), que competia com o nosso long-press: sem
  // isso, o Android podia "vencer a corrida" e cancelar nosso arrasto antes
  // mesmo dele começar. Não afeta digitação/edição em .oi/.ssel.
  tr.style.webkitUserSelect = 'none';
  tr.style.userSelect = 'none';
  tr.style.webkitTouchCallout = 'none';
  tr.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // Desabilita o HTML5 Drag and Drop nativo (usado só no desktop, via
  // dragstart/dragend) especificamente em touch: no Chrome Android, um
  // elemento draggable="true" aciona a própria largada nativa de drag-and-drop
  // por toque longo (com vibração), competindo com nosso long-press e
  // "vencendo a corrida" antes do nosso timer de 350ms dar início ao arrasto.
  tr.draggable = false;

  function cancelPress() {
    if (pressTimer !== null) { clearTimeout(pressTimer); pressTimer = null; }
  }
  function armDrag() {
    pressTimer = null;
    armed = true;
    tr.style.touchAction = 'none'; // trava scroll nativo só durante o arrasto ativo
  }
  function cleanupDrag() {
    stopAutoScroll();
    tr.style.touchAction = 'auto';
    if (clone) { document.body.removeChild(clone); clone = null; }
    armed = false;
  }

  tr.addEventListener('touchstart', function (e) {
    if (e.target.closest('.ab') || e.target.closest('.ssel') || e.target.closest('.oi')) return;
    var t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    armed = false; dragged = false; clone = null;
    cancelPress();
    pressTimer = setTimeout(armDrag, LONGPRESS_DELAY);
  }, { passive: true });

  tr.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    var dx = t.clientX - startX, dy = t.clientY - startY;

    if (!armed) {
      // ainda não armado: deslocamento além da trepidação cancela o
      // long-press e deixa o gesto seguir como rolagem normal da tabela
      if (Math.sqrt(dx * dx + dy * dy) > JITTER_TOLERANCE) cancelPress();
      return;
    }

    if (!clone) {
      // primeiro movimento após armar: cria o clone flutuante simplificado
      dragged = true;
      clone = document.createElement('div');
      clone.className = 'row-drag-clone';
      clone.textContent = p.name;
      clone.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;'
        + 'padding:6px 12px;border-radius:8px;background:var(--red,#c00);color:#fff;'
        + 'font-family:\'Barlow Condensed\',sans-serif;font-size:13px;font-weight:700;'
        + 'white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,.4);opacity:.92';
      document.body.appendChild(clone);
    }

    e.preventDefault();
    clone.style.left = (t.clientX + 14) + 'px';
    clone.style.top = (t.clientY - 14) + 'px';
    updateAutoScroll(t.clientY);
  }, { passive: false });

  tr.addEventListener('touchend', function (e) {
    cancelPress();
    if (!armed) return; // tap normal: deixa o listener de click cuidar (onRowTap)

    var wasDragged = dragged;
    cleanupDrag();
    dragged = false;

    if (!wasDragged) return; // long-press sem mover: trata como tap (click cuida)

    e.preventDefault(); // suprime o click fantasma pós-arrasto

    var t = e.changedTouches[0];
    var el = document.elementFromPoint(t.clientX, t.clientY);
    var targetSc = el ? el.closest('.scard') : null;
    if (targetSc) {
      // Reaproveita o fluxo de toque-toque: simula "jogador selecionado na
      // tabela" e delega a alocação/troca ao onScardTap já existente (CASO 1)
      touchSel = { type: 'row', id: p.id, si: null, tab: ST.ft, rowEl: null };
      onScardTap(targetSc, ST.ft);
    }
  }, { passive: false });

  tr.addEventListener('touchcancel', function () {
    cancelPress();
    if (armed) cleanupDrag();
    dragged = false;
  }, { passive: true });
}

// Exclui um jogador do elenco (com confirmação) e limpa referências no campo tático.
// Reaproveitada pelo modal de edição (openPl) — antes vinculada ao ícone "✕" da linha.
function deletePlayerById(id){
  const p=gp(id);if(!p)return;
  if(!confirm('Excluir '+p.name+'? Essa ação não pode ser desfeita.'))return;
  ST.players=ST.players.filter(function(x){return x.id!==id;});
  Object.keys(ST.slots).forEach(function(t){ST.slots[t]=ST.slots[t].map(function(s){return s===id?null:s;});});
  save();
  closePl();
  render();
}

// Atualiza só o indicador ofdot de uma linha da tabela (evita recriar tudo no drop)
function patchTableRow(pid){
  const tr=document.querySelector('tr[data-pid="'+pid+'"]');
  if(!tr)return;
  const onf=Object.values(ST.slots).some(function(a){return a.includes(pid);});
  tr.classList.toggle('onf',onf);
  // atualizar ofdot dentro do pname
  const pname=tr.querySelector('.pname');if(!pname)return;
  const existing=pname.querySelector('.ofdot');
  if(onf&&!existing){const dot=document.createElement('div');dot.className='ofdot';pname.appendChild(dot);}
  else if(!onf&&existing){existing.remove();}
}
function renderTable(){
  // limpar tooltips antigos do body
  document.querySelectorAll('.p-tooltip').forEach(function(t){t.remove();});
  const tbody=document.getElementById('tbody');tbody.innerHTML='';
  const sq=ST.sf.toLowerCase();
  let filtered=ST.players.filter(function(p){
    const ms=!sq||p.name.toLowerCase().includes(sq);
    const mp=ST.filterPos.length===0||ST.filterPos.includes(p.pos);
    const mst=ST.filterStatus.length===0||ST.filterStatus.includes(p.status);
    return ms&&mp&&mst;
  });
  filtered=sortArr(filtered,ST.sortKey,ST.sortAsc);
  filtered.forEach(function(p){
    const onf=Object.values(ST.slots).some(function(a){return a.includes(p.id);});
    const tr=document.createElement('tr');if(onf)tr.classList.add('onf');
    tr.setAttribute('data-pid',p.id);
    tr.setAttribute('draggable','true');tr.addEventListener('dragstart',function(e){dragId=p.id;dragSi=null;e.dataTransfer.effectAllowed='move';});tr.addEventListener('dragend',function(e){});if(IS_TOUCH){tr.addEventListener('click',function(e){if(!e.target.closest('.ab')&&!e.target.closest('.ssel')&&!e.target.closest('.oi'))onRowTap(p.id,tr);});addRowTouchDrag(tr,p);}
    const tdD=document.createElement('td');tdD.innerHTML='<span class="dh">⠿</span>';tr.appendChild(tdD);
    const tdN=document.createElement('td');
    const nd=document.createElement('div');nd.className='pname';
    nd.appendChild(photoEl(p.name,p.foto||'',28));
    // name + tooltip wrapper
    const nwrap=document.createElement('div');nwrap.className='pname-wrap';
    const ns=document.createElement('span');ns.textContent=p.name;nwrap.appendChild(ns);
    // tooltip
    const tip=document.createElement('div');tip.className='p-tooltip';
    const tipRows=[
      {lbl:'Idade',val:p.age+' anos'},
      {lbl:'Posição',val:p.pos||'—'},
      {lbl:'Nível',val:(p.nivel||'—')+'/100'},
      {lbl:'Valor',val:p.valor?'€'+p.valor+'M':'—'},
      {lbl:'Nac.',val:sanitizeText(p.nat||'—')},
    ];
    tipRows.forEach(function(r){
      const row=document.createElement('div');row.className='p-tooltip-row';
      row.innerHTML='<span class="p-tooltip-lbl">'+r.lbl+'</span><span class="p-tooltip-val">'+r.val+'</span>';
      tip.appendChild(row);
    });
    if(p.obs){const obsRow=document.createElement('div');obsRow.className='p-tooltip-row';obsRow.style.cssText='flex-direction:column;gap:1px;border-top:1px solid var(--dark3);margin-top:4px;padding-top:4px';obsRow.innerHTML='<span class="p-tooltip-lbl">Obs.</span><span style="font-size:10px;color:var(--gray-l)">'+sanitizeText(p.obs)+'</span>';tip.appendChild(obsRow);}
    document.body.appendChild(tip);
    nwrap.addEventListener('mouseenter',function(){
      const r=nwrap.getBoundingClientRect();
      tip.style.left=r.left+'px';
      tip.style.top=(r.bottom+6)+'px';
      tip.style.opacity='1';tip.style.transform='translateY(0)';tip.style.pointerEvents='auto';
    });
    nwrap.addEventListener('mouseleave',function(){
      tip.style.opacity='0';tip.style.transform='translateY(-4px)';tip.style.pointerEvents='none';
    });
    nd.appendChild(nwrap);
    if(p.selecionavel){const si=document.createElement('span');si.title='Selecionável';si.style.cssText='font-size:9px;color:var(--c2);margin-left:1px';si.textContent='⚑';nd.appendChild(si);}
    if(onf){const dot=document.createElement('div');dot.className='ofdot';nd.appendChild(dot);}
    tdN.appendChild(nd);tr.appendChild(tdN);
    const tdP=document.createElement('td');tdP.innerHTML='<span class="pbadge">'+p.pos+'</span>';tr.appendChild(tdP);
    const tdA=document.createElement('td');tdA.innerHTML='<span class="pval">'+p.age+'</span>';tr.appendChild(tdA);
    const tdNa=document.createElement('td');tdNa.innerHTML='<span class="pval">'+sanitizeText(p.nat||'')+'</span>';tr.appendChild(tdNa);
    const tdNv=document.createElement('td');const nvEl=nivelDonutEl(p.nivel,28);nvEl.className+=' nivel-compact';tdNv.appendChild(nvEl);tr.appendChild(tdNv);
    // Status: tag visual + select oculto para edição ao clicar
    const tdS=document.createElement('td');
    tdS.style.cssText='position:relative;cursor:pointer';
    const stag=statusTagEl(p.status);tdS.appendChild(stag);
    const sel=document.createElement('select');sel.className='ssel';
    sel.setAttribute('aria-label','Status de '+p.name);
    sel.style.cssText='position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;font-size:12px';
    SLIST.forEach(function(s){const o=document.createElement('option');o.value=s;o.textContent=s;if(s===p.status)o.selected=true;sel.appendChild(o);});
    sel.onchange=function(e){const pl=gp(p.id);if(pl)pl.status=e.target.value;save();renderTable();renderBar();if(ST.rt==='analise')renderAnalise();};
    tdS.appendChild(sel);tr.appendChild(tdS);
    const tdO=document.createElement('td');const oi=document.createElement('input');oi.className='oi';oi.value=p.obs||'';oi.placeholder='obs...';oi.onblur=function(e){const pl=gp(p.id);if(pl)pl.obs=sanitizeText(e.target.value);save();};oi.onkeydown=function(e){if(e.key==='Enter')oi.blur();};tdO.appendChild(oi);tr.appendChild(tdO);
    const tdAct=document.createElement('td');tdAct.className='abts';
    const abtsInner=document.createElement('div');abtsInner.className='abts-inner';
    const eb=document.createElement('button');eb.className='ab';eb.title='Editar jogador';eb.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';eb.onclick=function(){openPl(p.id);};
    abtsInner.appendChild(eb);tdAct.appendChild(abtsInner);tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
  document.getElementById('hdr-count').textContent=ST.players.length+' jogadores';
}

// EXPORT / IMPORT
function exportRoster(){
  const data=JSON.parse(localStorage.getItem(SK)||'{}');
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='urubufc_elenco.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importRoster(){
  const input=document.getElementById('import-roster-input');
  if(input)input.click();
}

function handleImportFile(e){
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const data=JSON.parse(ev.target.result);
      if(typeof data!=='object'||data===null||Array.isArray(data)){
        alert('Arquivo inválido: o JSON não é um objeto de dados do Urubu FC.');
        return;
      }
      localStorage.setItem(SK,JSON.stringify(data));
      load();
      render();
      alert('Elenco importado com sucesso!');
    }catch(err){
      alert('Erro ao importar: o arquivo não é um JSON válido.');
    }
    // limpar input para permitir re-importar o mesmo arquivo
    e.target.value='';
  };
  reader.readAsText(file);
}

// MERCADO
// injeta a definição SVG do clip-path do escudo uma única vez (usado por .tcard/.tcard-border no CSS)
function ensureShieldClipDef(){
  if(document.getElementById('tcardShieldClip'))return;
  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('style','position:absolute;width:0;height:0');
  const clip=document.createElementNS(NS,'clipPath');
  clip.setAttribute('id','tcardShieldClip');
  clip.setAttribute('clipPathUnits','objectBoundingBox');
  const path=document.createElementNS(NS,'path');
  path.setAttribute('d','M 0.04,0 L 0.96,0 L 0.96,0.5 C 0.96,0.78 0.76,0.95 0.5,1 C 0.24,0.95 0.04,0.78 0.04,0.5 Z');
  clip.appendChild(path);
  svg.appendChild(clip);
  document.body.appendChild(svg);
}
function renderMercado(){
  ensureShieldClipDef();
  const grid=document.getElementById('mgrid');grid.innerHTML='';
  const sq=ST.tsf.toLowerCase();
  const prioMap={'Baixa':1,'Média':2,'Alta':3,'Oportunidade':4};
  let filtered=ST.targets.filter(function(t){
    const ms=!sq||t.name.toLowerCase().includes(sq);
    const mp=ST.filterTPos.length===0||ST.filterTPos.includes(t.pos);
    const mpr=ST.filterTPrio.length===0||ST.filterTPrio.some(function(pr){return prioMap[pr]===t.prio;});
    return ms&&mp&&mpr;
  });
  const tgtCnt=document.getElementById('tgt-count');if(tgtCnt)tgtCnt.textContent=ST.targets.length+' alvo'+(ST.targets.length!==1?'s':'');
  if(!filtered.length){grid.innerHTML='<div class="empty"><p>Nenhum alvo cadastrado</p><span>Use "+ Alvo" para adicionar.</span></div>';return;}
  filtered.forEach(function(t,idx){
    // wrapper: contém a moldura dourada (tcard-border) + o escudo (tcard)
    const wrap=document.createElement('div');wrap.className='tcard-wrap';wrap.setAttribute('draggable','true');
    wrap.style.animationDelay=(idx*0.04)+'s';
    wrap.addEventListener('dragstart',function(e){dragId='t:'+t.id;dragSi=null;e.dataTransfer.effectAllowed='move';});
    wrap.addEventListener('dragend',function(e){});
    const border=document.createElement('div');border.className='tcard-border';wrap.appendChild(border);
    const c=document.createElement('div');c.className='tcard';
    // cabeçalho: nome+clube / posição
    const hdr=document.createElement('div');hdr.className='tcard-hdr';
    const info=document.createElement('div');info.className='tcard-namewrap';
    const tn=document.createElement('div');tn.className='tname';tn.textContent=t.name;
    const tc=document.createElement('div');tc.className='tclub';tc.textContent=t.club||'Clube não informado';
    info.appendChild(tn);info.appendChild(tc);
    const posWrap=document.createElement('div');posWrap.className='tpos-wrap';
    const pbdg=document.createElement('span');pbdg.className='tpbdg';pbdg.textContent=t.pos;
    posWrap.appendChild(pbdg);
    hdr.appendChild(info);hdr.appendChild(posWrap);c.appendChild(hdr);
    // faixas fixas (altura uniforme): Prioridade / Idade / Valor / Nível
    const infoDiv=document.createElement('div');infoDiv.className='tinfo';
    // Prioridade
    const prioRow=document.createElement('div');prioRow.className='trow';
    const prioLbl=document.createElement('span');prioLbl.className='trl';prioLbl.textContent='Prioridade';
    const prioVal=document.createElement('span');prioVal.className='trv tcard-stars';
    if(t.prio>0){
      prioVal.appendChild(starsEl(t.prio,true));
    }else{prioVal.textContent='—';}
    prioRow.appendChild(prioLbl);prioRow.appendChild(prioVal);infoDiv.appendChild(prioRow);
    // Idade
    const ageRow=document.createElement('div');ageRow.className='trow';
    ageRow.innerHTML='<span class="trl">Idade</span><span class="trv">'+(t.age?t.age+' anos':'—')+'</span>';
    infoDiv.appendChild(ageRow);
    // Valor
    const valRow=document.createElement('div');valRow.className='trow';
    valRow.innerHTML='<span class="trl">Valor</span><span class="trv">'+(t.val?'€ '+(+t.val).toFixed(1)+'M':'—')+'</span>';
    infoDiv.appendChild(valRow);
    // Nível (chip escuro + donut, número dentro)
    const nivelRow=document.createElement('div');nivelRow.className='trow';
    const nivelLbl=document.createElement('span');nivelLbl.className='trl';nivelLbl.textContent='Nível';
    const nivelVal=document.createElement('span');nivelVal.className='trv';nivelVal.style.cssText='display:flex;align-items:center;justify-content:flex-end';
    if(t.nivel){
      const chip=document.createElement('div');chip.className='tcard-nivel-chip';
      const donutEl=nivelDonutEl(t.nivel,28);donutEl.className+=' nivel-compact';
      chip.appendChild(donutEl);
      nivelVal.appendChild(chip);
    }else{nivelVal.textContent='—';}
    nivelRow.appendChild(nivelLbl);nivelRow.appendChild(nivelVal);infoDiv.appendChild(nivelRow);
    c.appendChild(infoDiv);
    // ações: Editar+Remover (linha 1) / Contratar (linha 2, largura igual à linha 1)
    const acts=document.createElement('div');acts.className='tacts';
    const actsRow=document.createElement('div');actsRow.className='tacts-row';
    const eb=document.createElement('button');eb.className='tab';eb.title='Editar alvo';eb.innerHTML='<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> Editar';eb.onclick=function(){openTgt(t.id);};
    const db=document.createElement('button');db.className='tab dl';db.innerHTML='✕ Remover';db.onclick=function(){if(confirm('Remover '+t.name+'?')){ST.targets=ST.targets.filter(function(x){return x.id!==t.id;});Object.keys(ST.slots).forEach(function(tab){ST.slots[tab]=ST.slots[tab].map(function(s){return s==='t:'+t.id?null:s;});});save();renderMercado();renderField();renderBar();}};
    actsRow.appendChild(eb);actsRow.appendChild(db);
    const pb=document.createElement('button');pb.className='tprom';pb.textContent='→ Contratar';pb.onclick=function(){ST.players.push({id:npi(),name:t.name,pos:t.pos,age:t.age||22,nat:'',status:'Compõe elenco',nivel:t.nivel||nivelDef('Compõe elenco'),valor:t.val||0,selecionavel:false,foto:'',obs:t.club?'Contratado de '+t.club:''});ST.targets=ST.targets.filter(function(x){return x.id!==t.id;});Object.keys(ST.slots).forEach(function(tab){ST.slots[tab]=ST.slots[tab].map(function(s){return s==='t:'+t.id?null:s;});});save();render();alert(t.name+' adicionado ao elenco.');};
    acts.appendChild(actsRow);acts.appendChild(pb);c.appendChild(acts);
    // logo do urubu na ponta do escudo
    const logoWrap=document.createElement('div');logoWrap.className='tcard-logo';
    const logoImg=document.createElement('img');logoImg.src='assets/urubu-logo.png';logoImg.alt='';logoImg.className='tcard-logo-img';
    logoWrap.appendChild(logoImg);c.appendChild(logoWrap);
    wrap.appendChild(c);
    grid.appendChild(wrap);
  });
}

// ANÁLISE v8
// ─── helpers de cor ───────────────────────────────────────────────
