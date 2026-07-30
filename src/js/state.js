function save(){try{syncSlotsToFmt();localStorage.setItem(SK,JSON.stringify({players:ST.players,targets:ST.targets,fmt:ST.fmt,slots:ST.slots,slotsByFmt:ST.slotsByFmt,customPos:ST.customPos,customFn:ST.customFn,customFmts:ST.customFmts,customFmtsV:CUSTOM_FMT_SCHEMA_V,serieA:ST.serieA}));}catch(e){}}
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
    } else {
      ST.players=DEF.map(function(p){return Object.assign({},p);});
      autoFill('A');
    }
  }catch(e){ST.players=DEF.map(function(p){return Object.assign({},p);});autoFill('A');}
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

// PHOTO
