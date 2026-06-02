const SK='fla_v7';
const SLIST=['Titular','Importante','Compõe elenco','Vender','Dispensável'];
const SCOL={'Titular':'#60a5fa','Importante':'#22c55e','Compõe elenco':'#f97316','Vender':'#ef4444','Dispensável':'#9ca3af'};
const SHEX={'Titular':'#60a5fa','Importante':'#22c55e','Compõe elenco':'#f97316','Vender':'#ef4444','Dispensável':'#9ca3af'};
const AVCOLS=['#e11d48','#7c3aed','#0369a1','#047857','#b45309','#0e7490','#9333ea','#b91c1c'];
const PIE_COLS=['#e11d48','#f97316','#f59e0b','#22c55e','#0ea5e9','#a78bfa','#ec4899','#14b8a6','#f43f5e','#84cc16','#06b6d4','#8b5cf6'];
const POSITIONS=['GOL','ZAG','LD','LE','VOL','MEI','PD','PE','CA'];
const PRIO_LABELS=['','Baixa','Média','Alta','Oportunidade'];
const FMTS={
  '4-2-3-1':[[50,85,'GOL'],[87,72,'LD'],[65,79,'ZAG'],[35,79,'ZAG'],[13,72,'LE'],[63,56,'VOL'],[37,56,'VOL'],[82,33,'PD'],[50,36,'MEI'],[18,33,'PE'],[50,18,'CA']],
  '4-3-3':[[50,85,'GOL'],[87,72,'LD'],[65,79,'ZAG'],[35,79,'ZAG'],[13,72,'LE'],[74,50,'VOL'],[50,47,'MEI'],[26,50,'VOL'],[82,20,'PD'],[50,16,'CA'],[18,20,'PE']],
  '4-4-2':[[50,85,'GOL'],[87,72,'LD'],[65,79,'ZAG'],[35,79,'ZAG'],[13,72,'LE'],[84,50,'PD'],[61,53,'VOL'],[39,53,'MEI'],[16,50,'PE'],[33,16,'CA'],[67,16,'CA']],
  '3-5-2':[[50,85,'GOL'],[74,79,'ZAG'],[50,81,'ZAG'],[26,79,'ZAG'],[92,55,'LD'],[68,52,'VOL'],[50,50,'MEI'],[32,52,'VOL'],[8,55,'LE'],[33,18,'CA'],[67,18,'CA']]
};

function pmatch(p,l){const m={GOL:['GOL'],LD:['LD'],LE:['LE'],ZAG:['ZAG'],VOL:['VOL'],MEI:['MEI'],CA:['CA'],PD:['PD','MEI'],PE:['PE','MEI']};return(m[l]||[l]).includes(p);}
function nivelDef(s){return{Titular:80,Importante:70,'Compõe elenco':60,Vender:55,Dispensável:45}[s]||60;}
function starChar(i,prio){
  if(prio===4)return i<=4?'★':'☆';
  return i<=prio?'★':'☆';
}
function starColor(prio){return prio===4?'#60a5fa':'#f59e0b';}
function prioLabel(prio){return PRIO_LABELS[prio]||'';}

const DEF=[
  {id:1,name:'Rossi',pos:'GOL',age:30,nat:'ARG',status:'Titular',nivel:82,valor:8,selecionavel:false,foto:'',obs:''},
  {id:2,name:'Andrew',pos:'GOL',age:24,nat:'BRA',status:'Importante',nivel:65,valor:2,selecionavel:true,foto:'',obs:'Contratado em 2026'},
  {id:3,name:'Dyogo Alves',pos:'GOL',age:22,nat:'BRA',status:'Compõe elenco',nivel:55,valor:0.5,selecionavel:false,foto:'',obs:''},
  {id:4,name:'Léo Pereira',pos:'ZAG',age:30,nat:'BRA',status:'Titular',nivel:81,valor:12,selecionavel:true,foto:'',obs:''},
  {id:5,name:'Vitão',pos:'ZAG',age:26,nat:'BRA',status:'Titular',nivel:76,valor:10,selecionavel:true,foto:'',obs:'Contratado 2026'},
  {id:6,name:'Léo Ortiz',pos:'ZAG',age:30,nat:'BRA',status:'Vender',nivel:72,valor:8,selecionavel:false,foto:'',obs:'Lista de saídas jul/26'},
  {id:7,name:'Varela',pos:'LD',age:33,nat:'URU',status:'Titular',nivel:78,valor:6,selecionavel:true,foto:'',obs:''},
  {id:8,name:'Emerson Royal',pos:'LD',age:27,nat:'BRA',status:'Importante',nivel:74,valor:10,selecionavel:true,foto:'',obs:''},
  {id:9,name:'Danilo',pos:'LD',age:34,nat:'BRA',status:'Compõe elenco',nivel:70,valor:1.5,selecionavel:false,foto:'',obs:''},
  {id:10,name:'João Souza',pos:'ZAG',age:19,nat:'BRA',status:'Compõe elenco',nivel:58,valor:1,selecionavel:false,foto:'',obs:'Jovem'},
  {id:11,name:'Ayrton Lucas',pos:'LE',age:28,nat:'BRA',status:'Titular',nivel:79,valor:14,selecionavel:true,foto:'',obs:''},
  {id:12,name:'Alex Sandro',pos:'LE',age:35,nat:'BRA',status:'Compõe elenco',nivel:65,valor:1,selecionavel:false,foto:'',obs:''},
  {id:13,name:'Pulgar',pos:'VOL',age:32,nat:'CHI',status:'Importante',nivel:73,valor:5,selecionavel:true,foto:'',obs:''},
  {id:14,name:'Evertton Araújo',pos:'VOL',age:23,nat:'BRA',status:'Vender',nivel:62,valor:3,selecionavel:false,foto:'',obs:'Lista de saídas'},
  {id:15,name:'Jorginho',pos:'VOL',age:34,nat:'ITA',status:'Compõe elenco',nivel:72,valor:2,selecionavel:false,foto:'',obs:''},
  {id:16,name:'Arrascaeta',pos:'MEI',age:31,nat:'URU',status:'Titular',nivel:87,valor:20,selecionavel:true,foto:'',obs:''},
  {id:17,name:'De La Cruz',pos:'MEI',age:28,nat:'URU',status:'Titular',nivel:84,valor:22,selecionavel:true,foto:'',obs:''},
  {id:18,name:'Paquetá',pos:'MEI',age:28,nat:'BRA',status:'Titular',nivel:88,valor:60,selecionavel:true,foto:'',obs:'Retornou West Ham'},
  {id:19,name:'Carrascal',pos:'MEI',age:27,nat:'COL',status:'Importante',nivel:75,valor:8,selecionavel:true,foto:'',obs:''},
  {id:20,name:'Saúl',pos:'MEI',age:31,nat:'ESP',status:'Compõe elenco',nivel:70,valor:3,selecionavel:false,foto:'',obs:''},
  {id:21,name:'Lorran',pos:'MEI',age:19,nat:'BRA',status:'Compõe elenco',nivel:65,valor:5,selecionavel:false,foto:'',obs:'Emprestado Pisa'},
  {id:22,name:'Luiz Araújo',pos:'PD',age:29,nat:'BRA',status:'Titular',nivel:80,valor:12,selecionavel:true,foto:'',obs:''},
  {id:23,name:'Gonzalo Plata',pos:'PD',age:25,nat:'EQU',status:'Importante',nivel:73,valor:10,selecionavel:true,foto:'',obs:''},
  {id:24,name:'Samuel Lino',pos:'PE',age:26,nat:'BRA',status:'Importante',nivel:74,valor:12,selecionavel:true,foto:'',obs:''},
  {id:25,name:'Bruno Henrique',pos:'PE',age:35,nat:'BRA',status:'Importante',nivel:73,valor:3,selecionavel:false,foto:'',obs:'Renovado 2027'},
  {id:26,name:'Everton Cebolinha',pos:'PE',age:30,nat:'BRA',status:'Vender',nivel:68,valor:5,selecionavel:false,foto:'',obs:'Saída iminente'},
  {id:27,name:'Pedro',pos:'CA',age:28,nat:'BRA',status:'Titular',nivel:86,valor:35,selecionavel:true,foto:'',obs:'Artilheiro'},
  {id:28,name:'Wallace Yan',pos:'CA',age:21,nat:'BRA',status:'Vender',nivel:60,valor:2,selecionavel:false,foto:'',obs:'Lista de saídas'},
];

let ST={
  players:[],targets:[],
  fmt:{A:'4-2-3-1',B:'4-2-3-1',C:'4-2-3-1'},
  slots:{A:Array(11).fill(null),B:Array(11).fill(null),C:Array(11).fill(null)},
  slotsByFmt:{},
  customPos:{},
  ft:'A',rt:'elenco',
  sf:'',filterPos:[],filterStatus:[],
  tsf:'',filterTPos:[],filterTPrio:[],
  sortKey:'',sortAsc:true,
  tsortKey:'',tsortAsc:true,
  epid:null,etid:null,
  selToggle:false,
  serieA:[
    {clube:'Flamengo',nivel:0,fla:true},
    {clube:'Palmeiras',nivel:0},
    {clube:'Atlético-MG',nivel:0},
    {clube:'Grêmio',nivel:0},
    {clube:'Internacional',nivel:0},
    {clube:'São Paulo',nivel:0},
    {clube:'Corinthians',nivel:0},
    {clube:'Botafogo',nivel:0},
    {clube:'Fluminense',nivel:0},
    {clube:'Cruzeiro',nivel:0},
    {clube:'Athletico-PR',nivel:0},
    {clube:'Bragantino',nivel:0},
    {clube:'Bahia',nivel:0},
    {clube:'Remo',nivel:0},
    {clube:'Vasco',nivel:0},
    {clube:'Santos',nivel:0},
    {clube:'Chapecoense',nivel:0},
    {clube:'Mirassol',nivel:0},
    {clube:'Coritiba',nivel:0},
    {clube:'Vitória',nivel:0},
  ],
};
let dragId=null,dragSi=null,lastFieldX=null,lastFieldY=null,dragOffX=0,dragOffY=0;
let mplSelVal=false;
let mtgtPrio=0;

function syncSlotsToFmt(){
  ['A','B','C'].forEach(function(t){
    var key=t+'|'+ST.fmt[t];
    ST.slotsByFmt[key]=ST.slots[t].slice();
  });
}
