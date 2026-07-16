const SK='fla_v7';
const SLIST=['Titular','Importante','Compõe elenco','Vender','Dispensável'];
const SCOL={'Titular':'#60a5fa','Importante':'#22c55e','Compõe elenco':'#f97316','Vender':'#ef4444','Dispensável':'#9ca3af'};
const SHEX={'Titular':'#60a5fa','Importante':'#22c55e','Compõe elenco':'#f97316','Vender':'#ef4444','Dispensável':'#9ca3af'};
const AVCOLS=['#e11d48','#7c3aed','#0369a1','#047857','#b45309','#0e7490','#9333ea','#b91c1c'];
const PIE_COLS=['#e11d48','#f97316','#f59e0b','#22c55e','#0ea5e9','#a78bfa','#ec4899','#14b8a6','#f43f5e','#84cc16','#06b6d4','#8b5cf6'];
const POSITIONS=['GOL','ZAG','LD','LE','VOL','MEI','PD','PE','CA'];
const PRIO_LABELS=['','Baixa','Média','Alta','Oportunidade'];
const FMTS={
  '4-2-3-1':[[50,86,'GOL'],[81.5,69,'LD'],[62.8,76,'ZAG'],[37.2,76,'ZAG'],[18.6,69,'LE'],[61,53,'VOL'],[39,53,'VOL'],[77.2,30,'PD'],[50,33,'MEI'],[22.8,30,'PE'],[50,12,'CA']],
  '4-3-3':[[50,86,'GOL'],[81.5,69,'LD'],[62.8,76,'ZAG'],[37.2,76,'ZAG'],[18.6,69,'LE'],[70.4,47,'VOL'],[50,44,'MEI'],[29.6,47,'VOL'],[77.2,17,'PD'],[50,10,'CA'],[22.8,17,'PE']],
  '4-4-2':[[50,86,'GOL'],[81.5,69,'LD'],[62.8,76,'ZAG'],[37.2,76,'ZAG'],[18.6,69,'LE'],[78.9,47,'PD'],[59.4,50,'VOL'],[40.6,50,'MEI'],[21.1,47,'PE'],[33,10,'CA'],[67,10,'CA']],
  '3-5-2':[[50,86,'GOL'],[70.4,76,'ZAG'],[50,78,'ZAG'],[29.6,76,'ZAG'],[85.7,52,'LD'],[65.3,49,'VOL'],[50,47,'MEI'],[34.7,49,'VOL'],[14.3,52,'LE'],[33,12,'CA'],[67,12,'CA']]
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
  {id:1,name:'Rossi',pos:'GOL',age:30,nat:'ARG',status:'Titular',nivel:78,valor:5,selecionavel:false,foto:'',obs:''},
  {id:2,name:'Andrew',pos:'GOL',age:24,nat:'BRA',status:'Compõe elenco',nivel:67,valor:2,selecionavel:false,foto:'',obs:''},
  {id:3,name:'Dyogo Alves',pos:'GOL',age:22,nat:'BRA',status:'Compõe elenco',nivel:63,valor:1,selecionavel:false,foto:'',obs:''},
  {id:4,name:'Varela',pos:'LD',age:27,nat:'URU',status:'Titular',nivel:78,valor:12,selecionavel:false,foto:'',obs:''},
  {id:5,name:'Emerson Royal',pos:'LD',age:25,nat:'BRA',status:'Importante',nivel:75,valor:15,selecionavel:false,foto:'',obs:''},
  {id:6,name:'Danilo',pos:'ZAG',age:34,nat:'BRA',status:'Importante',nivel:79,valor:3,selecionavel:false,foto:'',obs:''},
  {id:7,name:'Léo Pereira',pos:'ZAG',age:28,nat:'BRA',status:'Titular',nivel:80,valor:20,selecionavel:false,foto:'',obs:''},
  {id:8,name:'Léo Ortiz',pos:'ZAG',age:28,nat:'BRA',status:'Titular',nivel:78,valor:15,selecionavel:false,foto:'',obs:''},
  {id:9,name:'Vitão',pos:'ZAG',age:25,nat:'BRA',status:'Importante',nivel:77,valor:12,selecionavel:false,foto:'',obs:''},
  {id:10,name:'João Victor',pos:'ZAG',age:26,nat:'BRA',status:'Compõe elenco',nivel:64,valor:6,selecionavel:false,foto:'',obs:''},
  {id:11,name:'Ayrton Lucas',pos:'LE',age:27,nat:'BRA',status:'Titular',nivel:77,valor:12,selecionavel:false,foto:'',obs:''},
  {id:12,name:'Alex Sandro',pos:'LE',age:33,nat:'BRA',status:'Compõe elenco',nivel:76,valor:2,selecionavel:false,foto:'',obs:''},
  {id:13,name:'Pulgar',pos:'VOL',age:30,nat:'CHI',status:'Titular',nivel:78,valor:8,selecionavel:false,foto:'',obs:''},
  {id:14,name:'Evertton Araújo',pos:'VOL',age:23,nat:'BRA',status:'Compõe elenco',nivel:76,valor:3,selecionavel:false,foto:'',obs:''},
  {id:15,name:'Jorginho',pos:'VOL',age:34,nat:'ITA',status:'Titular',nivel:82,valor:2,selecionavel:false,foto:'',obs:''},
  {id:16,name:'Arrascaeta',pos:'MEI',age:31,nat:'URU',status:'Titular',nivel:83,valor:20,selecionavel:false,foto:'',obs:''},
  {id:17,name:'De La Cruz',pos:'MEI',age:28,nat:'URU',status:'Importante',nivel:79,valor:22,selecionavel:false,foto:'',obs:''},
  {id:18,name:'Paquetá',pos:'MEI',age:28,nat:'BRA',status:'Titular',nivel:85,valor:60,selecionavel:false,foto:'',obs:''},
  {id:19,name:'Carrascal',pos:'MEI',age:27,nat:'COL',status:'Importante',nivel:75,valor:8,selecionavel:false,foto:'',obs:''},
  {id:20,name:'Saúl',pos:'MEI',age:31,nat:'ESP',status:'Compõe elenco',nivel:74,valor:3,selecionavel:false,foto:'',obs:''},
  {id:21,name:'Pedro',pos:'CA',age:28,nat:'BRA',status:'Titular',nivel:82,valor:35,selecionavel:false,foto:'',obs:''},
  {id:22,name:'Everton Cebolinha',pos:'PE',age:30,nat:'BRA',status:'Vender',nivel:75,valor:5,selecionavel:false,foto:'',obs:''},
  {id:23,name:'Luiz Araújo',pos:'PD',age:29,nat:'BRA',status:'Importante',nivel:76,valor:12,selecionavel:false,foto:'',obs:''},
  {id:24,name:'Samuel Lino',pos:'PE',age:26,nat:'BRA',status:'Titular',nivel:80,valor:12,selecionavel:false,foto:'',obs:''},
  {id:25,name:'Gonzalo Plata',pos:'PD',age:25,nat:'EQU',status:'Titular',nivel:76,valor:10,selecionavel:false,foto:'',obs:''},
  {id:26,name:'Bruno Henrique',pos:'PE',age:35,nat:'BRA',status:'Compõe elenco',nivel:76,valor:3,selecionavel:false,foto:'',obs:''},
  {id:27,name:'Wallace Yan',pos:'CA',age:21,nat:'BRA',status:'Compõe elenco',nivel:66,valor:2,selecionavel:false,foto:'',obs:''},
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
