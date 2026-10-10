/* CostMyProject — Embeddable mini-calculators.
   Usage (one script tag + one div per calculator):
     <script src="https://brinoco47-wq.github.io/costmyproject/assets/js/embed.js" async></script>
     <div data-cmp-calculator="paint-cost"></div>
     <div data-cmp-calculator="moving-cost"></div>
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
    }
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
