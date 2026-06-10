/* =====================================================================
   STAYFOLIO PRE-ORDER - D-day 계산 · 카드 이동 · 알림 신청 (preorder.js)
   ===================================================================== */
(function () {
  const cards = document.querySelectorAll('.po-featured, .po-card');
  if (!cards.length) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAY = 86400000;

  cards.forEach((card) => {
    // D-day 뱃지 갱신
    const badge = card.querySelector('[data-dday]');
    const openStr = card.dataset.open;
    if (badge && openStr) {
      const open = new Date(openStr);
      const openDay = new Date(open.getFullYear(), open.getMonth(), open.getDate());
      const diff = Math.round((openDay - today) / DAY);

      badge.classList.remove('soon', 'live');
      if (diff > 0) {
        badge.textContent = 'D-' + diff;
        if (diff <= 7) badge.classList.add('soon');
      } else if (diff === 0) {
        badge.textContent = 'D-DAY';
        badge.classList.add('live');
      } else {
        badge.textContent = '예약 오픈';
        badge.classList.add('live');
      }
    }

    // 카드 클릭 시 상세로 이동
    const href = card.dataset.href;
    if (href) {
      card.addEventListener('click', () => { location.href = href; });
    }

    // 알림 신청 (카드 이동과 분리)
    const notify = card.querySelector('.po-notify');
    if (notify) {
      notify.addEventListener('click', (e) => {
        e.stopPropagation();
        if (notify.classList.contains('done')) return;
        notify.classList.add('done');
        notify.innerHTML = '신청 완료 <em>✓</em>';
      });
    }
  });
})();
