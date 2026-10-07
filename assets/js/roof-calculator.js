/* CostMyProject — Roof Cost Calculator engine. Vanilla JS, no dependencies.
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

  /* Oct 2026 roof price ranges per square foot of ROOF SURFACE (pitch-adjusted).
     Material = roofing material + underlayment + fasteners (materials only).
     Labor = pro install per square foot of roof surface. tier: budget -> low, standard -> mid, premium -> high.
     Installed-range anchors verified against 2026 published data; see on-page sources. */
  var MATERIALS = {
    threetab: { name: '3-tab asphalt shingle', matLo: 1.00, matHi: 2.50, labor: 3.00, laborLo: 2.00, laborHi: 4.00,
                life: '15–20 yrs', maint: 'Minimal; occasional shingle repair',
                where: 'roofing suppliers / home-improvement stores' },
    arch:     { name: 'Architectural asphalt shingle', matLo: 1.50, matHi: 3.50, labor: 3.50, laborLo: 2.50, laborHi: 4.50,
                life: '25–30 yrs', maint: 'Minimal; occasional shingle repair',
                where: 'roofing suppliers / home-improvement stores' },
    metal:    { name: 'Standing-seam metal', matLo: 5.00, matHi: 8.50, labor: 5.00, laborLo: 3.50, laborHi: 6.50,
                life: '40–70 yrs', maint: 'Minimal; fastener/sealant check every ~10 yrs',
                where: 'metal roofing suppliers' },
    wood:     { name: 'Wood shake / shingle', matLo: 4.00, matHi: 7.00, labor: 4.50, laborLo: 3.50, laborHi: 6.00,
                life: '25–40 yrs', maint: 'Cleaning + treatment every ~5 yrs (~$1,500, hired)',
                where: 'specialty lumber / roofing suppliers' },
    tile:     { name: 'Clay / concrete tile', matLo: 5.00, matHi: 9.00, labor: 6.00, laborLo: 4.50, laborHi: 8.00,
                life: '50–100 yrs', maint: 'Minimal; underlayment typically replaced ~yr 25 (~$5,000)',
                where: 'tile roofing suppliers' }
  };
  var TIER_LABEL = { budget: 'Budget', standard: 'Standard', premium: 'Premium' };
  /* Pitch multiplier converts footprint sqft to true roof-surface sqft.
     Pure geometry: mult = sqrt(1 + (rise/12)^2). Steep pitches also slow crews,
     so a labor surcharge applies at 9/12+ (industry rule of thumb — labeled estimate on-page). */
  var PITCH = {
    low:    { name: 'Low (3/12)', mult: 1.031, laborMult: 1.00, note: 'walkable, fastest install' },
    mod:    { name: 'Moderate (6/12)', mult: 1.118, laborMult: 1.00, note: 'most common US pitch' },
    steep:  { name: 'Steep (9/12)', mult: 1.250, laborMult: 1.15, note: '+15% labor — safety gear, slower pace' },
    vsteep: { name: 'Very steep (12/12)', mult: 1.414, laborMult: 1.25, note: '+25% labor — staging required' }
  };
  /* Stories multiplier on labor (access/scaffolding). Industry rule of thumb — labeled estimate. */
  var STORIES_MULT = { '1': 1.00, '2': 1.10, '3': 1.20 };
  var TEAROFF_RATE = 1.50;   /* old-roof tear-off + disposal, $/sqft per layer — industry range $1–$2 */
  var SHIELD_RATE = 0.75;    /* ice-and-water shield upgrade, $/sqft — typical $0.50–$1.00 */
  var SKYLIGHT_PRICE = 350;  /* per skylight re-flash/install — typical range $200–$500 */
  var PERMIT_DEFAULT = 350;  /* typical range $150–$500 by municipality */

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
    var mat = MATERIALS[matKey] || MATERIALS.arch;
    var matPrice = parseFloat($('in-material-price').value);
    var pitch = $('calc-pitch').value || 'mod';
    var stories = $('calc-stories').value || '1';
    var laborMode = $('calc-labor').value; /* diy | pro */
    var laborRate = parseFloat($('in-labor-rate').value);
    var layers = parseInt($('calc-tearoff').value, 10) || 0;
    var tearoffRate = parseFloat($('in-tearoff-rate').value);
    var shield = $('calc-shield').value === 'yes';
    var shieldRate = parseFloat($('in-shield-rate').value);
    var skylights = Math.max(parseInt($('in-skylights').value, 10) || 0, 0);
    var skylightPrice = parseFloat($('in-skylight-price').value);
    var permit = parseFloat($('in-permit').value) || 0;

    if (isNaN(matPrice) || matPrice <= 0) matPrice = tierPrice(mat, tier);
    if (isNaN(laborRate) || laborRate <= 0) laborRate = mat.labor;
    if (isNaN(tearoffRate) || tearoffRate < 0) tearoffRate = TEAROFF_RATE;
    if (isNaN(shieldRate) || shieldRate < 0) shieldRate = SHIELD_RATE;
    if (isNaN(skylightPrice) || skylightPrice < 0) skylightPrice = SKYLIGHT_PRICE;
    if (skylights < 0) skylights = 0;
    if (permit < 0) permit = 0;

    return {
      mode: mode, L: L, W: W, sqftDirect: sqftDirect,
      matKey: matKey, mat: mat, tier: tier,
      matPrice: matPrice, pitch: pitch, stories: stories,
      laborMode: laborMode, laborRate: laborRate,
      layers: layers, tearoffRate: tearoffRate,
      shield: shield, shieldRate: shieldRate,
      skylights: skylights, skylightPrice: skylightPrice,
      permit: permit
    };
  }

  function computeFor(s, matKey, matPrice, laborRate) {
    var mat = MATERIALS[matKey];
    var footprint = s.mode === 'sqft' ? s.sqftDirect : s.L * s.W;
    footprint = Math.max(footprint, 0);
    var p = PITCH[s.pitch] || PITCH.mod;
    var roofSqft = footprint * p.mult;
    var laborMult = p.laborMult * (STORIES_MULT[s.stories] || 1);

    var materialCost = roofSqft * matPrice;
    var laborCost = s.laborMode === 'pro' ? roofSqft * laborRate * laborMult : 0;
    var tearoffCost = s.layers * roofSqft * s.tearoffRate;
    var shieldCost = s.shield ? roofSqft * s.shieldRate : 0;
    var skylightCost = s.skylights * s.skylightPrice;
    var total = materialCost + laborCost + tearoffCost + shieldCost + skylightCost + s.permit;
    var perSqft = roofSqft > 0 ? total / roofSqft : 0;

    /* materials vs labor split (never a black-box total) */
    var materials = materialCost + shieldCost + skylightCost + s.permit;
    var labor = laborCost + tearoffCost;

    /* planning range: ±25% band covers regional pricing + site-condition variance.
       Documented on /methodology/ — a single false-precise number is never shown alone. */
    var rangeLow = total * 0.75;
    var rangeHigh = total * 1.25;

    return {
      footprint: footprint, roofSqft: roofSqft,
      pitchMult: p.mult, laborMult: laborMult,
      materialCost: materialCost, laborCost: laborCost,
      tearoffCost: tearoffCost, shieldCost: shieldCost, skylightCost: skylightCost,
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
    var p = PITCH[s.pitch] || PITCH.mod;

    var rows = '';
    var sizeDesc = s.mode === 'sqft'
      ? num1(s.sqftDirect) + ' sqft roof surface (entered directly)'
      : s.L + ' × ' + s.W + ' ft footprint × ' + p.mult.toFixed(3) + ' (' + esc(p.name) + ' pitch) = ' + num1(r.roofSqft) + ' sqft of roof';
    rows += row('Roofing materials — ' + esc(s.mat.name) + ' (' + (TIER_LABEL[s.tier] || 'Standard').toLowerCase() + ') @ ' + money(s.matPrice) + '/sqft', money(r.materialCost));
    if (s.laborMode === 'pro') {
      var multNote = r.laborMult > 1 ? ' <span class="hint">(×' + r.laborMult.toFixed(2) + ' pitch/stories labor factor)</span>' : '';
      rows += row('Install labor — ' + num1(r.roofSqft) + ' sqft @ ' + money(s.laborRate) + '/sqft' + multNote, money(r.laborCost));
    } else {
      rows += row('Install labor', 'DIY — $0.00');
    }
    if (s.layers > 0) rows += row('Tear-off &amp; disposal — ' + s.layers + ' layer' + (s.layers > 1 ? 's' : '') + ' × ' + money(s.tearoffRate) + '/sqft', money(r.tearoffCost));
    if (s.shield) rows += row('Ice-and-water shield upgrade @ ' + money(s.shieldRate) + '/sqft', money(r.shieldCost));
    if (s.skylights > 0) rows += row('Skylights re-flashed — ' + s.skylights + ' × ' + money(s.skylightPrice), money(r.skylightCost));
    if (s.permit > 0) rows += row('Permit &amp; fees', money(s.permit));

    var matPct = r.total > 0 ? Math.round(r.materials / r.total * 100) : 100;
    var labPct = 100 - matPct;
    var splitBar = r.labor > 0
      ? '<div class="splitbar" role="img" aria-label="Materials ' + matPct + ' percent, labor ' + labPct + ' percent">' +
        '<div class="split-mat" style="width:' + matPct + '%">Materials ' + matPct + '%</div>' +
        '<div class="split-lab" style="width:' + labPct + '%">Labor ' + labPct + '%</div></div>' +
        '<p class="split-legend">Materials &amp; features <strong>' + money(r.materials) + '</strong> (roofing, shield, skylights, permit) · ' +
        'Labor &amp; services <strong>' + money(r.labor) + '</strong> (install' +
        (s.layers > 0 ? ' + tear-off' : '') + ')</p>'
      : '<div class="splitbar" role="img" aria-label="Materials 100 percent, DIY labor">' +
        '<div class="split-mat" style="width:100%">Materials 100% — ' + money(r.materials) + '</div></div>' +
        '<p class="split-legend">DIY: you supply the labor, so the budget is materials, shield, skylights, and permit. Tear-off labor is still priced above when selected.</p>';

    /* side-by-side: all five materials for THIS job (standard tier, same settings) */
    var compRows = '';
    Object.keys(MATERIALS).forEach(function (k) {
      var m = MATERIALS[k];
      var mp = (m.matLo + m.matHi) / 2;
      var lr = s.laborMode === 'pro' ? m.labor : 0;
      var rrU = computeFor(s, k, mp, lr);
      var hl = k === s.matKey ? ' style="background:#fff8ec"' : '';
      compRows += '<tr' + hl + '><td>' + esc(m.name) + (k === s.matKey ? ' <strong>(yours)</strong>' : '') +
        '</td><td>' + money(mp) + '</td><td>' + money(rrU.total) + '</td><td>' + money(rrU.total / Math.max(rrU.roofSqft, 1)) + '/sqft</td><td>' + esc(m.life) + '</td></tr>';
    });

    var laborLine = s.laborMode === 'diy'
      ? 'Hiring a pro at ' + money(s.laborRate) + '/sqft would add about ' + money(r.roofSqft * s.laborRate * r.laborMult) + ' in install labor for this ' + esc(s.mat.name.toLowerCase()) + ' roof — and unlike decks or fences, roofing pros strongly recommend against DIY: falls, voided warranties, and code issues erase the savings.'
      : 'Doing it yourself would save ' + money(r.laborCost) + ' in install labor — but roofing is the one project where pros urge caution: manufacturer warranties usually require professional installation, and the work is genuinely dangerous.';

    out.innerHTML =
      '<h2>Your estimate</h2>' +
      '<p class="total">' + money(r.total) + '</p>' +
      '<p class="range">Typical range: <strong>' + money(r.rangeLow) + ' – ' + money(r.rangeHigh) + '</strong> ' +
      '<span class="small">(±25% planning band — covers regional pricing and site-condition variance)</span></p>' +
      '<p class="small">' + sizeDesc + ' &middot; ' + esc(s.mat.name.toLowerCase()) +
      ' &middot; about ' + money(r.perSqft) + ' per sqft of roof surface</p>' +
      splitBar +
      '<table><tbody>' + rows +
      '<tr><td><strong>Total project cost</strong></td><td><strong>' + money(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<h3>Same roof, all five materials <span class="hint">(standard tier, your settings)</span></h3>' +
      '<table><thead><tr><th>Material</th><th>Material $/sqft</th><th>Project total</th><th>Per sqft</th><th>Lifespan</th></tr></thead><tbody>' + compRows + '</tbody></table>' +
      '<div class="assume"><strong>Quick comparison:</strong><br>' + laborLine + '</div>' +
      '<details class="mt1"><summary><strong>How we got this number (show the math)</strong></summary>' +
      '<div class="math"><code>' + mathBlock(s, r) + '</code></div>' +
      '<p class="src">Prices checked October 2026. Installed ranges: HomeGuide via theflhomepros, bestroofingestimates, Bhumi Calculator, Angi 2026 cost guides (see data table below). ' +
      'Pitch multipliers are pure geometry (√(1+(rise/12)²)); steep-pitch labor surcharges (+15% at 9/12, +25% at 12/12) and stories multipliers are industry rules of thumb — estimates, not measured data. ' +
      'Full methodology: <a href="../../methodology/">/methodology/</a></p></details>' +
      '<p class="note"><strong>Budgeting estimate, not a contractor quote.</strong> Real bids typically land inside the ±25% ' +
      'range above — region, pitch, access, decking condition, and design complexity move the number. Use this to budget and to sanity-check ' +
      'quotes, not to replace them. No email required — this calculator never asks for your contact info.</p>';

    out.setAttribute('aria-live', 'polite');
  }

  function row(label, val) { return '<tr><td>' + label + '</td><td>' + val + '</td></tr>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mathBlock(s, r) {
    var p = PITCH[s.pitch] || PITCH.mod;
    var lines = [];
    if (s.mode === 'sqft') {
      lines.push('roof surface = ' + num1(s.sqftDirect) + ' sqft (entered directly)');
    } else {
      lines.push('footprint = length × width = ' + s.L + ' × ' + s.W + ' = ' + num1(r.footprint) + ' sqft');
      lines.push('pitch factor (' + p.name + ') = sqrt(1 + (rise/12)^2) = ' + p.mult.toFixed(3));
      lines.push('roof surface = footprint × pitch factor = ' + num1(r.footprint) + ' × ' + p.mult.toFixed(3) + ' = ' + num1(r.roofSqft) + ' sqft');
    }
    lines.push('roofing materials = ' + num1(r.roofSqft) + ' × ' + money(s.matPrice) + ' (' + s.mat.name + ', ' + s.tier + ') = ' + money(r.materialCost));
    if (s.laborMode === 'pro') {
      lines.push('install labor = ' + num1(r.roofSqft) + ' × ' + money(s.laborRate) + ' × ' + r.laborMult.toFixed(2) + ' (pitch/stories factor) = ' + money(r.laborCost));
    } else {
      lines.push('install labor = $0 (DIY)');
    }
    if (s.layers > 0) lines.push('tear-off = ' + s.layers + ' × ' + num1(r.roofSqft) + ' × ' + money(s.tearoffRate) + ' = ' + money(r.tearoffCost));
    if (s.shield) lines.push('ice-and-water shield = ' + num1(r.roofSqft) + ' × ' + money(s.shieldRate) + ' = ' + money(r.shieldCost));
    if (s.skylights > 0) lines.push('skylights = ' + s.skylights + ' × ' + money(s.skylightPrice) + ' = ' + money(r.skylightCost));
    if (s.permit > 0) lines.push('permit & fees = ' + money(s.permit));
    lines.push('materials & features subtotal = roofing + shield + skylights + permit = ' + money(r.materials));
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
      $('in-length').value = 40; $('in-width').value = 30; /* 1,200 sqft footprint */
    } else if (p === 'colonial') {
      $('in-length').value = 40; $('in-width').value = 50; /* 2,000 sqft footprint */
    } else if (p === 'estate') {
      $('in-length').value = 50; $('in-width').value = 60; /* 3,000 sqft footprint */
    }
    recalc();
  }

  function syncModeUI() {
    var mode = $('calc-mode').value;
    $('dims-fields').style.display = mode === 'dims' ? '' : 'none';
    $('sqft-field').style.display = mode === 'sqft' ? '' : 'none';
  }

  function syncMaterialUI() {
    var m = MATERIALS[$('calc-material').value] || MATERIALS.arch;
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
    segWire('seg-pitch', 'calc-pitch', function () { recalc(); });
    segWire('seg-stories', 'calc-stories', function () { recalc(); });
    segWire('seg-labor', 'calc-labor', function () { toggleLabor(); recalc(); });
    segWire('seg-tearoff', 'calc-tearoff', function () { recalc(); });
    segWire('seg-shield', 'calc-shield', function () { recalc(); });

    $('calc-material').addEventListener('change', function () { syncMaterialUI(); recalc(); });
    ['in-length', 'in-width', 'in-sqft',
     'in-material-price', 'in-labor-rate',
     'in-tearoff-rate', 'in-shield-rate',
     'in-skylights', 'in-skylight-price',
     'in-permit'].forEach(function (id) {
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
