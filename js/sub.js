/* =====================================================================
   STAYFOLIO 서브페이지 공통 스크립트 (sub.js)
   ===================================================================== */

// 헤더 스크롤 시 진하게
const subHeader = document.getElementById('header');
if (subHeader) {
  window.addEventListener('scroll', () => {
    subHeader.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// [스크롤 등장] 메인과 동일한 fx-reveal (있을 때만)
(function fxRevealSub() {
  const els = document.querySelectorAll('.fx-reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
})();

// [문의 탭] contact 페이지 탭 전환
(function contactTabs() {
  const tabs = document.querySelectorAll('.contact-tabs button');
  const panels = document.querySelectorAll('.contact-panel');
  if (!tabs.length) return;

  function activate(id) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === id));
    panels.forEach((p) => p.classList.toggle('active', p.id === id));
  }
  tabs.forEach((t) => t.addEventListener('click', () => activate(t.dataset.tab)));

  // 해시(#partner 등)로 진입 시 해당 탭 활성화
  const hash = location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) activate(hash);
})();

// [폼 제출] 데모용 - 실제 전송 대신 안내
document.querySelectorAll('form[data-demo]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('데모 페이지입니다. 실제 전송은 이루어지지 않습니다.');
  });
});

// [스테이 상세] 썸네일 클릭 시 메인 이미지 교체
(function detailGallery() {
  const main = document.getElementById('galleryMain');
  const thumbs = document.querySelectorAll('.detail-thumbs img');
  if (!main || !thumbs.length) return;
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      main.src = thumb.src;
    });
  });
})();
