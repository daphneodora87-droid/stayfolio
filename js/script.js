// ===================== 헤더 스크롤 효과 =====================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

// ===================== 추천 스테이 지역 필터 =====================
const filterBtns = document.querySelectorAll('.region-filter button');
const stayCards = document.querySelectorAll('.stay-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    stayCards.forEach((card) => {
      const show = filter === 'all' || card.dataset.region === filter;
      card.classList.toggle('hide', !show);
    });
  });
});

// ===================== Stay Experience 썸네일 전환 =====================
const thumbs = document.querySelectorAll('.exp-thumbs li');
const expBg = document.getElementById('expBg');
const expPhoto = document.getElementById('expPhoto');
const expBadge = document.getElementById('expBadge');
const expName = document.getElementById('expName');
const expPrice = document.getElementById('expPrice');
const expDesc = document.getElementById('expDesc');

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    thumbs.forEach((t) => t.classList.remove('active'));
    thumb.classList.add('active');

    // 배경은 크로스페이드 + 블러(뿌옇게), 우측 이미지는 3D 플립 효과로 전환
    expBg.style.opacity = 0;
    expBg.classList.add('switching');
    setTimeout(() => {
      expBg.style.backgroundImage = `url('${thumb.dataset.bg}')`;
      expBg.style.opacity = 1;
      expBg.classList.remove('switching');

      expPhoto.src = thumb.dataset.bg;
      expPhoto.classList.remove('flip');
      void expPhoto.offsetWidth; // 애니메이션 재시작 트릭
      expPhoto.classList.add('flip');
    }, 300);

    // 텍스트 정보 갱신
    expBadge.textContent = thumb.dataset.badge;
    expName.textContent = thumb.dataset.name;
    expPrice.innerHTML = thumb.dataset.price;
    expDesc.innerHTML = thumb.dataset.desc;
  });
});

// ===================== Stay Stories 게시글 hover → 이미지 크로스페이드 =====================
const storyItems = document.querySelectorAll('.stories-list li');
const storySlides = document.querySelectorAll('.stories-slide');

function setStorySlide(idx) {
  storySlides.forEach((slide, i) => {
    slide.classList.toggle('active', i === idx);
  });
}

storyItems.forEach((li, i) => {
  li.addEventListener('mouseenter', () => setStorySlide(i));
});

// 목록에서 벗어나면 첫 번째 이미지로 복귀
const storiesList = document.querySelector('.stories-list');
if (storiesList) {
  storiesList.addEventListener('mouseleave', () => setStorySlide(0));
}

// ===================== 히어로 슬라이더 (영상 + 이미지 2장, 크로스페이드) =====================
const heroSlides = document.querySelectorAll('.hero-slide');
const indicatorCurrent = document.querySelector('.hero-indicator .current');
const indicatorBar = document.querySelector('.hero-indicator .bar i');
let heroIndex = 0;
const heroTotal = heroSlides.length;

setInterval(() => {
  heroSlides[heroIndex].classList.remove('active');
  heroIndex = (heroIndex + 1) % heroTotal;
  heroSlides[heroIndex].classList.add('active');

  // 인디케이터 갱신
  indicatorCurrent.textContent = String(heroIndex + 1).padStart(2, '0');
  indicatorBar.style.width = ((heroIndex + 1) / heroTotal) * 100 + '%';

  // 첫 번째 슬라이드(영상)로 돌아오면 처음부터 재생
  const video = heroSlides[0];
  if (heroIndex === 0 && video.tagName === 'VIDEO') {
    video.currentTime = 0;
    video.play();
  }
}, 6000);

// ===================== 인터랙션 효과 (fx-*) =====================

// [fx-reveal] 스크롤 등장: 지정한 요소들이 화면에 들어오면 떠오름
(function fxReveal() {
  const targets = [
    '#curated .sec-head',
    '#curated .stay-card',
    '#experience .exp-inner',
    '#destinations .dest-text',
    '#destinations .dest-list li',
    '#stories .stories-text',
    '#stories .stories-frame',
    '#stories .stories-list li',
  ];
  const els = [];
  targets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => els.push(el));
  });
  els.forEach((el) => el.classList.add('fx-reveal'));

  // 같은 그룹 내에서의 순서를 저장(스태거용) — 인라인 delay 대신 등장 타이밍으로 처리
  els.forEach((el) => {
    const siblings = Array.from(el.parentElement.children).filter((c) =>
      c.classList.contains('fx-reveal')
    );
    el.dataset.fxIndex = String(Math.max(0, siblings.indexOf(el)));
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.fxIndex || '0', 10);
          setTimeout(() => entry.target.classList.add('is-in'), idx * 80);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
})();

// [fx-hero-parallax] 히어로 패럴럭스: 배경은 고정, 스크롤 시 텍스트만 밀림 + 페이드
(function fxHeroParallax() {
  const text = document.querySelector('#hero .hero-text');
  if (!text) return;
  const onScroll = () => {
    const y = window.scrollY;
    text.style.transform = `translateY(${y * 0.15}px)`;
    text.style.opacity = String(Math.max(0, 1 - y / 500));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// [fx-dest-tilt] 데스티네이션 틸트: 마우스 위치 따라 카드가 기울어짐
(function fxDestTilt() {
  const cards = document.querySelectorAll('#destinations .dest-list li');
  const MAX = 8; // 최대 기울기(deg)
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
    // 클릭 시 스테이 찾기 페이지로 이동
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      location.href = 'find-stay.html';
    });
  });
})();
