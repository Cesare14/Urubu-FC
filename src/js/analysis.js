// ─── blindagem numérica (Nível/Valor) contra dados corrompidos no localStorage ──
function safeNivel(v){var n=parseFloat(v);if(isNaN(n))return 0;return Math.max(0,Math.min(100,n));}
function safeValor(v){var n=parseFloat(v);if(isNaN(n))return 0;return Math.max(0,Math.min(999,n));}

// ─── texto fixo explicativo por card (não é tooltip) ──────────────
function cardDesc(cont,txt){
  const d=document.createElement('div');d.className='a-card-desc';d.textContent=txt;
  cont.appendChild(d);
}

function renderAnalise(){
  const grid=document.getElementById('agrid');grid.innerHTML='';
  const pl=ST.players;const tg=ST.targets;if(!pl.length)return;

  function slotPlayers(tab){return ST.slots[tab].filter(Boolean).map(function(id){return typeof id==='number'?gp(id):null;}).filter(Boolean);}
  const titulares=slotPlayers('A');
  const reservas=slotPlayers('B');
  const projecao=slotPlayers('C');

  // ── 1. IDADE MÉDIA ──────────────────────────────────────────────
  const c1=makeCard(false,'Idade Média',['bar'],function(cont){
    cardDesc(cont,'Idade média do elenco por posição');
    const ages=pl.map(function(p){return p.age||0;}).filter(Boolean);
    const avg=ages.length?(ages.reduce(function(a,b){return a+b;},0)/ages.length).toFixed(1):0;
    const bd=idadeBadge(parseFloat(avg));
    heroBlock(cont,avg,'anos',bd,pl.length+' jogadores no elenco');
    sep(cont);
    blkLbl(cont,'Idade média por posição');
    const posData=[];
    POSITIONS.forEach(function(pos){
      const arr=pl.filter(function(p){return p.pos===pos&&p.age;}).map(function(p){return p.age;});
      if(arr.length){const v=parseFloat((arr.reduce(function(a,b){return a+b;},0)/arr.length).toFixed(1));posData.push({lbl:pos,val:v,customColor:idadeColor(v)});}
    });
    posData.sort(function(a,b){return b.val-a.val;});
    barChart(cont,posData,40,null,function(v){return v.toFixed(1);},{primary:false,icon:true,tooltipFn:function(d){return d.lbl+': '+d.val.toFixed(1)+' anos';}});
  });
  // (c1 appendado no final)

  // ── 2. NÍVEL MÉDIO ──────────────────────────────────────────────
  const c2=makeCard(false,'Nível Médio',['bar'],function(cont){
    cardDesc(cont,'Nível médio por status');
    const nivs=pl.filter(function(p){return p.nivel;}).map(function(p){return safeNivel(p.nivel);});
    const avg=nivs.length?(nivs.reduce(function(a,b){return a+b;},0)/nivs.length).toFixed(1):0;
    const bd=nivelBadge(parseFloat(avg));
    // hero com donut grande
    const heroRow=document.createElement('div');heroRow.style.cssText='display:flex;align-items:center;gap:14px;margin-bottom:4px';
    const dw=nivelDonutEl(parseFloat(avg),72);heroRow.appendChild(dw);
    const heroRight=document.createElement('div');
    const heroUnit=document.createElement('div');heroUnit.className='a-hero-unit';heroUnit.textContent='/100 · nível médio';
    const heroBadge=document.createElement('div');heroBadge.className='a-hero-badge';
    heroBadge.style.cssText='background:'+bd.bg+';color:'+bd.col;heroBadge.textContent=bd.icon+' '+bd.label;
    const heroCtx=document.createElement('div');heroCtx.className='a-ctx';heroCtx.style.marginTop='4px';heroCtx.textContent='escala 0–100 · todos os jogadores';
    heroRight.appendChild(heroUnit);heroRight.appendChild(heroBadge);heroRight.appendChild(heroCtx);
    heroRow.appendChild(heroRight);cont.appendChild(heroRow);
    sep(cont);
    blkLbl(cont,'Por status');
    const sdData=[];
    SLIST.forEach(function(s){
      const arr=pl.filter(function(p){return p.status===s&&p.nivel;}).map(function(p){return safeNivel(p.nivel);});
      if(arr.length){const v=parseFloat((arr.reduce(function(a,b){return a+b;},0)/arr.length).toFixed(1));sdData.push({lbl:s,val:v});}
    });
    // donut grid for status
    const sdGrid=document.createElement('div');sdGrid.style.cssText='display:flex;flex-wrap:wrap;justify-content:space-between;margin-bottom:6px';
    sdData.forEach(function(d){
      const item=document.createElement('div');item.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px';
      item.appendChild(nivelDonutEl(d.val,56));
      const lbl=document.createElement('div');lbl.style.cssText='font-family:Barlow Condensed,sans-serif;font-size:9px;letter-spacing:.5px;text-transform:uppercase;color:var(--gray);text-align:center;max-width:54px;line-height:1.2';lbl.textContent=d.lbl;
      item.appendChild(lbl);sdGrid.appendChild(item);
    });
    cont.appendChild(sdGrid);
    sep(cont);
    blkLbl(cont,'Por escalação');
    const tabData=[
      {lbl:'Titulares',players:titulares,col:'#60a5fa'},
      {lbl:'Reservas',players:reservas,col:'#22c55e'},
      {lbl:'Projeção',players:projecao,col:'#a78bfa'}
    ];
    const escGrid=document.createElement('div');escGrid.style.cssText='display:flex;flex-wrap:wrap;gap:10px 16px;margin-bottom:6px';
    function makeEscDonut(val,col,lblTxt){
      const item=document.createElement('div');item.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px';
      // build donut diretamente com a cor certa
      const size=56,wrap=document.createElement('div');wrap.className='donut-wrap donut-wrap--lg';wrap.style.width=size+'px';wrap.style.height=size+'px';
      const cv=document.createElement('canvas');drawDonut(cv,val,col,size);
      const num=document.createElement('div');num.className='donut-num';num.style.cssText='font-size:13px;color:'+col;num.textContent=val;
      wrap.appendChild(cv);wrap.appendChild(num);item.appendChild(wrap);
      const lbl=document.createElement('div');lbl.style.cssText='font-family:Barlow Condensed,sans-serif;font-size:9px;letter-spacing:.5px;text-transform:uppercase;color:'+col+';text-align:center;max-width:54px;line-height:1.2;font-weight:700';lbl.textContent=lblTxt;
      item.appendChild(lbl);return item;
    }
    tabData.forEach(function(td){
      if(!td.players.length)return;
      const arr=td.players.filter(function(p){return p.nivel;}).map(function(p){return safeNivel(p.nivel);});
      if(!arr.length)return;
      const v=parseFloat((arr.reduce(function(a,b){return a+b;},0)/arr.length).toFixed(1));
      escGrid.appendChild(makeEscDonut(v,td.col,td.lbl));
    });
    const tgNivs=tg.filter(function(t){return t.nivel;}).map(function(t){return safeNivel(t.nivel);});
    if(tgNivs.length){
      const tav=parseFloat((tgNivs.reduce(function(a,b){return a+b;},0)/tgNivs.length).toFixed(1));
      escGrid.appendChild(makeEscDonut(tav,'#FFD700','Alvos'));
    }
    cont.appendChild(escGrid);
  });
  // (c2 appendado no final)

  // ── 3. VALOR DO ELENCO ──────────────────────────────────────────
  const c3=makeCard(true,'Valor do Elenco',['bar'],function(cont,type){
    cardDesc(cont,'Valor total do elenco e por jogador');
    const total=pl.reduce(function(a,p){return a+safeValor(p.valor);},0);
    const tgTotal=tg.reduce(function(a,t){return a+safeValor(t.val);},0);

    // hero inline — mesmo padrão que idade/nível
    const hero=document.createElement('div');hero.className='a-hero';
    const n=document.createElement('div');n.className='a-hero-num';n.style.color='#a78bfa';n.textContent='€'+total.toFixed(0)+'M';
    const right=document.createElement('div');right.className='a-hero-right';
    const u=document.createElement('div');u.className='a-hero-unit';u.textContent='valor de mercado';
    const badge=document.createElement('div');badge.className='a-hero-badge';
    badge.style.cssText='background:rgba(167,139,250,.12);color:#a78bfa';
    badge.textContent='elenco atual';
    right.appendChild(u);right.appendChild(badge);
    if(tgTotal){
      const b2=document.createElement('div');b2.className='a-hero-badge';
      b2.style.cssText='background:rgba(167,139,250,.08);color:var(--cv);margin-top:3px;font-size:10px';
      b2.textContent='Alvos: €'+tgTotal.toFixed(0)+'M';
      right.appendChild(b2);
    }
    hero.appendChild(n);hero.appendChild(right);
    cont.appendChild(hero);
    const ctx2=document.createElement('div');ctx2.className='a-ctx';ctx2.textContent=pl.length+' jogadores · escala de valor individual';
    cont.appendChild(ctx2);

    sep(cont);
    blkLbl(cont,'Valor por status');
    const stData=[];
    SLIST.forEach(function(s){const v=pl.filter(function(p){return p.status===s;}).reduce(function(a,p){return a+safeValor(p.valor);},0);if(v>0)stData.push({lbl:s,val:v,customColor:SHEX[s]});});
    {
      const maxV=stData.length?Math.max.apply(null,stData.map(function(d){return d.val;})):1;
      barChart(cont,stData,maxV,null,function(v){return '€'+v.toFixed(0)+'M';},{primary:true,tooltipFn:function(d){return d.lbl+': €'+d.val.toFixed(1)+'M';},sqrtScale:true});
    }

    sep(cont);
    blkLbl(cont,'Top jogadores por valor');
    const sorted=pl.slice().sort(function(a,b){return safeValor(b.valor)-safeValor(a.valor);}).slice(0,7);
    const tgSorted=tg.slice().sort(function(a,b){return safeValor(b.val)-safeValor(a.val);}).slice(0,3);
    const allSorted=sorted.map(function(p){return{lbl:p.name,val:safeValor(p.valor),customColor:'#a78bfa'};})
      .concat(tgSorted.map(function(t){return{lbl:t.name+' ★',val:safeValor(t.val),customColor:'var(--cv)'};}) );
    const maxV2=allSorted[0]?allSorted[0].val||1:1;
    barChart(cont,allSorted,maxV2,null,function(v){return '€'+v.toFixed(0)+'M';},{primary:false,tooltipFn:function(d){return d.lbl+': €'+d.val.toFixed(0)+'M';},sqrtScale:true});
  });
  // (c3 appendado no final)

  // ── 4. NACIONALIDADES ───────────────────────────────────────────
  const c4=makeCard(true,'Jogadores por Nacionalidade',['bar'],function(cont,type){
    cardDesc(cont,'Quantidade de jogadores por nacionalidade');
    const natMap={};
    pl.forEach(function(p){const n=p.nat||'?';natMap[n]=(natMap[n]||0)+1;});
    const arr=Object.keys(natMap).sort(function(a,b){return natMap[b]-natMap[a];});
    const data=arr.map(function(n){return{lbl:n,val:natMap[n],customColor:natGradient(n)||natColor(n)};});
    {
      // barras com gradiente por seleção — via barChart, mesmo caminho de
      // código que já aplica escala raiz quadrada (evita reimplementar a
      // lógica em paralelo)
      const maxV=data[0]?data[0].val:1;
      barChart(cont,data,maxV,null,function(v){return v+' jog.';},{primary:true,tooltipFn:function(d){return d.lbl+': '+d.val+' jogadores';},sqrtScale:true});
    }
  });
  // (c4 appendado no final)

  // ── 5. STATUS ───────────────────────────────────────────────────
  var STATUS_HIER={'Titular':'#60a5fa','Importante':'#22c55e','Compõe elenco':'#f97316','Vender':'#ef4444','Dispensável':'#9ca3af'};
  const c5=makeCard(false,'Por Status',['bar'],function(cont,type){
    cardDesc(cont,'Quantidade de jogadores por status (Titular, Compõe Elenco, Vender, Dispensável)');
    const data=SLIST.map(function(s){return{lbl:s,val:pl.filter(function(p){return p.status===s;}).length,customColor:STATUS_HIER[s]};}).filter(function(d){return d.val>0;});
    {
      const maxV=data.length?Math.max.apply(null,data.map(function(d){return d.val;})):1;
      barChart(cont,data,maxV,null,function(v){return v+' jog.';},{primary:true,tooltipFn:function(d){return d.lbl+': '+d.val+' jogadores';}});
    }
  });
  // (c5 appendado no final)

  // ── 6. SELECIONÁVEIS ────────────────────────────────────────────
  const c6=makeCard(false,'Selecionáveis por Seleção',['bar'],function(cont){
    cardDesc(cont,'Jogadores convocáveis por seleção');
    const selMap={};
    pl.filter(function(p){return p.selecionavel;}).forEach(function(p){const n=p.nat||'?';selMap[n]=(selMap[n]||0)+1;});
    const arr=Object.keys(selMap).sort(function(a,b){return selMap[b]-selMap[a];});
    if(!arr.length){const emp=document.createElement('div');emp.style.cssText='color:var(--gray);font-size:12px;padding:8px 0';emp.innerHTML='Nenhum jogador marcado como selecionável.<br>Edite jogadores e ative o campo "Selecionável".';cont.appendChild(emp);return;}
    const total=arr.reduce(function(a,k){return a+selMap[k];},0);
    const bd={icon:'⚑',label:total+' convocáveis',bg:'rgba(34,197,94,.12)',col:'#22c55e'};
    heroBlock(cont,total,'jogadores',bd,'selecionáveis por seleção nacional');
    sep(cont);
    blkLbl(cont,'Por seleção nacional');
    const data=arr.map(function(n){return{lbl:n,val:selMap[n]};});
    const maxV=data[0]?data[0].val:1;
    // barras com gradiente de seleção
    data.forEach(function(d){
      const pct=maxV?Math.round(d.val/maxV*100):0;
      const row=document.createElement('div');row.className='bar-row';
      const lbl=document.createElement('span');lbl.className='bar-lbl';lbl.title=d.lbl;
      const lt=document.createElement('span');lt.textContent=d.lbl;lbl.appendChild(lt);
      const track=document.createElement('div');track.className='bar-track primary';
      const fill=document.createElement('div');fill.className='bar-fill';
      const grad=natGradient(d.lbl);
      fill.style.background=grad||natColor(d.lbl);
      fill.style.setProperty('--target-width',pct+'%');
      fill.style.width='0';
      track.appendChild(fill);
      const num=document.createElement('span');num.className='bar-num';num.textContent=d.val+' jog.';
      const tip=document.createElement('div');tip.className='bar-tooltip';tip.textContent=d.lbl+': '+d.val+' convocável'+(d.val>1?'is':'');
      row.appendChild(lbl);row.appendChild(track);row.appendChild(num);row.appendChild(tip);
      cont.appendChild(row);
      requestAnimationFrame(function(){requestAnimationFrame(function(){fill.style.transition='width .6s cubic-bezier(.25,.46,.45,.94)';fill.style.width=pct+'%';});});
    });
  });
  // (c6 appendado no final)

  // ── 7. NÍVEL MÉDIO — SÉRIE A ────────────────────────────────────
  const flaAvg=(function(){
    const ns=pl.filter(function(p){return p.nivel;}).map(function(p){return safeNivel(p.nivel);});
    return ns.length?parseFloat((ns.reduce(function(a,b){return a+b;},0)/ns.length).toFixed(1)):0;
  }());
  // sincroniza Flamengo automaticamente
  ST.serieA.forEach(function(c){if(c.fla)c.nivel=flaAvg;});

  const c7=document.createElement('div');c7.className='acard full';

  // título
  const c7title=document.createElement('div');c7title.className='atitle';
  const c7lbl=document.createElement('span');c7lbl.textContent='Nível Médio — Comparativo Série A';
  const c7right=document.createElement('div');c7right.style.cssText='display:flex;align-items:center;gap:6px';
  const c7hint=document.createElement('span');c7hint.style.cssText='font-size:9px;color:var(--dark4);font-style:italic;letter-spacing:0';c7hint.textContent='Flamengo preenchido automaticamente · demais inseridos manualmente';
  const c7sbtn=document.createElement('button');c7sbtn.className='btn-share';c7sbtn.title='Compartilhar Série A';
  c7sbtn.style.cssText='padding:3px 7px;font-size:10px;gap:3px';
  c7sbtn.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>📸';
  c7sbtn.onclick=function(){compartilharCardAnalise(c7,'comparativo-serie-a');};
  c7right.appendChild(c7hint);c7right.appendChild(c7sbtn);
  c7title.appendChild(c7lbl);c7title.appendChild(c7right);
  c7.appendChild(c7title);
  cardDesc(c7,'Comparativo do Flamengo com os demais elencos da Série A');

  // ─ lista única: cada clube = rank + componente (input OU donut) + nome
  const salist=document.createElement('div');salist.className='sa-list';
  c7.appendChild(salist);

  // ordem: preenchidos por nível desc primeiro; vazios por ordem alfabética depois
  function sortedSerieA(){
    return ST.serieA.map(function(c,ci){return{c:c,ci:ci};}).sort(function(a,b){
      const af=a.c.nivel>0,bf=b.c.nivel>0;
      if(af&&bf)return b.c.nivel-a.c.nivel;
      if(af&&!bf)return -1;
      if(!af&&bf)return 1;
      return a.c.clube.localeCompare(b.c.clube);
    });
  }

  function buildSaList(){
    salist.innerHTML='';
    sortedSerieA().forEach(function(entry,idx){
      const c=entry.c,ci=entry.ci;
      const row=document.createElement('div');row.className='sa-item';
      const rank=document.createElement('span');rank.className='sa-rank';rank.textContent=(idx+1)+'°';
      const slot=document.createElement('span');slot.className='sa-slot';
      const lbl=document.createElement('span');lbl.className='sa-lbl'+(c.fla?' fla':'');lbl.textContent=c.clube;lbl.title=c.clube;
      row.appendChild(rank);row.appendChild(slot);row.appendChild(lbl);
      salist.appendChild(row);

      function showDonut(){
        slot.innerHTML='';
        const d=nivelDonutEl(c.nivel,28);d.className+=' sa-row-donut';
        if(!c.fla){
          d.style.cursor='pointer';d.title='Clique para editar';
          d.onclick=function(){showInput(true);};
        }
        slot.appendChild(d);
      }
      function showInput(focusIt){
        slot.innerHTML='';
        const inp=document.createElement('input');inp.type='number';inp.min='0';inp.max='100';
        inp.className='sa-inp';inp.value=c.nivel||'';
        slot.appendChild(inp);
        if(focusIt){inp.focus();if(c.nivel)inp.select();}
        inp.addEventListener('keydown',function(e){
          if(e.key==='Enter'){e.preventDefault();inp.blur();}
        });
        inp.addEventListener('blur',function(){
          ST.serieA[ci].nivel=safeNivel(inp.value);
          save();
          buildSaList();
        });
      }

      if(c.nivel>0)showDonut();else showInput();
    });
  }
  buildSaList();
  // Ordem final: c2(Nível), c1(Idade), c7(Série A), c3(Valor), c5(Status)+c6(Sel.) lado a lado, c4(Nac.)
  grid.appendChild(c2);
  grid.appendChild(c1);
  grid.appendChild(c7);
  grid.appendChild(c3);
  grid.appendChild(c5);
  grid.appendChild(c6);
  grid.appendChild(c4);
}

// MODALS
function openPl(id){
  ST.epid=id||null;mplSelVal=false;
  document.getElementById('modal-pl').style.display='flex';
  document.getElementById('mpl-title').textContent=id?'Editar Jogador':'Novo Jogador';
  if(id){const p=gp(id);document.getElementById('mpl-name').value=p.name;document.getElementById('mpl-pos').value=p.pos;document.getElementById('mpl-age').value=p.age;document.getElementById('mpl-nat').value=p.nat||'';document.getElementById('mpl-status').value=p.status;document.getElementById('mpl-nivel').value=p.nivel||'';document.getElementById('mpl-valor').value=p.valor||'';document.getElementById('mpl-foto').value=p.foto||'';document.getElementById('mpl-obs').value=p.obs||'';mplSelVal=p.selecionavel||false;}
  else{['mpl-name','mpl-foto','mpl-obs','mpl-nivel','mpl-valor'].forEach(function(x){document.getElementById(x).value='';});document.getElementById('mpl-pos').value='CA';document.getElementById('mpl-age').value='';document.getElementById('mpl-nat').value='BRA';document.getElementById('mpl-status').value='Compõe elenco';setTimeout(function(){document.getElementById('mpl-name').focus();},50);}
  const tog=document.getElementById('mpl-sel-toggle');const lbl=document.getElementById('mpl-sel-lbl');
  if(mplSelVal){tog.classList.add('on');lbl.textContent='Sim';}else{tog.classList.remove('on');lbl.textContent='Não';}
  const delBtn=document.getElementById('mpl-delete');if(delBtn)delBtn.style.display=id?'':'none';
}
