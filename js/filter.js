/* 서브페이지 스테이 목록 지역 필터 + 키워드 검색 */
(function () {
  const btns = document.querySelectorAll('.filter-bar button');
  const cards = document.querySelectorAll('.stay-grid .stay-card');
  const countEl = document.querySelector('.result-count strong');
  const searchInput = document.getElementById('staySearch');
  if (!btns.length) return;

  let region = 'all';
  let keyword = '';

  // 카드별 검색 대상 텍스트(이름 + 지역 뱃지) 미리 추출
  cards.forEach((card) => {
    const name = card.querySelector('h3')?.textContent || '';
    const badge = card.querySelector('.badge')?.textContent || '';
    card.dataset.search = (name + ' ' + badge + ' ' + (card.dataset.region || '')).toLowerCase();
  });

  function apply() {
    let visible = 0;
    cards.forEach((card) => {
      const matchRegion = region === 'all' || card.dataset.region === region;
      const matchKeyword = !keyword || card.dataset.search.includes(keyword);
      const show = matchRegion && matchKeyword;
      card.classList.toggle('hide', !show);
      if (show) visible++;
    });
    if (countEl) countEl.textContent = String(visible);
  }

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      region = btn.dataset.filter;
      apply();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      keyword = searchInput.value.trim().toLowerCase();
      apply();
    });
  }
})();
