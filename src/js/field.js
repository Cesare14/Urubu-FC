// ── TOUCH DETECTION ─────────────────────────────────────────────────────────
var IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

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
  var s = FMTS[ST.fmt[tab]][i]; return [s[0], s[1]];
}
function setCustomPos(tab, i, xy) {
  var key = tab + '|' + ST.fmt[tab];
  if (!ST.customPos[key]) ST.customPos[key] = {};
  ST.customPos[key][i] = xy;
}
function resetCustomPos(tab) {
  var key = tab + '|' + ST.fmt[tab];
  delete ST.customPos[key];
}

// ── TOUCH DRAG ──────────────────────────────────────────────────────────────
// Cria clone visual que segue o dedo durante o drag
function addTouchDrag(sc, tab) {
  var clone = null;
  var startX = 0, startY = 0;
  var moved = false;
  var MOVE_THRESHOLD = 8; // px para distinguir tap de drag

  sc.addEventListener('touchstart', function (e) {
    moved = false;
    var t = e.touches[0];
    startX = t.clientX; startY = t.clientY;

    // Criar clone após pequeno delay (evita conflito com tap)
    clone = null;
  }, { passive: true });

  sc.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    var dx = t.clientX - startX, dy = t.clientY - startY;

    if (!moved && Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
      moved = true;
      // Iniciar drag: criar clone
      clone = sc.cloneNode(true);
      clone.classList.add('touch-drag-clone');
      clone.style.width = sc.offsetWidth + 'px';
      clone.style.height = sc.offsetHeight + 'px';
      document.body.appendChild(clone);

      // Registrar origem
      dragId = sc.dataset.ek !== undefined ? (isNaN(sc.dataset.ek) ? sc.dataset.ek : +sc.dataset.ek) : null;
      dragSi = +sc.dataset.si;
      var fRect = document.getElementById('field').getBoundingClientRect();
      var scRect = sc.getBoundingClientRect();
      dragOffX = ((startX - scRect.left) / fRect.width) * 100;
      dragOffY = ((startY - scRect.top) / fRect.height) * 100;
    }

    if (moved && clone) {
      e.preventDefault();
      clone.style.left = (t.clientX - sc.offsetWidth / 2) + 'px';
      clone.style.top = (t.clientY - sc.offsetHeight / 2) + 'px';
    }
  }, { passive: false });

  sc.addEventListener('touchend', function (e) {
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

// ── BUILD SCARD ──────────────────────────────────────────────────────────────
function buildScard(i, tab) {
  var s = FMTS[ST.fmt[tab]][i];
  var ent = slotEnt(tab, i); var isTgt = ent && ent.type === 't';
  var sc = document.createElement('div');
  sc.className = 'scard' + (ent ? (isTgt ? ' ftgt' : ' filled') : '');
  sc.dataset.si = i;

  var pos = slotPos(tab, i);
  sc.style.left = 'calc(' + pos[0] + '% - ' + (SCARD_W / 2) + 'px)';
  sc.style.top = 'calc(' + pos[1] + '% - ' + (SCARD_H / 2) + 'px)';

  if (ent && ent.data) {
    var d = ent.data, col = isTgt ? 'var(--cv)' : (SCOL[d.status] || 'var(--c5)');
    sc.setAttribute('draggable', 'true');
    sc.dataset.ek = isTgt ? 't:' + d.id : d.id;

    var sn = document.createElement('div'); sn.className = 'sname'; sn.textContent = d.name; sc.appendChild(sn);
    if (d.nivel) { var sdw = nivelDonutEl(d.nivel, 24); if (sdw) { sdw.style.margin = '1px auto'; sc.appendChild(sdw); } }
    var dot = document.createElement('div'); dot.className = 'sdot'; dot.style.cssText = 'background:' + col + ';margin:2px auto'; sc.appendChild(dot);
    var ssub = document.createElement('div'); ssub.className = 'ssub'; ssub.textContent = d.pos || ''; sc.appendChild(ssub);
    var clr = document.createElement('button'); clr.className = 'sclr'; clr.innerHTML = '×';
    clr.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
    clr.onclick = function (e) { e.stopPropagation(); clearTouchSel(); ST.slots[tab][i] = null; save(); patchSlot(i, tab); };
    sc.appendChild(clr);

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
    sc.innerHTML = '<span class="sempty">' + s[2] + '</span>';
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
      onScardTap(sc, tab);
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

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'fsvg');
  svg.setAttribute('viewBox', '0 0 140 153');
  var sl1 = tab === 'C' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.16)';
  var sl2 = tab === 'C' ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.12)';
  var sl3 = tab === 'C' ? 'rgba(0,0,0,.60)' : 'rgba(255,255,255,.22)';
  var sl4 = tab === 'C' ? 'rgba(0,0,0,.50)' : 'rgba(255,255,255,.18)';
  svg.innerHTML =
    '<rect x="2" y="2" width="136" height="149" fill="none" stroke="' + sl1 + '" stroke-width=".6"/>' +
    '<line x1="2" y1="76.5" x2="138" y2="76.5" stroke="' + sl2 + '" stroke-width=".5"/>' +
    '<circle cx="70" cy="76.5" r="15" fill="none" stroke="' + sl2 + '" stroke-width=".5"/>' +
    '<circle cx="70" cy="76.5" r=".9" fill="' + sl3 + '"/>' +
    '<rect x="42" y="2" width="56" height="16" fill="none" stroke="' + sl2 + '" stroke-width=".5"/>' +
    '<rect x="42" y="135" width="56" height="16" fill="none" stroke="' + sl2 + '" stroke-width=".5"/>' +
    '<circle cx="70" cy="13" r="1.1" fill="' + sl4 + '"/>' +
    '<circle cx="70" cy="140" r="1.1" fill="' + sl4 + '"/>' +
    '<image href="' + logoB64 + '" x="3" y="3" width="30" height="24" opacity="0.22"/>';
  field.appendChild(svg);

  var bdg = document.createElement('span'); bdg.className = 'fbadge'; bdg.textContent = ST.fmt[tab];
  field.appendChild(bdg);

  FMTS[ST.fmt[tab]].forEach(function (s, i) {
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
  Object.keys(FMTS).forEach(function (f) {
    const b = document.createElement('button');
    b.className = 'fmtab' + (f === ST.fmt[tab] ? ' active' : '');
    b.textContent = f;
    b.onclick = function () {
      syncSlotsToFmt();
      ST.fmt[tab] = f;
      var key = tab + '|' + f;
      ST.slots[tab] = ST.slotsByFmt[key] ? ST.slotsByFmt[key].slice() : Array(11).fill(null);
      save(); renderFmTabs(); renderField(); renderBar(); renderTable();
    };
    el.appendChild(b);
  });
  const rb = document.createElement('button');
  rb.className = 'btn btn-red fmtab-reset';
  rb.textContent = '↺ Reset';
  rb.title = 'Limpar escalação e posições desta formação';
  rb.onclick = function () {
    resetCustomPos(tab);
    ST.slots[tab] = Array(11).fill(null);
    var key = tab + '|' + ST.fmt[tab]; ST.slotsByFmt[key] = Array(11).fill(null);
    clearTouchSel();
    save(); renderField(); renderBar(); renderTable();
  };
  el.appendChild(rb);
}

function renderBar() {
  const el = document.getElementById('sbar'); el.innerHTML = '';
}

// TABLE
const POS_ORDER = { GOL: 0, LD: 1, LE: 2, ZAG: 3, VOL: 4, MEI: 5, PD: 6, PE: 7, CA: 8 };
