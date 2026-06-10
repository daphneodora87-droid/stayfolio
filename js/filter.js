/* 서브페이지 스테이 목록 지역 필터 */
(function () {
  const btns = document.querySelectorAll('.filter-bar button');
  const cards = document.querySelectorAll('.stay-grid .stay-card');
  const countEl = document.querySelector('.result-count strong');
  if (!btns.length) return;

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      btns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.region === filter;
        card.classList.toggle('hide', !show);
        if (show) visible++;
      });
      if (countEl) countEl.textContent = String(visible);
    });
  });
})();
