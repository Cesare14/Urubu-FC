// ─── sanitização XSS ─────────────────────────────────────────────
function sanitizeText(str){
  return String(str==null?'':str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#x27;');
}

function sortArr(arr,key,asc){
  if(!key)return arr;
  return arr.slice().sort(function(a,b){
    let va,vb;
    if(key==='pos'){va=POS_ORDER[a.pos]!==undefined?POS_ORDER[a.pos]:99;vb=POS_ORDER[b.pos]!==undefined?POS_ORDER[b.pos]:99;}
    else{va=typeof a[key]==='string'?a[key]:(a[key]||0);vb=typeof b[key]==='string'?b[key]:(b[key]||0);}
    if(va<vb)return asc?-1:1;if(va>vb)return asc?1:-1;return 0;
  });
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
    tr.setAttribute('draggable','true');tr.addEventListener('dragstart',function(e){dragId=p.id;dragSi=null;e.dataTransfer.effectAllowed='move';clearCompatibleHighlight();highlightCompatibleSlots(p.pos,ST.ft);});tr.addEventListener('dragend',function(e){clearCompatibleHighlight();});if(IS_TOUCH){tr.addEventListener('click',function(e){if(!e.target.closest('.ab')&&!e.target.closest('.ssel')&&!e.target.closest('.oi'))onRowTap(p.id,tr);});}
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
    sel.style.cssText='position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;font-size:12px';
    SLIST.forEach(function(s){const o=document.createElement('option');o.value=s;o.textContent=s;if(s===p.status)o.selected=true;sel.appendChild(o);});
    sel.onchange=function(e){const pl=gp(p.id);if(pl)pl.status=e.target.value;save();renderTable();renderBar();if(ST.rt==='analise')renderAnalise();};
    tdS.appendChild(sel);tr.appendChild(tdS);
    const tdO=document.createElement('td');const oi=document.createElement('input');oi.className='oi';oi.value=p.obs||'';oi.placeholder='obs...';oi.onblur=function(e){const pl=gp(p.id);if(pl)pl.obs=e.target.value;save();};oi.onkeydown=function(e){if(e.key==='Enter')oi.blur();};tdO.appendChild(oi);tr.appendChild(tdO);
    const tdAct=document.createElement('td');tdAct.className='abts';
    const abtsInner=document.createElement('div');abtsInner.className='abts-inner';
    const eb=document.createElement('button');eb.className='ab';eb.textContent='✎';eb.onclick=function(){openPl(p.id);};
    const db=document.createElement('button');db.className='ab dl';db.textContent='✕';db.onclick=function(){if(confirm('Remover '+p.name+'?')){ST.players=ST.players.filter(function(x){return x.id!==p.id;});Object.keys(ST.slots).forEach(function(t){ST.slots[t]=ST.slots[t].map(function(s){return s===p.id?null:s;});});save();render();}};
    abtsInner.appendChild(eb);abtsInner.appendChild(db);tdAct.appendChild(abtsInner);tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
  document.getElementById('hdr-count').textContent=ST.players.length+' jogadores';
  // Criar botões Export/Import no tbar se ainda não existem
  if(!document.getElementById('btn-export-roster')){
    const tbar=document.getElementById('elenco-tbar');
    if(tbar){
      // input file oculto
      const fi=document.createElement('input');
      fi.type='file';fi.accept='.json';fi.id='import-roster-input';
      fi.style.cssText='display:none';
      fi.addEventListener('change',handleImportFile);
      document.body.appendChild(fi);
      // botão exportar
      const bExp=document.createElement('button');
      bExp.id='btn-export-roster';
      bExp.className='btn-share';
      bExp.title='Exportar elenco (JSON)';
      bExp.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar';
      bExp.onclick=exportRoster;
      tbar.appendChild(bExp);
      // botão importar
      const bImp=document.createElement('button');
      bImp.id='btn-import-roster';
      bImp.className='btn-share';
      bImp.title='Importar elenco (JSON)';
      bImp.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar';
      bImp.onclick=importRoster;
      tbar.appendChild(bImp);
    }
  }
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
function renderMercado(){
  const grid=document.getElementById('mgrid');grid.innerHTML='';
  const sq=ST.tsf.toLowerCase();
  const prioMap={'Baixa':1,'Média':2,'Alta':3,'Oportunidade':4};
  let filtered=ST.targets.filter(function(t){
    const ms=!sq||t.name.toLowerCase().includes(sq);
    const mp=ST.filterTPos.length===0||ST.filterTPos.includes(t.pos);
    const mpr=ST.filterTPrio.length===0||ST.filterTPrio.some(function(pr){return prioMap[pr]===t.prio;});
    return ms&&mp&&mpr;
  });
  const tsortMap={age:'age',nivel:'nivel',valor:'val',pos:'pos'};
  if(ST.tsortKey&&tsortMap[ST.tsortKey])filtered=sortArr(filtered,tsortMap[ST.tsortKey],ST.tsortAsc);
  const tgtCnt=document.getElementById('tgt-count');if(tgtCnt)tgtCnt.textContent=ST.targets.length+' alvo'+(ST.targets.length!==1?'s':'');
  if(!filtered.length){grid.innerHTML='<div class="empty"><p>Nenhum alvo cadastrado</p><span>Use "+ Alvo" para adicionar.</span></div>';return;}
  filtered.forEach(function(t,idx){
    const c=document.createElement('div');c.className='tcard';c.setAttribute('draggable','true');
    c.style.animationDelay=(idx*0.04)+'s';
    c.addEventListener('dragstart',function(e){dragId='t:'+t.id;dragSi=null;e.dataTransfer.effectAllowed='move';clearCompatibleHighlight();highlightCompatibleSlots(t.pos,ST.ft);});
    c.addEventListener('dragend',function(e){clearCompatibleHighlight();});
    const hdr=document.createElement('div');hdr.className='tcard-hdr';
    const info=document.createElement('div');
    const tn=document.createElement('div');tn.className='tname';tn.textContent=t.name;
    const tc=document.createElement('div');tc.className='tclub';tc.textContent=t.club||'Clube não informado';
    info.appendChild(tn);info.appendChild(tc);
    const pbdg=document.createElement('span');pbdg.className='tpbdg';pbdg.textContent=t.pos;
    hdr.appendChild(info);hdr.appendChild(pbdg);c.appendChild(hdr);
    // stars
    if(t.prio>0){const sw=document.createElement('div');sw.style.marginBottom='6px';sw.appendChild(starsEl(t.prio,true));c.appendChild(sw);}
    // info rows
    const infoDiv=document.createElement('div');infoDiv.className='tinfo';
    if(t.age)infoDiv.innerHTML+='<div class="trow"><span class="trl">Idade</span><span class="trv">'+t.age+' anos</span></div>';
    if(t.val)infoDiv.innerHTML+='<div class="trow"><span class="trl">Valor</span><span class="trv">€ '+(+t.val).toFixed(1)+'M</span></div>';
    if(t.nivel){
      const nivelRow=document.createElement('div');nivelRow.className='trow';nivelRow.style.alignItems='center';
      const trl=document.createElement('span');trl.className='trl';trl.textContent='Nível';
      const trv=document.createElement('div');trv.style.cssText='display:flex;align-items:center;gap:6px';
      const donutEl=nivelDonutEl(t.nivel,28);donutEl.className+=' nivel-compact';
      // remover o label interno do donut (fica só o número grande externo)
      const innerLbl=donutEl.querySelector('.donut-num');if(innerLbl)innerLbl.remove();
      trv.appendChild(donutEl);
      const ratingNum=document.createElement('span');
      ratingNum.style.cssText='font-family:\'Barlow Condensed\',sans-serif;font-size:18px;font-weight:800;color:'+nivelColor(t.nivel)+';line-height:1;';
      ratingNum.textContent=t.nivel;
      trv.appendChild(ratingNum);
      nivelRow.appendChild(trl);nivelRow.appendChild(trv);infoDiv.appendChild(nivelRow);
    }
    if(t.contract)infoDiv.innerHTML+='<div class="trow"><span class="trl">Contrato</span><span class="trv">'+sanitizeText(t.contract)+'</span></div>';
    if(t.obs)infoDiv.innerHTML+='<div class="trow" style="flex-direction:column;align-items:flex-start;gap:1px"><span class="trl">Perfil</span><span class="trv" style="font-size:10px;white-space:normal;color:var(--gray-l)">'+sanitizeText(t.obs)+'</span></div>';
    c.appendChild(infoDiv);
    const acts=document.createElement('div');acts.className='tacts';
    const eb=document.createElement('button');eb.className='tab';eb.textContent='✎';eb.onclick=function(){openTgt(t.id);};
    const db=document.createElement('button');db.className='tab dl';db.textContent='✕';db.onclick=function(){if(confirm('Remover '+t.name+'?')){ST.targets=ST.targets.filter(function(x){return x.id!==t.id;});Object.keys(ST.slots).forEach(function(tab){ST.slots[tab]=ST.slots[tab].map(function(s){return s==='t:'+t.id?null:s;});});save();renderMercado();renderField();renderBar();}};
    const pb=document.createElement('button');pb.className='tprom';pb.textContent='→ Contratar';pb.onclick=function(){ST.players.push({id:npi(),name:t.name,pos:t.pos,age:t.age||22,nat:'',status:'Compõe elenco',nivel:t.nivel||nivelDef('Compõe elenco'),valor:t.val||0,selecionavel:false,foto:'',obs:t.club?'Contratado de '+t.club:''});ST.targets=ST.targets.filter(function(x){return x.id!==t.id;});Object.keys(ST.slots).forEach(function(tab){ST.slots[tab]=ST.slots[tab].map(function(s){return s==='t:'+t.id?null:s;});});save();render();alert(t.name+' adicionado ao elenco.');};
    acts.appendChild(eb);acts.appendChild(db);acts.appendChild(pb);c.appendChild(acts);
    grid.appendChild(c);
  });
}

// ANÁLISE v8
// ─── helpers de cor ───────────────────────────────────────────────
