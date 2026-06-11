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

  // 카드별 검색 대상 텍스트(이름 + 지역 뱃지 + 무드 + 한글 동의어) 미리 추출
  const KO = {
    jeju: '제주', gangneung: '강릉', yangyang: '양양', seoul: '서울',
    busan: '부산', gyeongju: '경주', namhae: '남해',
    ocean: '오션뷰 바다', forest: '숲 숲속 마운틴', city: '시티 도심',
    private: '독채', minimal: '미니멀', pool: '풀빌라 수영장', pet: '반려동물 펫'
  };
  cards.forEach((card) => {
    const name = card.querySelector('h3')?.textContent || '';
    const badge = card.querySelector('.badge')?.textContent || '';
    const keys = ((card.dataset.region || '') + ' ' + (card.dataset.mood || '')).split(' ').filter(Boolean);
    const ko = keys.map((k) => KO[k] || '').join(' ');
    card.dataset.search = (name + ' ' + badge + ' ' + keys.join(' ') + ' ' + ko).toLowerCase();
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

  // 검색 버튼 클릭 시 상세 필터 접기
  const searchGo = panel.closest('.search-panel')?.querySelector('.search-go');
  if (searchGo && filtersBox) {
    searchGo.addEventListener('click', () => {
      filtersBox.classList.remove('open');
      if (toggleBtn) toggleBtn.classList.remove('open');
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

  // 검색 페이지: 검색/필터 전에는 결과를 숨기고 추천 박스만 노출
  const isSearchPage = !!document.querySelector('.search-hero');
  const noResultEl = document.getElementById('noResult');
  const nrTitle = document.getElementById('nrTitle');
  const nrSub = document.getElementById('nrSub');
  const resultCountP = document.querySelector('.result-count');

  function apply() {
    const region = activeValues(regionGroup);
    const mood = activeValues(moodGroup);
    const price = activeValues(priceGroup)[0];
    const cap = activeValues(guestGroup)[0];

    // 검색 페이지 초기 상태: 조건이 하나도 없으면 결과 숨김 + 안내
    const hasCriteria = !!keyword || panel.querySelectorAll('.chip.active').length > 0;
    if (isSearchPage && !hasCriteria) {
      cards.forEach((card) => card.classList.add('hide'));
      if (resultCountP) resultCountP.style.display = 'none';
      if (noResultEl) {
        if (nrTitle) nrTitle.textContent = '어떤 머무름을 찾고 계세요?';
        if (nrSub) nrSub.textContent = '검색어를 입력하거나, 아래 취향에서 시작해 보세요.';
        noResultEl.classList.add('show');
      }
      const fc = panel.querySelectorAll('.chip.active').length;
      if (filterCountEl) filterCountEl.textContent = fc ? `${fc}개 선택됨` : '';
      return;
    }
    if (resultCountP) resultCountP.style.display = '';
    if (nrTitle) nrTitle.textContent = '조건에 맞는 스테이가 없어요';
    if (nrSub) nrSub.textContent = '필터를 조금 풀어보시거나, 아래 취향에서 다시 시작해 보세요.';

    let visible = 0;
    cards.forEach((card) => {
      const cr = card.dataset.region;
      const cm = (card.dataset.mood || '').split(' ');
      const cp = card.dataset.price;
      const cc = Number(card.dataset.cap || 0);

      let ok = true;
      if (keyword) {
        // 띄어쓰기로 나눈 모든 단어가 포함돼야 매칭 (예: "제주 오션뷰")
        const tokens = keyword.split(/\s+/).filter(Boolean);
        if (!tokens.every((t) => (card.dataset.search || '').includes(t))) ok = false;
      }
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

    // 결과 0건이면 취향 추천 폴백 노출
    const noResult = document.getElementById('noResult');
    if (noResult) noResult.classList.toggle('show', visible === 0);

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

/* 검색 히어로: 고스트 타이포 - 여행지 이름 타이핑/삭제 반복 */
(function () {
  const el = document.getElementById('ghostType');
  if (!el) return;
  const words = ['JEJU', 'GANGNEUNG', 'YANGYANG', 'SEOUL', 'BUSAN', 'GYEONGJU', 'NAMHAE'];
  let wi = 0, ci = 0, deleting = false;
  function tick() {
    const w = words[wi];
    if (!deleting) {
      ci++;
      el.textContent = w.slice(0, ci);
      if (ci === w.length) { deleting = true; setTimeout(tick, 1700); return; }
      setTimeout(tick, 130);
    } else {
      ci--;
      el.textContent = w.slice(0, ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 450); return; }
      setTimeout(tick, 65);
    }
  }
  tick();
})();

/* 검색 히어로: 인기 검색어 칩 → 검색창 입력 */
(function () {
  const input = document.querySelector('.search-panel .search-bar input');
  if (!input) return;
  document.querySelectorAll('.sh-keywords button').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.q || '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  });
})();

/* 클릭 유도 4분할 카드: 타일 클릭 → 해당 필터 칩 토글 */
(function () {
  const panel = document.querySelector('.search-filters');
  if (!panel) return;
  document.querySelectorAll('.promo-quad button.pq-tile').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chip = panel.querySelector(
        '[data-group="' + btn.dataset.group + '"] .chip[data-value="' + btn.dataset.value + '"]'
      );
      if (!chip) return;
      chip.click(); // 기존 필터 로직 그대로 사용
      btn.classList.toggle('on', chip.classList.contains('active'));
    });
  });
})();
