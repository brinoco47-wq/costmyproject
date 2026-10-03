/* CostMyProject — Paint Cost Calculator engine. Vanilla JS, no dependencies.
   All math is shown to the user in the "How we got this number" panel.
   Price defaults are dated Sept 2026; see the data table on the page for sources. */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  var money = function (n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var num1 = function (n) {
    return (Math.round(n * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  /* Verified Sept 2026 price/coverage defaults. Sources listed on-page. */
  var BRANDS = {
    behr:   { name: 'Behr Premium Plus',              price: 43.98, coverage: 400, where: 'Home Depot' },
    sw:     { name: 'Sherwin-Williams SuperPaint',    price: 70.00, coverage: 375, where: 'Sherwin-Williams stores' },
    bm:     { name: 'Benjamin Moore Regal Select',    price: 74.00, coverage: 425, where: 'Ace Hardware / BM retailers' },
    custom: { name: 'Custom paint',                    price: 45.00, coverage: 375, where: 'your store' }
  };
  var PRIMER = { name: 'Zinsser Bulls Eye 1-2-3', price: 30.00, coverage: 400 };
  var TYPE_FACTOR = { interior: 1.0, ceiling: 0.9, exterior: 0.8 }; /* rough exterior surfaces drink more paint */
  var TYPE_LABEL = { interior: 'Interior walls', ceiling: 'Ceiling', exterior: 'Exterior siding' };
  var DOOR_SQFT = 21, WINDOW_SQFT = 15; /* standard 3x7 door, 3x5 window */

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

  function readState() {
    var mode = $('calc-mode').value;
    var L = parseFloat($('in-length').value) || 0;
    var W = parseFloat($('in-width').value) || 0;
    var H = parseFloat($('in-height').value) || 8;
    var doors = parseFloat($('in-doors').value) || 0;
    var windows = parseFloat($('in-windows').value) || 0;
    var areaDirect = parseFloat($('in-area').value) || 0;
    var type = $('calc-type').value;
    var condition = $('calc-condition').value;
    var coats = parseInt($('calc-coats').value, 10) || 2;
    var brandKey = $('calc-brand').value;
    var paintPrice = parseFloat($('in-paint-price').value);
    var paintCoverage = parseFloat($('in-paint-coverage').value);
    var primerMode = $('calc-primer').value; /* auto | yes | no */
    var primerPrice = parseFloat($('in-primer-price').value);
    var laborMode = $('calc-labor').value; /* diy | pro */
    var laborRate = parseFloat($('in-labor-rate').value);
    var supplies = parseFloat($('in-supplies').value) || 0;
    var wastePct = parseFloat($('in-waste').value);
    if (isNaN(wastePct)) wastePct = 10;

    var brand = BRANDS[brandKey] || BRANDS.behr;
    if (isNaN(paintPrice) || paintPrice <= 0) paintPrice = brand.price;
    if (isNaN(paintCoverage) || paintCoverage <= 0) paintCoverage = brand.coverage;
    if (isNaN(primerPrice) || primerPrice <= 0) primerPrice = PRIMER.price;
    if (isNaN(laborRate) || laborRate <= 0) laborRate = 2.50;

    return {
      mode: mode, L: L, W: W, H: H, doors: doors, windows: windows, areaDirect: areaDirect,
      type: type, condition: condition, coats: coats, brandKey: brandKey, brand: brand,
      paintPrice: paintPrice, paintCoverage: paintCoverage,
      primerMode: primerMode, primerPrice: primerPrice,
      laborMode: laborMode, laborRate: laborRate, supplies: supplies, wastePct: wastePct
    };
  }

  function compute(s) {
    var area;
    if (s.mode === 'area') {
      area = s.areaDirect;
    } else if (s.type === 'ceiling') {
      area = s.L * s.W;
    } else {
      area = 2 * (s.L + s.W) * s.H - s.doors * DOOR_SQFT - s.windows * WINDOW_SQFT;
    }
    area = Math.max(area, 0);

    var effCoverage = s.paintCoverage * (TYPE_FACTOR[s.type] || 1);
    var paintGalRaw = area * s.coats / effCoverage;
    var paintGalWaste = paintGalRaw * (1 + s.wastePct / 100);
    var paintGalBuy = Math.ceil(paintGalWaste - 1e-9);

    var primerNeeded = s.primerMode === 'yes' ||
      (s.primerMode === 'auto' && (s.condition === 'new' || s.condition === 'dramatic'));
    var primerGalRaw = primerNeeded ? area / PRIMER.coverage : 0;
    var primerGalWaste = primerGalRaw * (1 + s.wastePct / 100);
    var primerGalBuy = Math.ceil(primerGalWaste - 1e-9);

    var paintCost = paintGalBuy * s.paintPrice;
    var primerCost = primerGalBuy * s.primerPrice;
    var laborCost = s.laborMode === 'pro' ? area * s.laborRate : 0;
    var total = paintCost + primerCost + laborCost + s.supplies;
    var perSqft = area > 0 ? total / area : 0;

    /* materials vs labor split (BarrierBoss pattern: never a black-box total) */
    var materials = paintCost + primerCost + s.supplies;
    var labor = laborCost;

    /* planning range: ±25% band covers regional pricing + surface-condition variance.
       Documented on /methodology/ — a single false-precise number is never shown alone. */
    var rangeLow = total * 0.75;
    var rangeHigh = total * 1.25;

    /* what-if: cheapest alternative brand for the same job */
    var altKey = s.brandKey === 'behr' ? 'sw' : 'behr';
    var alt = BRANDS[altKey];
    var altEff = alt.coverage * (TYPE_FACTOR[s.type] || 1);
    var altBuy = Math.ceil(area * s.coats / altEff * (1 + s.wastePct / 100) - 1e-9);
    var altPaintCost = altBuy * alt.price;

    return {
      area: area, effCoverage: effCoverage,
      paintGalRaw: paintGalRaw, paintGalBuy: paintGalBuy,
      primerNeeded: primerNeeded, primerGalBuy: primerGalBuy,
      paintCost: paintCost, primerCost: primerCost, laborCost: laborCost,
      materials: materials, labor: labor,
      rangeLow: rangeLow, rangeHigh: rangeHigh,
      total: total, perSqft: perSqft,
      altKey: altKey, altBuy: altBuy, altPaintCost: altPaintCost
    };
  }

  function render(s, r) {
    var out = $('calc-result');
    if (!out) return;

    var rows = '';
    rows += row('Paint — ' + r.paintGalBuy + ' gal ' + esc(s.brand.name) + ' @ ' + money(s.paintPrice) + '/gal', money(r.paintCost));
    if (r.primerNeeded) {
      rows += row('Primer — ' + r.primerGalBuy + ' gal @ ' + money(s.primerPrice) + '/gal', money(r.primerCost));
    }
    if (s.laborMode === 'pro') {
      rows += row('Labor — ' + num1(r.area) + ' sq ft @ ' + money(s.laborRate) + '/sq ft', money(r.laborCost));
    } else {
      rows += row('Labor', 'DIY — $0.00');
    }
    rows += row('Supplies — tape, rollers, drop cloths, brushes', money(s.supplies));

    var alt = BRANDS[r.altKey];
    var delta = r.altPaintCost - r.paintCost;
    var altLine = delta > 0.005
      ? 'Switching to ' + esc(alt.name) + ' (' + money(alt.price) + '/gal) would add ' + money(delta) + ' in paint cost for this job.'
      : 'Switching to ' + esc(alt.name) + ' (' + money(alt.price) + '/gal) would save ' + money(-delta) + ' in paint cost for this job.';

    var laborLine = s.laborMode === 'diy'
      ? 'Hiring a pro at ' + money(s.laborRate) + '/sq ft would add ' + money(r.area * s.laborRate) + ' in labor.'
      : 'Doing it yourself would save ' + money(r.laborCost) + ' in labor.';

    var matPct = r.total > 0 ? Math.round(r.materials / r.total * 100) : 100;
    var labPct = 100 - matPct;
    var splitBar = s.laborMode === 'pro' && r.labor > 0
      ? '<div class="splitbar" role="img" aria-label="Materials ' + matPct + ' percent, labor ' + labPct + ' percent">' +
        '<div class="split-mat" style="width:' + matPct + '%">Materials ' + matPct + '%</div>' +
        '<div class="split-lab" style="width:' + labPct + '%">Labor ' + labPct + '%</div></div>' +
        '<p class="split-legend">Materials <strong>' + money(r.materials) + '</strong> (paint, primer, supplies) · ' +
        'Labor <strong>' + money(r.labor) + '</strong> (pro, ' + money(s.laborRate) + '/sq ft)</p>'
      : '<div class="splitbar" role="img" aria-label="Materials 100 percent, DIY labor">' +
        '<div class="split-mat" style="width:100%">Materials 100% — ' + money(r.materials) + '</div></div>' +
        '<p class="split-legend">DIY: you supply the labor, so the whole budget is materials.</p>';

    out.innerHTML =
      '<h2>Your estimate</h2>' +
      '<p class="total">' + money(r.total) + '</p>' +
      '<p class="range">Typical range: <strong>' + money(r.rangeLow) + ' – ' + money(r.rangeHigh) + '</strong> ' +
      '<span class="small">(±25% planning band — covers regional pricing and surface-condition variance)</span></p>' +
      '<p class="small">' + num1(r.area) + ' sq ft of ' + TYPE_LABEL[s.type].toLowerCase() +
      ' &middot; about ' + money(r.perSqft) + ' per sq ft &middot; ' +
      num1(r.paintGalRaw) + ' gal of paint needed &rarr; <strong>buy ' + r.paintGalBuy + ' gallon' + (r.paintGalBuy === 1 ? '' : 's') + '</strong>' +
      (r.primerNeeded ? ' + ' + r.primerGalBuy + ' gal primer' : '') + '</p>' +
      splitBar +
      '<table><tbody>' + rows +
      '<tr><td><strong>Total project cost</strong></td><td><strong>' + money(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<div class="assume"><strong>Quick comparisons:</strong><br>' + altLine + '<br>' + laborLine + '</div>' +
      '<details class="mt1"><summary><strong>How we got this number (show the math)</strong></summary>' +
      '<div class="math"><code>' + mathBlock(s, r) + '</code></div>' +
      '<p class="src">Prices checked September 2026. Paint prices: Home Depot / Sherwin-Williams / Ace Hardware listings. ' +
      'Coverage rates: manufacturer-published specs. Labor range $1–$6/sq ft: HomeGuide &amp; HomeAdvisor 2026 guides. ' +
      'Full methodology: <a href="../../methodology/">/methodology/</a></p></details>' +
      '<p class="note"><strong>Budgeting estimate, not a contractor quote.</strong> Real bids typically land inside the ±25% ' +
      'range above — region, surface condition, and prep move the number. Use this to budget and to sanity-check ' +
      'quotes, not to replace them. No email required — this calculator never asks for your contact info.</p>';

    out.setAttribute('aria-live', 'polite');
  }

  function row(label, val) { return '<tr><td>' + label + '</td><td>' + val + '</td></tr>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mathBlock(s, r) {
    var lines = [];
    if (s.mode === 'area') {
      lines.push('paintable area = ' + num1(s.areaDirect) + ' sq ft (entered directly)');
    } else if (s.type === 'ceiling') {
      lines.push('ceiling area = length × width = ' + s.L + ' × ' + s.W + ' = ' + num1(r.area) + ' sq ft');
    } else {
      lines.push('wall area = 2 × (L + W) × H − doors×21 − windows×15');
      lines.push('          = 2 × (' + s.L + ' + ' + s.W + ') × ' + s.H + ' − ' + s.doors + '×21 − ' + s.windows + '×15');
      lines.push('          = ' + num1(r.area) + ' sq ft');
    }
    lines.push('effective coverage = ' + s.paintCoverage + ' × ' + (TYPE_FACTOR[s.type] || 1) + ' (' + s.type + ' factor) = ' + Math.round(r.effCoverage) + ' sq ft/gal');
    lines.push('paint needed = ' + num1(r.area) + ' × ' + s.coats + ' coats ÷ ' + Math.round(r.effCoverage) + ' = ' + num1(r.paintGalRaw) + ' gal');
    lines.push('with ' + s.wastePct + '% waste = ' + num1(r.paintGalRaw * (1 + s.wastePct / 100)) + ' gal → buy ' + r.paintGalBuy + ' gal (rounded up)');
    if (r.primerNeeded) {
      lines.push('primer = ' + num1(r.area) + ' ÷ 400 × ' + (1 + s.wastePct / 100) + ' → buy ' + r.primerGalBuy + ' gal');
    }
    lines.push('paint cost = ' + r.paintGalBuy + ' × ' + money(s.paintPrice) + ' = ' + money(r.paintCost));
    if (r.primerNeeded) lines.push('primer cost = ' + r.primerGalBuy + ' × ' + money(s.primerPrice) + ' = ' + money(r.primerCost));
    if (s.laborMode === 'pro') lines.push('labor = ' + num1(r.area) + ' × ' + money(s.laborRate) + ' = ' + money(r.laborCost));
    lines.push('materials subtotal = paint + primer + supplies = ' + money(r.materials));
    lines.push('labor subtotal = ' + money(r.labor));
    lines.push('planning range = total × 0.75 … total × 1.25 = ' + money(r.rangeLow) + ' … ' + money(r.rangeHigh));
    lines.push('  (±25% covers regional pricing + surface-condition variance — see /methodology/)');
    lines.push('TOTAL = ' + money(r.paintCost) + ' + ' + money(r.primerCost) + ' + ' + money(r.laborCost) + ' + ' + money(s.supplies) + ' = ' + money(r.total));
    return lines.join('\n');
  }

  /* presets */
  function setPreset(p) {
    $('calc-mode').value = 'dims';
    syncModeUI();
    if (p === 'bedroom') {
      $('in-length').value = 10; $('in-width').value = 10; $('in-height').value = 8;
      $('in-doors').value = 1; $('in-windows').value = 1;
    } else if (p === 'living') {
      $('in-length').value = 12; $('in-width').value = 15; $('in-height').value = 8;
      $('in-doors').value = 2; $('in-windows').value = 2;
    } else if (p === 'exterior') {
      $('calc-mode').value = 'area'; syncModeUI();
      $('in-area').value = 2500;
      setSeg('seg-type', 'calc-type', 'exterior');
    }
    recalc();
  }

  function setSeg(segId, hiddenId, val) {
    var btns = $(segId).querySelectorAll('button[data-val]');
    btns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-val') === val ? 'true' : 'false');
    });
    $(hiddenId).value = val;
  }

  function syncModeUI() {
    var mode = $('calc-mode').value;
    $('dims-fields').style.display = mode === 'dims' ? '' : 'none';
    $('area-field').style.display = mode === 'area' ? '' : 'none';
  }

  function syncBrandUI() {
    var b = BRANDS[$('calc-brand').value] || BRANDS.behr;
    $('in-paint-price').value = b.price.toFixed(2);
    $('in-paint-coverage').value = b.coverage;
    $('brand-where').textContent = 'Default price & coverage from ' + b.where + ' (Sept 2026). Adjust freely — your numbers override ours.';
  }

  function syncConditionUI() {
    var c = $('calc-condition').value;
    if (c === 'new' || c === 'dramatic') {
      if ($('calc-primer').value === 'auto') { /* keep auto, it will resolve to yes */ }
    }
    var coatMap = { repaint: '2', new: '2', dramatic: '2' };
    /* don't force coats — just hint */
    $('condition-hint').textContent = c === 'repaint'
      ? 'Repainting a similar color: usually 2 coats for a rich finish; 1 coat can work with premium paint.'
      : c === 'new'
      ? 'New drywall or bare surface: 1 coat of primer + 2 coats of paint. Primer is auto-selected below.'
      : 'Dark-to-light or bold color change: primer first, then 2 coats. Primer is auto-selected below.';
  }

  function recalc() {
    var s = readState();
    render(s, compute(s));
  }

  function init() {
    if (!$('calc-form')) return;
    segWire('seg-mode', 'calc-mode', function () { syncModeUI(); recalc(); });
    segWire('seg-type', 'calc-type', function () { recalc(); });
    segWire('seg-condition', 'calc-condition', function () { syncConditionUI(); recalc(); });
    segWire('seg-primer', 'calc-primer', function () { recalc(); });
    segWire('seg-labor', 'calc-labor', function () { toggleLabor(); recalc(); });

    $('calc-brand').addEventListener('change', function () { syncBrandUI(); recalc(); });
    $('calc-coats').addEventListener('change', recalc);
    ['in-length', 'in-width', 'in-height', 'in-doors', 'in-windows', 'in-area',
     'in-paint-price', 'in-paint-coverage', 'in-primer-price',
     'in-labor-rate', 'in-supplies', 'in-waste'].forEach(function (id) {
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

    syncModeUI(); syncBrandUI(); syncConditionUI(); toggleLabor(); recalc();
  }

  function toggleLabor() {
    var pro = $('calc-labor').value === 'pro';
    $('labor-rate-field').style.display = pro ? '' : 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
