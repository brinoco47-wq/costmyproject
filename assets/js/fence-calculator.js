/* CostMyProject — Fence Cost Calculator engine. Vanilla JS, no dependencies.
   All math is shown to the user in the "How we got this number" panel.
   Price defaults are dated October 2026; see the data table on the page for sources. */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var money = function (n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var money0 = function (n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  };
  var num1 = function (n) {
    return (Math.round(n * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  /* Oct 2026 installed-price ranges per linear foot (6-ft baseline). Sources on-page.
     Material = panels/pickets/fabric + posts + concrete + hardware (materials only).
     Labor = pro install per linear foot. tier: budget -> low, standard -> mid, premium -> high. */
  var MATERIALS = {
    chainlink: { name: 'Chain-link (galvanized)', matLo: 8, matHi: 15, labor: 7, laborLo: 5, laborHi: 10,
                 life: '20–25 yrs', maint: 'Minimal — occasional tensioning',
                 where: 'home-improvement stores / fence suppliers' },
    wood:      { name: 'Wood privacy (pine/cedar)', matLo: 10, matHi: 30, labor: 11, laborLo: 8, laborHi: 15,
                 life: '15–20 yrs', maint: 'Stain/seal every 2–3 yrs (~$300–$700 per 150 ft)',
                 where: 'lumber yards / fence suppliers' },
    vinyl:     { name: 'Vinyl / PVC privacy', matLo: 20, matHi: 35, labor: 15, laborLo: 10, laborHi: 20,
                 life: '25–30 yrs', maint: 'Rinse annually — no painting or staining',
                 where: 'fence suppliers / home-improvement stores' },
    aluminum:  { name: 'Aluminum ornamental', matLo: 25, matHi: 40, labor: 16, laborLo: 12, laborHi: 20,
                 life: '30+ yrs', maint: 'None — powder-coat finish',
                 where: 'fence suppliers' },
    composite: { name: 'Composite privacy', matLo: 30, matHi: 50, labor: 18, laborLo: 14, laborHi: 22,
                 life: '25–30 yrs', maint: 'Occasional wash — no staining',
                 where: 'specialty fence suppliers' }
  };
  var TIER_LABEL = { budget: 'Budget', standard: 'Standard', premium: 'Premium' };
  /* Height multiplier vs. 6-ft baseline — industry rule of thumb (howmuchfence.com 2026):
     4 ft ≈ 15% less, 8 ft ≈ 30% more. Labeled as estimate on-page. */
  var HEIGHT_MULT = { '4': 0.85, '6': 1.0, '8': 1.30 };
  /* Terrain multiplier applies to the LABOR portion only (digging/setting posts).
     Sloped +15%, rocky +35% — industry rule of thumb, labeled estimate on-page. */
  var TERRAIN = {
    level: { name: 'Level ground', mult: 1.00, note: 'no adder' },
    sloped: { name: 'Sloped yard', mult: 1.15, note: '+15% on install labor' },
    rocky: { name: 'Rocky / hard digging', mult: 1.35, note: '+35% on install labor' }
  };
  var REMOVAL_RATE = 5.00;  /* old-fence tear-out + haul-away, $/LF — industry range $3–$10 */
  var WALK_GATE = 250;      /* 3–4 ft walk gate, installed — typical range $150–$400 */
  var DRIVE_GATE = 800;     /* double/driveway gate, installed — typical range $400–$1,500 */

  /* segmented-control helper */
  function segWire(containerId, hiddenId, onChange) {
    var c = $(containerId);
    if (!c) return;
    var btns = c.querySelectorAll('button[data-val]');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        $(hiddenId).value = b.getAttribute('data-val');
        onChange();
      });
    });
  }

  function tierPrice(mat, tier) {
    if (tier === 'budget') return mat.matLo;
    if (tier === 'premium') return mat.matHi;
    return (mat.matLo + mat.matHi) / 2;
  }

  function readState() {
    var mode = $('calc-mode').value;
    var L = parseFloat($('in-length').value) || 0;
    var W = parseFloat($('in-width').value) || 0;
    var lfDirect = parseFloat($('in-lf').value) || 0;
    var matKey = $('calc-material').value;
    var tier = $('calc-tier').value;
    var mat = MATERIALS[matKey] || MATERIALS.wood;
    var matPrice = parseFloat($('in-material-price').value);
    var height = $('calc-height').value || '6';
    var laborMode = $('calc-labor').value; /* diy | pro */
    var laborRate = parseFloat($('in-labor-rate').value);
    var terrain = $('calc-terrain').value || 'level';
    var removal = $('calc-removal').value === 'yes';
    var removalRate = parseFloat($('in-removal-rate').value);
    var walkGates = Math.max(parseInt($('in-walk-gates').value, 10) || 0, 0);
    var driveGates = Math.max(parseInt($('in-drive-gates').value, 10) || 0, 0);
    var walkPrice = parseFloat($('in-walk-price').value);
    var drivePrice = parseFloat($('in-drive-price').value);
    var permit = parseFloat($('in-permit').value) || 0;

    if (isNaN(matPrice) || matPrice <= 0) matPrice = tierPrice(mat, tier);
    if (isNaN(laborRate) || laborRate <= 0) laborRate = mat.labor;
    if (isNaN(removalRate) || removalRate < 0) removalRate = REMOVAL_RATE;
    if (isNaN(walkPrice) || walkPrice < 0) walkPrice = WALK_GATE;
    if (isNaN(drivePrice) || drivePrice < 0) drivePrice = DRIVE_GATE;
    if (permit < 0) permit = 0;

    return {
      mode: mode, L: L, W: W, lfDirect: lfDirect,
      matKey: matKey, mat: mat, tier: tier,
      matPrice: matPrice, height: height,
      laborMode: laborMode, laborRate: laborRate,
      terrain: terrain,
      removal: removal, removalRate: removalRate,
      walkGates: walkGates, driveGates: driveGates,
      walkPrice: walkPrice, drivePrice: drivePrice,
      permit: permit
    };
  }

  function computeFor(s, matKey, matPrice, laborRate) {
    var mat = MATERIALS[matKey];
    var lf = s.mode === 'lf' ? s.lfDirect : 2 * (s.L + s.W);
    lf = Math.max(lf, 0);
    var hMult = HEIGHT_MULT[s.height] || 1.0;
    var tMult = (TERRAIN[s.terrain] || TERRAIN.level).mult;

    var materialCost = lf * hMult * matPrice;
    var laborCost = s.laborMode === 'pro' ? lf * hMult * laborRate * tMult : 0;
    var removalCost = s.removal ? lf * s.removalRate : 0;
    var gatesCost = s.walkGates * s.walkPrice + s.driveGates * s.drivePrice;
    var total = materialCost + laborCost + removalCost + gatesCost + s.permit;
    var perLF = lf > 0 ? total / lf : 0;

    /* materials vs labor split (never a black-box total) */
    var materials = materialCost + gatesCost + s.permit;
    var labor = laborCost + removalCost;

    /* planning range: ±25% band covers regional pricing + site-condition variance.
       Documented on /methodology/ — a single false-precise number is never shown alone. */
    var rangeLow = total * 0.75;
    var rangeHigh = total * 1.25;

    return {
      lf: lf, hMult: hMult, tMult: tMult,
      materialCost: materialCost, laborCost: laborCost,
      removalCost: removalCost, gatesCost: gatesCost,
      materials: materials, labor: labor,
      rangeLow: rangeLow, rangeHigh: rangeHigh,
      total: total, perLF: perLF
    };
  }

  function compute(s) {
    return computeFor(s, s.matKey, s.matPrice, s.laborMode === 'pro' ? s.laborRate : 0);
  }

  function render(s, r) {
    var out = $('calc-result');
    if (!out) return;
    var t = TERRAIN[s.terrain] || TERRAIN.level;

    var rows = '';
    rows += row('Fence — ' + num1(r.lf) + ' LF ' + esc(s.mat.name) + ', ' + s.height + ' ft (' + (TIER_LABEL[s.tier] || 'Standard').toLowerCase() + ') @ ' + money(s.matPrice) + '/LF materials', money(r.materialCost));
    if (s.laborMode === 'pro') {
      var laborNote = s.terrain === 'level' ? '' : ' <span class="hint">(' + esc(t.name.toLowerCase()) + ': ' + esc(t.note) + ')</span>';
      rows += row('Install labor — ' + num1(r.lf) + ' LF @ ' + money(s.laborRate) + '/LF' + laborNote, money(r.laborCost));
    } else {
      rows += row('Install labor', 'DIY — $0.00');
    }
    if (s.walkGates > 0) rows += row('Walk gates — ' + s.walkGates + ' × ' + money(s.walkPrice), money(s.walkGates * s.walkPrice));
    if (s.driveGates > 0) rows += row('Driveway gates — ' + s.driveGates + ' × ' + money(s.drivePrice), money(s.driveGates * s.drivePrice));
    if (s.removal) rows += row('Old fence removal &amp; haul-away @ ' + money(s.removalRate) + '/LF', money(r.removalCost));
    if (s.permit > 0) rows += row('Permit &amp; fees', money(s.permit));

    var matPct = r.total > 0 ? Math.round(r.materials / r.total * 100) : 100;
    var labPct = 100 - matPct;
    var splitBar = (s.laborMode === 'pro' || s.removal) && r.labor > 0
      ? '<div class="splitbar" role="img" aria-label="Materials ' + matPct + ' percent, labor ' + labPct + ' percent">' +
        '<div class="split-mat" style="width:' + matPct + '%">Materials ' + matPct + '%</div>' +
        '<div class="split-lab" style="width:' + labPct + '%">Labor ' + labPct + '%</div></div>' +
        '<p class="split-legend">Materials <strong>' + money(r.materials) + '</strong> (fence materials, gates, permit) · ' +
        'Labor &amp; services <strong>' + money(r.labor) + '</strong> (install' +
        (s.removal ? ' + removal' : '') + ')</p>'
      : '<div class="splitbar" role="img" aria-label="Materials 100 percent, DIY labor">' +
        '<div class="split-mat" style="width:100%">Materials 100% — ' + money(r.materials) + '</div></div>' +
        '<p class="split-legend">DIY: you supply the labor, so the budget is materials, gates, and permit.</p>';

    /* side-by-side: all 5 materials for THIS job (standard tier, same settings) */
    var compRows = '';
    Object.keys(MATERIALS).forEach(function (k) {
      var m = MATERIALS[k];
      var mp = (m.matLo + m.matHi) / 2;
      var lr = s.laborMode === 'pro' ? m.labor : 0;
      var rrU = computeFor(s, k, mp, lr);
      var hl = k === s.matKey ? ' style="background:#fff8ec"' : '';
      compRows += '<tr' + hl + '><td>' + esc(m.name) + (k === s.matKey ? ' <strong>(yours)</strong>' : '') +
        '</td><td>' + money(mp) + '</td><td>' + money(rrU.total) + '</td><td>' + money(rrU.total / Math.max(rrU.lf, 1)) + '/LF</td></tr>';
    });

    var laborLine = s.laborMode === 'diy'
      ? 'Hiring a pro at ' + money(s.laborRate) + '/LF would add about ' + money(r.lf * r.hMult * s.laborRate * r.tMult) + ' in install labor for this ' + esc(s.mat.name.toLowerCase()) + '.'
      : 'Doing it yourself would save ' + money(r.laborCost) + ' in install labor — most fence DIYers report 2–4 weekends for a 150-LF run with a helper and a rented auger.';

    var sizeLine = s.mode === 'lf'
      ? num1(r.lf) + ' linear feet (entered directly)'
      : 'perimeter = 2 × (' + s.L + ' + ' + s.W + ') = ' + num1(r.lf) + ' linear feet';

    out.innerHTML =
      '<h2>Your estimate</h2>' +
      '<p class="total">' + money(r.total) + '</p>' +
      '<p class="range">Typical range: <strong>' + money(r.rangeLow) + ' – ' + money(r.rangeHigh) + '</strong> ' +
      '<span class="small">(±25% planning band — covers regional pricing and site-condition variance)</span></p>' +
      '<p class="small">' + sizeLine + ' &middot; ' + s.height + ' ft ' + esc(s.mat.name.toLowerCase()) +
      ' &middot; about ' + money(r.perLF) + ' per linear foot all-in</p>' +
      splitBar +
      '<table><tbody>' + rows +
      '<tr><td><strong>Total project cost</strong></td><td><strong>' + money(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<h3>Same job, all five materials <span class="hint">(standard tier, your settings)</span></h3>' +
      '<table><thead><tr><th>Material</th><th>Material $/LF</th><th>Project total</th><th>Per LF</th></tr></thead><tbody>' + compRows + '</tbody></table>' +
      '<div class="assume"><strong>Quick comparison:</strong><br>' + laborLine + '</div>' +
      '<details class="mt1"><summary><strong>How we got this number (show the math)</strong></summary>' +
      '<div class="math"><code>' + mathBlock(s, r) + '</code></div>' +
      '<p class="src">Prices checked October 2026. Installed ranges: Bhumi Calculator, HowMuchFence, UseCalcPro 2026 cost guides (see data table below). ' +
      'Height multipliers (4 ft ≈ −15%, 8 ft ≈ +30% vs. 6 ft) and terrain adders (slope +15%, rocky +35% on labor) are industry rules of thumb — estimates, not measured data. ' +
      'Full methodology: <a href="../../methodology/">/methodology/</a></p></details>' +
      '<p class="note"><strong>Budgeting estimate, not a contractor quote.</strong> Real bids typically land inside the ±25% ' +
      'range above — region, soil, slope, and access move the number. Use this to budget and to sanity-check ' +
      'quotes, not to replace them. No email required — this calculator never asks for your contact info.</p>';

    out.setAttribute('aria-live', 'polite');
  }

  function row(label, val) { return '<tr><td>' + label + '</td><td>' + val + '</td></tr>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mathBlock(s, r) {
    var t = TERRAIN[s.terrain] || TERRAIN.level;
    var lines = [];
    if (s.mode === 'lf') {
      lines.push('linear feet = ' + num1(s.lfDirect) + ' (entered directly)');
    } else {
      lines.push('linear feet = 2 × (length + width) = 2 × (' + s.L + ' + ' + s.W + ') = ' + num1(r.lf));
    }
    lines.push('height factor = ' + s.height + ' ft → ×' + r.hMult.toFixed(2) + ' (6 ft is the baseline)');
    lines.push('fence materials = ' + num1(r.lf) + ' × ' + r.hMult.toFixed(2) + ' × ' + money(s.matPrice) + ' (' + s.mat.name + ', ' + s.tier + ') = ' + money(r.materialCost));
    if (s.laborMode === 'pro') {
      lines.push('install labor = ' + num1(r.lf) + ' × ' + r.hMult.toFixed(2) + ' × ' + money(s.laborRate) + ' × ' + r.tMult.toFixed(2) + ' (' + t.name.toLowerCase() + ') = ' + money(r.laborCost));
    } else {
      lines.push('install labor = $0 (DIY)');
    }
    if (s.walkGates > 0) lines.push('walk gates = ' + s.walkGates + ' × ' + money(s.walkPrice) + ' = ' + money(s.walkGates * s.walkPrice));
    if (s.driveGates > 0) lines.push('driveway gates = ' + s.driveGates + ' × ' + money(s.drivePrice) + ' = ' + money(s.driveGates * s.drivePrice));
    if (s.removal) lines.push('old fence removal = ' + num1(r.lf) + ' × ' + money(s.removalRate) + ' = ' + money(r.removalCost));
    if (s.permit > 0) lines.push('permit & fees = ' + money(s.permit));
    lines.push('materials subtotal = fence materials + gates + permit = ' + money(r.materials));
    lines.push('labor & services subtotal = install + removal = ' + money(r.labor));
    lines.push('planning range = total × 0.75 … total × 1.25 = ' + money(r.rangeLow) + ' … ' + money(r.rangeHigh));
    lines.push('  (±25% covers regional pricing + site-condition variance — see /methodology/)');
    lines.push('TOTAL = ' + money(r.total));
    return lines.join('\n');
  }

  /* presets */
  function setPreset(p) {
    $('calc-mode').value = 'dims';
    syncModeUI();
    if (p === 'backyard') {
      $('in-length').value = 40; $('in-width').value = 35; /* 150 LF */
    } else if (p === 'large') {
      $('in-length').value = 60; $('in-width').value = 40; /* 200 LF */
    } else if (p === 'side') {
      $('calc-mode').value = 'lf'; syncModeUI();
      $('in-lf').value = 100;
    }
    recalc();
  }

  function syncModeUI() {
    var mode = $('calc-mode').value;
    $('dims-fields').style.display = mode === 'dims' ? '' : 'none';
    $('lf-field').style.display = mode === 'lf' ? '' : 'none';
  }

  function syncMaterialUI() {
    var m = MATERIALS[$('calc-material').value] || MATERIALS.wood;
    var t = $('calc-tier').value;
    $('in-material-price').value = tierPrice(m, t).toFixed(2);
    $('in-labor-rate').value = m.labor.toFixed(2);
    $('material-where').textContent = 'Defaults from ' + m.where + '; material range ' + money(m.matLo) + '–' + money(m.matHi) + '/LF, labor ' + money(m.laborLo) + '–' + money(m.laborHi) + '/LF (Oct 2026). Adjust freely — your numbers override ours.';
  }

  function recalc() {
    var s = readState();
    render(s, compute(s));
  }

  function init() {
    if (!$('calc-form')) return;
    segWire('seg-mode', 'calc-mode', function () { syncModeUI(); recalc(); });
    segWire('seg-tier', 'calc-tier', function () { syncMaterialUI(); recalc(); });
    segWire('seg-height', 'calc-height', function () { recalc(); });
    segWire('seg-labor', 'calc-labor', function () { toggleLabor(); recalc(); });
    segWire('seg-terrain', 'calc-terrain', function () { recalc(); });
    segWire('seg-removal', 'calc-removal', function () { recalc(); });

    $('calc-material').addEventListener('change', function () { syncMaterialUI(); recalc(); });
    ['in-length', 'in-width', 'in-lf',
     'in-material-price', 'in-labor-rate',
     'in-removal-rate', 'in-walk-gates', 'in-drive-gates',
     'in-walk-price', 'in-drive-price', 'in-permit'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('input', recalc);
    });

    document.querySelectorAll('.preset[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.preset[data-preset]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        setPreset(b.getAttribute('data-preset'));
      });
    });

    syncModeUI(); syncMaterialUI(); toggleLabor(); recalc();
  }

  function toggleLabor() {
    var pro = $('calc-labor').value === 'pro';
    $('labor-rate-field').style.display = pro ? '' : 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
