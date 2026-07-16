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

function compartilharCampo(){
  var nomes={A:'titulares',B:'reservas',C:'projecao'};
  var tab=ST&&ST.ft?ST.ft:'A';
  _shareFilename='urubufc-escala-'+nomes[tab]+'.png';
  if(!_shareLock())return;
  if(!_resetModal()){_shareUnlock();return;}
  openShare();

  setTimeout(function(){
    var fieldEl=document.getElementById('field');
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
        var SCARD_ZOOM=1.2;
        f.querySelectorAll('.scard').forEach(function(sc){
          var w0=sc.offsetWidth,h0=sc.offsetHeight;
          var w1=w0*SCARD_ZOOM,h1=h0*SCARD_ZOOM;
          sc.style.width=w1+'px';
          sc.style.minHeight=h1+'px';
          sc.style.marginLeft='-'+((w1-w0)/2)+'px';
          sc.style.marginTop='-'+((h1-h0)/2)+'px';
          var sname=sc.querySelector('.sname');
          if(sname){
            var fs0=parseFloat(getComputedStyle(sname).fontSize);
            sname.style.fontSize=(fs0*SCARD_ZOOM)+'px';
            sname.style.maxWidth=(w1-8)+'px';
          }
          var ssub=sc.querySelector('.ssub');
          if(ssub){
            var fs1=parseFloat(getComputedStyle(ssub).fontSize);
            // legibilidade da posição (MEI, LD etc): além do fator de escala
            // do card, aplica um reforço extra de tamanho + negrito — pedido
            // específico do usuário além do aumento proporcional do resto.
            ssub.style.fontSize=(fs1*SCARD_ZOOM*1.3)+'px';
            ssub.style.fontWeight='700';
          }
          var dwrap=sc.querySelector('.donut-wrap');
          if(dwrap){
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
            var DONUT_SIZE=40; // tamanho alvo fixo, mais agressivo que o fator 1.2x do card
            var oldCanvas=dwrap.querySelector('canvas');
            var num=dwrap.querySelector('.donut-num');
            if(oldCanvas&&num){
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
            }
          }
        });
        // centralização do número dentro do donut na captura — troca translate(%) por
        // translate(px), calculado a partir do próprio tamanho do elemento. Mantém
        // position:absolute;top:50%;left:50% (herdado do CSS) intacto — não usa
        // flex/grid, que se mostrou custoso para o html2canvas no diagnóstico anterior.
        f.querySelectorAll('.donut-num').forEach(function(lbl){
          var w=lbl.offsetWidth,h=lbl.offsetHeight;
          var nudge=1.2; // correção empírica pra compensar métrica da fonte (glifo vs caixa)
          lbl.style.transform='translate(-'+(w/2)+'px,-'+(h/2+nudge)+'px)';
        });
        // suprimir o glow (box-shadow) do destaque .ftgt (jogador do Mercado escalado)
        // só na imagem exportada — custoso para o html2canvas rasterizar. A borda
        // dourada sólida (border) permanece intacta; a interface ao vivo não é afetada.
        f.querySelectorAll('.scard.ftgt').forEach(function(sc){sc.style.boxShadow='none';});
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
      }
    }).then(function(canvas){
      // Letterbox: canvas sai em 1080x1180 (540x590 @ scale:2). Completar para
      // 1080x1350 fixo (4:5) com faixas pretas neutras em cima/embaixo,
      // centralizando o campo capturado sem esticar nem cortar.
      var finalW=1080,finalH=1350;
      var finalCanvas=document.createElement('canvas');
      finalCanvas.width=finalW;finalCanvas.height=finalH;
      var ctx=finalCanvas.getContext('2d');
      ctx.fillStyle='#000';
      ctx.fillRect(0,0,finalW,finalH);
      var offY=Math.round((finalH-canvas.height)/2);
      ctx.drawImage(canvas,0,offY);
      finalCanvas.toBlob(function(blob){
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
      console.error('compartilharCampo erro:',err);
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
