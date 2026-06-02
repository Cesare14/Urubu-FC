// ── COMPARTILHAR — função base ──────────────────────────────────────────────
var _shareBlob=null;
var _shareFilename='urubufc.png';

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
  // Resetar modal
  if(!_resetModal())return;
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
      },'image/png');
    }).catch(function(err){
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('html2canvas erro:',err);
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
  if(!_resetModal())return;
  openShare();

  setTimeout(function(){
    var fieldEl=document.getElementById('field');
    var cores={
      A:{base:'#1a5c24',faixa:'rgba(0,0,0,0.08)',borda:'#0e4019'},
      B:{base:'#122e52',faixa:'rgba(0,0,0,0.07)',borda:'#0a2240'},
      C:{base:'#7a1208',faixa:'rgba(0,0,0,0.10)',borda:'#4a0a06'}
    };
    var c=cores[tab]||cores.A;
    var sc=2;

    html2canvas(fieldEl,{
      backgroundColor:null,
      scale:sc,
      useCORS:true,
      allowTaint:false,
      logging:false,
      onclone:function(doc){
        var f=doc.getElementById('field');
        if(f) f.style.background=c.base+' repeating-linear-gradient(0deg,transparent,transparent 40px,'+c.faixa+' 40px,'+c.faixa+' 80px)';
      }
    }).then(function(canvas){
      canvas.toBlob(function(blob){
        _shareBlob=blob;
        var url=URL.createObjectURL(blob);
        var img=document.getElementById('share-preview-img');
        img.src=url;img.style.display='block';
        document.getElementById('share-loading').style.display='none';
        _showShareReady();
      },'image/png');
    }).catch(function(err){
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharCampo erro:',err);
    });
  },120);
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeShare();});

function compartilharElenco(){
  _shareFilename='urubufc-elenco.png';

  if(!_resetModal())return;
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
      },'image/png');
    }).catch(function(err){
      ssEl.style.overflow=ssOvOrig;
      ssEl.style.height=ssHOrig;
      ssEl.style.maxHeight=ssMaxOrig;
      pane.style.overflow=paneOvOrig;
      pane.style.display=paneDispOrig;
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharElenco erro:',err);
    });
  },120);
}

function compartilharMercado(){
  _shareFilename='urubufc-alvos-mercado.png';

  if(!_resetModal())return;
  openShare();

  setTimeout(function(){
    var pane=document.getElementById('pane-mercado');
    var paneDispOrig=pane.style.display;
    if(pane.style.display==='none'){pane.style.display='flex';}
    var mwrap=pane.querySelector('.mwrap');
    if(!mwrap){
      pane.style.display=paneDispOrig;
      document.getElementById('share-loading').textContent='Erro: lista de alvos não encontrada.';
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
      },'image/png');
    }).catch(function(err){
      mwrap.style.overflow=mwOvOrig;
      mwrap.style.height=mwHOrig;
      mwrap.style.maxHeight=mwMaxOrig;
      pane.style.overflow=paneOvOrig;
      pane.style.display=paneDispOrig;
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharMercado erro:',err);
    });
  },120);
}

function _capturarElementoSimples(el, filename){
  _shareFilename=filename;
  if(!_resetModal())return;
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
      },'image/png');
    }).catch(function(err){
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('captura erro:',err);
    });
  },120);
}

function compartilharCardAnalise(cardEl, titulo){
  var nome='urubufc-analise-'+titulo.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')+'.png';
  _capturarElementoSimples(cardEl, nome);
}

function compartilharAnaliseCompleta(){
  _shareFilename='urubufc-analise-completa.png';
  if(!_resetModal())return;
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
      },'image/png');
    }).catch(function(err){
      awrap.style.overflow=ovOrig;
      awrap.style.height=hOrig;
      awrap.style.maxHeight=maxOrig;
      document.getElementById('share-loading').textContent='Erro ao gerar imagem. Tente novamente.';
      console.error('compartilharAnaliseCompleta erro:',err);
    });
  },120);
}
// ────────────────────────────────────────────────────────────────────────────
