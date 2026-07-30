// ── TOUCH DETECTION ─────────────────────────────────────────────────────────
var IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Ícone de alvo/dardo (Twemoji, licença MIT) exibido na pill do nome do
// jogador contratado (.sname--outside.ftgt). Markup oficial, não recriado —
// ver briefing "Redesign do Scard" (branch redesign-scard).
var FTGT_ICON_SVG = '<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle fill="#DD2E44" cx="18" cy="18" r="18"/><circle fill="#FFF" cx="18" cy="18" r="13.5"/><circle fill="#DD2E44" cx="18" cy="18" r="10"/><circle fill="#FFF" cx="18" cy="18" r="6"/><circle fill="#DD2E44" cx="18" cy="18" r="3"/><path opacity=".2" d="M18.24 18.282l13.144 11.754s-2.647 3.376-7.89 5.109L17.579 18.42l.661-.138z" fill="#000"/><path fill="#FFAC33" d="M18.294 19a.994.994 0 0 1-.704-1.699l.563-.563a.995.995 0 0 1 1.408 1.407l-.564.563a.987.987 0 0 1-.703.292z"/><path fill="#55ACEE" d="M24.016 6.981c-.403 2.079 0 4.691 0 4.691l7.054-7.388c.291-1.454-.528-3.932-1.718-4.238c-1.19-.306-4.079.803-5.336 6.935zm5.003 5.003c-2.079.403-4.691 0-4.691 0l7.388-7.054c1.454-.291 3.932.528 4.238 1.718c.306 1.19-.803 4.079-6.935 5.336z"/><path fill="#3A87C2" d="M32.798 4.485L21.176 17.587c-.362.362-1.673.882-2.51.046c-.836-.836-.419-2.08-.057-2.443L31.815 3.501s.676-.635 1.159-.152s-.176 1.136-.176 1.136z"/></svg>';

// Estado global do tap-to-select
// touchSel = { type: 'row'|'scard', id: number|string, si: number|null, tab: string, rowEl: el|null }
var touchSel = null;

function clearTouchSel() {
  if (!touchSel) return;
  if (touchSel.rowEl) touchSel.rowEl.classList.remove('touch-sel');
  if (touchSel.si !== null) {
    var sc = document.querySelector('.scard[data-si="' + touchSel.si + '"]');
    if (sc) sc.classList.remove('touch-sel');
  }
  touchSel = null;
}

// ── CANCELAR SELEÇÃO AO TOCAR FORA DO CAMPO/LISTA (toque) ───────────────────
// Ignora toques dentro do campo (já tratado por field.click) e da lista do
// elenco (já tratado por onRowTap), e ignora toques em modais, menus e
// elementos de UI sobrepostos (cookie banner, share sheet, dropdowns etc.),
// para não cancelar a seleção sem querer ao abrir outra coisa.
if (IS_TOUCH) {
  document.addEventListener('click', function (e) {
    if (!touchSel) return;
    var t = e.target;
    if (t.closest('#field')) return;
    if (t.closest('.ss')) return;
    if (t.closest('.mover, .share-over, #share-menu-overlay, #share-menu-sheet, .legal-over, #cookie-bar, .mf-dropdown')) return;
    clearTouchSel();
  });
}

// ── AUTO-SCROLL (compartilhado: usado tanto ao arrastar um scard dentro do
// campo quanto ao arrastar uma linha da tabela de elenco até o campo) ───────
// Ativa quando o dedo se aproxima do topo/fundo da viewport durante um arrasto.
var SCROLL_ZONE = 70; // px da borda da viewport que ativa o auto-scroll
var SCROLL_SPEED = 12; // px por frame
var scrollDir = 0; // -1 sobe, 0 parado, 1 desce
var scrollRAF = null;
function getScrollEl() {
  // Container de rolagem próprio (mobile). Fallback para o scroll do documento.
  return document.getElementById('scrollwrap') || document.scrollingElement || document.documentElement || document.body;
}
function autoScrollStep() {
  if (scrollDir === 0) { scrollRAF = null; return; }
  getScrollEl().scrollTop += scrollDir * SCROLL_SPEED;
  scrollRAF = requestAnimationFrame(autoScrollStep);
}
function updateAutoScroll(clientY) {
  var vh = window.innerHeight;
  var dir = 0;
  if (clientY < SCROLL_ZONE) dir = -1;
  else if (clientY > vh - SCROLL_ZONE) dir = 1;
  scrollDir = dir;
  if (scrollDir !== 0 && !scrollRAF) scrollRAF = requestAnimationFrame(autoScrollStep);
}
function stopAutoScroll() {
  scrollDir = 0;
  if (scrollRAF !== null) { cancelAnimationFrame(scrollRAF); scrollRAF = null; }
}

// ── SNAP / POS HELPERS ──────────────────────────────────────────────────────
function snapToGrid(xPct, yPct) {
  var cw = 100 / GRID_COLS, ch = 100 / GRID_ROWS;
  var sx = Math.round(xPct / cw) * cw;
  var sy = Math.round(yPct / ch) * ch;
  sx = Math.max(7, Math.min(93, sx));
  sy = Math.max(6, Math.min(94, sy));
  return [Math.round(sx * 10) / 10, Math.round(sy * 10) / 10];
}
function slotPos(tab, i) {
  var key = tab + '|' + ST.fmt[tab];
  if (ST.customPos[key] && ST.customPos[key][i]) return ST.customPos[key][i];
  var s = fmtSlots(ST.fmt[tab])[i]; return [s[0], s[1]];
}
// Função (GOL/ZAG/VOL...) do slot i. Mesmo padrão do customPos acima: o valor
// base vem da formação (de fábrica ou customizada) e pode ser sobreposto por
// uma troca solta do usuário, guardada por aba+formação em ST.customFn. Ao
// salvar a configuração como formação nova, essas trocas são congeladas dentro
// dela e a sobreposição é limpa.
function slotFn(tab, i) {
  var key = tab + '|' + ST.fmt[tab];
  if (ST.customFn && ST.customFn[key] && ST.customFn[key][i]) return ST.customFn[key][i];
  var s = fmtSlots(ST.fmt[tab])[i];
  return s ? s[2] : 'MEI';
}
function setSlotFn(tab, i, pos) {
  if (POSITIONS.indexOf(pos) === -1) return; // dropdown fechado: nunca valor livre
  var key = tab + '|' + ST.fmt[tab];
  if (!ST.customFn) ST.customFn = {};
  if (!ST.customFn[key]) ST.customFn[key] = {};
  ST.customFn[key][i] = pos;
}
function setCustomPos(tab, i, xy) {
  var key = tab + '|' + ST.fmt[tab];
  if (!ST.customPos[key]) ST.customPos[key] = {};
  ST.customPos[key][i] = xy;
}
function resetCustomPos(tab) {
  var key = tab + '|' + ST.fmt[tab];
  delete ST.customPos[key];
  if (ST.customFn) delete ST.customFn[key];
}

// ── POPOVER DE FUNÇÃO DO SLOT ───────────────────────────────────────────────
// Abre no clique curto (desktop) ou no toque longo de 500ms (mobile — 500ms é o
// long_press_timeout padrão do Android). Usa um <select> nativo: dropdown
// fechado com as 9 posições de POSITIONS, nunca texto livre, senão
// pmatch/autoFill deixariam de casar jogadores com o slot. Trocar a função NÃO
// mexe em ST.slots: o jogador que estiver no slot continua nele.
var _fnpopEl = null;
var _longPressFired = false; // suprime o tap que vem logo após o toque longo

function fecharPopFuncao() {
  if (_fnpopEl && _fnpopEl.parentNode) _fnpopEl.parentNode.removeChild(_fnpopEl);
  _fnpopEl = null;
  document.removeEventListener('click', _fnpopFora, true);
}
function _fnpopFora(e) {
  if (_fnpopEl && !_fnpopEl.contains(e.target)) fecharPopFuncao();
}
function abrirPopFuncao(sc, tab, i) {
  fecharPopFuncao();
  clearTouchSel();
  var pop = document.createElement('div');
  pop.className = 'fnpop'; pop.id = 'fnpop';
  var lbl = document.createElement('div'); lbl.className = 'fnpop-lbl'; lbl.textContent = 'Função do slot';
  var sel = document.createElement('select'); sel.className = 'fs fnpop-sel';
  var atual = slotFn(tab, i);
  POSITIONS.forEach(function (pos) {
    var o = document.createElement('option');
    o.value = pos; o.textContent = pos;
    if (pos === atual) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('click', function (e) { e.stopPropagation(); });
  sel.addEventListener('change', function () {
    setSlotFn(tab, i, sel.value);
    save();
    fecharPopFuncao();
    patchSlot(i, tab);
  });
  pop.appendChild(lbl); pop.appendChild(sel);
  document.body.appendChild(pop);

  // Ancorado no próprio slot, preso à viewport (position:fixed no CSS): o
  // #field tem overflow:hidden e cortaria o popover se ele nascesse lá dentro.
  var r = sc.getBoundingClientRect();
  var pw = pop.offsetWidth || 140, ph = pop.offsetHeight || 66;
  var left = Math.max(8, Math.min(window.innerWidth - pw - 8, r.left + r.width / 2 - pw / 2));
  var top = r.bottom + 6;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 6);
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';
  _fnpopEl = pop;
  // setTimeout: sem isso o próprio clique/toque que abriu o popover seria
  // capturado logo abaixo e o fecharia no mesmo instante.
  setTimeout(function () { document.addEventListener('click', _fnpopFora, true); }, 0);
}

// ── TOUCH DRAG ──────────────────────────────────────────────────────────────
// Cria clone visual que segue o dedo durante o drag
function addTouchDrag(sc, tab) {
  var clone = null;
  var startX = 0, startY = 0;
  var moved = false;
  var MOVE_THRESHOLD = 8; // px para distinguir tap de drag
  var pressTimer = null;
  var LONGPRESS_DELAY = 500; // ms parado até abrir o popover de função

  function cancelarLongPress() {
    if (pressTimer !== null) { clearTimeout(pressTimer); pressTimer = null; }
  }

  sc.addEventListener('touchstart', function (e) {
    moved = false;
    var t = e.touches[0];
    startX = t.clientX; startY = t.clientY;

    // Toque longo parado → popover de função. Qualquer deslocamento acima do
    // MOVE_THRESHOLD (abaixo, no touchmove) cancela: arrastar tem prioridade.
    _longPressFired = false;
    cancelarLongPress();
    pressTimer = setTimeout(function () {
      pressTimer = null;
      if (moved) return;
      _longPressFired = true;
      abrirPopFuncao(sc, tab, +sc.dataset.si);
    }, LONGPRESS_DELAY);

    // Criar clone após pequeno delay (evita conflito com tap)
    clone = null;
  }, { passive: true });

  sc.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    var dx = t.clientX - startX, dy = t.clientY - startY;

    if (!moved && Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      moved = true;
      cancelarLongPress();
      // Iniciar drag: criar clone fixo na viewport
      clone = sc.cloneNode(true);
      clone.classList.add('touch-drag-clone');
      clone.style.position = 'fixed';
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.width = sc.offsetWidth + 'px';
      clone.style.height = sc.offsetHeight + 'px';
      clone.style.opacity = '0.85';
      document.body.appendChild(clone);

      // Registrar origem
      dragId = sc.dataset.ek !== undefined ? (isNaN(sc.dataset.ek) ? sc.dataset.ek : +sc.dataset.ek) : null;
      dragSi = +sc.dataset.si;
      var fEl = document.getElementById('field');
      if (fEl) fEl.style.touchAction = 'none'; // trava scroll nativo do container só durante o arrasto ativo
      var fRect = fEl.getBoundingClientRect();
      var scRect = sc.getBoundingClientRect();
      dragOffX = ((startX - scRect.left) / fRect.width) * 100;
      dragOffY = ((startY - scRect.top) / fRect.height) * 100;
    }

    if (moved && clone) {
      e.preventDefault();
      clone.style.left = (t.clientX - sc.offsetWidth / 2) + 'px';
      clone.style.top = (t.clientY - sc.offsetHeight / 2) + 'px';

      updateAutoScroll(t.clientY);
    }
  }, { passive: false });

  sc.addEventListener('touchend', function (e) {
    cancelarLongPress();
    stopAutoScroll();
    var fElEnd = document.getElementById('field');
    if (fElEnd) fElEnd.style.touchAction = 'auto'; // libera scroll normal do campo ao soltar
    if (!moved || !clone) {
      // É um tap — delegar ao handler de tap
      if (clone) { document.body.removeChild(clone); clone = null; }
      return;
    }

    // Remover clone
    document.body.removeChild(clone); clone = null;

    var t = e.changedTouches[0];
    var field = document.getElementById('field');
    var fRect = field.getBoundingClientRect();

    // Calcular posição de drop em % do campo
    var xPct = ((t.clientX - fRect.left) / fRect.width) * 100;
    var yPct = ((t.clientY - fRect.top) / fRect.height) * 100;

    // Verificar se o dedo está dentro do campo
    if (xPct < 0 || xPct > 100 || yPct < 0 || yPct > 100) {
      dragId = null; dragSi = null; return;
    }

    // Verificar se caiu sobre outro scard
    var el = document.elementFromPoint(t.clientX, t.clientY);
    var targetSc = el ? el.closest('.scard') : null;
    var ti = targetSc ? +targetSc.dataset.si : null;

    if (ti !== null && ti !== dragSi) {
      // Troca entre dois slots
      var prev = ST.slots[tab].indexOf(dragId);
      var dis = ST.slots[tab][ti];
      ST.slots[tab][ti] = dragId;
      if (prev >= 0) ST.slots[tab][prev] = dis;
      else if (dragSi !== null) ST.slots[tab][dragSi] = dis;
      save();
      if (dragSi !== null && dragSi !== ti) patchSlot(dragSi, tab);
      patchSlot(ti, tab);
      if (typeof dragId === 'number') patchTableRow(dragId);
    } else {
      // Reposicionar dentro do campo (mover scard existente)
      var xy = snapToGrid(
        xPct - dragOffX + (SCARD_W / 2 / fRect.width * 100),
        yPct - dragOffY + (SCARD_H / 2 / fRect.height * 100)
      );
      if (dragSi !== null) {
        setCustomPos(tab, dragSi, xy);
        save();
        patchSlot(dragSi, tab);
      }
    }

    dragId = null; dragSi = null;
  }, { passive: false });

  sc.addEventListener('touchcancel', function () {
    cancelarLongPress();
    stopAutoScroll();
    var fElCancel = document.getElementById('field');
    if (fElCancel) fElCancel.style.touchAction = 'auto';
    if (clone) { document.body.removeChild(clone); clone = null; }
    moved = false;
    dragId = null; dragSi = null;
  }, { passive: true });
}

// ── TAP-TO-SELECT (linha da tabela) ─────────────────────────────────────────
// Chamado por roster.js ao construir cada linha — exportado globalmente
function onRowTap(pid, rowEl) {
  if (!IS_TOUCH) return;

  // Se já há um scard selecionado, ignorar tap na linha (contexto diferente)
  if (touchSel && touchSel.type === 'scard') { clearTouchSel(); return; }

  if (touchSel && touchSel.type === 'row' && touchSel.id === pid) {
    // Segundo tap na mesma linha: desselecionar
    clearTouchSel(); return;
  }

  clearTouchSel();
  rowEl.classList.add('touch-sel');
  touchSel = { type: 'row', id: pid, si: null, tab: ST.ft, rowEl: rowEl };
}

// ── TAP NO SCARD ────────────────────────────────────────────────────────────
function onScardTap(sc, tab) {
  if (!IS_TOUCH) return;
  var si = +sc.dataset.si;
  var slotVal = ST.slots[tab][si];

  // CASO 1: há um jogador selecionado na tabela → colocar no slot
  if (touchSel && touchSel.type === 'row') {
    var pid = touchSel.id;
    var prevSi = ST.slots[tab].indexOf(pid);
    var displaced = slotVal;

    ST.slots[tab][si] = pid;
    if (prevSi >= 0 && prevSi !== si) ST.slots[tab][prevSi] = displaced;

    clearTouchSel();
    save();
    if (prevSi >= 0 && prevSi !== si) patchSlot(prevSi, tab);
    patchSlot(si, tab);
    patchTableRow(pid);
    return;
  }

  // CASO 2: há um scard selecionado → trocar com este slot
  if (touchSel && touchSel.type === 'scard') {
    var fromSi = touchSel.si;
    if (fromSi === si) { clearTouchSel(); return; }

    var fromVal = ST.slots[tab][fromSi];
    ST.slots[tab][fromSi] = slotVal;
    ST.slots[tab][si] = fromVal;

    clearTouchSel();
    save();
    patchSlot(fromSi, tab);
    patchSlot(si, tab);
    if (typeof fromVal === 'number') patchTableRow(fromVal);
    if (typeof slotVal === 'number') patchTableRow(slotVal);
    return;
  }

  // CASO 3: slot preenchido sem seleção → selecionar este scard
  if (slotVal !== null) {
    sc.classList.add('touch-sel');
    touchSel = { type: 'scard', id: slotVal, si: si, tab: tab, rowEl: null };
    return;
  }

  // CASO 4: slot vazio sem seleção → não faz nada
  clearTouchSel();
}

// ── LISTRAS DECORATIVAS DO CÍRCULO (campo tático) ────────────────────────────
// Substitui o donut de nível (número + cor por faixa) dentro do
// .circle-visual do campo tático (Titulares/Reservas/Projeção) por um padrão
// puramente decorativo de listras horizontais vermelho/preto + borda preta,
// IDÊNTICO para todo jogador — sem nenhuma variação por nível. Cores fixas em
// vermelho de marca (#C52613, igual a var(--red) do style.css) e preto
// literal (#0a0a0a): NÃO usar var(--black), pois essa variável vira
// quase-branco no tema claro (é a cor de fundo de página, não um preto de
// identidade). A função genérica nivelDonutEl()/drawDonut() (ui.js) permanece
// intocada e continua sendo usada normalmente em Elenco, Mercado/Alvos e
// Análise.
function buildStripeCircle(size) {
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'circle-stripes');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
  var uid = 'stripeClip' + Math.random().toString(36).slice(2, 9);
  var cx = size / 2, cy = size / 2;
  var strokeW = size * 0.045; // espessura da borda preta
  var innerR = cx - strokeW; // raio da área de listras (deixa espaço p/ borda)
  var band = size / 6; // altura de cada listra
  var step = band * 2; // repetição (listra + espaço)
  var bands = '';
  for (var y = -size; y <= size * 2; y += step) {
    bands += '<rect x="-' + size + '" y="' + y + '" width="' + (size * 3) + '" height="' + band + '" fill="#C52613"/>';
  }
  svg.innerHTML =
    '<defs><clipPath id="' + uid + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + innerR + '"/></clipPath></defs>' +
    '<g clip-path="url(#' + uid + ')">' +
      '<rect x="0" y="0" width="' + size + '" height="' + size + '" fill="#0a0a0a"/>' +
      bands +
    '</g>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + (cx - strokeW / 2) + '" fill="none" stroke="#0a0a0a" stroke-width="' + strokeW + '"/>';
  return svg;
}

// ── BUILD SCARD ──────────────────────────────────────────────────────────────
function buildScard(i, tab) {
  var sfn = slotFn(tab, i);
  var ent = slotEnt(tab, i); var isTgt = ent && ent.type === 't';
  var isCircle = tab === 'A' || tab === 'B' || tab === 'C'; // Fase B do redesign: circular em Titulares, Reservas e Projeção. Mercado/Alvos é painel separado (market.js) e não passa por buildScard.
  var sc = document.createElement('div');
  sc.className = 'scard' + (ent ? (isTgt ? ' ftgt' : ' filled') : '') + (isCircle ? ' scard--circle' : '');
  sc.dataset.si = i;

  var pos = slotPos(tab, i);
  sc.style.left = 'calc(' + pos[0] + '% - ' + (SCARD_W / 2) + 'px)';
  sc.style.top = 'calc(' + pos[1] + '% - ' + (SCARD_H / 2) + 'px)';
  if (IS_TOUCH) sc.style.touchAction = 'none';

  if (ent && ent.data) {
    var d = ent.data;
    sc.setAttribute('draggable', 'true');
    sc.dataset.ek = isTgt ? 't:' + d.id : d.id;

    if (isCircle) {
      // ── TOKEN CIRCULAR (campo Titulares — Fase A do redesign) ──
      // sc (.scard) continua com seu tamanho/hitbox originais (drag-drop,
      // grid, left/top calculados a partir de SCARD_W/H — nada disso muda).
      // O círculo é um wrapper FILHO, centralizado pelo próprio flex do
      // pai — sem precisar de transform manual pra compensar tamanhos.
      var circleWrap = document.createElement('div'); circleWrap.className = 'circle-visual' + (isTgt ? ' ftgt' : ' filled');
      // Redesign do Scard: o donut precisa nascer desenhado no tamanho real
      // de cada viewport (não é pra continuar desenhando 40px e deixar o
      // CSS espremer o container visualmente por fora — isso deixava o
      // canvas real vazando ~6px além da caixa .circle-visual de 28px no
      // mobile). Breakpoint igual ao do CSS (max-width:767px). thick e
      // numSize ficam intocados — ajuste de proporção do número é assunto
      // do próximo briefing, depois que este tamanho estiver validado.
      var circleSize = window.matchMedia('(max-width:767px)').matches ? 34 : 40;
      // thick e numSize escalados proporcionalmente ao circleSize (0.15 e
      // 0.3 = 6/40 e 12/40, a proporção já validada no desktop) — antes
      // eram fixos e não acompanhavam o tamanho real do donut em mobile,
      // deixando o traço relativamente mais grosso e o número desproporcional.
      // Padrão decorativo listras vermelho/preto — igual para todo jogador
      // (inclusive .ftgt), sem número e sem variação por nível. Substitui a
      // chamada anterior a nivelDonutEl() SOMENTE aqui; ui.js/drawDonut()
      // continuam intocados e seguem usados em Elenco, Mercado e Análise.
      var sdwC = buildStripeCircle(circleSize);
      circleWrap.appendChild(sdwC);
      var clrC = document.createElement('button'); clrC.className = 'sclr'; clrC.innerHTML = '×';
      clrC.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
      clrC.onclick = function (e) { e.stopPropagation(); clearTouchSel(); ST.slots[tab][i] = null; save(); patchSlot(i, tab); };
      circleWrap.appendChild(clrC);
      var snC = document.createElement('div'); snC.className = 'sname sname--outside' + (isTgt ? ' ftgt' : '');
      if (isTgt) {
        var snIcon = document.createElement('span'); snIcon.className = 'ftgt-icon'; snIcon.innerHTML = FTGT_ICON_SVG;
        var snText = document.createElement('span'); snText.className = 'ftgt-name'; snText.textContent = d.name;
        snC.appendChild(snIcon); snC.appendChild(snText);
      } else {
        // Nome envolvido num <span> (não mais texto cru direto no container
        // flex .sname--outside) — mesmo padrão já usado no ramo .ftgt acima.
        // Um nó de texto solto como item flex é válido no CSS e renderiza
        // certo em qualquer navegador real, mas o html2canvas (que usa seu
        // próprio parser de layout, não o do navegador) trata essa "caixa
        // anônima" de forma inconsistente — é a causa raiz confirmada do
        // nome saindo desalinhado (não respeitando align-items:center) e do
        // espaço sumindo em nomes compostos na imagem exportada, mais
        // visível em engines mobile. Span sem estilo próprio se comporta
        // identicamente a texto cru no site ao vivo — não muda nada visual.
        var snPlain = document.createElement('span'); snPlain.textContent = d.name;
        snC.appendChild(snPlain);
      }
      circleWrap.appendChild(snC);
      sc.appendChild(circleWrap);
    } else {
      var sn = document.createElement('div'); sn.className = 'sname'; sn.textContent = d.name; sc.appendChild(sn);
      if (d.nivel) { var sdw = nivelDonutEl(d.nivel, 28); if (sdw) { sdw.style.margin = '1px auto 0'; sc.appendChild(sdw); } }
      var ssub = document.createElement('div'); ssub.className = 'ssub'; ssub.textContent = d.pos || ''; sc.appendChild(ssub);
      var clr = document.createElement('button'); clr.className = 'sclr'; clr.innerHTML = '×';
      clr.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
      clr.onclick = function (e) { e.stopPropagation(); clearTouchSel(); ST.slots[tab][i] = null; save(); patchSlot(i, tab); };
      sc.appendChild(clr);
    }

    // ── MOUSE DRAG (desktop) ──────────────────────────────────────
    sc.addEventListener('dragstart', function (e) {
      dragId = isNaN(sc.dataset.ek) ? sc.dataset.ek : +sc.dataset.ek;
      dragSi = i;
      e.dataTransfer.effectAllowed = 'move';
      var scRect = sc.getBoundingClientRect();
      var field = document.getElementById('field');
      var fRect = field.getBoundingClientRect();
      dragOffX = ((e.clientX - scRect.left) / fRect.width) * 100;
      dragOffY = ((e.clientY - scRect.top) / fRect.height) * 100;

      function onDragEnd() {
        document.removeEventListener('dragend', onDragEnd, true);
        if (dragSi === null || dragId === null || lastFieldX === null) { dragId = null; dragSi = null; lastFieldX = null; lastFieldY = null; return; }
        var fEl = document.getElementById('field');
        var fR = fEl ? fEl.getBoundingClientRect() : { width: 1, height: 1 };
        var xy = snapToGrid(lastFieldX - dragOffX + (SCARD_W / 2 / fR.width * 100), lastFieldY - dragOffY + (SCARD_H / 2 / fR.height * 100));
        var movedSi = dragSi;
        setCustomPos(tab, movedSi, xy);
        dragId = null; dragSi = null; lastFieldX = null; lastFieldY = null; save();
        patchSlot(movedSi, tab);
      }
      document.addEventListener('dragend', onDragEnd, true);
    });
  } else {
    if (isCircle) {
      // Contorno tracejado circular do slot vazio: reaproveita o
      // .circle-visual base (border dashed já definido no CSS para o
      // estado não-.filled/.ftgt) — sem isso, o slot vazio ficava sem
      // nenhuma indicação visual de área de destino no redesign circular.
      var emptyWrap = document.createElement('div'); emptyWrap.className = 'circle-visual circle-visual--empty';
      var semptyEl = document.createElement('span'); semptyEl.className = 'sempty'; semptyEl.textContent = sfn;
      emptyWrap.appendChild(semptyEl);
      sc.appendChild(emptyWrap);
    } else {
      sc.innerHTML = '<span class="sempty">' + sfn + '</span>';
    }
  }

  // ── MOUSE DROP (desktop) ──────────────────────────────────────
  sc.addEventListener('dragover', function (e) { e.preventDefault(); sc.classList.add('dov'); });
  sc.addEventListener('dragleave', function () { sc.classList.remove('dov'); });
  sc.addEventListener('drop', function (e) {
    e.preventDefault(); e.stopPropagation(); sc.classList.remove('dov');
    if (dragId === null && dragId !== 0) return;
    var ti = +sc.dataset.si;
    if (dragSi !== null && dragSi === ti) {
      var rect = document.getElementById('field').getBoundingClientRect();
      var xPct = ((e.clientX - rect.left) / rect.width) * 100 - dragOffX + (SCARD_W / 2 / rect.width * 100);
      var yPct = ((e.clientY - rect.top) / rect.height) * 100 - dragOffY + (SCARD_H / 2 / rect.height * 100);
      var movedSi = dragSi;
      setCustomPos(tab, movedSi, snapToGrid(xPct, yPct));
      dragId = null; dragSi = null; lastFieldX = null; lastFieldY = null; save();
      patchSlot(movedSi, tab); return;
    }
    var prev = ST.slots[tab].indexOf(dragId);
    var prevSi = dragSi;
    var affectedPid = typeof dragId === 'number' ? dragId : null;
    if (prev >= 0) ST.slots[tab][prev] = null;
    if (prevSi !== null && prevSi !== ti) { var dis = ST.slots[tab][ti]; ST.slots[tab][ti] = dragId; ST.slots[tab][prevSi] = dis; }
    else ST.slots[tab][ti] = dragId;
    dragId = null; dragSi = null; save();
    if (prevSi !== null && prevSi !== ti) patchSlot(prevSi, tab);
    patchSlot(ti, tab);
    if (affectedPid !== null) patchTableRow(affectedPid);
  });

  // ── TAP (touch) ───────────────────────────────────────────────
  if (IS_TOUCH) {
    addTouchDrag(sc, tab);
    sc.addEventListener('click', function (e) {
      // click após drag já foi resolvido pelo touchend; só processar taps reais
      if (e.detail === 0) return; // evento sintético
      // Toque longo acabou de abrir o popover de função: o navegador ainda
      // dispara um click logo em seguida. Sem esta guarda, esse click cairia
      // no tap-to-select e mexeria no jogador do slot sem o usuário pedir.
      if (_longPressFired) { _longPressFired = false; return; }
      onScardTap(sc, tab);
    });
    // Menu nativo do navegador no toque longo (copiar/compartilhar no iOS,
    // arrasto nativo no Android por causa do draggable=true) roubaria o gesto.
    sc.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  } else {
    // Desktop: clique curto no slot abre o popover de função. O arrasto usa a
    // API de drag nativa (dragstart/drop), que não dispara click — então não
    // há conflito entre mover o jogador e trocar a função do slot.
    sc.addEventListener('click', function (e) {
      if (e.target.closest('.sclr')) return; // o "×" tem ação própria
      abrirPopFuncao(sc, tab, i);
    });
  }

  return sc;
}

// ── PATCH SLOT ───────────────────────────────────────────────────────────────
function patchSlot(i, tab) {
  var existing = document.querySelector('.scard[data-si="' + i + '"]');
  if (!existing) return;
  var newSc = buildScard(i, tab);
  existing.parentNode.replaceChild(newSc, existing);
}

// ── RENDER FIELD ─────────────────────────────────────────────────────────────
function renderField() {
  var tab = ST.ft, field = document.getElementById('field');
  field.className = 'field' + (tab === 'B' ? ' res' : tab === 'C' ? ' mkt' : '');
  field.innerHTML = '';
  if (IS_TOUCH) field.style.touchAction = 'auto';

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'fsvg');
  svg.setAttribute('viewBox', '0 0 140 153');
  var sl = 'rgba(255,255,255,.38)';
  svg.innerHTML =
    '<rect x="2" y="2" width="136" height="149" fill="none" stroke="' + sl + '" stroke-width="1"/>' +
    '<line x1="2" y1="76.5" x2="138" y2="76.5" stroke="' + sl + '" stroke-width="1"/>' +
    '<circle cx="70" cy="76.5" r="15" fill="none" stroke="' + sl + '" stroke-width="1"/>' +
    '<circle cx="70" cy="76.5" r=".9" fill="' + sl + '"/>' +
    '<rect x="42" y="2" width="56" height="16" fill="none" stroke="' + sl + '" stroke-width="1"/>' +
    '<rect x="42" y="135" width="56" height="16" fill="none" stroke="' + sl + '" stroke-width="1"/>' +
    '<circle cx="70" cy="13" r="1.1" fill="' + sl + '"/>' +
    '<circle cx="70" cy="140" r="1.1" fill="' + sl + '"/>' +
    '<image href="' + logoB64 + '" x="3" y="3" width="30" height="24" opacity="0.50"/>';
  field.appendChild(svg);

  var bdg = document.createElement('span'); bdg.className = 'fbadge'; bdg.textContent = fmtLabel(ST.fmt[tab]);
  field.appendChild(bdg);

  fmtSlots(ST.fmt[tab]).forEach(function (s, i) {
    field.appendChild(buildScard(i, tab));
  });

  // ── MOUSE DROP no campo vazio (desktop) ──────────────────────
  field.ondragover = function (e) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    var rect = field.getBoundingClientRect();
    lastFieldX = ((e.clientX - rect.left) / rect.width) * 100;
    lastFieldY = ((e.clientY - rect.top) / rect.height) * 100;
  };
  field.ondrop = function (e) {
    if (dragSi === null || dragId === null) return;
    var overCard = e.target.closest('.scard');
    var overSi = overCard ? +overCard.dataset.si : null;
    var isForeignFilled = overCard && overSi !== dragSi && ST.slots[tab][overSi] != null;
    if (isForeignFilled) return;
    e.preventDefault(); e.stopPropagation();
    var rect = field.getBoundingClientRect();
    var xPct = ((e.clientX - rect.left) / rect.width) * 100 - dragOffX + (SCARD_W / 2 / rect.width * 100);
    var yPct = ((e.clientY - rect.top) / rect.height) * 100 - dragOffY + (SCARD_H / 2 / rect.height * 100);
    var xy = snapToGrid(xPct, yPct);
    var movedSi = dragSi;
    setCustomPos(tab, movedSi, xy);
    dragId = null; dragSi = null; lastFieldX = null; lastFieldY = null; save();
    patchSlot(movedSi, tab);
  };

  // ── TAP no campo vazio (touch) → cancelar seleção ────────────
  if (IS_TOUCH) {
    field.addEventListener('click', function (e) {
      if (e.target === field || e.target.classList.contains('fsvg') || e.target.tagName === 'svg') {
        clearTouchSel();
      }
    });
  }
}

// ── RENDER FM TABS ───────────────────────────────────────────────────────────
function renderFmTabs() {
  const tab = ST.ft, el = document.getElementById('fmtabs'); el.innerHTML = '';
  // Só as 4 formações de fábrica ficam na barra de botões — conjunto fechado
  // e conhecido, então 1 clique faz sentido aqui. As customizadas (conjunto
  // sem limite de tamanho) vivem no dropdown do botão "Formações", ao lado do
  // rótulo — ver trocarViaDropdownFmts()/renderFmtsDropdown() mais abaixo.
  // Se a formação ativa for uma customizada, nenhum destes 4 botões acende.
  Object.keys(FMTS).forEach(function (f) {
    const b = document.createElement('button');
    b.className = 'fmtab' + (f === ST.fmt[tab] ? ' active' : '');
    b.textContent = f;
    b.onclick = function () {
      fecharPopFuncao();
      syncSlotsToFmt();
      ST.fmt[tab] = f;
      var key = tab + '|' + f;
      ST.slots[tab] = ST.slotsByFmt[key] ? ST.slotsByFmt[key].slice() : Array(11).fill(null);
      save(); renderFmTabs(); renderFmtsDropdownBtn(); renderField(); renderBar(); renderTable();
    };
    el.appendChild(b);
  });
  // Salvar: congela a configuração atual (posições + funções) como formação.
  const sb = document.createElement('button');
  sb.className = 'btn btn-ghost fmtab-save';
  sb.textContent = '💾 Salvar';
  sb.title = 'Salvar a configuração atual como formação';
  sb.onclick = function () { salvarFormacaoAtual(); };
  el.appendChild(sb);
  const rb = document.createElement('button');
  rb.className = 'btn btn-red fmtab-reset';
  rb.textContent = '↺ Reset';
  rb.title = 'Limpar escalação e posições desta formação';
  rb.onclick = function () {
    fecharPopFuncao();
    resetCustomPos(tab);
    ST.slots[tab] = Array(11).fill(null);
    var key = tab + '|' + ST.fmt[tab]; ST.slotsByFmt[key] = Array(11).fill(null);
    clearTouchSel();
    save(); renderField(); renderBar(); renderTable();
  };
  el.appendChild(rb);
}

// ── GERENCIAR FORMAÇÕES CUSTOMIZADAS ────────────────────────────────────────
var TAB_NOMES = { A: 'Titulares', B: 'Reservas', C: 'Projeção' };

// Os 11 slots da aba como estão AGORA na tela: posição já com os ajustes
// arrastados (customPos) e função já com as trocas do popover (customFn).
function _slotsAtuais(tab) {
  var out = [];
  for (var i = 0; i < 11; i++) {
    var pos = slotPos(tab, i);
    out.push([pos[0], pos[1], slotFn(tab, i)]);
  }
  return out;
}

// Nome duplicado é bloqueado tanto entre as customizadas quanto contra as de
// fábrica: dois botões com o mesmo rótulo na barra deixariam o usuário sem
// saber qual é qual.
function _erroNomeFmt(nome, ignorarId) {
  nome = String(nome == null ? '' : nome).trim();
  if (!nome) return 'O nome não pode ficar vazio.';
  if (nome.length > FMT_NAME_MAX) return 'O nome deve ter no máximo ' + FMT_NAME_MAX + ' caracteres.';
  if (FMTS[nome]) return 'Já existe uma formação de fábrica com esse nome.';
  var alvo = sanitizeText(nome).toLowerCase();
  var dup = (ST.customFmts || []).some(function (f) {
    return f.id !== ignorarId && String(f.name).toLowerCase() === alvo;
  });
  if (dup) return 'Você já tem uma formação com esse nome.';
  return null;
}
function _pedirNomeFmt(titulo, valorInicial, ignorarId) {
  var nome = valorInicial || '';
  for (;;) {
    nome = prompt(titulo, nome);
    if (nome === null) return null; // cancelou
    nome = String(nome).trim();
    var erro = _erroNomeFmt(nome, ignorarId);
    if (!erro) return sanitizeText(nome);
    alert(erro);
  }
}

function salvarFormacaoAtual() {
  fecharPopFuncao();
  var tab = ST.ft;
  var atual = ST.fmt[tab];
  var custom = getCustomFmt(atual);
  var slots = _slotsAtuais(tab);

  if (custom) {
    // Já estamos numa formação salva: sobrescrever ou tirar uma cópia nova?
    var sobrescrever = confirm(
      'Salvar alterações em "' + custom.name + '"?\n\n' +
      'OK = salvar as alterações nesta formação\n' +
      'Cancelar = salvar como uma formação nova'
    );
    if (sobrescrever) {
      custom.slots = slots;
      // Ajustes soltos viraram parte da formação: a sobreposição some.
      delete ST.customPos[tab + '|' + atual];
      if (ST.customFn) delete ST.customFn[tab + '|' + atual];
      save(); renderFmTabs(); renderFmtsDropdownBtn(); renderField(); renderBar();
      return;
    }
  }

  var nome = _pedirNomeFmt(
    'Nome da nova formação (até ' + FMT_NAME_MAX + ' caracteres):',
    custom ? '' : atual, null
  );
  if (nome === null) return;

  var id = nextCustomFmtId();
  ST.customFmts.push({ id: id, name: nome, slots: slots });

  // A escalação que está em campo acompanha a formação nova (mesmos 11 slots).
  ST.slotsByFmt[tab + '|' + id] = ST.slots[tab].slice();

  // Os ajustes soltos foram congelados na formação nova: a formação de origem
  // desta aba volta ao layout original e a nova nasce sem sobreposições.
  delete ST.customPos[tab + '|' + atual];
  if (ST.customFn) delete ST.customFn[tab + '|' + atual];
  delete ST.customPos[tab + '|' + id];
  if (ST.customFn) delete ST.customFn[tab + '|' + id];

  ST.fmt[tab] = id;
  save(); renderFmTabs(); renderFmtsDropdownBtn(); renderField(); renderBar(); renderTable();
}

function renomearFormacao(id) {
  var f = getCustomFmt(id);
  if (!f) return;
  var nome = _pedirNomeFmt('Novo nome da formação:', f.name, id);
  if (nome === null) return;
  f.name = nome;
  // O id interno não muda, então escalação e posições salvas continuam ligadas.
  save(); renderFmtsList(); renderFmTabs(); renderFmtsDropdownBtn(); renderField();
}

function excluirFormacao(id) {
  var f = getCustomFmt(id);
  if (!f) return;
  var emUso = ['A', 'B', 'C'].filter(function (t) { return ST.fmt[t] === id; });
  var msg = 'Excluir a formação "' + f.name + '"?';
  if (emUso.length) {
    msg += '\n\nEla está em uso em: ' + emUso.map(function (t) { return TAB_NOMES[t]; }).join(', ') +
           '.\nEssa(s) aba(s) voltam para a formação ' + FMT_FALLBACK + '.';
  }
  msg += '\n\nEssa ação não pode ser desfeita.';
  if (!confirm(msg)) return;

  ST.customFmts = ST.customFmts.filter(function (x) { return x.id !== id; });
  ['A', 'B', 'C'].forEach(function (t) {
    var key = t + '|' + id;
    delete ST.slotsByFmt[key];
    delete ST.customPos[key];
    if (ST.customFn) delete ST.customFn[key];
    if (ST.fmt[t] === id) {
      ST.fmt[t] = FMT_FALLBACK;
      var fk = t + '|' + FMT_FALLBACK;
      ST.slots[t] = ST.slotsByFmt[fk] ? ST.slotsByFmt[fk].slice() : Array(11).fill(null);
    }
  });
  fecharPopFuncao();
  save(); renderFmtsList(); renderFmTabs(); renderFmtsDropdownBtn(); renderField(); renderBar(); renderTable();
}

// ── JANELA "FORMAÇÕES" (lista + renomear + excluir) ──────────────────────────
function abrirModalFmts() {
  fecharPopFuncao();
  closeAllDD();
  renderFmtsList();
  document.getElementById('modal-fmts').style.display = 'flex';
}
function fecharModalFmts() {
  document.getElementById('modal-fmts').style.display = 'none';
}
function renderFmtsList() {
  var el = document.getElementById('fmts-list');
  if (!el) return;
  el.innerHTML = '';
  var lista = ST.customFmts || [];
  if (!lista.length) {
    var vazio = document.createElement('div');
    vazio.className = 'fmts-empty';
    vazio.textContent = 'Você ainda não salvou nenhuma formação. Mova os jogadores no campo, troque as funções dos slots e use o botão Salvar, ao lado do Reset.';
    el.appendChild(vazio);
    return;
  }
  lista.forEach(function (f) {
    var abas = ['A', 'B', 'C'].filter(function (t) { return ST.fmt[t] === f.id; });
    var row = document.createElement('div');
    row.className = 'fmts-item' + (abas.length ? ' em-uso' : '');

    var info = document.createElement('div'); info.className = 'fmts-info';
    var nome = document.createElement('span'); nome.className = 'fmts-nome'; nome.textContent = f.name;
    info.appendChild(nome);
    if (abas.length) {
      var uso = document.createElement('span'); uso.className = 'fmts-uso';
      uso.textContent = 'Em uso · ' + abas.map(function (t) { return TAB_NOMES[t]; }).join(', ');
      info.appendChild(uso);
    }

    var acts = document.createElement('div'); acts.className = 'fmts-acts';
    var bRen = document.createElement('button'); bRen.className = 'fmts-btn'; bRen.textContent = 'Renomear';
    bRen.onclick = function () { renomearFormacao(f.id); };
    var bDel = document.createElement('button'); bDel.className = 'fmts-btn fmts-btn-del'; bDel.textContent = 'Excluir';
    bDel.onclick = function () { excluirFormacao(f.id); };
    acts.appendChild(bRen); acts.appendChild(bDel);

    row.appendChild(info); row.appendChild(acts);
    el.appendChild(row);
  });
}

// ── DROPDOWN "MINHAS FORMAÇÕES" (troca rápida, ao lado do botão Formações) ──
// Reaproveita o mesmo componente já usado nos filtros de Pos/Status do elenco
// (positionMFDropdown/closeAllDD, definidos em ui.js): um <div class="mf-dropdown">
// portado para #mf-portal ao abrir, fechado num clique fora ou no scroll.
// Diferença para aquele uso: aqui é seleção única (troca ao clicar), não
// multi-seleção — por isso não há linha "Todos" nem checkbox, só destaque na
// formação ativa.
function trocarViaDropdownFmts(id) {
  var tab = ST.ft;
  fecharPopFuncao();
  closeAllDD();
  syncSlotsToFmt();
  ST.fmt[tab] = id;
  var key = tab + '|' + id;
  ST.slots[tab] = ST.slotsByFmt[key] ? ST.slotsByFmt[key].slice() : Array(11).fill(null);
  save(); renderFmTabs(); renderFmtsDropdownBtn(); renderField(); renderBar(); renderTable();
}
function renderFmtsDropdown() {
  var dd = document.getElementById('mf-fmts-dd');
  if (!dd) return;
  dd.innerHTML = '';
  var tab = ST.ft, lista = ST.customFmts || [];
  lista.forEach(function (f) {
    var ativa = f.id === ST.fmt[tab];
    var opt = document.createElement('div');
    opt.className = 'mf-opt fmt-opt' + (ativa ? ' fmt-ativa' : '');
    var lbl = document.createElement('span'); lbl.textContent = f.name; lbl.title = f.name;
    opt.appendChild(lbl);
    opt.onclick = function (e) { e.stopPropagation(); trocarViaDropdownFmts(f.id); };
    dd.appendChild(opt);
  });
}
// Habilita/desabilita a setinha (sem nenhuma formação salva não há o que
// trocar) e liga o clique que abre o dropdown — chamada sempre que a lista de
// formações muda (salvar, renomear, excluir, ou ao carregar um link recebido).
function renderFmtsDropdownBtn() {
  var btn = document.getElementById('mf-fmts-btn');
  var wrap = document.getElementById('mf-fmts-wrap');
  if (!btn || !wrap) return;
  var vazio = !(ST.customFmts && ST.customFmts.length);
  btn.disabled = vazio;
  if (vazio) {
    closeAllDD();
    var dd0 = document.getElementById('mf-fmts-dd');
    if (dd0) dd0.innerHTML = ''; // não deixar opção fantasma de uma lista anterior
    return;
  }
  renderFmtsDropdown();
  btn.onclick = function (e) {
    e.stopPropagation();
    var dd = document.getElementById('mf-fmts-dd');
    var open = dd.classList.contains('open');
    closeAllDD();
    if (!open) {
      renderFmtsDropdown(); // sempre atual: nome/estado podem ter mudado
      positionMFDropdown(dd, btn);
      dd.classList.add('open');
      btn.classList.add('open');
    }
  };
}

function renderBar() {
  const el = document.getElementById('sbar'); el.innerHTML = '';
}

// TABLE
const POS_ORDER = { GOL: 0, LD: 1, LE: 2, ZAG: 3, VOL: 4, MEI: 5, PD: 6, PE: 7, CA: 8 };
