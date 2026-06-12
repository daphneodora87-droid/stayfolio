/* =====================================================================
   STAYFOLIO PRE-ORDER - D-day 계산 · 카드 이동 · 알림 신청 (preorder.js)
   ===================================================================== */
(function () {
  // 라인업 그리드: 오픈 날짜순 정렬
  const grid = document.querySelector('.po-grid');
  if (grid) {
    [...grid.children]
      .sort((a, b) => new Date(a.dataset.open) - new Date(b.dataset.open))
      .forEach((el) => grid.appendChild(el));

    // PC: Shift 없이 마우스 휠로 가로 스크롤 (부드러운 관성 이동)
    let target = null;
    let raf = null;
    function glide() {
      const diff = target - grid.scrollLeft;
      if (Math.abs(diff) < 0.6) {
        grid.scrollLeft = target;
        raf = null;
        target = null;
        return;
      }
      grid.scrollLeft += diff * 0.14;
      raf = requestAnimationFrame(glide);
    }
    grid.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return; // 트랙패드 가로 제스처는 그대로
      const max = grid.scrollWidth - grid.clientWidth;
      const from = target === null ? grid.scrollLeft : target;
      const next = Math.max(0, Math.min(max, from + e.deltaY * 1.6));
      const atStart = grid.scrollLeft <= 0;
      const atEnd = grid.scrollLeft >= max - 1;
      if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
        e.preventDefault();
        target = next;
        if (!raf) raf = requestAnimationFrame(glide);
      }
    }, { passive: false });

    // 월 네비게이터: 해당 월 마커로 스크롤
    document.querySelectorAll('.po-nav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mm = String(btn.dataset.month).padStart(2, '0');
        const marker = [...grid.querySelectorAll('.po-month')].find((el) =>
          (el.dataset.open || '').includes('-' + mm + '-')
        );
        if (!marker) return;
        const left =
          marker.getBoundingClientRect().left -
          grid.getBoundingClientRect().left +
          grid.scrollLeft - 6;
        target = null; // 휠 관성 이동과 충돌 방지
        grid.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
      });
    });

    // 월 네비게이터: 월별 스테이 개수 점 표시
    const navBtns = [...document.querySelectorAll('.po-nav button')];
    navBtns.forEach((btn) => {
      const m = Number(btn.dataset.month);
      const n = [...grid.querySelectorAll('.po-card')].filter(
        (c) => new Date(c.dataset.open).getMonth() + 1 === m
      ).length;
      if (n > 0) {
        const dots = document.createElement('i');
        dots.className = 'dots';
        dots.textContent = '•'.repeat(n);
        btn.appendChild(dots);
      }
    });

    // 스크롤 스파이: 슬라이더 위치에 맞춰 현재 월 자동 하이라이트
    if (navBtns.length) {
      const markers = [...grid.querySelectorAll('.po-month')];
      function updateNav() {
        const gridLeft = grid.getBoundingClientRect().left;
        const anchor = grid.clientWidth * 0.3; // 화면 왼쪽 30% 지점 기준
        let current = null;
        markers.forEach((mk) => {
          const left = mk.getBoundingClientRect().left - gridLeft;
          if (left <= anchor) current = new Date(mk.dataset.open).getMonth() + 1;
        });
        if (current === null && markers.length) {
          current = new Date(markers[0].dataset.open).getMonth() + 1;
        }
        navBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.month) === current));
      }
      let spyRaf = null;
      grid.addEventListener('scroll', () => {
        if (spyRaf) return;
        spyRaf = requestAnimationFrame(() => { spyRaf = null; updateNav(); });
      }, { passive: true });
      updateNav();
    }
  }

  const cards = document.querySelectorAll('.po-featured, .po-card');

  const perksAction = document.querySelector('.po-perks-action');
  if (perksAction) {
    perksAction.addEventListener('click', () => {
      if (perksAction.classList.contains('done')) return;
      perksAction.classList.add('done');
      perksAction.innerHTML = '전체 알림 신청 완료 <em>✓</em>';
    });
  }

  if (!cards.length) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAY = 86400000;

  // 포트폴리오 모드: 오픈일이 지난 카드는 날짜를 내일로 자동 밀기
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  cards.forEach((card) => {
    const openStr = card.dataset.open;
    if (!openStr) return;
    const open = new Date(openStr);
    const openDay = new Date(open.getFullYear(), open.getMonth(), open.getDate());
    const diff = Math.round((openDay - today) / DAY);
    if (diff >= 0) return; // 아직 오픈 전이면 그대로 유지

    const tomorrow = new Date(today.getTime() + DAY);
    const hhmm = openStr.includes('T') ? openStr.split('T')[1] : '11:00';
    const yy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    card.dataset.open = `${yy}-${mm}-${dd}T${hhmm}`;

    const strong = card.querySelector('.po-open-mini strong');
    if (strong) {
      if (card.classList.contains('po-featured')) {
        strong.textContent = `${yy}.${mm}.${dd} (${DAY_NAMES[tomorrow.getDay()]}) ${hhmm}`;
      } else {
        strong.textContent = `${yy}.${mm}.${dd} ${hhmm}`;
      }
    }
  });

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
        badge.textContent = '예약 진행 중';
        badge.classList.add('live');

        // 오픈 완료 상태(오픈 당일~다음날): 상태칩 · 버튼을 예약 모드로 전환
        card.classList.add('is-open');
        const status = card.querySelector('.po-status');
        if (status) {
          status.textContent = 'NOW OPEN';
          status.className = 'po-status live';
        }
        const mini = card.querySelector('.po-open-mini');
        if (mini) mini.innerHTML = '지금 바로 예약할 수 있어요';
        const notifyBtn = card.querySelector('.po-notify');
        if (notifyBtn) {
          notifyBtn.classList.add('book');
          notifyBtn.innerHTML = '지금 예약하기 <em>→</em>';
        }
      }
    }

    // 카드 클릭 시 상세로 이동
    const href = card.dataset.href;
    if (href) {
      card.addEventListener('click', () => { location.href = href; });
    }

    // 알림 신청 (카드 이동과 분리) / 오픈된 스테이는 예약으로 이동
    const notify = card.querySelector('.po-notify');
    if (notify) {
      notify.addEventListener('click', (e) => {
        e.stopPropagation();
        if (notify.classList.contains('book')) {
          location.href = card.dataset.href || 'stay-detail.html';
          return;
        }
        if (notify.classList.contains('done')) return;
        notify.classList.add('done');
        notify.innerHTML = '신청 완료 <em>✓</em>';
      });
    }
  });
})();
