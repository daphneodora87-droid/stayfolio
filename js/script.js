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
const expBgImg = document.getElementById('expBgImg');
const expPhoto = document.getElementById('expPhoto');
const expBadge = document.getElementById('expBadge');
const expName = document.getElementById('expName');
const expPrice = document.getElementById('expPrice');
const expDesc = document.getElementById('expDesc');

thumbs.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    thumbs.forEach((t) => t.classList.remove('active'));
    thumb.classList.add('active');

    // 배경은 크로스페이드, 우측 이미지는 와이프 효과로 전환
    expBgImg.style.opacity = 0;
    setTimeout(() => {
      expBgImg.src = thumb.dataset.bg;
      expBgImg.style.opacity = 1;

      expPhoto.src = thumb.dataset.bg;
      expPhoto.classList.remove('wipe');
      void expPhoto.offsetWidth; // 애니메이션 재시작 트릭
      expPhoto.classList.add('wipe');
    }, 300);

    // 텍스트 정보 갱신
    expBadge.textContent = thumb.dataset.badge;
    expName.textContent = thumb.dataset.name;
    expPrice.innerHTML = thumb.dataset.price;
    expDesc.innerHTML = thumb.dataset.desc;
  });
});

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
