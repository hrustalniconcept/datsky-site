/* Датский квартал — фильтры шахматки и галерея карточки. Весь текст уже в HTML, скрипт только показывает и скрывает. */
(function () {
  // ---------- Шахматка ----------
  var root = document.querySelector('[data-shahmatka]');
  if (root) {
    var state = { sp: null, fl: null, terr: false, promo: false, area: null, dom: null };
    var lots = [].slice.call(root.querySelectorAll('[data-lot]'));
    var cells = [].slice.call(root.querySelectorAll('.cell[data-sp]'));
    var houses = [].slice.call(root.querySelectorAll('.house'));
    var empty = root.querySelector('.empty');
    var counter = root.querySelector('[data-count]');

    function match(el) {
      var d = el.dataset, s = parseFloat(d.s);
      if (state.sp && d.sp !== state.sp && d.spAlt !== state.sp) return false;
      if (state.fl && d.fl !== state.fl) return false;
      if (state.terr && d.terr !== '1') return false;
      if (state.promo && d.st !== 'promo') return false;
      if (state.dom && d.dom !== state.dom) return false;
      if (state.area === 'a1' && s >= 50) return false;
      if (state.area === 'a2' && (s < 50 || s >= 65)) return false;
      if (state.area === 'a3' && (s < 65 || s >= 80)) return false;
      if (state.area === 'a4' && s < 80) return false;
      return true;
    }

    function apply() {
      var n = 0;
      lots.forEach(function (el) { var ok = match(el); el.hidden = !ok; if (ok) n++; });
      cells.forEach(function (el) { el.classList.toggle('is-dim', !match(el)); });
      houses.forEach(function (h) { h.classList.toggle('is-active', !!state.dom && h.dataset.dom === state.dom); });
      root.querySelectorAll('.gp-house').forEach(function (g) { g.classList.toggle('is-active', g.dataset.dom === state.dom); });
      if (counter) counter.textContent = n;
      if (empty) empty.classList.toggle('is-on', n === 0);
    }

    root.querySelectorAll('[data-f]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.dataset.f, val = b.dataset.v;
        if (key === 'terr' || key === 'promo') {
          state[key] = !state[key];
          b.setAttribute('aria-pressed', state[key]);
        } else {
          state[key] = state[key] === val ? null : val;
          root.querySelectorAll('[data-f="' + key + '"]').forEach(function (x) {
            x.setAttribute('aria-pressed', x.dataset.v === state[key]);
          });
        }
        apply();
      });
    });

    root.querySelectorAll('.gp-house').forEach(function (g) {
      g.addEventListener('click', function () {
        state.dom = state.dom === g.dataset.dom ? null : g.dataset.dom;
        apply();
        var h = root.querySelector('.house[data-dom="' + g.dataset.dom + '"]');
        if (state.dom && h && root.querySelector('[data-view="houses"]').getAttribute('aria-pressed') === 'true') {
          h.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    root.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        root.querySelector('#view-list').hidden = b.dataset.view !== 'list';
        root.querySelector('#view-houses').hidden = b.dataset.view !== 'houses';
      });
    });

    var reset = root.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', function () {
      state = { sp: null, fl: null, terr: false, promo: false, area: null, dom: null };
      root.querySelectorAll('[data-f]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      apply();
    });

    // Фильтр из адреса: kvartiry.html?sp=3 или #promo
    var q = new URLSearchParams(location.search);
    ['sp', 'fl', 'dom'].forEach(function (k) { if (q.get(k)) state[k] = q.get(k); });
    if (q.get('promo') || location.hash === '#promo') state.promo = true;
    root.querySelectorAll('[data-f]').forEach(function (x) {
      var k = x.dataset.f;
      x.setAttribute('aria-pressed', (k === 'terr' || k === 'promo') ? state[k] : x.dataset.v === state[k]);
    });
    apply();
  }

  // ---------- Видео: плеер Kinescope грузится только по нажатию ----------
  document.querySelectorAll('[data-kinescope]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://kinescope.io/embed/' + b.dataset.kinescope + '?autoplay=1';
      f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      f.setAttribute('allowfullscreen', '');
      f.title = b.getAttribute('aria-label');
      b.replaceWith(Object.assign(document.createElement('div'), { className: b.className + ' is-playing' }));
      document.querySelector('.video.is-playing:not(:has(iframe))').appendChild(f);
    });
  });

  // ---------- Галерея карточки ----------
  var gal = document.querySelector('[data-gallery]');
  if (gal) {
    var items = JSON.parse(gal.querySelector('script[type="application/json"]').textContent);
    var img = gal.querySelector('.gal__main img'), cap = gal.querySelector('.gal__cap');
    var thumbs = [].slice.call(gal.querySelectorAll('.thumbs button')), i = 0;
    function show(k) {
      i = (k + items.length) % items.length;
      img.src = items[i].src; img.alt = items[i].alt;
      cap.innerHTML = (items[i].kind === 'viz' ? '<b>Визуализация.</b> ' : '') + items[i].alt;
      thumbs.forEach(function (t, j) { t.setAttribute('aria-current', j === i); });
    }
    thumbs.forEach(function (t, j) { t.addEventListener('click', function () { show(j); }); });
    gal.querySelector('.gal__nav--p').addEventListener('click', function () { show(i - 1); });
    gal.querySelector('.gal__nav--n').addEventListener('click', function () { show(i + 1); });
  }
})();
