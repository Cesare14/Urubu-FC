// ── COMPARTILHAR — função base ──────────────────────────────────────────────
var _shareBlob=null;
var _shareFilename='urubufc.png';

// ── trava de repetição (evita múltiplas capturas simultâneas) ──────────────
var _shareBusy=false;
var _shareBusyTimer=null;
var _shareBusyBtn=null;
function _shareLock(){
  if(_shareBusy)return false;
  _shareBusy=true;
  _shareBusyBtn=(document.activeElement&&document.activeElement.tagName==='BUTTON')?document.activeElement:null;
  if(_shareBusyBtn){_shareBusyBtn.disabled=true;_shareBusyBtn.style.opacity='0.5';}
  _shareBusyTimer=setTimeout(_shareUnlock,8000);
  return true;
}
function _shareUnlock(){
  _shareBusy=false;
  if(_shareBusyTimer){clearTimeout(_shareBusyTimer);_shareBusyTimer=null;}
  if(_shareBusyBtn){_shareBusyBtn.disabled=false;_shareBusyBtn.style.opacity='';_shareBusyBtn=null;}
}

// ── Padrão de faixas do campo (compartilharCampo) — pré-gerado como Data URI SVG
// Gerado uma única vez aqui no carregamento do script, não a cada captura.
// Substitui o antigo repeating-linear-gradient: html2canvas apenas desenha o
// bitmap já decodificado, em vez de recalcular o padrão pixel a pixel — e por
// ser Data URI (não arquivo externo), não há requisição de rede nem risco de
// timing/CORS que pudesse deixar a imagem "não pronta" no momento da captura.
function _buildStripePatternSVG(corFaixa){
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="4" height="80">'
    +'<rect x="0" y="40" width="4" height="40" fill="'+corFaixa+'"/>'
    +'</svg>';
  return 'data:image/svg+xml;base64,'+btoa(svg);
}
// Cor da faixa unificada nas 3 abas, igual à paleta verde Copa do Mundo aplicada
// em .field/.field.res/.field.mkt (style.css) — antes estas 3 chaves usavam
// cores antigas por aba, divergentes da paleta ao vivo atual.
var _FIELD_STRIPE_PATTERNS={
  A:_buildStripePatternSVG('rgba(31,90,31,.35)'),
  B:_buildStripePatternSVG('rgba(31,90,31,.35)'),
  C:_buildStripePatternSVG('rgba(31,90,31,.35)')
};


function openShare(){var o=document.getElementById('share-over');if(o)o.classList.add('open');}
function closeShare(){var o=document.getElementById('share-over');if(o)o.classList.remove('open');_shareBlob=null;}

function _resetModal(){
  var els=['share-loading','share-preview-img','share-hint','share-actions'];
  var displays=['block','none','none','none'];
  var ok=true;
  els.forEach(function(id,i){
    var el=document.getElementById(id);
    if(!el){ok=false;return;}
    el.style.display=displays[i];
  });
  return ok;
}

function capturarImagem(elementoId, nomeArquivo){
  var el=document.getElementById(elementoId);
  if(!el){alert('Elemento não encontrado: '+elementoId);return;}
  if(typeof html2canvas==='undefined'){alert('Biblioteca de captura não carregou. Verifique sua conexão.');return;}
  _shareFilename=nomeArquivo||'urubufc.png';
  if(!_shareLock())return;
  // Resetar modal
  if(!_resetModal()){_shareUnlock();return;}
  openShare();
  // Pequeno delay para garantir que o modal abre antes da captura
  setTimeout(function(){
    html2canvas(el,{
      backgroundColor:'#0a0a0a',
      scale:2,
      useCORS:true,
      allowTaint:false,
      logging:false
    }).then(function(canvas){
      canvas.toBlob(function(blob){
        _shareBlob=blob;
        var url=URL.createObjectURL(blob);
        var img=document.getElementById('share-preview-img');
        img.src=url;
        img.style.display='block';
        document.getElementById('share-loading').style.display='none';
        _showShareReady();
        _shareUnlock();
      },'image/png');
    }).catch(function(err){
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('html2canvas erro:',err);
      _shareUnlock();
    });
  },120);
}

function _showShareReady(){
  var temShare=!!(navigator.canShare&&navigator.share);
  var hint=document.getElementById('share-hint');
  var btn=document.getElementById('share-send-btn');
  if(temShare){
    hint.innerHTML='✅ Imagem pronta! Toque em <strong>Compartilhar</strong> para enviar pelo WhatsApp, Instagram, Telegram ou outra rede.';
    btn.style.display='inline-flex';
  } else {
    hint.innerHTML='✅ Imagem gerada! Clique em <strong>Baixar PNG</strong> para salvar e compartilhe manualmente.<br><small style="color:var(--gray)">Dica: o compartilhamento direto funciona em navegadores de celular (Chrome/Safari).</small>';
    btn.style.display='none';
  }
  hint.style.display='block';
  document.getElementById('share-actions').style.display='flex';
}

function shareEnviar(){
  if(!_shareBlob)return;
  var file=new File([_shareBlob],_shareFilename,{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){
    navigator.share({files:[file],title:'Urubu FC — Escalação'})
      .catch(function(e){if(e.name!=='AbortError')shareDownload();});
  } else {
    shareDownload();
  }
}

function shareDownload(){
  if(!_shareBlob)return;
  var a=document.createElement('a');
  a.href=URL.createObjectURL(_shareBlob);
  a.download=_shareFilename;
  a.click();
}

// ── ROTA 1: BASTIDOR OFF-SCREEN (iframe enxuto) ─────────────────────────────
// Monta um iframe invisível, fora da tela, contendo SÓ o campo (#field) + os
// estilos/fontes do site. O html2canvas, ao capturar um elemento, clona o
// documento inteiro do contexto desse elemento — e é esse clone que consome
// 82-84% do tempo. Rodando a captura dentro deste bastidor enxuto, o "documento
// inteiro" a ser clonado passa a ser só o campo, em vez da página real com
// elenco, mercado, análise, menus e modais. A imagem final é IDÊNTICA: toda a
// lógica visual validada continua no onclone de compartilharCampo, intocada —
// aqui só se troca ONDE o campo mora no momento da captura.
//
// O iframe é criado sem src (about:blank), o mesmo tipo que o próprio
// html2canvas já cria internamente e que funciona sob a CSP atual. Ele é
// destruído logo após a captura (limpar()), então nunca aparece para o usuário
// nem deixa resíduo no DOM.
function _campoMontarBastidor(vw, vh, onReady, onError){
  var ifr=null;
  function limpar(){
    if(ifr&&ifr.parentNode){ifr.parentNode.removeChild(ifr);}
    ifr=null;
  }
  try{
    var live=document.getElementById('field');
    if(!live){if(onError)onError(new Error('campo não encontrado'));return;}

    ifr=document.createElement('iframe');
    ifr.setAttribute('aria-hidden','true');
    ifr.setAttribute('tabindex','-1');
    // Fora da tela e invisível; dimensionado igual ao viewport de exportação
    // (vw x vh) para que os mesmos breakpoints de mídia do site sejam aplicados
    // — coerente com o windowWidth/windowHeight passados ao html2canvas.
    ifr.style.cssText='position:fixed;left:-99999px;top:0;width:'+vw+'px;height:'+vh+'px;border:0;margin:0;padding:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(ifr);

    var idoc=ifr.contentDocument||(ifr.contentWindow&&ifr.contentWindow.document);
    if(!idoc){limpar();if(onError)onError(new Error('sem acesso ao documento do bastidor (CSP frame-src?)'));return;}

    // Um iframe recém-criado (sem src) já nasce com um documento em branco
    // válido — elementos raiz, head e body já existem — sem precisar escrever
    // nenhuma marcação como texto. A tentativa anterior usava idoc.write com
    // as marcações de raiz, head e body em texto: dentro do arquivo final
    // gerado pelo build, isso confundia o processo de montagem do próprio
    // documento (que já monta essas mesmas marcações no nível de fora),
    // fazendo o restante do script vazar como texto puro na página — foi a
    // causa da tela quebrada nas duas telas anteriores. Aqui não escrevemos
    // nenhuma marcação como texto: só criamos o elemento head via API do
    // DOM (createElement), sem digitar seu nome entre sinais de maior/menor,
    // caso o iframe ainda não tenha um (alguns navegadores entregam vazio).
    var ihead=idoc.head;
    if(!ihead){
      ihead=idoc.createElement('head');
      idoc.documentElement.appendChild(ihead);
    }
    if(!idoc.body){
      var ibody=idoc.createElement('body');
      idoc.documentElement.appendChild(ibody);
    }
    var pendentes=0, jaChamou=false;

    function tentarPronto(){
      if(jaChamou)return;
      jaChamou=true;
      // Garantir que as fontes (Barlow/Barlow Condensed) estejam carregadas no
      // bastidor antes de capturar — as correções de tamanho de nome/donut
      // dependem da métrica correta da fonte. fonts.ready resolve após a carga;
      // como o site já usa as mesmas fontes, elas costumam vir do cache na hora.
      var fontsP=(idoc.fonts&&idoc.fonts.ready)?idoc.fonts.ready:Promise.resolve();
      fontsP.then(function(){
        if(onReady)onReady(ifr, idoc.getElementById('field'), limpar);
      }).catch(function(){
        if(onReady)onReady(ifr, idoc.getElementById('field'), limpar);
      });
    }

    // Timeout de segurança: nunca travar a captura esperando um recurso.
    var to=setTimeout(tentarPronto, 1500);
    function umPronto(){
      pendentes--;
      if(pendentes<=0){clearTimeout(to);tentarPronto();}
    }

    // Copiar TODOS os estilos do documento vivo para o bastidor: blocos <style>
    // (build injeta o style.css aqui) e <link rel="stylesheet"> (Google Fonts +
    // eventuais CSS externos). Copiar em tempo real mantém o bastidor sempre em
    // sincronia com o CSS do site — sem duplicar nem manter cópia à parte.
    var estilos=document.querySelectorAll('style');
    for(var i=0;i<estilos.length;i++){
      var st=idoc.createElement('style');
      st.textContent=estilos[i].textContent;
      ihead.appendChild(st);
    }
    var links=document.querySelectorAll('link[rel="stylesheet"]');
    for(var j=0;j<links.length;j++){
      var ln=idoc.createElement('link');
      ln.rel='stylesheet';
      if(links[j].href)ln.href=links[j].href;
      if(links[j].media)ln.media=links[j].media;
      pendentes++;
      ln.onload=umPronto;
      ln.onerror=umPronto;
      ihead.appendChild(ln);
    }

    // Clonar o campo vivo para dentro do bastidor. Os donuts (<canvas>) não
    // carregam o bitmap desenhado através do cloneNode — mas isso é irrelevante:
    // o onclone de compartilharCampo redesenha cada donut do zero a partir do
    // número, então o canvas de origem pode vir vazio sem qualquer perda.
    var clone=live.cloneNode(true);
    idoc.body.appendChild(clone);

    // Esperar a(s) imagem(ns) do SVG do campo (marca d'água, <image> com
    // Data URI) terminarem de carregar/decodificar NESTE documento novo antes
    // de liberar a captura. cloneNode() copia a referência da imagem, mas o
    // navegador pode precisar decodificá-la de novo neste contexto recém
    // criado — em mobile (CPU/GPU mais lentos), o html2canvas podia começar a
    // desenhar antes dessa decodificação terminar, fazendo a marca d'água sair
    // com opacidade inconsistente em relação ao 0.50 real (era mais rápido o
    // suficiente no desktop pra nunca expor essa corrida). Mesmo padrão de
    // pendentes/umPronto já usado acima para as folhas de estilo.
    var imgs=clone.querySelectorAll('image');
    for(var k=0;k<imgs.length;k++){
      var im=imgs[k];
      // <image> de SVG não tem a propriedade .complete (isso é exclusivo de
      // <img> HTML) — não há como checar de antemão se já terminou. Sempre
      // esperar o evento 'load' é seguro: ele dispara mesmo para Data URI,
      // e como este documento é recém-criado, não há cache que o suprima.
      pendentes++;
      im.addEventListener('load',umPronto,{once:true});
      im.addEventListener('error',umPronto,{once:true});
    }

    // Sem nenhum <link>/<image> a esperar → seguir direto (clone já no DOM,
    // para as fontes serem requisitadas).
    if(pendentes===0){clearTimeout(to);tentarPronto();}
  }catch(e){
    limpar();
    if(onError)onError(e);
  }
}

function compartilharCampo(){
  // ── INSTRUMENTAÇÃO DE PERFORMANCE (diagnóstico — não altera comportamento) ──
  // Medição via Performance API (performance.now()), técnica padrão de mercado
  // para instrumentar código real em produção, em vez de estimar por inspeção
  // visual. _tm acumula os tempos (ms) de cada etapa; relatório completo é
  // impresso no console ao final (sucesso) ou no catch (falha), com os
  // parciais já coletados até o ponto da falha.
  var _t0=performance.now();
  var _tm={
    iframeBuildMs:0,     // montagem do bastidor (iframe enxuto) + carga de estilos/fontes
    setupMs:0,            // da entrada da função até a chamada do html2canvas
    gapCallToOncloneMs:0,  // do início do html2canvas até o onclone disparar (clone do DOM)
    oncloneFieldSetupMs:0, // dentro do onclone: estilos do #field + SVG + ocultar "×"
    scardLoopMs:0,         // total do forEach('.scard') (zoom+fonte+donut)
    donutCount:0,          // nº de donuts redesenhados
    donutTotalMs:0,        // soma do redesenho do canvas do donut (todos os jogadores)
    donutNumCenterMs:0,    // forEach('.donut-num') — centralização do número
    ftgtLoopMs:0,          // total do forEach('.scard.ftgt')
    gradientCount:0,       // nº de gradientes champagne desenhados
    gradientTotalMs:0,     // soma do canvas do gradiente champagne (pill .ftgt)
    oncloneTailMs:0,       // resto do onclone após os loops acima (fbadge etc.)
    oncloneTotalMs:0,      // total do onclone (medido diretamente, início ao fim)
    html2canvasTotalMs:0,  // total da chamada html2canvas (chamada → .then)
    html2canvasRasterEstMs:0, // estimativa: html2canvasTotal - (gap + oncloneTotal) = clone+decode+rasterização internos da lib
    letterboxMs:0,         // desenho do canvas final (letterbox 1080x1350)
    toBlobMs:0             // canvas.toBlob (assíncrono)
  };
  var nomes={A:'titulares',B:'reservas',C:'projecao'};
  var tab=ST&&ST.ft?ST.ft:'A';
  _shareFilename='urubufc-escala-'+nomes[tab]+'.png';
  if(!_shareLock())return;
  if(!_resetModal()){_shareUnlock();return;}
  openShare();

  setTimeout(function(){
    // O campo NÃO é mais capturado direto da página: ele será clonado para
    // dentro do bastidor (iframe enxuto) e o fieldEl abaixo virá de lá, via
    // callback de _campoMontarBastidor. Assim o html2canvas clona só o campo,
    // não a página inteira — que era 82-84% do tempo.
    // Paleta unificada nas 3 abas — igual à paleta verde Copa do Mundo ao vivo
    // (.field/.field.res/.field.mkt em style.css). A faixa vem de
    // _FIELD_STRIPE_PATTERNS (já corrigida acima).
    var CAMPO_BASE='#3CAC3B';
    var sc=2;
    // Tamanho de exportação FIXO (não depende mais da tela de origem): 540x590
    // sem escala, que com scale:2 vira 1080x1180. Preserva a proporção real do
    // campo (viewBox 140x153, ~140:153) sem distorcer. A diferença até 1350 de
    // altura é preenchida depois com letterbox preto (ver .then abaixo), para
    // sair sempre 1080x1350 (4:5), igual nas 3 abas e em qualquer dispositivo.
    var fw=540,fh=590;

    var _tBuildStart=performance.now();
    _campoMontarBastidor(fw,fh,function(_bastidor,fieldEl,_limparBastidor){
    _tm.iframeBuildMs=performance.now()-_tBuildStart;
    _tm.setupMs=performance.now()-_t0;
    var _tHtmlCanvasStart=performance.now();
    html2canvas(fieldEl,{
      backgroundColor:null,
      scale:sc,
      useCORS:true,
      allowTaint:false,
      logging:false,
      width:fw,
      height:fh,
      // Viewport do clone FIXO em fw/fh, não mais o tamanho real da tela de
      // origem (window.innerWidth/innerHeight). Antes, mesmo fixando o
      // #field em 540x590 dentro do onclone, o clone inteiro ainda era
      // montado no viewport real do dispositivo (ex.: ~390px num celular) —
      // menor que os 540px do campo — então o campo ultrapassava esse
      // viewport e ficava cortado, independente do que fizéssemos em
      // .fwrap/.lpanel. Fixar o viewport do clone elimina essa causa raiz e
      // também garante breakpoint de mídia (mobile/desktop) sempre igual,
      // não importa de onde a captura foi disparada.
      windowWidth:fw,
      windowHeight:fh,
      onclone:function(doc){
        var _tOncloneStart=performance.now();
        _tm.gapCallToOncloneMs=_tOncloneStart-_tHtmlCanvasStart;
        var f=doc.getElementById('field');
        if(!f)return;
        // Tirar o #field do fluxo normal do documento (position:fixed,
        // ancorado em 0,0) — assim ele para de depender do tamanho real de
        // qualquer container ancestral (.fwrap, .lpanel) e do overflow deles.
        // Combinado com o viewport fixo (windowWidth/windowHeight acima),
        // garante que o campo sempre renderiza no tamanho exato fw x fh,
        // sem corte, em qualquer tela de origem.
        f.style.position='fixed';
        f.style.top='0';
        f.style.left='0';
        f.style.margin='0';
        f.style.width=fw+'px';
        f.style.height=fh+'px';
        f.style.flex='none';
        f.style.background=CAMPO_BASE+' url("'+_FIELD_STRIPE_PATTERNS[tab]+'")';
        // Forçar dimensões explícitas em pixels no SVG das linhas do campo
        // (.fsvg, viewBox 140x153). O html2canvas não resolve de forma
        // confiável width:100%/height:100% (CSS) em elementos <svg> — sem
        // isso, ele renderiza no tamanho intrínseco do viewBox, fazendo o
        // desenho (retângulo, meio-campo, círculo central) sair pequeno e
        // centralizado, com sobra de verde ao redor. Só afeta o clone da
        // captura — o desenho do SVG em si (definido em field.js) não é
        // tocado, só o tamanho de renderização.
        // Descontar a borda de 2px do #field (box-sizing:border-box global):
        // fw/fh já incluem a borda, mas o SVG (inset:0, preenche o espaço
        // dentro da borda) precisa do tamanho do padding-box, senão sobra
        // 4px que o overflow:hidden do campo corta à direita/embaixo,
        // descentralizando o desenho (mais verde sobrando à esquerda).
        var svgEl=f.querySelector('svg.fsvg');
        if(svgEl){
          var FIELD_BORDER=2;
          var svgW=fw-FIELD_BORDER*2,svgH=fh-FIELD_BORDER*2;
          svgEl.setAttribute('width',svgW);
          svgEl.setAttribute('height',svgH);
          svgEl.style.width=svgW+'px';
          svgEl.style.height=svgH+'px';
        }
        // ocultar o "×" de remover jogador — só na imagem exportada
        f.querySelectorAll('.sclr').forEach(function(x){x.style.display='none';});
        // Legibilidade dos scards na imagem exportada: aumentar nome, donut
        // e posição juntos. NÃO usa transform:scale — o html2canvas resolve
        // de forma inconsistente <svg> aninhado (o donut) sob transform 2D
        // pós-render. NÃO usa zoom — propriedade não padrão, sem suporte no
        // Firefox (checklist de compatibilidade do projeto exige Firefox).
        // Em vez disso, redimensiona width/height/font-size reais — força o
        // motor a recalcular o box model antes de rasterizar, técnica
        // recomendada pela própria documentação do html2canvas para casos
        // onde transform falha com conteúdo complexo. Executa uma única vez,
        // de forma síncrona, sobre no máximo 11 elementos — custo
        // desprezível, sem impacto no tempo de geração validado (~3-4s).
        // Recentraliza via margin negativo para compensar o crescimento e
        // manter o card alinhado ao slot (left/top definidos por field.js).
        // IMPORTANTE: roda ANTES do bloco de centralização do .donut-num
        // logo abaixo — aquele bloco calcula translate() a partir do
        // offsetWidth/offsetHeight do número, então precisa medir o número
        // já no tamanho final (pós font-size aumentado), senão descentraliza.
        // Dimensões FIXAS em px (não medidas via offsetWidth/getComputedStyle
        // do clone) — mesmo padrão já usado no donut (DONUT_SIZE). Medir o
        // clone antes de aplicar o zoom é uma corrida com o reflow/carga da
        // fonte custom (Barlow) dentro do onclone: em mobile o layout pode
        // não ter convergido no instante da leitura, fazendo offsetWidth
        // variar entre dispositivos e produzir scards/textos menores que no
        // desktop mesmo com viewport e canvas finais idênticos — era a causa
        // raiz confirmada do bug. Valores abaixo = base real do .scard em
        // style.css (66px largura / 50px min-height / 9.5px nome / 7px
        // posição) × o mesmo fator 1.2 (e 1.3 extra p/ .ssub) já usado antes,
        // agora pré-calculados e fixos — reproduzem exatamente o resultado
        // visual já validado no desktop, independente da origem da captura.
        var SCARD_W0=66,SCARD_H0=50,SNAME_FS0=9.5,SSUB_FS0=7;
        var SCARD_ZOOM=1.2;
        var w1=SCARD_W0*SCARD_ZOOM,h1=SCARD_H0*SCARD_ZOOM;
        _tm.oncloneFieldSetupMs=performance.now()-_tOncloneStart;
        var _tScardLoopStart=performance.now();
        f.querySelectorAll('.scard').forEach(function(sc){
          sc.style.width=w1+'px';
          sc.style.minHeight=h1+'px';
          sc.style.marginLeft='-'+((w1-SCARD_W0)/2)+'px';
          sc.style.marginTop='-'+((h1-SCARD_H0)/2)+'px';
          // :not(.sname--outside) — esse bloco de zoom foi escrito para o
          // .sname do scard quadrado antigo. Nas 3 abas do campo circular
          // (Titulares/Reservas/Projeção), a pill (.sname--outside) também
          // carrega a classe .sname e acabava sendo pega aqui, recebendo um
          // max-width fixo (~71px) que não existe na sua CSS (width:max-
          // content, sem limite). Para nomes longos ("Gonzalo Plata",
          // "GonzaloPlata"), isso estourava a pill e, dependendo do motor de
          // renderização (mais visível em mobile), desalinhava o texto
          // verticalmente e comia o espaço em nomes compostos. Excluindo a
          // pill deste seletor, ela é capturada fielmente como está definida
          // em style.css — sem alterar o zoom do donut nem do .ssub.
          var sname=sc.querySelector('.sname:not(.sname--outside)');
          if(sname){
            sname.style.fontSize=(SNAME_FS0*SCARD_ZOOM)+'px';
            sname.style.maxWidth=(w1-8)+'px';
          }
          var ssub=sc.querySelector('.ssub');
          if(ssub){
            // legibilidade da posição (MEI, LD etc): além do fator de escala
            // do card, aplica um reforço extra de tamanho + negrito — pedido
            // específico do usuário além do aumento proporcional do resto.
            ssub.style.fontSize=(SSUB_FS0*SCARD_ZOOM*1.3)+'px';
            ssub.style.fontWeight='700';
          }
          var dwrap=sc.querySelector('.donut-wrap');
          // Forçar o .circle-visual (contêiner do círculo) para o mesmo
          // tamanho fixo do donut nesta captura. O viewport fixo da captura
          // (540px) é menor que o breakpoint mobile de .circle-visual em
          // style.css (max-width:767px → 34px) — então o clone do
          // html2canvas herda a REGRA MOBILE (34px) mesmo capturando de um
          // desktop, só porque essa classe não é redimensionada por JS em
          // lugar nenhum. Sem esta correção, o donut redesenhado abaixo
          // (40px, tamanho fixo) fica maior que a caixa de 34px que deveria
          // contê-lo e vaza por cima do espaço onde a pill do nome fica —
          // era isso que comia o espaçamento visual só na imagem exportada.
          // Não altera o CSS ao vivo nem o breakpoint mobile real do site.
          var circleWrap=sc.querySelector('.circle-visual');
          if(dwrap){
            var DONUT_SIZE=40; // tamanho alvo fixo, mais agressivo que o fator 1.2x do card
            if(circleWrap){
              circleWrap.style.width=DONUT_SIZE+'px';
              circleWrap.style.height=DONUT_SIZE+'px';
            }
            // Donut: NÃO esticar o <canvas> existente via CSS width/height —
            // ele é um bitmap já rasterizado em 28px (Canvas 2D, não SVG);
            // esticar via CSS produz um resultado borrado. Em vez disso,
            // redesenha um canvas novo, no tamanho final, com a mesma
            // matemática de traçado usada em drawDonut() (ui.js, área
            // finalizada — não modificada, só replicada aqui porque a
            // função original não é chamada com segurança de dentro do
            // onclone: o html2canvas pode renderizar o clone num documento/
            // iframe isolado, sem acesso às funções globais da página, e um
            // ReferenceError ali quebraria a geração inteira da imagem).
            var oldCanvas=dwrap.querySelector('canvas');
            var num=dwrap.querySelector('.donut-num');
            if(oldCanvas&&num){
              var _tDonutStart=performance.now();
              var nivelVal=Math.max(0,parseFloat(num.textContent)||0);
              var col=num.style.color||getComputedStyle(num).color;
              var newCanvas=doc.createElement('canvas');
              var dpr=window.devicePixelRatio||1;
              var s=DONUT_SIZE;
              newCanvas.width=s*dpr;newCanvas.height=s*dpr;
              newCanvas.style.width=s+'px';newCanvas.style.height=s+'px';
              var ctx=newCanvas.getContext('2d');
              ctx.scale(dpr,dpr);
              // Espessura do traço: a tabela original de drawDonut() (ui.js)
              // não previa 40px como faixa própria — caía em "size>=27" (4px),
              // fino demais para esse diâmetro. Usa 6px, intermediário entre
              // a faixa de 28px (4px) e a de 50px+ (7px), proporcional ao
              // novo tamanho fixo desta captura.
              var lw=6;
              var cx=s/2,cy=s/2,r=s/2-lw/2-1;
              ctx.clearRect(0,0,s,s);
              // Fundo escuro atrás do anel (bgFill): replica a mesma lógica
              // de drawDonut() em ui.js (área finalizada, não modificada —
              // só espelhada aqui pelo mesmo motivo do redesenho acima: o
              // onclone não pode chamar a função original com segurança).
              // Mesmo valor de bgFill passado em field.js para os donuts do
              // campo circular ('rgba(0,0,0,.78)'). Sem isso, o novo canvas
              // desenhava só os dois arcos (track + progresso) e nunca
              // preenchia o disco de fundo — o verde do campo aparecia
              // através do donut só na imagem exportada.
              var BG_FILL='rgba(0,0,0,.78)';
              ctx.save();
              ctx.shadowColor=BG_FILL;ctx.shadowBlur=1.5;
              ctx.beginPath();ctx.arc(cx,cy,r+lw/2-0.75,0,2*Math.PI);
              ctx.fillStyle=BG_FILL;ctx.fill();
              ctx.restore();
              ctx.beginPath();ctx.arc(cx,cy,r,0,2*Math.PI);
              ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=lw;ctx.stroke();
              var pct=nivelVal/100;
              ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+pct*2*Math.PI);
              ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineCap='round';ctx.stroke();
              oldCanvas.replaceWith(newCanvas);
              dwrap.style.width=DONUT_SIZE+'px';
              dwrap.style.height=DONUT_SIZE+'px';
              // O número não aumentava apesar do style.fontSize inline por
              // causa de uma regra em style.css:
              //   .donut-wrap:not(.donut-wrap--lg)... .donut-num{font-size:7px!important}
              // Esse !important vence qualquer estilo inline enquanto o
              // wrap não tiver a classe donut-wrap--lg (só existe para
              // size>=50 em nivelDonutEl/ui.js — não é o nosso caso, size
              // original é 28). Adicionar a classe aqui, só no clone,
              // neutraliza o :not() e libera o font-size abaixo para valer.
              // Não toca em ui.js nem em style.css.
              dwrap.classList.add('donut-wrap--lg');
              // 23px estourava o espaço interno do anel (raio útil ≈16px
              // com lw=6, diâmetro limpo ≈26px) e sobrepunha o traço,
              // principalmente em números de 2 dígitos. 16px cabe com folga
              // dentro do anel mantendo boa legibilidade.
              num.style.fontSize='16px';
              _tm.donutCount++;
              _tm.donutTotalMs+=performance.now()-_tDonutStart;
            }
          }
        });
        _tm.scardLoopMs=performance.now()-_tScardLoopStart;
        // centralização do número dentro do donut na captura — troca translate(%) por
        // translate(px), calculado a partir do próprio tamanho do elemento. Mantém
        // position:absolute;top:50%;left:50% (herdado do CSS) intacto — não usa
        // flex/grid, que se mostrou custoso para o html2canvas no diagnóstico anterior.
        var _tDonutNumStart=performance.now();
        f.querySelectorAll('.donut-num').forEach(function(lbl){
          var w=lbl.offsetWidth,h=lbl.offsetHeight;
          var nudge=1.2; // correção empírica pra compensar métrica da fonte (glifo vs caixa)
          lbl.style.transform='translate(-'+(w/2)+'px,-'+(h/2+nudge)+'px)';
        });
        _tm.donutNumCenterMs=performance.now()-_tDonutNumStart;
        // suprimir o glow (box-shadow) do destaque .ftgt (jogador do Mercado escalado)
        // só na imagem exportada — custoso para o html2canvas rasterizar. A borda
        // dourada sólida (border) permanece intacta; a interface ao vivo não é afetada.
        var _tFtgtLoopStart=performance.now();
        f.querySelectorAll('.scard.ftgt').forEach(function(sc){
          sc.style.boxShadow='none';
          // Gradiente champagne da pill (.sname--outside.ftgt): o
          // linear-gradient(100deg, ...) do CSS ao vivo é rasterizado mal
          // pelo html2canvas e sai quase branco sólido na imagem exportada.
          // Substituído por um <canvas> real desenhado atrás do texto, no
          // tamanho real de cada pill (não distorce o ângulo do gradiente).
          // Não altera o CSS ao vivo nem o box-shadow inset da pill.
          var pill=sc.querySelector('.sname--outside.ftgt');
          if(pill){
            var _tGradStart=performance.now();
            // Trava um tamanho mínimo sensato: se o clone ainda não tiver
            // resolvido o layout de largura variável (width:max-content) no
            // momento exato desta leitura, offsetWidth/offsetHeight podem
            // vir zerados (ou quase).
            var pw=Math.max(pill.offsetWidth||0,40);
            var ph=Math.max(pill.offsetHeight||0,16);
            // Tentativa anterior (background-image via CSS) não pegou no
            // html2canvas — mesma classe de limitação, mas dessa vez a
            // troca de propriedade CSS dentro do onclone simplesmente não
            // foi refletida na rasterização final. Troca de abordagem: em
            // vez de PEDIR ao html2canvas pra interpretar um CSS
            // background-image, desenha o gradiente direto num <canvas>
            // real — a mesma técnica já usada e comprovada no donut acima,
            // que o html2canvas sabe capturar com fidelidade total (é só um
            // bitmap, não CSS a ser interpretado).
            pill.style.background='none';
            pill.style.position='absolute'; // já é (herdado do CSS); explícito para o z-index abaixo valer
            pill.style.zIndex='0'; // cria contexto de empilhamento próprio, só para o canvas ficar atrás do texto desta pill (não afeta mais nada)
            var gradCanvas=doc.createElement('canvas');
            var gdpr=window.devicePixelRatio||1;
            gradCanvas.width=pw*gdpr;gradCanvas.height=ph*gdpr;
            gradCanvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;border-radius:999px;z-index:-1;';
            var gctx=gradCanvas.getContext('2d');
            gctx.scale(gdpr,gdpr);
            // Conversão ângulo CSS (100deg) → vetor de gradiente do Canvas
            // 2D pela fórmula do próprio spec do CSS (projeção nos cantos
            // da caixa) — garante a mesma direção/proporção do gradiente ao
            // vivo, não importa o tamanho real de cada pill.
            var ga=(100%360)*Math.PI/180;
            var gdx=Math.sin(ga),gdy=-Math.cos(ga);
            var gL=Math.abs(pw*gdx)+Math.abs(ph*gdy);
            var gcx=pw/2,gcy=ph/2,ghalf=gL/2;
            var grad=gctx.createLinearGradient(gcx-gdx*ghalf,gcy-gdy*ghalf,gcx+gdx*ghalf,gcy+gdy*ghalf);
            // Mesmos 5 stops e cores de .sname--outside.ftgt em style.css —
            // fonte única de verdade continua sendo o CSS; aqui só replica.
            grad.addColorStop(0,'#D9BA6A');
            grad.addColorStop(0.2,'#E8CE8F');
            grad.addColorStop(0.4,'#F5E7B8');
            grad.addColorStop(0.6,'#E8CE8F');
            grad.addColorStop(1,'#D9BA6A');
            // Desenha o formato de pill (retângulo com cantos 100% arredondados,
            // raio = metade da altura) preenchido com o gradiente.
            var rad=ph/2;
            gctx.beginPath();
            gctx.moveTo(rad,0);
            gctx.lineTo(pw-rad,0);
            gctx.arcTo(pw,0,pw,rad,rad);
            gctx.lineTo(pw,ph-rad);
            gctx.arcTo(pw,ph,pw-rad,ph,rad);
            gctx.lineTo(rad,ph);
            gctx.arcTo(0,ph,0,ph-rad,rad);
            gctx.lineTo(0,rad);
            gctx.arcTo(0,0,rad,0,rad);
            gctx.closePath();
            gctx.fillStyle=grad;
            gctx.fill();
            pill.insertBefore(gradCanvas,pill.firstChild);
            _tm.gradientCount++;
            _tm.gradientTotalMs+=performance.now()-_tGradStart;
          }
        });
        _tm.ftgtLoopMs=performance.now()-_tFtgtLoopStart;
        // Posição do rótulo de formação (.fbadge, top:5px em style.css): no
        // tamanho fixo de captura (540x590) esse top fica colado à linha de
        // fundo superior do campo (retângulo do SVG, próximo ao topo),
        // parcialmente sobreposto. Empurrar para baixo só no clone da
        // captura, sem alterar o CSS ao vivo (.fbadge em style.css).
        var badge=f.querySelector('.fbadge');
        if(badge)badge.style.top='14px';
        // Posição do rótulo de formação (.fbadge, top:5px em style.css): no
        // tamanho fixo de captura (540x590) esse top fica colado à linha de
        // fundo superior do campo (retângulo do SVG, próximo ao topo),
        // parcialmente sobreposto. Empurrar para baixo só no clone da
        // captura, sem alterar o CSS ao vivo (.fbadge em style.css).
        var badge=f.querySelector('.fbadge');
        if(badge)badge.style.top='14px';
        _tm.oncloneTotalMs=performance.now()-_tOncloneStart;
        _tm.oncloneTailMs=_tm.oncloneTotalMs-_tm.oncloneFieldSetupMs-_tm.scardLoopMs-_tm.donutNumCenterMs-_tm.ftgtLoopMs;
        // Log imediato (síncrono) do que aconteceu dentro do onclone — garante
        // que estes dados fiquem registrados mesmo se algo falhar depois,
        // durante a rasterização assíncrona do html2canvas.
        console.log(
          '[perf] compartilharCampo — onclone (DOM já clonado, ainda dentro do html2canvas):\n'+
          '  gap chamada→onclone (clone do DOM pelo html2canvas): '+_tm.gapCallToOncloneMs.toFixed(1)+'ms\n'+
          '  setup do #field/SVG/ocultar "×": '+_tm.oncloneFieldSetupMs.toFixed(1)+'ms\n'+
          '  loop .scard (zoom+fonte+donut) TOTAL: '+_tm.scardLoopMs.toFixed(1)+'ms\n'+
          '    └─ redesenho canvas donut: '+_tm.donutTotalMs.toFixed(1)+'ms em '+_tm.donutCount+' jogador(es)'+
            (_tm.donutCount?' ('+(_tm.donutTotalMs/_tm.donutCount).toFixed(2)+'ms/jogador)':'')+'\n'+
          '  centralização .donut-num: '+_tm.donutNumCenterMs.toFixed(1)+'ms\n'+
          '  loop .scard.ftgt TOTAL: '+_tm.ftgtLoopMs.toFixed(1)+'ms\n'+
          '    └─ canvas gradiente champagne: '+_tm.gradientTotalMs.toFixed(1)+'ms em '+_tm.gradientCount+' jogador(es)'+
            (_tm.gradientCount?' ('+(_tm.gradientTotalMs/_tm.gradientCount).toFixed(2)+'ms/jogador)':'')+'\n'+
          '  resto (fbadge etc.): '+_tm.oncloneTailMs.toFixed(1)+'ms\n'+
          '  ── ONCLONE TOTAL: '+_tm.oncloneTotalMs.toFixed(1)+'ms'
        );
      }
    }).then(function(canvas){
      _tm.html2canvasTotalMs=performance.now()-_tHtmlCanvasStart;
      // Estimativa da parte "caixa-preta" do html2canvas (carregamento de
      // imagens/fontes + rasterização em si), já que só temos visibilidade
      // do que roda dentro do nosso onclone via instrumentação manual.
      _tm.html2canvasRasterEstMs=_tm.html2canvasTotalMs-_tm.gapCallToOncloneMs-_tm.oncloneTotalMs;
      // Letterbox: canvas sai em 1080x1180 (540x590 @ scale:2). Completar para
      // 1080x1350 fixo (4:5) com faixas pretas neutras em cima/embaixo,
      // centralizando o campo capturado sem esticar nem cortar.
      var _tLetterboxStart=performance.now();
      var finalW=1080,finalH=1350;
      var finalCanvas=document.createElement('canvas');
      finalCanvas.width=finalW;finalCanvas.height=finalH;
      var ctx=finalCanvas.getContext('2d');
      ctx.fillStyle='#000';
      ctx.fillRect(0,0,finalW,finalH);
      var offY=Math.round((finalH-canvas.height)/2);
      ctx.drawImage(canvas,0,offY);
      _tm.letterboxMs=performance.now()-_tLetterboxStart;
      var _tToBlobStart=performance.now();
      finalCanvas.toBlob(function(blob){
        _tm.toBlobMs=performance.now()-_tToBlobStart;
        var _totalMs=performance.now()-_t0;
        console.log(
          '[perf] compartilharCampo — RELATÓRIO FINAL (ms):\n'+
          '  0. bastidor (iframe enxuto + estilos/fontes): '+_tm.iframeBuildMs.toFixed(1)+'\n'+
          '  1. setup (entrada função → chamada html2canvas): '+_tm.setupMs.toFixed(1)+'\n'+
          '  2. html2canvas TOTAL (chamada → canvas pronto): '+_tm.html2canvasTotalMs.toFixed(1)+'\n'+
          '     2.1 gap até onclone (clone do DOM p/ iframe interno): '+_tm.gapCallToOncloneMs.toFixed(1)+'\n'+
          '     2.2 onclone TOTAL (nosso código síncrono): '+_tm.oncloneTotalMs.toFixed(1)+'\n'+
          '         - setup #field/SVG: '+_tm.oncloneFieldSetupMs.toFixed(1)+'\n'+
          '         - loop .scard (total): '+_tm.scardLoopMs.toFixed(1)+'   [donut: '+_tm.donutTotalMs.toFixed(1)+'ms / '+_tm.donutCount+' jogador(es)]\n'+
          '         - centralização .donut-num: '+_tm.donutNumCenterMs.toFixed(1)+'\n'+
          '         - loop .scard.ftgt (total): '+_tm.ftgtLoopMs.toFixed(1)+'   [gradiente: '+_tm.gradientTotalMs.toFixed(1)+'ms / '+_tm.gradientCount+' jogador(es)]\n'+
          '         - resto (fbadge etc.): '+_tm.oncloneTailMs.toFixed(1)+'\n'+
          '     2.3 estimativa rasterização/decode interno do html2canvas: '+_tm.html2canvasRasterEstMs.toFixed(1)+'\n'+
          '  3. letterbox (canvas final 1080x1350): '+_tm.letterboxMs.toFixed(1)+'\n'+
          '  4. canvas.toBlob (PNG): '+_tm.toBlobMs.toFixed(1)+'\n'+
          '  ── TOTAL (compartilharCampo, do clique ao blob pronto): '+_totalMs.toFixed(1)+'ms'
        );
        if(console.table){
          console.table({
            'setup':_tm.setupMs,
            'html2canvas total':_tm.html2canvasTotalMs,
            'gap→onclone':_tm.gapCallToOncloneMs,
            'onclone total':_tm.oncloneTotalMs,
            'donut (agregado)':_tm.donutTotalMs,
            'donut/jogador':_tm.donutCount?_tm.donutTotalMs/_tm.donutCount:0,
            'gradiente champagne (agregado)':_tm.gradientTotalMs,
            'gradiente/jogador':_tm.gradientCount?_tm.gradientTotalMs/_tm.gradientCount:0,
            'rasterização interna (estimativa)':_tm.html2canvasRasterEstMs,
            'letterbox':_tm.letterboxMs,
            'toBlob':_tm.toBlobMs,
            'TOTAL':_totalMs
          });
        }
        _shareBlob=blob;
        var url=URL.createObjectURL(blob);
        var img=document.getElementById('share-preview-img');
        img.src=url;img.style.display='block';
        document.getElementById('share-loading').style.display='none';
        _showShareReady();
        _limparBastidor();
        _shareUnlock();
      },'image/png');
    }).catch(function(err){
      console.log('[perf] compartilharCampo — falhou após '+(performance.now()-_t0).toFixed(1)+'ms. Parciais coletados:',_tm);
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharCampo erro:',err);
      if(typeof _limparBastidor==='function')_limparBastidor();
      _shareUnlock();
    });
    },function(_erroBastidor){
      // Falha ao montar o bastidor (ex.: iframe bloqueado pela CSP frame-src).
      console.error('compartilharCampo — falha ao montar bastidor:',_erroBastidor);
      document.getElementById('share-loading').textContent='Erro ao preparar a imagem. Tente novamente.';
      _shareUnlock();
    });
  },120);
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeShare();});

function compartilharElenco(){
  _shareFilename='urubufc-elenco.png';
  if(!_shareLock())return;

  if(!_resetModal()){_shareUnlock();return;}
  openShare();

  setTimeout(function(){
    var pane=document.getElementById('pane-elenco');
    // Garantir que o painel está visível e renderizado
    var paneDispOrig=pane.style.display;
    if(pane.style.display==='none'){pane.style.display='flex';}
    var ssEl=pane.querySelector('.ss');
    if(!ssEl){
      pane.style.display=paneDispOrig;
      document.getElementById('share-loading').textContent='Erro: tabela não encontrada.';
      _shareUnlock();
      return;
    }
    var ssOvOrig=ssEl.style.overflow;
    var ssHOrig=ssEl.style.height;
    var ssMaxOrig=ssEl.style.maxHeight;
    var paneOvOrig=pane.style.overflow;
    ssEl.style.overflow='visible';
    ssEl.style.height='auto';
    ssEl.style.maxHeight='none';
    pane.style.overflow='visible';
    var sc=2;
    html2canvas(pane,{
      backgroundColor:'#141414',
      scale:sc,
      useCORS:true,
      allowTaint:false,
      logging:false,
      windowHeight:pane.scrollHeight+200,
      height:pane.scrollHeight
    }).then(function(canvas){
      ssEl.style.overflow=ssOvOrig;
      ssEl.style.height=ssHOrig;
      ssEl.style.maxHeight=ssMaxOrig;
      pane.style.overflow=paneOvOrig;
      pane.style.display=paneDispOrig;
      canvas.toBlob(function(blob){
        _shareBlob=blob;
        var url=URL.createObjectURL(blob);
        var img=document.getElementById('share-preview-img');
        img.src=url;img.style.display='block';
        document.getElementById('share-loading').style.display='none';
        _showShareReady();
        _shareUnlock();
      },'image/png');
    }).catch(function(err){
      ssEl.style.overflow=ssOvOrig;
      ssEl.style.height=ssHOrig;
      ssEl.style.maxHeight=ssMaxOrig;
      pane.style.overflow=paneOvOrig;
      pane.style.display=paneDispOrig;
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharElenco erro:',err);
      _shareUnlock();
    });
  },120);
}

function compartilharMercado(){
  _shareFilename='urubufc-alvos-mercado.png';
  if(!_shareLock())return;

  if(!_resetModal()){_shareUnlock();return;}
  openShare();

  setTimeout(function(){
    var pane=document.getElementById('pane-mercado');
    var paneDispOrig=pane.style.display;
    if(pane.style.display==='none'){pane.style.display='flex';}
    var mwrap=pane.querySelector('.mwrap');
    if(!mwrap){
      pane.style.display=paneDispOrig;
      document.getElementById('share-loading').textContent='Erro: lista de alvos não encontrada.';
      _shareUnlock();
      return;
    }
    var mwOvOrig=mwrap.style.overflow;
    var mwHOrig=mwrap.style.height;
    var mwMaxOrig=mwrap.style.maxHeight;
    var paneOvOrig=pane.style.overflow;
    mwrap.style.overflow='visible';
    mwrap.style.height='auto';
    mwrap.style.maxHeight='none';
    pane.style.overflow='visible';
    var sc=2;
    html2canvas(pane,{
      backgroundColor:'#141414',
      scale:sc,
      useCORS:true,
      allowTaint:false,
      logging:false,
      windowHeight:pane.scrollHeight+200,
      height:pane.scrollHeight
    }).then(function(canvas){
      mwrap.style.overflow=mwOvOrig;
      mwrap.style.height=mwHOrig;
      mwrap.style.maxHeight=mwMaxOrig;
      pane.style.overflow=paneOvOrig;
      pane.style.display=paneDispOrig;
      canvas.toBlob(function(blob){
        _shareBlob=blob;
        var url=URL.createObjectURL(blob);
        var img=document.getElementById('share-preview-img');
        img.src=url;img.style.display='block';
        document.getElementById('share-loading').style.display='none';
        _showShareReady();
        _shareUnlock();
      },'image/png');
    }).catch(function(err){
      mwrap.style.overflow=mwOvOrig;
      mwrap.style.height=mwHOrig;
      mwrap.style.maxHeight=mwMaxOrig;
      pane.style.overflow=paneOvOrig;
      pane.style.display=paneDispOrig;
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharMercado erro:',err);
      _shareUnlock();
    });
  },120);
}

function _capturarElementoSimples(el, filename){
  _shareFilename=filename;
  if(!_shareLock())return;
  if(!_resetModal()){_shareUnlock();return;}
  openShare();
  setTimeout(function(){
    html2canvas(el,{
      backgroundColor:'#1e1e1e',
      scale:2,
      useCORS:true,
      allowTaint:false,
      logging:false
    }).then(function(canvas){
      canvas.toBlob(function(blob){
        _shareBlob=blob;
        var url=URL.createObjectURL(blob);
        var img=document.getElementById('share-preview-img');
        img.src=url;img.style.display='block';
        document.getElementById('share-loading').style.display='none';
        _showShareReady();
        _shareUnlock();
      },'image/png');
    }).catch(function(err){
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('captura erro:',err);
      _shareUnlock();
    });
  },120);
}

function compartilharCardAnalise(cardEl, titulo){
  var nome='urubufc-analise-'+titulo.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')+'.png';
  _capturarElementoSimples(cardEl, nome);
}

function compartilharAnaliseCompleta(){
  _shareFilename='urubufc-analise-completa.png';
  if(!_shareLock())return;
  if(!_resetModal()){_shareUnlock();return;}
  openShare();
  setTimeout(function(){
    var awrap=document.querySelector('#pane-analise .awrap');
    var ovOrig=awrap.style.overflow;
    var hOrig=awrap.style.height;
    var maxOrig=awrap.style.maxHeight;
    awrap.style.overflow='visible';
    awrap.style.height='auto';
    awrap.style.maxHeight='none';
    html2canvas(awrap,{
      backgroundColor:'#0a0a0a',
      scale:2,
      useCORS:true,
      allowTaint:false,
      logging:false,
      windowHeight:awrap.scrollHeight+200,
      height:awrap.scrollHeight
    }).then(function(canvas){
      awrap.style.overflow=ovOrig;
      awrap.style.height=hOrig;
      awrap.style.maxHeight=maxOrig;
      canvas.toBlob(function(blob){
        _shareBlob=blob;
        var url=URL.createObjectURL(blob);
        var img=document.getElementById('share-preview-img');
        img.src=url;img.style.display='block';
        document.getElementById('share-loading').style.display='none';
        _showShareReady();
        _shareUnlock();
      },'image/png');
    }).catch(function(err){
      awrap.style.overflow=ovOrig;
      awrap.style.height=hOrig;
      awrap.style.maxHeight=maxOrig;
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharAnaliseCompleta erro:',err);
      _shareUnlock();
    });
  },120);
}
// ── COMPARTILHAR VIA LINK ────────────────────────────────────────────────────

function _linkFeedback(btnId){
  var btn=document.getElementById(btnId);
  if(!btn)return;
  var orig=btn.textContent;
  btn.textContent='Link copiado!';
  btn.disabled=true;
  setTimeout(function(){btn.textContent=orig;btn.disabled=false;},2200);
}

function _copiarTexto(texto){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(texto);
  }
  // fallback para ambientes sem Clipboard API
  var ta=document.createElement('textarea');
  ta.value=texto;
  ta.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  try{document.execCommand('copy');}catch(e){}
  document.body.removeChild(ta);
  return Promise.resolve();
}

function compartilharLinkLimpo(){
  var url='https://urubufc.com.br';
  _copiarTexto(url).then(function(){
    _linkFeedback('btn-link-limpo');
  }).catch(function(){
    alert('Não foi possível copiar. URL: '+url);
  });
}

function compartilharLinkEscalacao(){
  // Montar cópia do estado sem targets, serieA e fotos base64
  var players=(ST.players||[]).map(function(p){
    var clone={};
    Object.keys(p).forEach(function(k){
      if(k==='foto'&&typeof p[k]==='string'&&p[k].indexOf('data:')===0)return;
      clone[k]=p[k];
    });
    return clone;
  });

  var dados={
    players: players,
    slots:   ST.slots,
    fmt:     ST.fmt,
    slotsByFmt: ST.slotsByFmt,
    customPos:  ST.customPos
  };

  var json=JSON.stringify(dados);
  var hash='#d='+encodeURIComponent(json);
  var url='https://urubufc.com.br/'+hash;

  _copiarTexto(url).then(function(){
    _linkFeedback('btn-link-escalacao');
  }).catch(function(){
    alert('Não foi possível copiar. URL gerada:\n'+url);
  });
}
// ────────────────────────────────────────────────────────────────────────────
