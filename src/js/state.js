function save(){try{syncSlotsToFmt();localStorage.setItem(SK,JSON.stringify({players:ST.players,targets:ST.targets,fmt:ST.fmt,slots:ST.slots,slotsByFmt:ST.slotsByFmt,customPos:ST.customPos,customFn:ST.customFn,customFmts:ST.customFmts,customFmtsV:CUSTOM_FMT_SCHEMA_V,fmtUsage:ST.fmtUsage,serieA:ST.serieA}));}catch(e){}}
function load(){
  try{
    const r=localStorage.getItem(SK);
    if(r){
      const d=JSON.parse(r);
      ST.players=d.players||DEF.map(function(p){return Object.assign({},p);});
      ST.targets=d.targets||[];
      ST.fmt=Object.assign({A:'4-2-3-1',B:'4-2-3-1',C:'4-2-3-1'},d.fmt||{});
      ST.slots=Object.assign({A:Array(11).fill(null),B:Array(11).fill(null),C:Array(11).fill(null)},d.slots||{});
      ST.slotsByFmt=d.slotsByFmt||{};
      ST.customPos=d.customPos||{};
      ST.customFn=d.customFn||{};
      // Formações customizadas: sempre revalidadas na carga (o localStorage pode
      // ter sido editado à mão ou vir de uma versão futura do schema). Formação
      // inválida é descartada em silêncio em vez de quebrar o campo.
      // d.customFmtsV guarda a versão do schema — hoje só é registrada; quando
      // houver uma v2, é aqui que a migração vai entrar, antes de validar.
      ST.customFmts=validarCustomFmts(d.customFmts);
      // Ranking de uso (frecência) das formações, por chave (nome de fábrica ou
      // id customizado). Ausente/corrompido -> objeto vazio; cada formação sem
      // registro é tratada como "nunca usada" (score=0) por getFmtScore(), e as
      // 4 de fábrica ganham um score-piso logo abaixo — nunca lança erro.
      ST.fmtUsage=(d.fmtUsage&&typeof d.fmtUsage==='object'&&!Array.isArray(d.fmtUsage))?d.fmtUsage:{};
      // Se alguma aba apontava para uma formação que não existe mais (foi
      // excluída, ou veio inválida acima), volta para a formação de fábrica.
      ['A','B','C'].forEach(function(t){
        if(!fmtExists(ST.fmt[t]))ST.fmt[t]=FMT_FALLBACK;
      });
      // sincronizar: ST.slots[tab] reflete a escalação da formação atual de cada aba
      ['A','B','C'].forEach(function(t){
        var key=t+'|'+ST.fmt[t];
        if(ST.slotsByFmt[key])ST.slots[t]=ST.slotsByFmt[key].slice();
        else ST.slotsByFmt[key]=ST.slots[t].slice();
      });
      // merge serieA: preserve order/names from ST defaults, update niveis from saved
      if(d.serieA&&d.serieA.length){
        const saved={};d.serieA.forEach(function(c){saved[c.clube]=c.nivel||0;});
        ST.serieA.forEach(function(c){if(saved[c.clube]!==undefined)c.nivel=saved[c.clube];});
      }
      ST.players.forEach(function(p){
        if(p.nivel===undefined)p.nivel=nivelDef(p.status);
        if(p.valor===undefined)p.valor=0;
        if(p.foto===undefined)p.foto='';
        if(p.selecionavel===undefined)p.selecionavel=false;
      });
      ST.targets.forEach(function(t){
        if(t.nivel===undefined)t.nivel=0;
        if(t.prio===undefined)t.prio=0;
      });
      _initFmtUsageFabrica();
    } else {
      ST.players=DEF.map(function(p){return Object.assign({},p);});
      ST.fmtUsage={};
      _initFmtUsageFabrica();
      autoFill('A');
    }
  }catch(e){ST.players=DEF.map(function(p){return Object.assign({},p);});ST.fmtUsage={};_initFmtUsageFabrica();autoFill('A');}
}

// Piso de ranking: as 4 formações de fábrica sempre têm um score mínimo
// (score=1) mesmo antes de qualquer clique do usuário — sem isso a Linha 2
// ficaria vazia/arbitrária na primeira visita. Só cria o registro se ainda
// não existir (nunca pisa em score real já acumulado por uso).
// IMPORTANTE: lastUsed do piso é o momento da própria inicialização (agora),
// não epoch 0 — sob a fórmula de meia-vida de 30 dias, um "lastUsed" no
// passado distante (ex: 1970) decai score=1 para ~0 quase instantaneamente
// (dezenas de milhares de dias / 30 já satura 0.5^n), o que faria o piso
// sumir do ranking assim que qualquer formação real fosse usada — o oposto
// do que este piso existe para garantir.
function _initFmtUsageFabrica(){
  Object.keys(FMTS).forEach(function(k){
    if(!ST.fmtUsage[k])ST.fmtUsage[k]={score:1,lastUsed:Date.now()};
  });
}

// Score efetivo (decaído) de uma formação NO MOMENTO da leitura — nunca
// escreve em ST.fmtUsage. Meia-vida de 30 dias: score cai pela metade a
// cada 30 dias sem uso. Formação sem registro = nunca usada = 0.
function getFmtScoreEfetivo(key){
  const u=ST.fmtUsage[key];
  if(!u)return 0;
  const dias=(Date.now()-(u.lastUsed||0))/86400000;
  return (u.score||0)*Math.pow(0.5,dias/30);
}

// Registra uso efetivo de uma formação (clique no botão da Linha 2 ou troca
// via dropdown do item 18) — decai o score até agora e soma +1, na mesma
// operação. É o ÚNICO lugar que persiste mudança de score (leitura de
// ranking usa getFmtScoreEfetivo() acima, sem persistir nada).
function registrarUsoFmt(key){
  const efetivo=getFmtScoreEfetivo(key);
  ST.fmtUsage[key]={score:efetivo+1,lastUsed:Date.now()};
}

// Bônus de criação: formação customizada recém-criada nasce com score maior
// que o maior score efetivo existente no momento — garante topo do ranking
// imediatamente, sem inflar o histórico de uso real (é um bônus único; usos
// seguintes seguem a regra normal de registrarUsoFmt()).
function initFmtUsageNovaCustom(key){
  let maior=0;
  Object.keys(ST.fmtUsage).forEach(function(k){
    const s=getFmtScoreEfetivo(k);
    if(s>maior)maior=s;
  });
  ST.fmtUsage[key]={score:maior+1,lastUsed:Date.now()};
}

function gp(id){return ST.players.find(function(p){return p.id===id;});}
function gt(id){return ST.targets.find(function(t){return t.id===id;});}
function npi(){return Math.max(0,...ST.players.map(function(p){return p.id;}))+1;}
function nti(){return Math.max(0,...ST.targets.map(function(t){return t.id;}))+1;}
function slotEnt(tab,i){
  const k=ST.slots[tab][i];
  if(!k)return null;
  if(typeof k==='number')return{type:'p',data:gp(k)};
  if(typeof k==='string'&&k.startsWith('t:'))return{type:'t',data:gt(+k.slice(2))};
  return null;
}
function autoFill(tab){
  const f=fmtSlots(ST.fmt[tab]);ST.slots[tab]=Array(11).fill(null);
  const used=new Set();
  const pool=tab==='B'?ST.players.filter(function(p){return p.status==='Importante'||p.status==='Compõe elenco';}):ST.players.filter(function(p){return p.status==='Titular';});
  f.forEach(function(s,i){const fn=slotFn(tab,i);const m=pool.find(function(p){return !used.has(p.id)&&pmatch(p.pos,fn);});if(m){ST.slots[tab][i]=m.id;used.add(m.id);}});
}

// Ação do botão "Auto-escalar": preenche SOMENTE os slots vazios da aba ativa,
// sem nunca tocar em slots já ocupados manualmente. Diferente de autoFill():
// não zera ST.slots[tab], usa cascata de status por aba e escolhe, entre
// candidatos compatíveis, o de maior nível. Jogadores-alvo do Mercado nunca
// entram no pool. Não altera as demais abas.
function autoFillEmpty(tab){
  const used=new Set();
  // Ids já ocupados nos demais slots desta mesma aba não podem ser reusados.
  ST.slots[tab].forEach(function(k){if(typeof k==='number')used.add(k);});
  // Camadas de status em cascata, por aba. B mantém a regra já existente
  // (sem fallback em duas camadas separadas); A e C caem de Titular para
  // Importante quando não houver titular compatível disponível.
  const camadas=tab==='B'
    ?[function(p){return p.status==='Importante'||p.status==='Compõe elenco';}]
    :[function(p){return p.status==='Titular';},function(p){return p.status==='Importante';}];
  for(let i=0;i<11;i++){
    if(ST.slots[tab][i]!=null)continue; // nunca sobrescreve slot já ocupado
    const fn=slotFn(tab,i);
    let escolhido=null;
    for(let c=0;c<camadas.length&&!escolhido;c++){
      const candidatos=ST.players
        .filter(function(p){return !used.has(p.id)&&camadas[c](p)&&pmatch(p.pos,fn);})
        .sort(function(a,b){return (b.nivel||0)-(a.nivel||0);});
      if(candidatos.length)escolhido=candidatos[0];
    }
    if(escolhido){ST.slots[tab][i]=escolhido.id;used.add(escolhido.id);}
  }
}

// PHOTO
