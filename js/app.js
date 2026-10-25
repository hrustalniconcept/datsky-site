/* Датский квартал — фильтры шахматки, форма, меню и галерея. Весь текст уже в HTML, скрипт только показывает и скрывает. */
(function () {
  // ---------- Меню на телефоне и планшете ----------
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  // ---------- Форма: кнопка выбирает задачу («Посчитать платёж» → расчёт) ----------
  var form = document.querySelector('[data-form]');
  function setNeed(v) {
    if (!form || !v) return;
    var sel = form.querySelector('[name="need"]');
    sel.value = v;
    form.querySelectorAll('.cond').forEach(function (c) { c.hidden = c.dataset.for !== v; });
  }
  if (form) {
    form.querySelector('[name="need"]').addEventListener('change', function (e) { setNeed(e.target.value); });
    setNeed(form.querySelector('[name="need"]').value);
  }
  document.querySelectorAll('[data-need]').forEach(function (a) {
    a.addEventListener('click', function () { setNeed(a.dataset.need); });
  });

  // ---------- Шахматка ----------
  var root = document.querySelector('[data-shahmatka]');
  if (root) {
    var blank = function () { return { sp: null, fl: null, terr: false, promo: false, area: null, dom: null }; };
    var state = blank();
    var lots = [].slice.call(root.querySelectorAll('[data-lot]'));
    var cells = [].slice.call(root.querySelectorAll('.cell[data-sp]'));
    var houses = [].slice.call(root.querySelectorAll('.house'));
    var empty = root.querySelector('.empty');
    var counter = root.querySelector('[data-count]');
    var countline = root.querySelector('[data-countline]');
    var domchip = root.querySelector('[data-domchip]');
    var list = root.querySelector('#view-list .grid-lots');

    function spOk(d) {
      if (!state.sp) return true;
      // sp=23 — 2 или 3 спальни, sp=34 — 3 или 4
      return state.sp.split('').some(function (v) { return d.sp === v || d.spAlt === v; });
    }

    function match(el) {
      var d = el.dataset, s = parseFloat(d.s);
      if (!spOk(d)) return false;
      if (state.fl && d.fl !== state.fl) return false;
      if (state.terr && d.terr !== '1') return false;
      if (state.promo && d.st !== 'promo') return false;
      if (state.dom && d.dom !== state.dom) return false;
      if (state.area === 'a1' && s >= 50) return false;
      if (state.area === 'a2' && (s < 50 || s >= 65)) return false;
      if (state.area === 'a3' && (s < 65 || s >= 79.5)) return false;
      if (state.area === 'a4' && s < 79.5) return false;
      return true;
    }

    function apply() {
      var n = 0;
      lots.forEach(function (el) { var ok = match(el); el.hidden = !ok; if (ok) n++; });
      cells.forEach(function (el) { el.classList.toggle('is-dim', !match(el)); });
      houses.forEach(function (h) { h.classList.toggle('is-active', !!state.dom && h.dataset.dom === state.dom); });
      root.querySelectorAll('.gp-house').forEach(function (g) { g.classList.toggle('is-active', g.dataset.dom === state.dom); });
      if (counter) counter.textContent = n;
      // число квартир по акции не показываем
      if (countline) countline.hidden = state.promo;
      if (domchip) { domchip.hidden = !state.dom; domchip.textContent = state.dom ? 'Дом ' + state.dom + ' ×' : ''; }
      if (empty) empty.classList.toggle('is-on', n === 0);
    }

    function press() {
      root.querySelectorAll('[data-f]').forEach(function (x) {
        var k = x.dataset.f;
        x.setAttribute('aria-pressed', (k === 'terr' || k === 'promo') ? state[k] : x.dataset.v === state[k]);
      });
    }

    root.querySelectorAll('[data-f]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.dataset.f, val = b.dataset.v;
        if (key === 'terr' || key === 'promo') state[key] = !state[key];
        else state[key] = state[key] === val ? null : val;
        press();
        apply();
      });
    });

    function pickHouse(g) {
      state.dom = state.dom === g.dataset.dom ? null : g.dataset.dom;
      apply();
      if (!state.dom) return;
      var housesView = root.querySelector('[data-view="houses"]').getAttribute('aria-pressed') === 'true';
      var target = housesView ? root.querySelector('.house[data-dom="' + g.dataset.dom + '"]') : root.querySelector('.sh-bar');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: housesView ? 'center' : 'start' });
    }
    root.querySelectorAll('.gp-house').forEach(function (g) {
      g.addEventListener('click', function () { pickHouse(g); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickHouse(g); } });
    });
    if (domchip) domchip.addEventListener('click', function () { state.dom = null; apply(); });

    root.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        root.querySelector('#view-list').hidden = b.dataset.view !== 'list';
        root.querySelector('#view-houses').hidden = b.dataset.view !== 'houses';
      });
    });

    var sort = root.querySelector('[data-sort]');
    if (sort && list) sort.addEventListener('change', function () {
      var v = sort.value;
      lots.slice().sort(function (a, b) {
        if (v === 's') return parseFloat(a.dataset.s) - parseFloat(b.dataset.s);
        var d = parseInt(a.dataset.price, 10) - parseInt(b.dataset.price, 10);
        return v === 'p-asc' ? d : -d;
      }).forEach(function (el) { list.appendChild(el); });
    });

    var reset = root.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', function () { state = blank(); press(); apply(); });

    // Фильтр из адреса: kvartiry.html?sp=23, ?dom=16, ?promo=1
    var q = new URLSearchParams(location.search);
    ['sp', 'fl', 'dom'].forEach(function (k) { if (q.get(k)) state[k] = q.get(k); });
    if (q.get('promo') || location.hash === '#promo') state.promo = true;
    press();
    apply();
  }

  // ---------- Видео: плеер Kinescope грузится только по нажатию ----------
  document.querySelectorAll('[data-kinescope]').forEach(function (b) {
    b.addEventListener('click', function () {
      var box = document.createElement('div');
      box.className = b.className + ' is-playing';
      var f = document.createElement('iframe');
      f.src = 'https://kinescope.io/embed/' + b.dataset.kinescope + '?autoplay=1';
      f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      f.setAttribute('allowfullscreen', '');
      f.title = b.getAttribute('aria-label');
      box.appendChild(f);
      b.parentNode.replaceChild(box, b);
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
    // свайп на телефоне
    var x0 = null, main = gal.querySelector('.gal__main');
    main.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }
})();
