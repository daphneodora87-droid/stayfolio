/* =====================================================================
   STAYFOLIO 예약 - 캘린더 날짜 선택 + 금액 계산 (booking.js)
   ===================================================================== */
(function () {
  const root = document.getElementById('bookingBox');
  if (!root) return;

  const PRICE = parseInt(root.dataset.price || '0', 10);
  const STAY_NAME = root.dataset.name || '';
  const STAY_IMG = root.dataset.img || '';
  const STAY_LOC = root.dataset.loc || '';
  const STAY_BADGE = root.dataset.badge || '';

  const trigger = document.getElementById('dateTrigger');
  const calEl = document.getElementById('calendar');
  const summaryEl = document.getElementById('priceSummary');
  const stepper = document.getElementById('guestStepper');
  const submitBtn = document.getElementById('bookSubmit');

  // 인원 스테퍼 (성인 / 아동)
  const GUEST_MIN = { adult: 1, child: 0 };
  const GUEST_MAX = { adult: 10, child: 6 };
  const guests = {
    adult: parseInt(stepper?.dataset.adult || '2', 10),
    child: parseInt(stepper?.dataset.child || '0', 10),
  };
  const valEls = {
    adult: document.getElementById('adultVal'),
    child: document.getElementById('childVal'),
  };

  function guestsLabel() {
    let s = `성인 ${guests.adult}명`;
    if (guests.child > 0) s += ` · 아동 ${guests.child}명`;
    return s;
  }

  function syncStepper() {
    ['adult', 'child'].forEach((k) => {
      if (valEls[k]) valEls[k].textContent = guests[k];
      stepper.querySelectorAll(`.step-btn[data-target="${k}"]`).forEach((b) => {
        const act = b.dataset.act;
        b.disabled = act === 'dec' ? guests[k] <= GUEST_MIN[k] : guests[k] >= GUEST_MAX[k];
      });
    });
  }

  if (stepper) {
    stepper.querySelectorAll('.step-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.target;
        const delta = btn.dataset.act === 'inc' ? 1 : -1;
        const next = Math.min(GUEST_MAX[k], Math.max(GUEST_MIN[k], guests[k] + delta));
        guests[k] = next;
        syncStepper();
      });
    });
    syncStepper();
  }

  const WON = (n) => '₩ ' + n.toLocaleString('ko-KR');
  const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let checkIn = null;
  let checkOut = null;

  // 캘린더 토글
  trigger.addEventListener('click', () => calEl.classList.toggle('open'));

  function nights() {
    if (!checkIn || !checkOut) return 0;
    return Math.round((checkOut - checkIn) / 86400000);
  }

  function render() {
    const y = view.getFullYear();
    const m = view.getMonth();
    const first = new Date(y, m, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDisabled = y === today.getFullYear() && m === today.getMonth();

    let html = `
      <div class="cal-head">
        <button type="button" id="calPrev" ${prevDisabled ? 'disabled' : ''}>‹</button>
        <span class="cal-title">${y}년 ${m + 1}월</span>
        <button type="button" id="calNext">›</button>
      </div>
      <div class="cal-grid">
        <div class="dow">일</div><div class="dow">월</div><div class="dow">화</div>
        <div class="dow">수</div><div class="dow">목</div><div class="dow">금</div><div class="dow">토</div>`;

    for (let i = 0; i < startDow; i++) html += `<div class="cal-empty"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const past = date < today;
      let cls = 'cal-day';
      if (past) cls += ' disabled';
      if (sameDay(date, checkIn) && checkOut) cls += ' start';
      else if (sameDay(date, checkOut)) cls += ' end';
      else if (sameDay(date, checkIn) && !checkOut) cls += ' single';
      else if (checkIn && checkOut && date > checkIn && date < checkOut) cls += ' inrange';
      html += `<div class="${cls}" data-date="${ymd(date)}">${d}</div>`;
    }
    html += `</div>`;
    calEl.innerHTML = html;

    document.getElementById('calPrev').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!prevDisabled) { view = new Date(y, m - 1, 1); render(); }
    });
    document.getElementById('calNext').addEventListener('click', (e) => {
      e.stopPropagation();
      view = new Date(y, m + 1, 1);
      render();
    });
    calEl.querySelectorAll('.cal-day:not(.disabled)').forEach((el) => {
      el.addEventListener('click', () => onPick(el.dataset.date));
    });
  }

  function onPick(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    if (!checkIn || (checkIn && checkOut)) {
      checkIn = date;
      checkOut = null;
    } else if (date > checkIn) {
      checkOut = date;
    } else {
      checkIn = date;
      checkOut = null;
    }
    render();
    updateUI();
  }

  function updateUI() {
    if (checkIn && checkOut) {
      trigger.textContent = `${fmt(checkIn)} → ${fmt(checkOut)}`;
      trigger.classList.remove('placeholder');
      const n = nights();
      const subtotal = PRICE * n;
      const fee = Math.round(subtotal * 0.03);
      summaryEl.style.display = 'block';
      summaryEl.innerHTML = `
        <div class="row"><span>${WON(PRICE)} × ${n}박</span><span>${WON(subtotal)}</span></div>
        <div class="row"><span>서비스 수수료</span><span>${WON(fee)}</span></div>
        <div class="row total"><span>총 결제 금액</span><span>${WON(subtotal + fee)}</span></div>`;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    } else {
      if (checkIn) trigger.textContent = `${fmt(checkIn)} → 체크아웃 선택`;
      else { trigger.textContent = '날짜를 선택하세요'; trigger.classList.add('placeholder'); }
      summaryEl.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
    }
  }

  // 예약 진행 → booking.html 로 전달
  submitBtn.addEventListener('click', () => {
    if (!checkIn || !checkOut) {
      calEl.classList.add('open');
      return;
    }
    const params = new URLSearchParams({
      name: STAY_NAME,
      img: STAY_IMG,
      loc: STAY_LOC,
      badge: STAY_BADGE,
      price: String(PRICE),
      checkin: fmt(checkIn),
      checkout: fmt(checkOut),
      nights: String(nights()),
      guests: guestsLabel(),
    });
    location.href = 'booking.html?' + params.toString();
  });

  // 초기 상태
  render();
  updateUI();
})();
