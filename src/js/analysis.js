// ─── blindagem numérica (Nível/Valor) contra dados corrompidos no localStorage ──
function safeNivel(v){var n=parseFloat(v);if(isNaN(n))return 0;return Math.max(0,Math.min(100,n));}
function safeValor(v){var n=parseFloat(v);if(isNaN(n))return 0;return Math.max(0,Math.min(999,n));}

function renderAnalise(){
  const grid=document.getElementById('agrid');grid.innerHTML='';
  const pl=ST.players;const tg=ST.targets;if(!pl.length)return;

  function slotPlayers(tab){return ST.slots[tab].filter(Boolean).map(function(id){return typeof id==='number'?gp(id):null;}).filter(Boolean);}
  const titulares=slotPlayers('A');
  const reservas=slotPlayers('B');
  const projecao=slotPlayers('C');

  // ── 1. IDADE MÉDIA ──────────────────────────────────────────────
  const c1=makeCard(false,'Idade Média',['bar'],function(cont){
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
      escGrid.appendChild(makeEscDonut(tav,'var(--cv)','Alvos'));
    }
    cont.appendChild(escGrid);
  });
  // (c2 appendado no final)

  // ── 3. VALOR DO ELENCO ──────────────────────────────────────────
  const c3=makeCard(true,'Valor do Elenco',['bar'],function(cont,type){
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
    const natMap={};
    pl.forEach(function(p){const n=p.nat||'?';natMap[n]=(natMap[n]||0)+1;});
    const arr=Object.keys(natMap).sort(function(a,b){return natMap[b]-natMap[a];});
    const data=arr.map(function(n){return{lbl:n,val:natMap[n],customColor:natColor(n)};});
    {
      // barras com gradiente por seleção
      const maxV=data[0]?data[0].val:1;
      data.forEach(function(d){
        const pct=maxV?Math.round(d.val/maxV*100):0;
        const row=document.createElement('div');row.className='bar-row';
        const lbl=document.createElement('span');lbl.className='bar-lbl';lbl.title=d.lbl;
        const lt=document.createElement('span');lt.textContent=d.lbl;lbl.appendChild(lt);
        const track=document.createElement('div');track.className='bar-track primary';
        const fill=document.createElement('div');fill.className='bar-fill';
        const grad=natGradient(d.lbl);
        fill.style.background=grad||d.customColor;
        fill.style.setProperty('--target-width',pct+'%');
        fill.style.width='0';
        track.appendChild(fill);
        const num=document.createElement('span');num.className='bar-num';num.textContent=d.val+' jog.';
        const tip=document.createElement('div');tip.className='bar-tooltip';tip.textContent=d.lbl+': '+d.val+' jogadores';
        row.appendChild(lbl);row.appendChild(track);row.appendChild(num);row.appendChild(tip);
        cont.appendChild(row);
        requestAnimationFrame(function(){requestAnimationFrame(function(){fill.style.transition='width .6s cubic-bezier(.25,.46,.45,.94)';fill.style.width=pct+'%';});});
      });
    }
  });
  // (c4 appendado no final)

  // ── 5. STATUS ───────────────────────────────────────────────────
  var STATUS_HIER={'Titular':'#60a5fa','Importante':'#22c55e','Compõe elenco':'#f97316','Vender':'#ef4444','Dispensável':'#9ca3af'};
  const c5=makeCard(false,'Por Status',['bar'],function(cont,type){
    const data=SLIST.map(function(s){return{lbl:s,val:pl.filter(function(p){return p.status===s;}).length,customColor:STATUS_HIER[s]};}).filter(function(d){return d.val>0;});
    {
      const maxV=data.length?Math.max.apply(null,data.map(function(d){return d.val;})):1;
      barChart(cont,data,maxV,null,function(v){return v+' jog.';},{primary:true,tooltipFn:function(d){return d.lbl+': '+d.val+' jogadores';}});
    }
  });
  // (c5 appendado no final)

  // ── 6. SELECIONÁVEIS ────────────────────────────────────────────
  const c6=makeCard(false,'Selecionáveis por Seleção',['bar'],function(cont){
    const selMap={};
    pl.filter(function(p){return p.selecionavel;}).forEach(function(p){const n=p.nat||'?';selMap[n]=(selMap[n]||0)+1;});
    const arr=Object.keys(selMap).sort(function(a,b){return selMap[b]-selMap[a];});
    if(!arr.length){cont.innerHTML='<div style="color:var(--gray);font-size:12px;padding:8px 0">Nenhum jogador marcado como selecionável.<br>Edite jogadores e ative o campo "Selecionável".</div>';return;}
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

  // layout: inputs (esquerda) + gráfico (direita)
  const c7body=document.createElement('div');c7body.style.cssText='display:flex;gap:20px;align-items:flex-start';

  // ─ inputs grid
  const igrid=document.createElement('div');igrid.className='sa-grid';igrid.style.width='290px';igrid.style.flexShrink='0';
  ST.serieA.forEach(function(c,ci){
    const row=document.createElement('div');row.className='sa-row';
    const lbl=document.createElement('span');lbl.className='sa-lbl'+(c.fla?' fla':'');lbl.textContent=c.clube;lbl.title=c.clube;
    const inp=document.createElement('input');inp.type='number';inp.min='0';inp.max='100';
    inp.className='sa-inp'+(c.fla?' fla-inp':'');
    inp.value=c.nivel||'';inp.placeholder='—';
    if(c.fla){inp.readOnly=true;inp.tabIndex=-1;}
    inp.oninput=function(){
      ST.serieA[ci].nivel=parseFloat(inp.value)||0;
      save();
      // atualiza donut inline
      var existing=row.querySelector('.sa-row-donut');
      var nd=nivelDonutEl(ST.serieA[ci].nivel,28);nd.className+=' sa-row-donut';
      if(existing)row.replaceChild(nd,existing);
      buildC7Chart();
    };
    row.appendChild(lbl);row.appendChild(inp);
    // donut inline — visível só no mobile via CSS
    const rowDonut=nivelDonutEl(c.nivel||0,28);rowDonut.className+=' sa-row-donut';
    row.appendChild(rowDonut);
    igrid.appendChild(row);
  });
  c7body.appendChild(igrid);

  // ─ gráfico
  const c7chart=document.createElement('div');c7chart.className='c7chart';c7chart.style.cssText='flex:1;min-width:0';
  c7body.appendChild(c7chart);
  c7.appendChild(c7body);

  function buildC7Chart(){
    c7chart.innerHTML='';
    const data=ST.serieA.filter(function(c){return c.nivel>0;})
      .slice().sort(function(a,b){return b.nivel-a.nivel;});
    if(!data.length){
      const emp=document.createElement('div');emp.style.cssText='color:var(--gray);font-size:12px;padding:16px 0';
      emp.textContent='Insira os níveis dos clubes para gerar o gráfico.';
      c7chart.appendChild(emp);return;
    }
    // two-column grid of donuts
    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px 20px';
    data.forEach(function(c,idx){
      const col=c.fla?'#a78bfa':nivelColor(c.nivel);
      const item=document.createElement('div');
      item.style.cssText='display:flex;align-items:center;gap:8px;padding:4px 0;'+(idx>0?'border-top:1px solid rgba(255,255,255,.04)':'');
      // rank badge
      const rank=document.createElement('div');rank.style.cssText='font-family:Barlow Condensed,sans-serif;font-size:10px;font-weight:700;color:var(--dark4);width:14px;text-align:right;flex-shrink:0';rank.textContent=(idx+1)+'°';
      item.appendChild(rank);
      // donut
      item.appendChild(nivelDonutEl(c.nivel,34));
      // text
      const txt=document.createElement('div');txt.style.cssText='min-width:0;flex:1';
      const cname=document.createElement('div');
      cname.style.cssText='font-family:Barlow Condensed,sans-serif;font-size:12px;font-weight:'+(c.fla?'800':'600')+';color:'+(c.fla?'#a78bfa':'var(--white)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      cname.textContent=c.clube;
      const cnivel=document.createElement('div');cnivel.style.cssText='font-size:9px;color:'+col+';font-family:Barlow Condensed,sans-serif;font-weight:700';cnivel.textContent=c.nivel+'/100';
      txt.appendChild(cname);txt.appendChild(cnivel);
      item.appendChild(txt);
      grid.appendChild(item);
    });
    c7chart.appendChild(grid);
  }
  buildC7Chart();
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
var LEGAL_CONTENT={
  privacy:{
    title:'Política de Privacidade',
    body:`<h3>1. Informações que Coletamos</h3>
Esta plataforma utiliza armazenamento local (<em>localStorage</em>) exclusivamente no seu navegador para salvar as configurações do elenco, escalações e metas de mercado. Nenhuma informação pessoal é coletada, transmitida ou armazenada em servidores externos.
<h3>2. Cookies e Tecnologias de Rastreamento</h3>
Utilizamos cookies estritamente necessários para o funcionamento da plataforma. Podemos utilizar ferramentas de análise agregada (como Google Analytics) para compreender padrões de uso sem identificar usuários individualmente. Ao aceitar, você consente com o uso de cookies analíticos.
<h3>3. Publicidade</h3>
Esta plataforma pode exibir anúncios veiculados pelo Google AdSense. O Google pode utilizar cookies para exibir anúncios relevantes com base em suas visitas anteriores a este e a outros sites. Saiba mais em <em>google.com/policies/privacy/partners</em>.
<h3>4. Seus Direitos (LGPD)</h3>
Nos termos da Lei nº 13.709/2018 (LGPD), você tem direito a: acessar, corrigir e excluir seus dados. Como todos os dados são armazenados localmente no seu navegador, você pode limpá-los a qualquer momento pelo gerenciador de armazenamento do navegador.
<h3>5. Contato</h3>
Dúvidas sobre esta política podem ser enviadas para: <em>privacidade@urubufc.com.br</em>`
  },
  terms:{
    title:'Termos de Uso',
    body:`<h3>1. Aceitação dos Termos</h3>
Ao acessar e utilizar a plataforma Urubu FC, você concorda com estes Termos de Uso. Caso não concorde, por favor, não utilize a plataforma.
<h3>2. Descrição do Serviço</h3>
A plataforma Urubu FC é uma ferramenta de gestão de elenco de futebol destinada a fins recreativos e informativos. Todos os dados inseridos são de responsabilidade exclusiva do usuário.
<h3>3. Uso Permitido</h3>
É permitido o uso pessoal e não-comercial desta plataforma. É proibida a reprodução, distribuição ou modificação do código-fonte sem autorização expressa.
<h3>4. Isenção de Responsabilidade</h3>
A Urubu FC não se responsabiliza por decisões tomadas com base nos dados inseridos na plataforma. As informações sobre jogadores, valores de mercado e níveis são inseridas manualmente pelos usuários e não refletem dados oficiais.
<h3>5. Propriedade Intelectual</h3>
O design, código e identidade visual da plataforma Urubu FC são propriedade de seus criadores. Os dados sobre jogadores e clubes são de domínio público ou inseridos pelos próprios usuários.
<h3>6. Alterações</h3>
Estes termos podem ser atualizados periodicamente. O uso continuado da plataforma após alterações constitui aceitação dos novos termos.`
  }
};
function openLegal(type){
  var c=LEGAL_CONTENT[type];if(!c)return;
  document.getElementById('legal-title').textContent=c.title;
  document.getElementById('legal-body').innerHTML=c.body;
  document.getElementById('legal-over').classList.add('open');
}
function closeLegal(){document.getElementById('legal-over').classList.remove('open');}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLegal();});
// COOKIE
function acceptCookies(){localStorage.setItem('ufc_cookie','1');var cb=document.getElementById('cookie-bar');if(cb)cb.classList.add('hidden');}
function declineCookies(){localStorage.setItem('ufc_cookie','0');var cb=document.getElementById('cookie-bar');if(cb)cb.classList.add('hidden');}

