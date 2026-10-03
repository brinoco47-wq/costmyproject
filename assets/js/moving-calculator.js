/* CostMyProject — Moving Cost Estimator engine. Vanilla JS, no dependencies.
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
  var num0 = function (n) {
    return Math.round(n).toLocaleString('en-US');
  };

  /* Home-size profiles. Weights: mygoodmovers.com 2026 (midpoint of published
     bands). Local hours: mygoodmovers.com 2026. Container flats & packing:
     midpoints of 2026 published ranges (diyvspros.com, extraspace.com) —
     labeled estimates, all user-editable. */
  var HOMES = {
    studio: { label: 'Studio',          weight: 1800,  crew: 2, hours: 3.5, truck: '10', truckBase: 19.95, contBase: 500,  packFull: 465,  supplies: 100 },
    br1:    { label: '1 bedroom',       weight: 2650,  crew: 2, hours: 5,   truck: '10', truckBase: 19.95, contBase: 800,  packFull: 765,  supplies: 150 },
    br2:    { label: '2 bedroom',       weight: 5250,  crew: 3, hours: 7,   truck: '15', truckBase: 29.95, contBase: 1100, packFull: 765,  supplies: 200 },
    br3:    { label: '3 bedroom',       weight: 8000,  crew: 4, hours: 9.5, truck: '20', truckBase: 39.95, contBase: 1600, packFull: 1615, supplies: 275 },
    br4:    { label: '4 bedroom',       weight: 12000, crew: 5, hours: 12,  truck: '26', truckBase: 39.95, contBase: 2200, packFull: 2200, supplies: 350 },
    br5:    { label: '5 bedroom',       weight: 15000, crew: 5, hours: 14,  truck: '26', truckBase: 39.95, contBase: 2800, packFull: 2800, supplies: 450 }
  };
  /* Default crew hourly rates by crew size — typical 2026 US market rates
     (ConsumerAffairs: $80–$100/hr for 2 movers; larger crews scale up).
     Estimate; user-adjustable. */
  var CREW_RATE = { 2: 110, 3: 150, 4: 190, 5: 230 };
  /* One-way truck pricing: base + per-mile, fitted to 2026 one-way quotes
     (easystoragesearch.com: 2,500 mi ≈ $2,600 for 10 ft, ≈ $3,900 for 26 ft,
     fuel + protection included in the fit). Estimate. */
  var ONEWAY = {
    '10': { base: 400, per: 0.85 },
    '15': { base: 500, per: 1.00 },
    '20': { base: 600, per: 1.10 },
    '26': { base: 700, per: 1.25 }
  };
  var TRUCK_LABEL = { '10': '10 ft truck', '15': '15 ft truck', '20': '20 ft truck', '26': '26 ft truck' };
  var TYPE_LABEL = { diy: 'DIY truck rental', container: 'Moving container', full: 'Full-service movers' };
  var PACK_LABEL = { none: 'No packing help', fragile: 'Fragile-only packing', full: 'Full packing service' };
  var LD_FLOOR = 1200; /* long-distance carriers enforce minimum charges; estimate */
  var MPG = 10;        /* box-truck fuel economy, easystoragesearch.com 2026 */

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
    var homeKey = $('calc-home').value;
    var home = HOMES[homeKey] || HOMES.br2;
    var miles = parseFloat($('in-miles').value);
    if (isNaN(miles) || miles < 0) miles = 25;
    var type = $('calc-type').value;       /* diy | container | full */
    var packing = $('calc-packing').value; /* none | fragile | full */
    var hourly = parseFloat($('in-hourly').value);
    var perMile = parseFloat($('in-permile').value);
    var gas = parseFloat($('in-gas').value);
    var protect = parseFloat($('in-protect').value);
    var days = parseFloat($('in-days').value);
    var contBase = parseFloat($('in-contbase').value);
    var packFull = parseFloat($('in-packfull').value);
    var supplies = parseFloat($('in-supplies').value);
    if (isNaN(hourly) || hourly <= 0) hourly = CREW_RATE[home.crew];
    if (isNaN(perMile) || perMile < 0) perMile = 0.99;
    if (isNaN(gas) || gas <= 0) gas = 3.50;
    if (isNaN(protect) || protect < 0) protect = 20;
    if (isNaN(days) || days < 1) days = 1;
    if (isNaN(contBase) || contBase < 0) contBase = home.contBase;
    if (isNaN(packFull) || packFull < 0) packFull = home.packFull;
    if (isNaN(supplies) || supplies < 0) supplies = home.supplies;

    return {
      homeKey: homeKey, home: home, miles: miles, type: type, packing: packing,
      hourly: hourly, perMile: perMile, gas: gas, protect: protect, days: days,
      contBase: contBase, packFull: packFull, supplies: supplies,
      local: miles <= 100
    };
  }

  function packingCost(s) {
    if (s.packing === 'full') return s.packFull;
    if (s.packing === 'fragile') return s.packFull * 0.4;
    return 0;
  }
  function suppliesApplies(s) {
    /* DIY always needs your own boxes. With hired movers or a container,
       supplies are only extra when you pack yourself (packing services
       typically include materials). */
    return s.type === 'diy' || s.packing !== 'full';
  }

  function costFull(s) {
    var h = s.home;
    var move;
    if (s.local) {
      move = h.hours * s.hourly;
    } else {
      move = Math.max(LD_FLOOR, h.weight * (0.50 + 0.0003 * s.miles));
    }
    return move;
  }
  function costDiy(s) {
    var h = s.home;
    var truck;
    if (s.local) {
      var fuel = (s.miles / MPG) * s.gas;
      truck = h.truckBase * s.days + s.miles * s.perMile + fuel + s.protect;
    } else {
      var ow = ONEWAY[h.truck];
      truck = ow.base + s.miles * ow.per;
    }
    return truck;
  }
  function costContainer(s) {
    if (s.local) return s.contBase;
    return s.contBase + s.miles * 2.50;
  }

  function compute(s) {
    var pack = packingCost(s);
    var supFor = function (t) { return suppliesApplies({ type: t, packing: s.packing }) ? s.supplies : 0; };
    var totals = {
      diy: costDiy(s) + pack + supFor('diy'),
      container: costContainer(s) + pack + supFor('container'),
      full: costFull(s) + pack + supFor('full')
    };
    var selected = totals[s.type];
    var cheapest = 'diy';
    if (totals.container < totals[cheapest]) cheapest = 'container';
    if (totals.full < totals[cheapest]) cheapest = 'full';
    return {
      totals: totals, selected: selected, cheapest: cheapest,
      pack: pack, sup: supFor(s.type), moveCost: totals[s.type] - pack - supFor(s.type)
    };
  }

  function row(label, val) { return '<tr><td>' + label + '</td><td>' + val + '</td></tr>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function render(s, r) {
    var out = $('calc-result');
    if (!out) return;
    var h = s.home;

    var rows = '';
    rows += row(TYPE_LABEL[s.type] + ' — move cost', money(r.moveCost));
    if (s.packing !== 'none') rows += row(PACK_LABEL[s.packing], money(r.pack));
    rows += row(s.packing === 'full' && s.type !== 'diy' ? 'Boxes &amp; materials <span class="src">(included in packing)</span>' : 'Boxes &amp; materials (DIY)', money(r.sup));

    var comp = '';
    ['diy', 'container', 'full'].forEach(function (k) {
      var sel = k === s.type ? ' <strong>(your pick)</strong>' : '';
      var cheap = k === r.cheapest ? ' ★ cheapest' : '';
      comp += '<tr><td>' + TYPE_LABEL[k] + sel + cheap + '</td><td><strong>' + money(r.totals[k]) + '</strong></td></tr>';
    });

    var altLines = [];
    ['diy', 'container', 'full'].forEach(function (k) {
      if (k !== s.type) {
        var d = r.totals[k] - r.selected;
        altLines.push(d > 0.005
          ? TYPE_LABEL[k] + ' would cost ' + money(d) + ' more (' + money(r.totals[k]) + ').'
          : TYPE_LABEL[k] + ' would save ' + money(-d) + ' (' + money(r.totals[k]) + ').');
      }
    });

    var distLine = s.local
      ? 'Local move — ' + num0(s.miles) + ' miles (≤100 mi). Movers bill by the hour on local jobs.'
      : 'Long-distance move — ' + num0(s.miles) + ' miles. Movers bill by weight (' + num0(h.weight) + ' lbs est.) on interstate jobs.';

    out.innerHTML =
      '<h2>Your estimate</h2>' +
      '<p class="total">' + money(r.selected) + '</p>' +
      '<p class="small">' + esc(h.label) + ' home &middot; ' + distLine + '</p>' +
      '<table><tbody>' + rows +
      '<tr><td><strong>Total project cost</strong></td><td><strong>' + money(r.selected) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<h3 class="mt1">All three move types, your inputs</h3>' +
      '<table><thead><tr><th>Move type</th><th>Total</th></tr></thead><tbody>' + comp + '</tbody></table>' +
      '<div class="assume"><strong>Quick comparisons:</strong><br>' + altLines.join('<br>') + '</div>' +
      '<details class="mt1"><summary><strong>How we got this number (show the math)</strong></summary>' +
      '<div class="math"><code>' + mathBlock(s, r) + '</code></div>' +
      '<p class="src">Prices checked October 2026. Full-service ranges: Lugg / American Moving and Storage Association; ' +
      'mygoodmovers.com 2026. Truck rental: U-Haul advertised rates via movebuddha.com &amp; easystoragesearch.com 2026. ' +
      'Container pricing: freightwaves.com, diyvspros.com 2026. Packing: extraspace.com 2026. ' +
      'Long-distance formula and one-way truck fit are our modeled estimates from those published ranges — ' +
      'every input is editable above. Full methodology: <a href="../../methodology/">methodology</a></p></details>' +
      '<p class="note">Estimate, not a quote. Actual costs vary by city, season, and company — always get three written quotes. ' +
      'No email required — this calculator never asks for your contact info.</p>';

    out.setAttribute('aria-live', 'polite');
  }

  function mathBlock(s, r) {
    var h = s.home;
    var lines = [];
    lines.push('home: ' + h.label + ' ≈ ' + num0(h.weight) + ' lbs of belongings (industry estimate)');
    lines.push('distance: ' + num0(s.miles) + ' miles → ' + (s.local ? 'LOCAL (hourly billing)' : 'LONG-DISTANCE (weight billing)'));
    lines.push('');
    lines.push('FULL-SERVICE:');
    if (s.local) {
      lines.push('  ' + h.hours + ' hrs × ' + money(s.hourly) + '/hr (' + h.crew + '-person crew) = ' + money(costFull(s)));
    } else {
      var raw = h.weight * (0.50 + 0.0003 * s.miles);
      lines.push('  ' + num0(h.weight) + ' lbs × ($0.50 + 0.0003 × ' + num0(s.miles) + ' mi) = ' + money(raw));
      if (raw < LD_FLOOR) lines.push('  → raised to $1,200 long-distance minimum');
      lines.push('  = ' + money(costFull(s)));
    }
    lines.push('');
    lines.push('DIY TRUCK (' + TRUCK_LABEL[h.truck] + '):');
    if (s.local) {
      var fuel = (s.miles / MPG) * s.gas;
      lines.push('  base ' + money(h.truckBase) + ' × ' + s.days + ' day(s) = ' + money(h.truckBase * s.days));
      lines.push('  mileage ' + num0(s.miles) + ' mi × ' + money(s.perMile) + ' = ' + money(s.miles * s.perMile));
      lines.push('  fuel ' + num0(s.miles) + ' ÷ ' + MPG + ' mpg × ' + money(s.gas) + '/gal = ' + money(fuel));
      lines.push('  protection = ' + money(s.protect));
      lines.push('  = ' + money(costDiy(s)));
    } else {
      var ow = ONEWAY[h.truck];
      lines.push('  one-way ' + money(ow.base) + ' base + ' + num0(s.miles) + ' mi × ' + money(ow.per) + ' = ' + money(costDiy(s)));
      lines.push('  (bundles truck, fuel & protection — fitted to 2026 one-way quotes)');
    }
    lines.push('');
    lines.push('CONTAINER:');
    if (s.local) {
      lines.push('  flat ' + money(s.contBase) + ' (local, incl. ~1 month rental)');
    } else {
      lines.push('  ' + money(s.contBase) + ' base + ' + num0(s.miles) + ' mi × $2.50 = ' + money(costContainer(s)));
    }
    lines.push('');
    lines.push('PACKING: ' + PACK_LABEL[s.packing] + ' = ' + money(r.pack));
    lines.push('SUPPLIES: ' + money(r.sup) + (r.sup === 0 ? ' (included in packing service)' : ''));
    lines.push('');
    lines.push('SELECTED (' + TYPE_LABEL[s.type] + '): ' + money(r.moveCost) + ' + ' + money(r.pack) + ' + ' + money(r.sup) + ' = ' + money(r.selected));
    return lines.join('\n');
  }

  function setSeg(segId, hiddenId, val) {
    var btns = $(segId).querySelectorAll('button[data-val]');
    btns.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-val') === val ? 'true' : 'false');
    });
    $(hiddenId).value = val;
  }

  function setPreset(p) {
    var map = {
      studio:  { home: 'studio', miles: 15 },
      br2mid:  { home: 'br2',    miles: 500 },
      br3long: { home: 'br3',    miles: 1200 },
      br4far:  { home: 'br4',    miles: 2500 }
    };
    var m = map[p];
    if (!m) return;
    setSeg('seg-home', 'calc-home', m.home);
    $('in-miles').value = m.miles;
    syncHomeUI();
    recalc();
  }

  function syncHomeUI() {
    var h = HOMES[$('calc-home').value] || HOMES.br2;
    $('in-hourly').value = CREW_RATE[h.crew];
    $('in-contbase').value = h.contBase;
    $('in-packfull').value = h.packFull;
    $('in-supplies').value = h.supplies;
    $('truck-hint').textContent = 'Suggested truck for a ' + h.label.toLowerCase() + ' home: ' + TRUCK_LABEL[h.truck] +
      ' (' + money(h.truckBase) + '/day local). One-way pricing auto-applies over 100 miles.';
  }

  function syncTypeUI() {
    var t = $('calc-type').value;
    var local = (parseFloat($('in-miles').value) || 0) <= 100;
    $('days-field').style.display = (t === 'diy' && local) ? '' : 'none';
    $('permile-field').style.display = (t === 'diy' && local) ? '' : 'none';
  }

  function recalc() {
    var s = readState();
    syncTypeUI();
    render(s, compute(s));
  }

  function init() {
    if (!$('calc-form')) return;
    segWire('seg-home', 'calc-home', function () { syncHomeUI(); recalc(); });
    segWire('seg-type', 'calc-type', function () { recalc(); });
    segWire('seg-packing', 'calc-packing', function () { recalc(); });

    ['in-miles', 'in-hourly', 'in-permile', 'in-gas', 'in-protect', 'in-days',
     'in-contbase', 'in-packfull', 'in-supplies'].forEach(function (id) {
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

    syncHomeUI(); recalc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
