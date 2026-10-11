/* CostMyProject — ZIP-code local labor adjustment (shared module).
   Usage on a calculator page:
     1. Add the ZIP field HTML near the top of the form (see calculators/paint-cost/ for the pattern):
        <div class="zip-field">
          <label for="in-zip">ZIP code <span class="opt">(optional — local labor rates)</span></label>
          <input id="in-zip" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="e.g. 90210">
          <span class="zip-note" id="zip-note" aria-live="polite"></span>
          <span class="zip-tip" title="Construction labor costs vary a lot by metro. Enter your ZIP and we scale the labor portion of your estimate using BLS wage data for your area (first 3 digits of the ZIP). Materials are national prices. Full methodology: /cost-guides/how-labor-rates-vary-by-zip/">?</span>
        </div>
     2. Include this script AFTER your calculator script (or before — order doesn't matter):
        <script src="../../assets/js/zip-labor.js"></script>
     3. In your calculator JS init:  CMPZipLabor.bind('in-zip', 'zip-note', recalc);
        In compute, on the labor portion:  laborCost = CMPZipLabor.adjust(laborCost);
        In render, after the labor row:    var zn = CMPZipLabor.noteRow(); if (zn) rows += row(zn.label, zn.val);
   Data: /assets/data/zip3-multipliers.json (BLS OEWS May 2023, SOC 47-2061). */
(function () {
  'use strict';

  var DATA = null;
  var state = { zip: '', mult: 1.00, label: '', tier: 0, known: false };
  var readyCbs = [];
  var boundOnChange = null;

  function dataUrl() {
    try {
      var src = document.currentScript && document.currentScript.src ? document.currentScript.src : '';
      if (src.indexOf('/assets/js/zip-labor.js') !== -1) {
        return src.replace('/assets/js/zip-labor.js', '/assets/data/zip3-multipliers.json');
      }
    } catch (e) { /* fall through */ }
    return 'assets/data/zip3-multipliers.json';
  }

  function fireReady() {
    var cbs = readyCbs.slice(); readyCbs = [];
    for (var i = 0; i < cbs.length; i++) { try { cbs[i](); } catch (e) {} }
    if (boundOnChange) { try { boundOnChange(); } catch (e) {} }
  }

  function load() {
    if (DATA) { fireReady(); return; }
    if (!window.fetch) { fireReady(); return; }
    fetch(dataUrl(), { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('zip data ' + r.status);
      return r.json();
    }).then(function (j) {
      DATA = j;
      fireReady();
    }).catch(function () { fireReady(); /* offline/blocked: stay on national average */ });
  }

  function lookup(zip) {
    var z = String(zip == null ? '' : zip).replace(/\D/g, '');
    if (!/^\d{5}$/.test(z)) return null;
    var z3 = z.slice(0, 3);
    var e = DATA && DATA.zip3 ? DATA.zip3[z3] : null;
    if (e) return { zip: z, mult: e.m, label: e.label, tier: e.t, known: true };
    return { zip: z, mult: 1.00, label: 'National average (area not in table)', tier: 0, known: false };
  }

  function fmtMult(m) { return '×' + m.toFixed(2); }

  function noteText() {
    if (!state.zip) return '';
    var src = state.tier === 1 ? 'BLS metro wage data'
      : state.tier === 2 ? 'BLS state wage data'
      : state.tier === 3 ? 'state estimate' : 'national average';
    return 'Local labor ' + fmtMult(state.mult) + ' — ' + state.label + ' (' + src + ')';
  }

  function paintNote(noteEl) {
    var el = typeof noteEl === 'string' ? document.getElementById(noteEl) : noteEl;
    if (!el) return;
    el.textContent = noteText();
  }

  var api = {
    /* Wire a ZIP input. onChange is called whenever the effective multiplier changes. */
    bind: function (inputId, noteId, onChange) {
      var input = document.getElementById(inputId);
      if (!input) return;
      boundOnChange = onChange || null;
      var apply = function () {
        var res = lookup(input.value);
        if (res) {
          var changed = res.mult !== state.mult || res.zip !== state.zip;
          state = res;
          paintNote(noteId);
          if (changed && onChange) onChange();
        } else {
          /* mid-typing (fewer than 5 digits): keep last good state, clear only if emptied */
          if (String(input.value).replace(/\D/g, '') === '' && state.zip !== '') {
            state = { zip: '', mult: 1.00, label: '', tier: 0, known: false };
            paintNote(noteId);
            if (onChange) onChange();
          }
        }
      };
      input.addEventListener('input', apply);
      input.addEventListener('change', apply);
      load();
    },
    /* Current multiplier (1.00 until a valid ZIP is entered / data loads). */
    mult: function () { return state.mult; },
    /* Scale a labor dollar amount. */
    adjust: function (amount) {
      var n = parseFloat(amount) || 0;
      return n * state.mult;
    },
    /* Breakdown-row content for the calculator's results table, or null. */
    noteRow: function () {
      if (!state.zip) return null;
      return { label: 'Local labor adjustment (ZIP ' + state.zip + ': ' + fmtMult(state.mult) + ')', val: '' };
    },
    /* Short status line for under the input. */
    noteText: noteText,
    /* Run cb once the multiplier table has loaded (immediately if already loaded). */
    ready: function (cb) {
      if (DATA) { try { cb(); } catch (e) {} return; }
      readyCbs.push(cb);
      load();
    },
    /* For tests: force a state without DOM. */
    _setState: function (s) { state = s; },
    _lookup: lookup
  };

  window.CMPZipLabor = api;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
