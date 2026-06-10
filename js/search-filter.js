/* =====================================================================
   STAYFOLIO 검색 필터 (지역 · 무드 · 가격 · 인원) - search-filter.js
   ===================================================================== */
(function () {
  const panel = document.querySelector('.search-filters');
  if (!panel) return;

  const cards = document.querySelectorAll('.stay-grid .stay-card');
  const countEl = document.querySelector('.result-count strong');

  const regionGroup = panel.querySelector('[data-group="region"]');
  const moodGroup = panel.querySelector('[data-group="mood"]');
  const priceGroup = panel.querySelector('[data-group="price"]');
  const guestGroup = panel.querySelector('[data-group="guests"]');

  const activeValues = (group) =>
    group ? Array.from(group.querySelectorAll('.chip.active')).map((c) => c.dataset.value) : [];

  function priceInRange(price, range) {
    const p = Number(price);
    if (range === 'u30') return p < 300000;
    if (range === '30-40') return p >= 300000 && p < 400000;
    if (range === '40-50') return p >= 400000 && p < 500000;
    if (range === 'o50') return p >= 500000;
    return true;
  }

  function apply() {
    const region = activeValues(regionGroup);
    const mood = activeValues(moodGroup);
    const price = activeValues(priceGroup)[0];
    const cap = activeValues(guestGroup)[0];

    let visible = 0;
    cards.forEach((card) => {
      const cr = card.dataset.region;
      const cm = (card.dataset.mood || '').split(' ');
      const cp = card.dataset.price;
      const cc = Number(card.dataset.cap || 0);

      let ok = true;
      if (region.length && !region.includes(cr)) ok = false;
      if (mood.length && !mood.some((m) => cm.includes(m))) ok = false;
      if (price && !priceInRange(cp, price)) ok = false;
      if (cap) {
        const min = cap === 'g12' ? 1 : cap === 'g34' ? 3 : 5;
        if (cc < min) ok = false;
      }
      card.classList.toggle('hide', !ok);
      if (ok) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
  }

  panel.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.closest('.filter-group');
      const multi = group.dataset.multi === 'true';
      if (multi) {
        chip.classList.toggle('active');
      } else {
        const wasActive = chip.classList.contains('active');
        group.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
        if (!wasActive) chip.classList.add('active');
      }
      apply();
    });
  });

  const reset = panel.querySelector('.filter-reset');
  if (reset) {
    reset.addEventListener('click', () => {
      panel.querySelectorAll('.chip.active').forEach((c) => c.classList.remove('active'));
      apply();
    });
  }

  apply();
})();
