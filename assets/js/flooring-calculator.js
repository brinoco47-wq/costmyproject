/* CostMyProject — Flooring Cost Calculator engine. Vanilla JS, no dependencies.
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

  /* Verified Oct 2026 material/labor ranges (per sq ft). Sources listed on-page.
     tier: budget -> range low, standard -> midpoint, premium -> range high. */
  var MATERIALS = {
    lvp:       { name: 'Luxury vinyl plank (LVP)', lo: 2.50, hi: 6.00, labor: 2.75, underlay: 0.00,
                 underlayNote: 'most LVP has an attached pad — $0', life: 20, water: 'Yes — 100% waterproof', diy: 'Easy (click-lock)',
                 where: 'Home Depot / flooring retailers' },
    laminate:  { name: 'Laminate', lo: 1.50, hi: 4.00, labor: 2.50, underlay: 0.50,
                 underlayNote: 'foam underlayment + moisture barrier', life: 15, water: 'No — swells with standing water', diy: 'Easy (click-lock)',
                 where: 'Home Depot / flooring retailers' },
    engineered:{ name: 'Engineered hardwood', lo: 4.00, hi: 10.00, labor: 5.50, underlay: 0.50,
                 underlayNote: 'underlayment or glue assist', life: 30, water: 'Partial — handles humidity better than solid', diy: 'Moderate',
                 where: 'flooring retailers' },
    hardwood:  { name: 'Solid hardwood', lo: 6.00, hi: 12.00, labor: 6.00, underlay: 0.25,
                 underlayNote: 'felt / rosin paper', life: 75, water: 'No — site-finished or prefinished wood', diy: 'Hard — nail-down + finishing',
                 where: 'Home Depot / lumber dealers' },
    tile:      { name: 'Ceramic / porcelain tile', lo: 2.50, hi: 8.00, labor: 6.00, underlay: 1.00,
                 underlayNote: 'thinset mortar + grout', life: 50, water: 'Yes — with sealed grout', diy: 'Hard — mortar, cuts, grout',
                 where: 'tile retailers' },
    carpet:    { name: 'Carpet', lo: 1.50, hi: 5.00, labor: 1.00, underlay: 0.75,
                 underlayNote: 'carpet pad', life: 10, water: 'No', diy: 'Moderate — stretch-in needs a knee kicker',
                 where: 'carpet retailers' }
  };
  var TIER_LABEL = { budget: 'Budget', standard: 'Standard', premium: 'Premium' };
  var REMOVAL_RATE = 1.50; /* old-floor tear-out, $/sq ft — industry range $1–$3 */
  var PREP_RATE = 3.00;    /* subfloor leveling/patch, $/sq ft — industry range $2–$5 */

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
    if (tier === 'budget') return mat.lo;
    if (tier === 'premium') return mat.hi;
    return (mat.lo + mat.hi) / 2;
  }

  function readState() {
    var mode = $('calc-mode').value;
    var L = parseFloat($('in-length').value) || 0;
    var W = parseFloat($('in-width').value) || 0;
    var areaDirect = parseFloat($('in-area').value) || 0;
    var matKey = $('calc-material').value;
    var tier = $('calc-tier').value;
    var mat = MATERIALS[matKey] || MATERIALS.lvp;
    var matPrice = parseFloat($('in-material-price').value);
    var underlayRate = parseFloat($('in-underlay-rate').value);
    var laborMode = $('calc-labor').value; /* diy | pro */
    var laborRate = parseFloat($('in-labor-rate').value);
    var wastePct = parseFloat($('in-waste').value);
    var removal = $('calc-removal').value === 'yes';
    var prep = $('calc-prep').value === 'yes';
    var trim = parseFloat($('in-trim').value) || 0;

    if (isNaN(matPrice) || matPrice <= 0) matPrice = tierPrice(mat, tier);
    if (isNaN(underlayRate) || underlayRate < 0) underlayRate = mat.underlay;
    if (isNaN(laborRate) || laborRate <= 0) laborRate = mat.labor;
    if (isNaN(wastePct)) wastePct = 10;

    return {
      mode: mode, L: L, W: W, areaDirect: areaDirect,
      matKey: matKey, mat: mat, tier: tier,
      matPrice: matPrice, underlayRate: underlayRate,
      laborMode: laborMode, laborRate: laborRate,
      wastePct: wastePct, removal: removal, prep: prep, trim: trim
    };
  }

  function computeFor(s, matKey, matPrice, laborRate) {
    var mat = MATERIALS[matKey];
    var area = s.mode === 'area' ? s.areaDirect : s.L * s.W;
    area = Math.max(area, 0);
    var orderSqft = area * (1 + s.wastePct / 100);

    var materialCost = orderSqft * matPrice;
    var underlayCost = orderSqft * s.underlayRate;
    var laborCost = s.laborMode === 'pro' ? orderSqft * laborRate : 0;
    var removalCost = s.removal ? area * REMOVAL_RATE : 0;
    var prepCost = s.prep ? area * PREP_RATE : 0;
    var total = materialCost + underlayCost + laborCost + removalCost + prepCost + s.trim;
    var perSqft = area > 0 ? total / area : 0;

    /* materials vs labor split (BarrierBoss pattern: never a black-box total) */
    var materials = materialCost + underlayCost + s.trim;
    var labor = laborCost + removalCost + prepCost;

    /* planning range: ±25% band covers regional pricing + subfloor-condition variance.
       Documented on /methodology/ — a single false-precise number is never shown alone. */
    var rangeLow = total * 0.75;
    var rangeHigh = total * 1.25;

    return {
      area: area, orderSqft: orderSqft,
      materialCost: materialCost, underlayCost: underlayCost, laborCost: laborCost,
      removalCost: removalCost, prepCost: prepCost,
      materials: materials, labor: labor,
      rangeLow: rangeLow, rangeHigh: rangeHigh,
      total: total, perSqft: perSqft
    };
  }

  function compute(s) {
    return computeFor(s, s.matKey, s.matPrice, s.laborMode === 'pro' ? s.laborRate : 0);
  }

  function render(s, r) {
    var out = $('calc-result');
    if (!out) return;

    var rows = '';
    rows += row('Flooring — ' + num1(r.orderSqft) + ' sq ft ' + esc(s.mat.name) + ' (' + (TIER_LABEL[s.tier] || 'Standard').toLowerCase() + ') @ ' + money(s.matPrice) + '/sq ft', money(r.materialCost));
    rows += row('Underlayment / setting materials @ ' + money(s.underlayRate) + '/sq ft <span class="hint">' + esc(s.mat.underlayNote) + '</span>', money(r.underlayCost));
    if (s.laborMode === 'pro') {
      rows += row('Install labor — ' + num1(r.orderSqft) + ' sq ft @ ' + money(s.laborRate) + '/sq ft', money(r.laborCost));
    } else {
      rows += row('Install labor', 'DIY — $0.00');
    }
    if (s.removal) rows += row('Old floor removal @ ' + money(REMOVAL_RATE) + '/sq ft', money(r.removalCost));
    if (s.prep) rows += row('Subfloor prep / leveling @ ' + money(PREP_RATE) + '/sq ft', money(r.prepCost));
    if (s.trim > 0) rows += row('Trim, transitions & thresholds', money(s.trim));

    var matPct = r.total > 0 ? Math.round(r.materials / r.total * 100) : 100;
    var labPct = 100 - matPct;
    var splitBar = (s.laborMode === 'pro' || s.removal || s.prep) && r.labor > 0
      ? '<div class="splitbar" role="img" aria-label="Materials ' + matPct + ' percent, labor ' + labPct + ' percent">' +
        '<div class="split-mat" style="width:' + matPct + '%">Materials ' + matPct + '%</div>' +
        '<div class="split-lab" style="width:' + labPct + '%">Labor ' + labPct + '%</div></div>' +
        '<p class="split-legend">Materials <strong>' + money(r.materials) + '</strong> (flooring, underlayment, trim) · ' +
        'Labor &amp; services <strong>' + money(r.labor) + '</strong> (install' +
        (s.removal ? ' + removal' : '') + (s.prep ? ' + subfloor prep' : '') + ')</p>'
      : '<div class="splitbar" role="img" aria-label="Materials 100 percent, DIY labor">' +
        '<div class="split-mat" style="width:100%">Materials 100% — ' + money(r.materials) + '</div></div>' +
        '<p class="split-legend">DIY: you supply the labor, so the whole budget is materials.</p>';

    /* side-by-side: all 6 materials for THIS job (standard tier, same settings) */
    var compRows = '';
    Object.keys(MATERIALS).forEach(function (k) {
      var m = MATERIALS[k];
      var mp = (m.lo + m.hi) / 2;
      var lr = s.laborMode === 'pro' ? m.labor : 0;
      /* each material compared at its own standard-tier price + its own underlay default */
      var rrU = computeFor(Object.assign({}, s, { underlayRate: m.underlay }), k, mp, lr);
      var hl = k === s.matKey ? ' style="background:#fff8ec"' : '';
      compRows += '<tr' + hl + '><td>' + esc(m.name) + (k === s.matKey ? ' <strong>(yours)</strong>' : '') +
        '</td><td>' + money(mp) + '</td><td>' + money(rrU.total) + '</td><td>' + money(rrU.total / Math.max(rrU.area, 1)) + '/sq ft</td></tr>';
    });

    var laborLine = s.laborMode === 'diy'
      ? 'Hiring a pro at ' + money(s.laborRate) + '/sq ft would add about ' + money(r.orderSqft * s.laborRate) + ' in install labor for this ' + esc(s.mat.name.toLowerCase()) + '.'
      : 'Doing it yourself would save ' + money(r.laborCost) + ' in install labor — ' + esc(s.mat.diy.toLowerCase()) + ' for this material.';

    out.innerHTML =
      '<h2>Your estimate</h2>' +
      '<p class="total">' + money(r.total) + '</p>' +
      '<p class="range">Typical range: <strong>' + money(r.rangeLow) + ' – ' + money(r.rangeHigh) + '</strong> ' +
      '<span class="small">(±25% planning band — covers regional pricing and subfloor-condition variance)</span></p>' +
      '<p class="small">' + num1(r.area) + ' sq ft of floor &middot; order <strong>' + num1(r.orderSqft) + ' sq ft</strong> with ' + s.wastePct + '% waste &middot; ' +
      'about ' + money(r.perSqft) + ' per sq ft installed</p>' +
      splitBar +
      '<table><tbody>' + rows +
      '<tr><td><strong>Total project cost</strong></td><td><strong>' + money(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<h3>Same job, all six materials <span class="hint">(standard tier, your settings)</span></h3>' +
      '<table><thead><tr><th>Material</th><th>Material $/sq ft</th><th>Installed total</th><th>Per sq ft</th></tr></thead><tbody>' + compRows + '</tbody></table>' +
      '<div class="assume"><strong>Quick comparison:</strong><br>' + laborLine + '</div>' +
      '<details class="mt1"><summary><strong>How we got this number (show the math)</strong></summary>' +
      '<div class="math"><code>' + mathBlock(s, r) + '</code></div>' +
      '<p class="src">Prices checked October 2026. Material ranges: Home Depot / flooring-retailer listings and 2026 cost guides (see data table below). ' +
      'Labor ranges by material: 2026 installer guides. ' +
      'Full methodology: <a href="../../methodology/">/methodology/</a></p></details>' +
      '<p class="note"><strong>Budgeting estimate, not a contractor quote.</strong> Real bids typically land inside the ±25% ' +
      'range above — region, subfloor condition, and room complexity move the number. Use this to budget and to sanity-check ' +
      'quotes, not to replace them. No email required — this calculator never asks for your contact info.</p>';

    out.setAttribute('aria-live', 'polite');
  }

  function row(label, val) { return '<tr><td>' + label + '</td><td>' + val + '</td></tr>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mathBlock(s, r) {
    var lines = [];
    if (s.mode === 'area') {
      lines.push('floor area = ' + num1(s.areaDirect) + ' sq ft (entered directly)');
    } else {
      lines.push('floor area = length × width = ' + s.L + ' × ' + s.W + ' = ' + num1(r.area) + ' sq ft');
    }
    lines.push('order quantity = ' + num1(r.area) + ' × (1 + ' + s.wastePct + '% waste) = ' + num1(r.orderSqft) + ' sq ft');
    lines.push('flooring = ' + num1(r.orderSqft) + ' × ' + money(s.matPrice) + ' (' + s.mat.name + ', ' + s.tier + ') = ' + money(r.materialCost));
    lines.push('underlayment = ' + num1(r.orderSqft) + ' × ' + money(s.underlayRate) + ' = ' + money(r.underlayCost));
    if (s.laborMode === 'pro') lines.push('install labor = ' + num1(r.orderSqft) + ' × ' + money(s.laborRate) + ' = ' + money(r.laborCost));
    else lines.push('install labor = $0 (DIY)');
    if (s.removal) lines.push('old floor removal = ' + num1(r.area) + ' × ' + money(REMOVAL_RATE) + ' = ' + money(r.removalCost));
    if (s.prep) lines.push('subfloor prep = ' + num1(r.area) + ' × ' + money(PREP_RATE) + ' = ' + money(r.prepCost));
    if (s.trim > 0) lines.push('trim & transitions = ' + money(s.trim));
    lines.push('materials subtotal = flooring + underlayment + trim = ' + money(r.materials));
    lines.push('labor & services subtotal = install + removal + prep = ' + money(r.labor));
    lines.push('planning range = total × 0.75 … total × 1.25 = ' + money(r.rangeLow) + ' … ' + money(r.rangeHigh));
    lines.push('  (±25% covers regional pricing + subfloor-condition variance — see /methodology/)');
    lines.push('TOTAL = ' + money(r.total));
    return lines.join('\n');
  }

  /* presets */
  function setPreset(p) {
    $('calc-mode').value = 'dims';
    syncModeUI();
    if (p === 'bedroom') {
      $('in-length').value = 12; $('in-width').value = 12;
    } else if (p === 'living') {
      $('in-length').value = 20; $('in-width').value = 15;
    } else if (p === 'wholehome') {
      $('calc-mode').value = 'area'; syncModeUI();
      $('in-area').value = 1000;
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

  function syncMaterialUI() {
    var m = MATERIALS[$('calc-material').value] || MATERIALS.lvp;
    var t = $('calc-tier').value;
    $('in-material-price').value = tierPrice(m, t).toFixed(2);
    $('in-underlay-rate').value = m.underlay.toFixed(2);
    $('in-labor-rate').value = m.labor.toFixed(2);
    $('material-where').textContent = 'Defaults from ' + m.underlayNote + '; price range ' + money(m.lo) + '–' + money(m.hi) + '/sq ft (' + m.where + ', Oct 2026). Adjust freely — your numbers override ours.';
  }

  function recalc() {
    var s = readState();
    render(s, compute(s));
  }

  function init() {
    if (!$('calc-form')) return;
    segWire('seg-mode', 'calc-mode', function () { syncModeUI(); recalc(); });
    segWire('seg-tier', 'calc-tier', function () { syncMaterialUI(); recalc(); });
    segWire('seg-labor', 'calc-labor', function () { toggleLabor(); recalc(); });
    segWire('seg-removal', 'calc-removal', function () { recalc(); });
    segWire('seg-prep', 'calc-prep', function () { recalc(); });

    $('calc-material').addEventListener('change', function () { syncMaterialUI(); recalc(); });
    ['in-length', 'in-width', 'in-area',
     'in-material-price', 'in-underlay-rate',
     'in-labor-rate', 'in-waste', 'in-trim'].forEach(function (id) {
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
