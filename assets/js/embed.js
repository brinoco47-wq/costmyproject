/* CostMyProject — Embeddable mini-calculators.
   Usage (one script tag + one div per calculator):
     <script src="https://brinoco47-wq.github.io/costmyproject/assets/js/embed.js" async></script>
     <div data-cmp-calculator="paint-cost"></div>
     <div data-cmp-calculator="moving-cost"></div>
     <div data-cmp-calculator="solar-panel-cost"></div>
   The script renders a compact, branded calculator into each placeholder.
   Styles are scoped inside Shadow DOM so the host page's CSS can't break it.
   Math is a simplified version of the full on-site calculators (same 2026
   defaults, same ±25% planning range). Prices: October 2026, US.
   To add a new calculator, add an entry to CALCS below. */
(function () {
  'use strict';

  var BASE = 'https://brinoco47-wq.github.io/costmyproject';

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Shared widget CSS (injected into each shadow root). */
  var CSS = [
    ':host{display:block;max-width:420px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}',
    '.cmp{border:1px solid #dfe5ee;border-radius:12px;padding:16px;background:#fff;color:#1c2430;}',
    '.cmp h3{margin:0 0 4px;font-size:17px;}',
    '.cmp .sub{margin:0 0 12px;font-size:12px;color:#5b6b82;}',
    '.cmp label{display:block;font-size:12px;font-weight:600;margin:10px 0 4px;color:#33415c;}',
    '.cmp input,.cmp select{width:100%;box-sizing:border-box;padding:8px 10px;font-size:14px;border:1px solid #c6d0de;border-radius:8px;}',
    '.cmp .row{display:flex;gap:8px;}',
    '.cmp .row>div{flex:1;}',
    '.cmp .seg{display:flex;gap:6px;}',
    '.cmp .seg button{flex:1;padding:8px 4px;font-size:13px;border:1px solid #c6d0de;background:#f4f6fa;border-radius:8px;cursor:pointer;}',
    '.cmp .seg button[aria-pressed="true"]{background:#1c5fd6;border-color:#1c5fd6;color:#fff;font-weight:700;}',
    '.cmp .out{margin-top:14px;padding:12px;border-radius:8px;background:#eef4ff;}',
    '.cmp .out .big{font-size:24px;font-weight:800;}',
    '.cmp .out .rng{font-size:12px;color:#5b6b82;margin-top:2px;}',
    '.cmp .out .det{font-size:12px;color:#33415c;margin-top:6px;}',
    '.cmp .attr{margin-top:10px;font-size:11px;color:#8a97ab;text-align:right;}',
    '.cmp .attr a{color:#1c5fd6;text-decoration:none;}'
  ].join('\n');

  /* ---- Calculator definitions (extend here) ---- */
  var CALCS = {
    'paint-cost': {
      title: 'Paint Cost Estimator',
      sub: 'Room size → gallons + total. October 2026 US prices.',
      url: BASE + '/calculators/paint-cost/',
      fields: function () {
        return '' +
          '<div class="row">' +
          '<div><label>Length (ft)</label><input type="number" data-f="L" value="12" min="1"></div>' +
          '<div><label>Width (ft)</label><input type="number" data-f="W" value="12" min="1"></div>' +
          '<div><label>Height (ft)</label><input type="number" data-f="H" value="8" min="1"></div>' +
          '</div>' +
          '<label>Coats</label>' +
          '<div class="seg" data-seg="coats"><button data-v="1" aria-pressed="false">1</button><button data-v="2" aria-pressed="true">2</button></div>' +
          '<label>Labor</label>' +
          '<div class="seg" data-seg="labor"><button data-v="diy" aria-pressed="false">DIY</button><button data-v="pro" aria-pressed="true">Hire a pro</button></div>';
      },
      read: function (root) {
        var v = function (f) { var el = root.querySelector('[data-f="' + f + '"]'); return parseFloat(el.value) || 0; };
        var seg = function (n) { var b = root.querySelector('[data-seg="' + n + '"] [aria-pressed="true"]'); return b ? b.getAttribute('data-v') : null; };
        return { L: v('L'), W: v('W'), H: v('H'), coats: parseInt(seg('coats'), 10) || 2, labor: seg('labor') || 'pro' };
      },
      compute: function (s) {
        /* Mirrors paint-calculator.js defaults: 375 sq ft/gal coverage,
           10% waste, $45/gal paint, $2.50/sq ft pro labor. */
        var area = Math.max(2 * (s.L + s.W) * s.H, 0);
        var gal = Math.ceil(area * s.coats / 375 * 1.10 - 1e-9);
        var paintCost = gal * 45;
        var laborCost = s.labor === 'pro' ? area * 2.50 : 0;
        var total = paintCost + laborCost;
        return {
          total: total, low: total * 0.75, high: total * 1.25,
          detail: gal + ' gal paint · ' + Math.round(area) + ' sq ft walls' +
            (s.labor === 'pro' ? ' · pro labor' : ' · DIY labor')
        };
      }
    },
    'moving-cost': {
      title: 'Moving Cost Estimator',
      sub: 'Home size + distance → moving estimate. October 2026 US prices.',
      url: BASE + '/calculators/moving-cost/',
      fields: function () {
        return '' +
          '<label>Home size</label>' +
          '<select data-f="home">' +
          '<option value="studio">Studio</option>' +
          '<option value="br1">1 bedroom</option>' +
          '<option value="br2" selected>2 bedroom</option>' +
          '<option value="br3">3 bedroom</option>' +
          '<option value="br4">4 bedroom</option>' +
          '</select>' +
          '<label>Distance (miles)</label>' +
          '<input type="number" data-f="miles" value="25" min="1">' +
          '<label>Move type</label>' +
          '<div class="seg" data-seg="type"><button data-v="diy" aria-pressed="false">DIY truck</button><button data-v="container" aria-pressed="false">Container</button><button data-v="full" aria-pressed="true">Full-service</button></div>';
      },
      read: function (root) {
        var sel = root.querySelector('[data-f="home"]');
        var mi = root.querySelector('[data-f="miles"]');
        var b = root.querySelector('[data-seg="type"] [aria-pressed="true"]');
        return {
          home: sel.value,
          miles: parseFloat(mi.value) || 25,
          type: b ? b.getAttribute('data-v') : 'full'
        };
      },
      compute: function (s) {
        /* Mirrors moving-calculator.js defaults (simplified): crew hours ×
           hourly for local; weight formula with $1,200 floor for long-distance. */
        var HOMES = {
          studio: { crew: 2, hours: 4, hourly: 110, weight: 1800, truck: 19.95, cont: 800, ow: { base: 400, per: 0.85 } },
          br1:    { crew: 2, hours: 5, hourly: 110, weight: 2650, truck: 19.95, cont: 800, ow: { base: 400, per: 0.85 } },
          br2:    { crew: 3, hours: 7, hourly: 150, weight: 5250, truck: 29.95, cont: 1100, ow: { base: 500, per: 1.00 } },
          br3:    { crew: 4, hours: 9.5, hourly: 190, weight: 8000, truck: 39.95, cont: 1600, ow: { base: 600, per: 1.10 } },
          br4:    { crew: 5, hours: 12, hourly: 230, weight: 12000, truck: 39.95, cont: 2200, ow: { base: 700, per: 1.25 } }
        };
        var h = HOMES[s.home] || HOMES.br2;
        var local = s.miles <= 100, total, detail;
        if (s.type === 'full') {
          total = local ? h.hours * h.hourly : Math.max(1200, h.weight * (0.50 + 0.0003 * s.miles));
          detail = 'Full-service movers · ' + (local ? 'local' : Math.round(s.miles) + ' mi');
        } else if (s.type === 'container') {
          total = local ? h.cont : h.cont + s.miles * 2.50;
          detail = 'Moving container · ' + (local ? 'local' : Math.round(s.miles) + ' mi');
        } else {
          total = local
            ? h.truck + s.miles * 0.99 + (s.miles / 10) * 3.50 + 20
            : h.ow.base + s.miles * h.ow.per;
          detail = 'DIY truck rental · ' + (local ? 'local' : Math.round(s.miles) + ' mi');
        }
        return { total: total, low: total * 0.75, high: total * 1.25, detail: detail };
      }
    },
    'solar-panel-cost': {
      title: 'Solar Cost Estimator',
      sub: 'Monthly bill + state → system size, cost, payback. October 2026 US defaults.',
      url: BASE + '/calculators/solar-panel-cost/',
      fields: function () {
        var opts = '<option value="US" selected>National average</option>' +
          '<option value=\"AK\">Alaska</option><option value=\"AL\">Alabama</option><option value=\"AR\">Arkansas</option><option value=\"AZ\">Arizona</option><option value=\"CA\">California</option><option value=\"CO\">Colorado</option><option value=\"CT\">Connecticut</option><option value=\"DE\">Delaware</option><option value=\"FL\">Florida</option><option value=\"GA\">Georgia</option><option value=\"HI\">Hawaii</option><option value=\"IA\">Iowa</option><option value=\"ID\">Idaho</option><option value=\"IL\">Illinois</option><option value=\"IN\">Indiana</option><option value=\"KS\">Kansas</option><option value=\"KY\">Kentucky</option><option value=\"LA\">Louisiana</option><option value=\"MA\">Massachusetts</option><option value=\"MD\">Maryland</option><option value=\"ME\">Maine</option><option value=\"MI\">Michigan</option><option value=\"MN\">Minnesota</option><option value=\"MO\">Missouri</option><option value=\"MS\">Mississippi</option><option value=\"MT\">Montana</option><option value=\"NC\">North Carolina</option><option value=\"ND\">North Dakota</option><option value=\"NE\">Nebraska</option><option value=\"NH\">New Hampshire</option><option value=\"NJ\">New Jersey</option><option value=\"NM\">New Mexico</option><option value=\"NV\">Nevada</option><option value=\"NY\">New York</option><option value=\"OH\">Ohio</option><option value=\"OK\">Oklahoma</option><option value=\"OR\">Oregon</option><option value=\"PA\">Pennsylvania</option><option value=\"RI\">Rhode Island</option><option value=\"SC\">South Carolina</option><option value=\"SD\">South Dakota</option><option value=\"TN\">Tennessee</option><option value=\"TX\">Texas</option><option value=\"UT\">Utah</option><option value=\"VA\">Virginia</option><option value=\"VT\">Vermont</option><option value=\"WA\">Washington</option><option value=\"WI\">Wisconsin</option><option value=\"WV\">West Virginia</option><option value=\"WY\">Wyoming</option>';
        return '' +
          '<label>Monthly electric bill ($)</label>' +
          '<input type="number" data-f="bill" value="150" min="10">' +
          '<label>State</label>' +
          '<select data-f="state">' + opts + '</select>';
      },
      read: function (root) {
        var bill = root.querySelector('[data-f="bill"]');
        var st = root.querySelector('[data-f="state"]');
        var S = {"AK":[0.282,3.0],"AL":[0.168,4.6],"AR":[0.144,4.5],"AZ":[0.152,6.5],"CA":[0.333,5.6],"CO":[0.162,5.5],"CT":[0.274,4.2],"DE":[0.194,4.4],"FL":[0.152,5.3],"GA":[0.158,4.8],"HI":[0.52,5.8],"IA":[0.141,4.4],"ID":[0.124,4.9],"IL":[0.239,4.3],"IN":[0.182,4.2],"KS":[0.151,5.0],"KY":[0.15,4.3],"LA":[0.142,4.7],"MA":[0.288,4.2],"MD":[0.218,4.4],"ME":[0.286,4.2],"MI":[0.22,4.0],"MN":[0.17,4.3],"MO":[0.137,4.6],"MS":[0.162,4.6],"MT":[0.147,4.7],"NC":[0.151,4.7],"ND":[0.136,4.5],"NE":[0.136,4.8],"NH":[0.273,4.2],"NJ":[0.233,4.3],"NM":[0.141,6.5],"NV":[0.136,6.4],"NY":[0.299,4.0],"OH":[0.195,4.1],"OK":[0.134,5.1],"OR":[0.163,4.2],"PA":[0.216,4.1],"RI":[0.295,4.2],"SC":[0.162,4.8],"SD":[0.157,4.7],"TN":[0.145,4.4],"TX":[0.164,5.3],"UT":[0.13,5.5],"VA":[0.176,4.5],"VT":[0.249,4.0],"WA":[0.15,3.8],"WI":[0.197,4.2],"WV":[0.168,4.1],"WY":[0.148,5.2]};
        var d = S[st.value];
        return { bill: parseFloat(bill.value) || 150, rate: d ? d[0] : 0.17, sun: d ? d[1] : 4.5 };
      },
      compute: function (s) {
        /* Mirrors the solar calculator: $2.70/W, 400 W panels, 0.80 derate, 0% 2026 credit. */
        var annual = s.bill * 12 / s.rate;
        var kw = annual / (365 * s.sun * 0.80);
        var panels = Math.ceil(kw * 1000 / 400);
        var actual = panels * 400 / 1000;
        var net = actual * 1000 * 2.70;
        var save = actual * s.sun * 365 * 0.80 * s.rate;
        var payback = save > 0 ? net / save : 0;
        return {
          total: net, low: net * 0.75, high: net * 1.25,
          detail: actual.toFixed(1) + ' kW · ' + panels + ' panels · payback ' + payback.toFixed(1) + ' years'
        };
      }
    },
  };

  function renderInto(host) {
    var key = host.getAttribute('data-cmp-calculator');
    var def = CALCS[key];
    if (!def) return;
    var shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML =
      '<style>' + CSS + '</style>' +
      '<div class="cmp" role="region" aria-label="' + esc(def.title) + '">' +
      '<h3>' + esc(def.title) + '</h3>' +
      '<p class="sub">' + esc(def.sub) + '</p>' +
      '<div class="fields">' + def.fields() + '</div>' +
      '<div class="out" aria-live="polite"><div class="big"></div><div class="rng"></div><div class="det"></div></div>' +
      '<p class="attr">Powered by <a href="' + def.url + '" target="_blank" rel="noopener">CostMyProject</a> · planning estimate, not a quote</p>' +
      '</div>';

    var root = shadow;
    function update() {
      var s = def.read(root);
      var r = def.compute(s);
      root.querySelector('.big').textContent = money(r.total) + ' estimate';
      root.querySelector('.rng').textContent = 'Planning range ' + money(r.low) + ' – ' + money(r.high) + ' (±25%)';
      root.querySelector('.det').textContent = r.detail;
    }
    shadow.addEventListener('input', update);
    shadow.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-seg] button') : null;
      if (!btn) return;
      var seg = btn.closest('[data-seg]');
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      update();
    });
    update();
  }

  function init() {
    document.querySelectorAll('[data-cmp-calculator]').forEach(renderInto);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
