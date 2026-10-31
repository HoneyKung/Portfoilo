/* Language menu: close on Esc or outside click (it is a <details>, so it works without JS too). */
(function () {
  var menus = [].slice.call(document.querySelectorAll('details.lang-menu'));
  if (!menus.length) return;
  document.addEventListener('click', function (e) {
    menus.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    menus.forEach(function (d) { if (d.open) { d.open = false; d.querySelector('summary').focus(); } });
  });
})();
/* Click-to-enlarge for content images. No dependencies. */
(function () {
  var imgs = [].slice.call(document.querySelectorAll('main figure img'));
  if (!imgs.length) return;
  var th = document.documentElement.lang === 'th';
  var L = th ? { close: 'ปิด', prev: 'ภาพก่อนหน้า', next: 'ภาพถัดไป', open: 'คลิกเพื่อขยายภาพ' }
             : { close: 'Close', prev: 'Previous image', next: 'Next image', open: 'Click to enlarge' };

  var ov = document.createElement('div');
  ov.className = 'lb';
  ov.hidden = true;
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.innerHTML =
    '<button type="button" class="lb-btn lb-x" aria-label="' + L.close + '">&times;</button>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="' + L.prev + '">&#8249;</button>' +
    '<figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-btn lb-next" aria-label="' + L.next + '">&#8250;</button>' +
    '<p class="lb-count" aria-live="polite"></p>';
  document.body.appendChild(ov);

  var big = ov.querySelector('img'), cap = ov.querySelector('figcaption'),
      count = ov.querySelector('.lb-count'), cur = 0, lastFocus = null;
  var multi = imgs.length > 1;
  ov.classList.toggle('single', !multi);

  function show(n) {
    cur = (n + imgs.length) % imgs.length;
    var src = imgs[cur];
    big.src = src.currentSrc || src.src;
    big.alt = src.alt || '';
    big.classList.toggle('pixel', src.classList.contains('pixel'));
    var fig = src.closest('figure'), fc = fig && fig.querySelector('figcaption');
    cap.textContent = fc ? fc.textContent.trim() : (src.alt || '');
    count.textContent = multi ? (cur + 1) + ' / ' + imgs.length : '';
  }
  function open(n) {
    lastFocus = document.activeElement;
    show(n);
    ov.hidden = false;
    document.documentElement.classList.add('lb-open');
    ov.querySelector('.lb-x').focus();
  }
  function close() {
    ov.hidden = true;
    big.removeAttribute('src');
    document.documentElement.classList.remove('lb-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  imgs.forEach(function (el, n) {
    el.classList.add('zoomable');
    el.setAttribute('tabindex', '0');
    el.setAttribute('title', L.open);
    el.addEventListener('click', function () { open(n); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(n); }
    });
  });

  ov.querySelector('.lb-x').addEventListener('click', close);
  ov.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
  ov.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
  ov.addEventListener('click', function (e) {
    if (e.target === ov || e.target.classList.contains('lb-fig')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (ov.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && multi) show(cur - 1);
    else if (e.key === 'ArrowRight' && multi) show(cur + 1);
  });

  var x0 = null;
  ov.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  ov.addEventListener('touchend', function (e) {
    if (x0 === null || !multi) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
