/* CostMyProject — Siding Cost Calculator engine. Vanilla JS, no dependencies.
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

  /* Oct 2026 siding price ranges per square foot of WALL AREA.
     Material = siding panels/boards + fasteners + basic trim stock (materials only).
     Labor = pro install per square foot of wall. tier: budget -> low, standard -> mid, premium -> high.
     Installed-range anchors reconciled against 2026 published data; see on-page sources. */
  var MATERIALS = {
    vinyl:    { name: 'Vinyl siding', matLo: 2.00, matHi: 3.50, labor: 2.50, laborLo: 1.50, laborHi: 4.00,
                life: '20–40 yrs', maint: 'Wash yearly — ~$0 in upkeep',
                where: 'home-improvement stores / siding distributors' },
    fiber:    { name: 'Fiber cement (Hardie-style)', matLo: 3.00, matHi: 5.00, labor: 5.00, laborLo: 4.00, laborHi: 7.00,
                life: '30–50 yrs', maint: 'Repaint every ~15–25 yrs (~$4,000 hired, typical home)',
                where: 'siding distributors / lumber yards' },
    engwood:  { name: 'Engineered wood (LP SmartSide-style)', matLo: 2.50, matHi: 4.50, labor: 4.00, laborLo: 3.00, laborHi: 5.50,
                life: '20–40 yrs', maint: 'Repaint every ~10–15 yrs (~$4,000 hired, typical home)',
                where: 'lumber yards / siding distributors' },
    cedar:    { name: 'Cedar / wood siding', matLo: 4.00, matHi: 7.00, labor: 5.00, laborLo: 4.00, laborHi: 7.00,
                life: '20–40 yrs', maint: 'Stain/paint every ~3–5 yrs (~$2,500 hired, typical home)',
                where: 'specialty lumber yards' },
    brick:    { name: 'Brick veneer', matLo: 5.00, matHi: 9.00, labor: 6.00, laborLo: 4.50, laborHi: 9.00,
                life: '50–100 yrs', maint: 'Repoint mortar every ~25–30 yrs (~$3,000 hired)',
                where: 'masonry suppliers' }
  };
  var TIER_LABEL = { budget: 'Budget', standard: 'Standard', premium: 'Premium' };
  /* Wall height per story (9 ft incl. floor system). Industry-standard planning assumption — labeled estimate. */
  var WALL_HEIGHT = 9;
  /* Stories multiplier on labor (staging/scaffolding). Industry rule of thumb — labeled estimate. */
  var STORIES_MULT = { '1': 1.00, '2': 1.10, '3': 1.20 };
  var TEAROFF_RATE = 1.00;   /* old-siding removal + disposal, $/sqft — typical range $0.50–$1.50 */
  var WRAP_RATE = 0.75;      /* house wrap / weather barrier, $/sqft — typical range $0.50–$1.00 */
  var TRIM_DEFAULT = 1500;  /* trim, soffit, fascia package — typical range $1,000–$3,000 */
  var PERMIT_DEFAULT = 300; /* typical range $200–$500 by municipality */

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
    var stories = $('calc-stories').value || '1';
    var sqftDirect = parseFloat($('in-sqft').value) || 0;
    var matKey = $('calc-material').value;
    var tier = $('calc-tier').value;
    var mat = MATERIALS[matKey] || MATERIALS.vinyl;
    var matPrice = parseFloat($('in-material-price').value);
    var laborMode = $('calc-labor').value; /* diy | pro */
    var laborRate = parseFloat($('in-labor-rate').value);
    var tearoff = $('calc-tearoff').value === 'yes';
    var tearoffRate = parseFloat($('in-tearoff-rate').value);
    var wrap = $('calc-wrap').value === 'yes';
    var wrapRate = parseFloat($('in-wrap-rate').value);
    var trim = parseFloat($('in-trim').value) || 0;
    var permit = parseFloat($('in-permit').value) || 0;

    if (isNaN(matPrice) || matPrice <= 0) matPrice = tierPrice(mat, tier);
    if (isNaN(laborRate) || laborRate <= 0) laborRate = mat.labor;
    if (isNaN(tearoffRate) || tearoffRate < 0) tearoffRate = TEAROFF_RATE;
    if (isNaN(wrapRate) || wrapRate < 0) wrapRate = WRAP_RATE;
    if (trim < 0) trim = 0;
    if (permit < 0) permit = 0;

    return {
      mode: mode, L: L, W: W, stories: stories, sqftDirect: sqftDirect,
      matKey: matKey, mat: mat, tier: tier,
      matPrice: matPrice,
      laborMode: laborMode, laborRate: laborRate,
      tearoff: tearoff, tearoffRate: tearoffRate,
      wrap: wrap, wrapRate: wrapRate,
      trim: trim, permit: permit
    };
  }

  function computeFor(s, matKey, matPrice, laborRate) {
    var mat = MATERIALS[matKey];
    var wallSqft = s.mode === 'sqft' ? Math.max(s.sqftDirect, 0)
      : Math.max(2 * (s.L + s.W) * WALL_HEIGHT * parseInt(s.stories, 10), 0);
    var laborMult = STORIES_MULT[s.stories] || 1;

    var materialCost = wallSqft * matPrice;
    var laborCost = s.laborMode === 'pro' ? wallSqft * laborRate * laborMult : 0;
    var tearoffCost = s.tearoff ? wallSqft * s.tearoffRate : 0;
    var wrapCost = s.wrap ? wallSqft * s.wrapRate : 0;
    var total = materialCost + laborCost + tearoffCost + wrapCost + s.trim + s.permit;
    var perSqft = wallSqft > 0 ? total / wallSqft : 0;

    /* materials vs labor split (never a black-box total) */
    var materials = materialCost + wrapCost + s.trim + s.permit;
    var labor = laborCost + tearoffCost;

    /* planning range: ±25% band covers regional pricing + site-condition variance.
       Documented on /methodology/ — a single false-precise number is never shown alone. */
    var rangeLow = total * 0.75;
    var rangeHigh = total * 1.25;

    return {
      wallSqft: wallSqft, laborMult: laborMult,
      materialCost: materialCost, laborCost: laborCost,
      tearoffCost: tearoffCost, wrapCost: wrapCost,
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
    var sizeDesc = s.mode === 'sqft'
      ? num1(s.sqftDirect) + ' sqft wall area (entered directly)'
      : '2 × (' + s.L + ' + ' + s.W + ') ft perimeter × ' + WALL_HEIGHT + ' ft/story × ' + s.stories + ' ' +
        (s.stories === '1' ? 'story' : 'stories') + ' = ' + num1(r.wallSqft) + ' sqft of wall';
    rows += row('Siding materials — ' + esc(s.mat.name) + ' (' + (TIER_LABEL[s.tier] || 'Standard').toLowerCase() + ') @ ' + money(s.matPrice) + '/sqft', money(r.materialCost));
    if (s.laborMode === 'pro') {
      var multNote = r.laborMult > 1 ? ' <span class="hint">(×' + r.laborMult.toFixed(2) + ' stories labor factor)</span>' : '';
      rows += row('Install labor — ' + num1(r.wallSqft) + ' sqft @ ' + money(s.laborRate) + '/sqft' + multNote, money(r.laborCost));
    } else {
      rows += row('Install labor', 'DIY — $0.00');
    }
    if (s.tearoff) rows += row('Old-siding tear-off &amp; disposal @ ' + money(s.tearoffRate) + '/sqft', money(r.tearoffCost));
    if (s.wrap) rows += row('House wrap / weather barrier @ ' + money(s.wrapRate) + '/sqft', money(r.wrapCost));
    if (s.trim > 0) rows += row('Trim, soffit &amp; fascia package', money(s.trim));
    if (s.permit > 0) rows += row('Permit &amp; fees', money(s.permit));

    var matPct = r.total > 0 ? Math.round(r.materials / r.total * 100) : 100;
    var labPct = 100 - matPct;
    var splitBar = r.labor > 0
      ? '<div class="splitbar" role="img" aria-label="Materials ' + matPct + ' percent, labor ' + labPct + ' percent">' +
        '<div class="split-mat" style="width:' + matPct + '%">Materials ' + matPct + '%</div>' +
        '<div class="split-lab" style="width:' + labPct + '%">Labor ' + labPct + '%</div></div>' +
        '<p class="split-legend">Materials &amp; features <strong>' + money(r.materials) + '</strong> (siding, wrap, trim, permit) · ' +
        'Labor &amp; services <strong>' + money(r.labor) + '</strong> (install' +
        (s.tearoff ? ' + tear-off' : '') + ')</p>'
      : '<div class="splitbar" role="img" aria-label="Materials 100 percent, DIY labor">' +
        '<div class="split-mat" style="width:100%">Materials 100% — ' + money(r.materials) + '</div></div>' +
        '<p class="split-legend">DIY: you supply the labor, so the budget is siding, wrap, trim, and permit. Tear-off labor is still priced above when selected.</p>';

    /* side-by-side: all five materials for THIS job (standard tier, same settings) */
    var compRows = '';
    Object.keys(MATERIALS).forEach(function (k) {
      var m = MATERIALS[k];
      var mp = (m.matLo + m.matHi) / 2;
      var lr = s.laborMode === 'pro' ? m.labor : 0;
      var rrU = computeFor(s, k, mp, lr);
      var hl = k === s.matKey ? ' style="background:#fff8ec"' : '';
      compRows += '<tr' + hl + '><td>' + esc(m.name) + (k === s.matKey ? ' <strong>(yours)</strong>' : '') +
        '</td><td>' + money(mp) + '</td><td>' + money(rrU.total) + '</td><td>' + money(rrU.total / Math.max(rrU.wallSqft, 1)) + '/sqft</td><td>' + esc(m.life) + '</td></tr>';
    });

    var laborLine = s.laborMode === 'diy'
      ? 'Hiring a pro at ' + money(s.laborRate) + '/sqft would add about ' + money(r.wallSqft * s.laborRate * r.laborMult) + ' in install labor for this ' + esc(s.mat.name.toLowerCase()) + ' job. Vinyl is the most DIY-friendly siding; fiber cement and brick veneer are strongly pro-only (silica dust, weight, and flashing details).'
      : 'Doing it yourself would save ' + money(r.laborCost) + ' in install labor — but be honest about skill: vinyl is genuinely DIY-able, while fiber cement (silica dust, heavy panels) and brick veneer (masonry + flashing) are jobs most homeowners should hire out.';

    out.innerHTML =
      '<h2>Your estimate</h2>' +
      '<p class="total">' + money(r.total) + '</p>' +
      '<p class="range">Typical range: <strong>' + money(r.rangeLow) + ' – ' + money(r.rangeHigh) + '</strong> ' +
      '<span class="small">(±25% planning band — covers regional pricing and site-condition variance)</span></p>' +
      '<p class="small">' + sizeDesc + ' &middot; ' + esc(s.mat.name.toLowerCase()) +
      ' &middot; about ' + money(r.perSqft) + ' per sqft of wall</p>' +
      splitBar +
      '<table><tbody>' + rows +
      '<tr><td><strong>Total project cost</strong></td><td><strong>' + money(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<h3>Same house, all five materials <span class="hint">(standard tier, your settings)</span></h3>' +
      '<table><thead><tr><th>Material</th><th>Material $/sqft</th><th>Project total</th><th>Per sqft</th><th>Lifespan</th></tr></thead><tbody>' + compRows + '</tbody></table>' +
      '<div class="assume"><strong>Quick comparison:</strong><br>' + laborLine + '</div>' +
      '<details class="mt1"><summary><strong>How we got this number (show the math)</strong></summary>' +
      '<div class="math"><code>' + mathBlock(s, r) + '</code></div>' +
      '<p class="src">Prices checked October 2026. Installed ranges reconciled from Angi, HomeGuide, and 2026 contractor-published guides (see data table below). ' +
      'Wall-area formula (perimeter × 9 ft/story) and stories labor multipliers (+10%/+20%) are industry rules of thumb — estimates, not measured data. ' +
      'Full methodology: <a href="../../methodology/">/methodology/</a></p></details>' +
      '<p class="note"><strong>Budgeting estimate, not a contractor quote.</strong> Real bids typically land inside the ±25% ' +
      'range above — region, stories, access, sheathing condition, and trim complexity move the number. Use this to budget and to sanity-check ' +
      'quotes, not to replace them. No email required — this calculator never asks for your contact info.</p>';

    out.setAttribute('aria-live', 'polite');
  }

  function row(label, val) { return '<tr><td>' + label + '</td><td>' + val + '</td></tr>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mathBlock(s, r) {
    var lines = [];
    if (s.mode === 'sqft') {
      lines.push('wall area = ' + num1(s.sqftDirect) + ' sqft (entered directly)');
    } else {
      lines.push('perimeter = 2 × (length + width) = 2 × (' + s.L + ' + ' + s.W + ') = ' + num1(2 * (s.L + s.W)) + ' ft');
      lines.push('wall area = perimeter × 9 ft/story × ' + s.stories + ' ' + (s.stories === '1' ? 'story' : 'stories') +
        ' = ' + num1(2 * (s.L + s.W)) + ' × 9 × ' + s.stories + ' = ' + num1(r.wallSqft) + ' sqft');
      lines.push('(window/door cutouts roughly offset by gables, corners, and waste — planning convention)');
    }
    lines.push('siding materials = ' + num1(r.wallSqft) + ' × ' + money(s.matPrice) + ' (' + s.mat.name + ', ' + s.tier + ') = ' + money(r.materialCost));
    if (s.laborMode === 'pro') {
      lines.push('install labor = ' + num1(r.wallSqft) + ' × ' + money(s.laborRate) + ' × ' + r.laborMult.toFixed(2) + ' (stories factor) = ' + money(r.laborCost));
    } else {
      lines.push('install labor = $0 (DIY)');
    }
    if (s.tearoff) lines.push('tear-off = ' + num1(r.wallSqft) + ' × ' + money(s.tearoffRate) + ' = ' + money(r.tearoffCost));
    if (s.wrap) lines.push('house wrap = ' + num1(r.wallSqft) + ' × ' + money(s.wrapRate) + ' = ' + money(r.wrapCost));
    if (s.trim > 0) lines.push('trim, soffit & fascia = ' + money(s.trim));
    if (s.permit > 0) lines.push('permit & fees = ' + money(s.permit));
    lines.push('materials & features subtotal = siding + wrap + trim + permit = ' + money(r.materials));
    lines.push('labor & services subtotal = install + tear-off = ' + money(r.labor));
    lines.push('planning range = total × 0.75 … total × 1.25 = ' + money(r.rangeLow) + ' … ' + money(r.rangeHigh));
    lines.push('  (±25% covers regional pricing + site-condition variance — see /methodology/)');
    lines.push('TOTAL = ' + money(r.total));
    return lines.join('\n');
  }

  /* presets */
  function setPreset(p) {
    $('calc-mode').value = 'dims';
    syncModeUI();
    if (p === 'ranch') {
      $('in-length').value = 40; $('in-width').value = 30; /* 40×30 1-story */
      $('calc-stories').value = '1'; syncSeg('seg-stories', '1');
    } else if (p === 'colonial') {
      $('in-length').value = 40; $('in-width').value = 50; /* 40×50 2-story */
      $('calc-stories').value = '2'; syncSeg('seg-stories', '2');
    } else if (p === 'estate') {
      $('in-length').value = 50; $('in-width').value = 60; /* 50×60 2-story */
      $('calc-stories').value = '2'; syncSeg('seg-stories', '2');
    }
    recalc();
  }

  function syncSeg(containerId, val) {
    var c = $(containerId);
    if (!c) return;
    c.querySelectorAll('button[data-val]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-val') === val ? 'true' : 'false');
    });
  }

  function syncModeUI() {
    var mode = $('calc-mode').value;
    $('dims-fields').style.display = mode === 'dims' ? '' : 'none';
    $('sqft-field').style.display = mode === 'sqft' ? '' : 'none';
  }

  function syncMaterialUI() {
    var m = MATERIALS[$('calc-material').value] || MATERIALS.vinyl;
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
    segWire('seg-stories', 'calc-stories', function () { recalc(); });
    segWire('seg-labor', 'calc-labor', function () { toggleLabor(); recalc(); });
    segWire('seg-tearoff', 'calc-tearoff', function () { recalc(); });
    segWire('seg-wrap', 'calc-wrap', function () { recalc(); });

    $('calc-material').addEventListener('change', function () { syncMaterialUI(); recalc(); });
    ['in-length', 'in-width', 'in-sqft',
     'in-material-price', 'in-labor-rate',
     'in-tearoff-rate', 'in-wrap-rate',
     'in-trim', 'in-permit'].forEach(function (id) {
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
