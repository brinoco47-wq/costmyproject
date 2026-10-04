/* CostMyProject — Deck Cost Calculator engine. Vanilla JS, no dependencies.
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

  /* Oct 2026 deck-surface price ranges per square foot (ground-level baseline). Sources on-page.
     Material = decking boards + framing lumber + fasteners (materials only).
     Labor = pro install per square foot of deck surface. tier: budget -> low, standard -> mid, premium -> high. */
  var MATERIALS = {
    ptwood:   { name: 'Pressure-treated wood', matLo: 4, matHi: 10, labor: 11, laborLo: 8, laborHi: 14,
                life: '10–15 yrs', maint: 'Stain/seal every 2 yrs (~$1,000 per cycle on 400 sqft, hired)',
                where: 'lumber yards / home-improvement stores' },
    cedar:    { name: 'Cedar / redwood', matLo: 7, matHi: 14, labor: 13, laborLo: 10, laborHi: 16,
                life: '15–20 yrs', maint: 'Stain/seal every 3 yrs (~$1,200 per cycle on 400 sqft, hired)',
                where: 'lumber yards / deck suppliers' },
    composite:{ name: 'Composite (Trex/TimberTech)', matLo: 10, matHi: 18, labor: 17, laborLo: 14, laborHi: 22,
                life: '25–30 yrs', maint: 'Seasonal wash (~$100/yr in supplies)',
                where: 'deck suppliers / home-improvement stores' },
    pvc:      { name: 'PVC / cellular vinyl', matLo: 13, matHi: 24, labor: 20, laborLo: 16, laborHi: 26,
                life: '30–50 yrs', maint: 'Seasonal wash (~$100/yr in supplies)',
                where: 'deck suppliers' }
  };
  var TIER_LABEL = { budget: 'Budget', standard: 'Standard', premium: 'Premium' };
  /* Height multiplier on the deck-surface price (materials + labor per sqft).
     Ground <2 ft: simple footings, often no railing required. Raised 2–8 ft: posts,
     beams, railing + stairs required. Rooftop/second-story 8+ ft: engineering,
     deeper footings, complex framing. Industry rule of thumb — labeled estimate on-page. */
  var HEIGHT = {
    ground:  { name: 'Ground-level (< 2 ft)', mult: 1.00, note: 'base price — simple footings' },
    raised:  { name: 'Raised (2–8 ft)', mult: 1.30, note: '+30% — posts, beams, railing & stairs' },
    rooftop: { name: 'Rooftop / 2nd story (8+ ft)', mult: 1.55, note: '+55% — engineering, deep footings' }
  };
  var STEP_PRICE = 75;       /* per stair step, installed — typical range $50–$100 */
  var RAILING_PRICE = 45;    /* per linear foot, installed — typical range $25–$80 */
  var BENCH_PRICE = 800;     /* per built-in bench — typical range $500–$1,200 */
  var REMOVAL_RATE = 3.00;   /* old-deck tear-off + disposal, $/sqft — industry range $2–$5 */
  var PERMIT_DEFAULT = 250;  /* typical range $100–$800 by municipality */

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
    var sqftDirect = parseFloat($('in-sqft').value) || 0;
    var matKey = $('calc-material').value;
    var tier = $('calc-tier').value;
    var mat = MATERIALS[matKey] || MATERIALS.ptwood;
    var matPrice = parseFloat($('in-material-price').value);
    var height = $('calc-height').value || 'ground';
    var laborMode = $('calc-labor').value; /* diy | pro */
    var laborRate = parseFloat($('in-labor-rate').value);
    var steps = Math.max(parseInt($('in-steps').value, 10) || 0, 0);
    var stepPrice = parseFloat($('in-step-price').value);
    var railingLF = parseFloat($('in-railing-lf').value) || 0;
    var railingPrice = parseFloat($('in-railing-price').value);
    var benches = Math.max(parseInt($('in-benches').value, 10) || 0, 0);
    var benchPrice = parseFloat($('in-bench-price').value);
    var removal = $('calc-removal').value === 'yes';
    var removalRate = parseFloat($('in-removal-rate').value);
    var permit = parseFloat($('in-permit').value) || 0;

    if (isNaN(matPrice) || matPrice <= 0) matPrice = tierPrice(mat, tier);
    if (isNaN(laborRate) || laborRate <= 0) laborRate = mat.labor;
    if (isNaN(stepPrice) || stepPrice < 0) stepPrice = STEP_PRICE;
    if (isNaN(railingPrice) || railingPrice < 0) railingPrice = RAILING_PRICE;
    if (isNaN(benchPrice) || benchPrice < 0) benchPrice = BENCH_PRICE;
    if (isNaN(removalRate) || removalRate < 0) removalRate = REMOVAL_RATE;
    if (railingLF < 0) railingLF = 0;
    if (permit < 0) permit = 0;

    return {
      mode: mode, L: L, W: W, sqftDirect: sqftDirect,
      matKey: matKey, mat: mat, tier: tier,
      matPrice: matPrice, height: height,
      laborMode: laborMode, laborRate: laborRate,
      steps: steps, stepPrice: stepPrice,
      railingLF: railingLF, railingPrice: railingPrice,
      benches: benches, benchPrice: benchPrice,
      removal: removal, removalRate: removalRate,
      permit: permit
    };
  }

  function computeFor(s, matKey, matPrice, laborRate) {
    var mat = MATERIALS[matKey];
    var sqft = s.mode === 'sqft' ? s.sqftDirect : s.L * s.W;
    sqft = Math.max(sqft, 0);
    var h = HEIGHT[s.height] || HEIGHT.ground;
    var hMult = h.mult;

    var materialCost = sqft * hMult * matPrice;
    var laborCost = s.laborMode === 'pro' ? sqft * hMult * laborRate : 0;
    var stairsCost = s.steps * s.stepPrice;
    var railingCost = s.railingLF * s.railingPrice;
    var benchesCost = s.benches * s.benchPrice;
    var removalCost = s.removal ? sqft * s.removalRate : 0;
    var total = materialCost + laborCost + stairsCost + railingCost + benchesCost + removalCost + s.permit;
    var perSqft = sqft > 0 ? total / sqft : 0;

    /* materials vs labor split (never a black-box total) */
    var materials = materialCost + stairsCost + railingCost + benchesCost + s.permit;
    var labor = laborCost + removalCost;

    /* planning range: ±25% band covers regional pricing + site-condition variance.
       Documented on /methodology/ — a single false-precise number is never shown alone. */
    var rangeLow = total * 0.75;
    var rangeHigh = total * 1.25;

    return {
      sqft: sqft, hMult: hMult,
      materialCost: materialCost, laborCost: laborCost,
      stairsCost: stairsCost, railingCost: railingCost, benchesCost: benchesCost,
      removalCost: removalCost,
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
    var h = HEIGHT[s.height] || HEIGHT.ground;

    var rows = '';
    var sizeDesc = s.mode === 'sqft'
      ? num1(r.sqft) + ' sqft (entered directly)'
      : s.L + ' × ' + s.W + ' ft = ' + num1(r.sqft) + ' sqft';
    rows += row('Deck surface — ' + sizeDesc + ', ' + esc(s.mat.name) + ' (' + (TIER_LABEL[s.tier] || 'Standard').toLowerCase() + ') @ ' + money(s.matPrice) + '/sqft materials' + (s.height === 'ground' ? '' : ' <span class="hint">(' + esc(h.name.toLowerCase()) + ': ' + esc(h.note) + ')</span>'), money(r.materialCost));
    if (s.laborMode === 'pro') {
      rows += row('Install labor — ' + num1(r.sqft) + ' sqft @ ' + money(s.laborRate) + '/sqft', money(r.laborCost));
    } else {
      rows += row('Install labor', 'DIY — $0.00');
    }
    if (s.steps > 0) rows += row('Stairs — ' + s.steps + ' steps × ' + money(s.stepPrice), money(r.stairsCost));
    if (s.railingLF > 0) rows += row('Railing — ' + num1(s.railingLF) + ' LF × ' + money(s.railingPrice), money(r.railingCost));
    if (s.benches > 0) rows += row('Built-in benches — ' + s.benches + ' × ' + money(s.benchPrice), money(r.benchesCost));
    if (s.removal) rows += row('Old deck tear-off &amp; disposal @ ' + money(s.removalRate) + '/sqft', money(r.removalCost));
    if (s.permit > 0) rows += row('Permit &amp; fees', money(s.permit));

    var matPct = r.total > 0 ? Math.round(r.materials / r.total * 100) : 100;
    var labPct = 100 - matPct;
    var splitBar = (s.laborMode === 'pro' || s.removal) && r.labor > 0
      ? '<div class="splitbar" role="img" aria-label="Materials ' + matPct + ' percent, labor ' + labPct + ' percent">' +
        '<div class="split-mat" style="width:' + matPct + '%">Materials ' + matPct + '%</div>' +
        '<div class="split-lab" style="width:' + labPct + '%">Labor ' + labPct + '%</div></div>' +
        '<p class="split-legend">Materials &amp; features <strong>' + money(r.materials) + '</strong> (decking, stairs, railing, benches, permit) · ' +
        'Labor &amp; services <strong>' + money(r.labor) + '</strong> (install' +
        (s.removal ? ' + removal' : '') + ')</p>'
      : '<div class="splitbar" role="img" aria-label="Materials 100 percent, DIY labor">' +
        '<div class="split-mat" style="width:100%">Materials 100% — ' + money(r.materials) + '</div></div>' +
        '<p class="split-legend">DIY: you supply the labor, so the budget is materials, stairs, railing, benches, and permit.</p>';

    /* side-by-side: all four materials for THIS job (standard tier, same settings) */
    var compRows = '';
    Object.keys(MATERIALS).forEach(function (k) {
      var m = MATERIALS[k];
      var mp = (m.matLo + m.matHi) / 2;
      var lr = s.laborMode === 'pro' ? m.labor : 0;
      var rrU = computeFor(s, k, mp, lr);
      var hl = k === s.matKey ? ' style="background:#fff8ec"' : '';
      compRows += '<tr' + hl + '><td>' + esc(m.name) + (k === s.matKey ? ' <strong>(yours)</strong>' : '') +
        '</td><td>' + money(mp) + '</td><td>' + money(rrU.total) + '</td><td>' + money(rrU.total / Math.max(rrU.sqft, 1)) + '/sqft</td><td>' + esc(m.life) + '</td></tr>';
    });

    var laborLine = s.laborMode === 'diy'
      ? 'Hiring a pro at ' + money(s.laborRate) + '/sqft would add about ' + money(r.sqft * r.hMult * s.laborRate) + ' in install labor for this ' + esc(s.mat.name.toLowerCase()) + ' deck.'
      : 'Doing it yourself would save ' + money(r.laborCost) + ' in install labor — labor is typically 40–60% of an installed deck quote.';

    var sizeLine = s.mode === 'sqft'
      ? num1(r.sqft) + ' sqft (entered directly)'
      : s.L + ' × ' + s.W + ' ft = ' + num1(r.sqft) + ' sqft';

    out.innerHTML =
      '<h2>Your estimate</h2>' +
      '<p class="total">' + money(r.total) + '</p>' +
      '<p class="range">Typical range: <strong>' + money(r.rangeLow) + ' – ' + money(r.rangeHigh) + '</strong> ' +
      '<span class="small">(±25% planning band — covers regional pricing and site-condition variance)</span></p>' +
      '<p class="small">' + sizeLine + ' &middot; ' + esc(s.mat.name.toLowerCase()) +
      ' &middot; ' + esc(h.name.toLowerCase()) +
      ' &middot; about ' + money(r.perSqft) + ' per sqft all-in</p>' +
      splitBar +
      '<table><tbody>' + rows +
      '<tr><td><strong>Total project cost</strong></td><td><strong>' + money(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<h3>Same deck, all four materials <span class="hint">(standard tier, your settings)</span></h3>' +
      '<table><thead><tr><th>Material</th><th>Material $/sqft</th><th>Project total</th><th>Per sqft</th><th>Lifespan</th></tr></thead><tbody>' + compRows + '</tbody></table>' +
      '<div class="assume"><strong>Quick comparison:</strong><br>' + laborLine + '</div>' +
      '<details class="mt1"><summary><strong>How we got this number (show the math)</strong></summary>' +
      '<div class="math"><code>' + mathBlock(s, r) + '</code></div>' +
      '<p class="src">Prices checked October 2026. Installed ranges: RemodelCalculators, HonestCasa, FixUpFirst, Woodworking Advisor 2026 cost guides (see data table below). ' +
      'Height multipliers (raised +30%, rooftop/second-story +55% vs. ground-level) are industry rules of thumb — estimates, not measured data. ' +
      'Full methodology: <a href="../../methodology/">/methodology/</a></p></details>' +
      '<p class="note"><strong>Budgeting estimate, not a contractor quote.</strong> Real bids typically land inside the ±25% ' +
      'range above — region, access, soil, and design complexity move the number. Use this to budget and to sanity-check ' +
      'quotes, not to replace them. No email required — this calculator never asks for your contact info.</p>';

    out.setAttribute('aria-live', 'polite');
  }

  function row(label, val) { return '<tr><td>' + label + '</td><td>' + val + '</td></tr>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mathBlock(s, r) {
    var h = HEIGHT[s.height] || HEIGHT.ground;
    var lines = [];
    if (s.mode === 'sqft') {
      lines.push('deck area = ' + num1(s.sqftDirect) + ' sqft (entered directly)');
    } else {
      lines.push('deck area = length × width = ' + s.L + ' × ' + s.W + ' = ' + num1(r.sqft) + ' sqft');
    }
    lines.push('height factor = ' + h.name + ' → ×' + r.hMult.toFixed(2));
    lines.push('decking materials = ' + num1(r.sqft) + ' × ' + r.hMult.toFixed(2) + ' × ' + money(s.matPrice) + ' (' + s.mat.name + ', ' + s.tier + ') = ' + money(r.materialCost));
    if (s.laborMode === 'pro') {
      lines.push('install labor = ' + num1(r.sqft) + ' × ' + r.hMult.toFixed(2) + ' × ' + money(s.laborRate) + ' = ' + money(r.laborCost));
    } else {
      lines.push('install labor = $0 (DIY)');
    }
    if (s.steps > 0) lines.push('stairs = ' + s.steps + ' × ' + money(s.stepPrice) + ' = ' + money(r.stairsCost));
    if (s.railingLF > 0) lines.push('railing = ' + num1(s.railingLF) + ' × ' + money(s.railingPrice) + ' = ' + money(r.railingCost));
    if (s.benches > 0) lines.push('built-in benches = ' + s.benches + ' × ' + money(s.benchPrice) + ' = ' + money(r.benchesCost));
    if (s.removal) lines.push('old deck tear-off = ' + num1(r.sqft) + ' × ' + money(s.removalRate) + ' = ' + money(r.removalCost));
    if (s.permit > 0) lines.push('permit & fees = ' + money(s.permit));
    lines.push('materials & features subtotal = decking + stairs + railing + benches + permit = ' + money(r.materials));
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
    if (p === 'classic') {
      $('in-length').value = 12; $('in-width').value = 16; /* 192 sqft */
    } else if (p === 'family') {
      $('in-length').value = 16; $('in-width').value = 20; /* 320 sqft */
    } else if (p === 'entertainer') {
      $('in-length').value = 20; $('in-width').value = 24; /* 480 sqft */
    }
    recalc();
  }

  function syncModeUI() {
    var mode = $('calc-mode').value;
    $('dims-fields').style.display = mode === 'dims' ? '' : 'none';
    $('sqft-field').style.display = mode === 'sqft' ? '' : 'none';
  }

  function syncMaterialUI() {
    var m = MATERIALS[$('calc-material').value] || MATERIALS.ptwood;
    var t = $('calc-tier').value;
    $('in-material-price').value = tierPrice(m, t).toFixed(2);
    $('in-labor-rate').value = m.labor.toFixed(2);
    $('material-where').textContent = 'Defaults from ' + m.where + '; material range ' + money(m.matLo) + '–' + money(m.matHi) + '/sqft, labor ' + money(m.laborLo) + '–' + money(m.laborHi) + '/sqft (Oct 2026). Adjust freely — your numbers override ours.';
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
    segWire('seg-removal', 'calc-removal', function () { recalc(); });

    $('calc-material').addEventListener('change', function () { syncMaterialUI(); recalc(); });
    ['in-length', 'in-width', 'in-sqft',
     'in-material-price', 'in-labor-rate',
     'in-steps', 'in-step-price',
     'in-railing-lf', 'in-railing-price',
     'in-benches', 'in-bench-price',
     'in-removal-rate', 'in-permit'].forEach(function (id) {
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
