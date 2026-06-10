/* =====================================================================
   STAYFOLIO 검색 필터 (지역 · 무드 · 가격 · 인원) - search-filter.js
   ===================================================================== */
(function () {
  const panel = document.querySelector('.search-filters');
  if (!panel) return;

  const cards = document.querySelectorAll('.stay-grid .stay-card');
  const countEl = document.querySelector('.result-count strong');
  const filterCountEl = document.getElementById('filterCount');
  const searchInput = panel.closest('.search-panel')?.querySelector('.search-bar input');
  let keyword = '';

  // 카드별 검색 대상 텍스트(이름 + 지역 뱃지 + 무드) 미리 추출
  cards.forEach((card) => {
    const name = card.querySelector('h3')?.textContent || '';
    const badge = card.querySelector('.badge')?.textContent || '';
    card.dataset.search = (name + ' ' + badge + ' ' + (card.dataset.region || '') + ' ' + (card.dataset.mood || '')).toLowerCase();
  });

  // 필터 토글(펼침/접힘)
  const toggleBtn = document.getElementById('filterToggle');
  const filtersBox = document.getElementById('searchFilters');
  if (toggleBtn && filtersBox) {
    toggleBtn.addEventListener('click', () => {
      const open = filtersBox.classList.toggle('open');
      toggleBtn.classList.toggle('open', open);
    });
  }

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
      if (keyword && !(card.dataset.search || '').includes(keyword)) ok = false;
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

    // 선택된 필터 개수 표시
    const selected = panel.querySelectorAll('.chip.active').length;
    if (filterCountEl) filterCountEl.textContent = selected ? `${selected}개 선택됨` : '';
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

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      keyword = searchInput.value.trim().toLowerCase();
      apply();
    });
  }

  const reset = panel.querySelector('.filter-reset');
  if (reset) {
    reset.addEventListener('click', () => {
      panel.querySelectorAll('.chip.active').forEach((c) => c.classList.remove('active'));
      if (searchInput) { searchInput.value = ''; keyword = ''; }
      apply();
    });
  }

  apply();
})();

/* ===================== 검색 필터 - 날짜 캘린더 ===================== */
(function () {
  const trigger = document.getElementById('searchDateTrigger');
  const calEl = document.getElementById('searchCalendar');
  if (!trigger || !calEl) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let ci = null;
  let co = null;

  const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const same = (a, b) => a && b && a.toDateString() === b.toDateString();

  function render() {
    const y = view.getFullYear();
    const m = view.getMonth();
    const startDow = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const prevOff = y === today.getFullYear() && m === today.getMonth();

    let html = `
      <div class="cal-head">
        <button type="button" id="sCalPrev" ${prevOff ? 'disabled' : ''}>‹</button>
        <span class="cal-title">${y}년 ${m + 1}월</span>
        <button type="button" id="sCalNext">›</button>
      </div>
      <div class="cal-grid">
        <div class="dow">일</div><div class="dow">월</div><div class="dow">화</div>
        <div class="dow">수</div><div class="dow">목</div><div class="dow">금</div><div class="dow">토</div>`;
    for (let i = 0; i < startDow; i++) html += `<div class="cal-empty"></div>`;
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      let cls = 'cal-day';
      if (date < today) cls += ' disabled';
      if (same(date, ci) && co) cls += ' start';
      else if (same(date, co)) cls += ' end';
      else if (same(date, ci) && !co) cls += ' single';
      else if (ci && co && date > ci && date < co) cls += ' inrange';
      html += `<div class="${cls}" data-date="${ymd(date)}">${d}</div>`;
    }
    html += `</div>`;
    calEl.innerHTML = html;

    document.getElementById('sCalPrev').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!prevOff) { view = new Date(y, m - 1, 1); render(); }
    });
    document.getElementById('sCalNext').addEventListener('click', (e) => {
      e.stopPropagation();
      view = new Date(y, m + 1, 1); render();
    });
    calEl.querySelectorAll('.cal-day:not(.disabled)').forEach((el) => {
      el.addEventListener('click', () => pick(el.dataset.date));
    });
  }

  function pick(str) {
    const date = new Date(str + 'T00:00:00');
    if (!ci || (ci && co)) { ci = date; co = null; }
    else if (date > ci) { co = date; }
    else { ci = date; co = null; }
    render();
    update();
  }

  function update() {
    if (ci && co) {
      trigger.textContent = `${fmt(ci)} → ${fmt(co)}`;
      trigger.classList.remove('placeholder');
    } else if (ci) {
      trigger.textContent = `${fmt(ci)} → 체크아웃 선택`;
      trigger.classList.remove('placeholder');
    } else {
      trigger.textContent = '체크인 · 체크아웃 선택';
      trigger.classList.add('placeholder');
    }
  }

  // 필터 초기화 시 날짜도 리셋
  const reset = document.querySelector('.filter-reset');
  if (reset) {
    reset.addEventListener('click', () => {
      ci = null; co = null;
      calEl.classList.remove('open');
      render();
      update();
    });
  }

  render();
})();
