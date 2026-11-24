/* SOLVENTA sv-zeit.js: Jahreszahlen, Fristen und Jahreswerte zentral.
   Einmal pro Jahr ergänzen (Quelle angeben), Seiten passen sich automatisch an.
   Fehlt ein Wert für das relevante Jahr, wird der Satz ausgeblendet oder durch einen neutralen Text ersetzt.
 */
(function(){
  var D = {
    // Säule 3a: k = mit Pensionskasse, g = ohne 2. Säule (max.). Quelle: BSV/ESTV
    s3a: {2025:{k:7258,g:36288}, 2026:{k:7258,g:36288}, 2027:{k:7373,g:36864}},
    // BVG: e = Eintrittsschwelle, ko = Koordinationsabzug, o = obere Limite. Quelle: BSV
    bvg: {2025:{e:22680,ko:26460,o:90720}, 2026:{e:22680,ko:26460,o:90720}, 2027:{e:23040,ko:26880,o:92160}},
    // Krankenkasse pro Prämienjahr: erw = Erwachsene CHF/Monat, mittel = mittlere Prämie, Plus = Anstieg in %. Quelle: BAG
    kk: {2027:{erw:487.60, erwPlus:4.9, jung:338.80, kind:128.10, mittel:412, mittelPlus:5.0, quelle:'BAG, Medienmitteilung 29.09.2026'}}
  };
  var now = new Date();
  var Y = now.getFullYear(), M = now.getMonth();
  var kkJ = M >= 9 ? Y + 1 : Y;          // ab 1. Oktober gelten die neuen Prämien als "kommendes Jahr"
  var kkF = M === 11 ? Y + 1 : Y;         // Kündigungsfrist 30. November: im Dezember die nächste
  function f(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }
  function g(o, k){ return o ? o[k] : undefined; }
  var s3 = D.s3a[Y], s3n = D.s3a[Y + 1], b = D.bvg[Y], bn = D.bvg[Y + 1], kk = D.kk[kkJ];
  var V = {
    'J': Y, 'J1': Y + 1, 'J_1': Y - 1, 'KKJ': kkJ, 'KKJ_1': kkJ - 1, 'KKF': kkF, 'S3J': Y,
    'S3.k': s3 && f(s3.k), 'S3.g': s3 && f(s3.g), 'S3N.k': s3n && f(s3n.k), 'S3N.g': s3n && f(s3n.g),
    'BVG.e': b && f(b.e), 'BVG.ko': b && f(b.ko), 'BVG.o': b && f(b.o),
    'BVGN.e': bn && f(bn.e), 'BVGN.ko': bn && f(bn.ko), 'BVGN.o': bn && f(bn.o),
    'KK.erw': kk && kk.erw.toFixed(2), 'KK.erwPlus': g(kk, 'erwPlus'), 'KK.mittel': kk && f(kk.mittel),
    'KK.mittelPlus': kk && kk.mittelPlus.toFixed(1), 'KK.quelle': g(kk, 'quelle')
  };
  function t(tpl, fb){
    var miss = false;
    var s = String(tpl).replace(/\[\[(.*?)\]\]/g, function(_, seg){
      var r = t(seg, null); return r === null ? '' : r;
    }).replace(/\{([A-Z0-9_.]+[a-zA-Z]*)\}/g, function(_, k){
      var v = V[k]; if(v === undefined || v === null || v === '') { miss = true; return ''; } return v;
    });
    return miss ? (fb === undefined ? null : fb) : s;
  }
  function need(keys){ return String(keys).split(/[ ,]+/).every(function(k){ return !k || (V[k] !== undefined && V[k] !== null && V[k] !== ''); }); }
  function last(tab){ var best = null; for(var y in tab){ if(+y <= Y && (!best || +y > best)) best = +y; } return best ? tab[best] : null; }
  window.SVZ = {
    now: now, jahr: Y, kkj: function(){ return kkJ; }, kk: function(){ return kk || null; },
    s3: function(){ return s3 || last(D.s3a); }, t: function(tpl, fb){ return t(tpl, fb === undefined ? '' : fb); }, need: need
  };
  function run(){
    var mt = document.querySelector('meta[name="sv-title"]');
    if(mt){ var tt = t(mt.getAttribute('content'), null); if(tt) document.title = tt; }
    Array.prototype.forEach.call(document.querySelectorAll('[data-zneed]'), function(el){ if(!need(el.getAttribute('data-zneed'))) el.style.display = 'none'; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-zuntil]'), function(el){
      var u = new Date(el.getAttribute('data-zuntil') + 'T23:59:59'); if(now > u) el.innerHTML = el.getAttribute('data-zf') || '';
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-zt]'), function(el){
      var r = t(el.getAttribute('data-zt'), null);
      if(r !== null) el.innerHTML = r;
      else if(el.hasAttribute('data-zf')) el.innerHTML = el.getAttribute('data-zf');
      else el.style.display = 'none';
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
