const HERO_MOTION_ENABLED = false;

function initialiseIntro() {
  const intro = document.querySelector('.intro');
  const video = document.querySelector('.intro__video');
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!intro || !video) {
    root.classList.remove('intro-active');
    return;
  }

  let revealed = false;
  let revealTimer;

  function reveal(duration) {
    if (revealed) return;
    revealed = true;
    clearTimeout(revealTimer);
    root.style.setProperty('--intro-fade-duration', `${duration}ms`);
    intro.style.setProperty('--intro-fade-duration', `${duration}ms`);
    root.classList.add('intro-revealing');

    window.setTimeout(() => {
      root.classList.remove('intro-active', 'intro-revealing');
      intro.remove();
    }, duration);
  }

  video.addEventListener('error', () => reveal(220), { once: true });

  if (reducedMotion) {
    reveal(160);
    return;
  }

  revealTimer = window.setTimeout(() => reveal(1350), 2900);
  window.setTimeout(() => reveal(220), 5000);

  const playback = video.play();
  if (playback) {
    playback.catch(() => reveal(220));
  }
}

initialiseIntro();

function initialiseHeroMotion() {
  if (!HERO_MOTION_ENABLED || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const hero = document.querySelector('.hero');
  const background = document.querySelector('.hero__background');
  const badge = document.querySelector('.hero__badge');

  function resetParallax() {
    background.style.transform = '';
    badge.style.transform = '';
  }

  function moveParallax(event) {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    background.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0) scale(1.015)`;
    badge.style.transform = `translate3d(${x * 7}px, ${y * 6}px, 0)`;
  }

  hero.addEventListener('pointermove', moveParallax);
  hero.addEventListener('pointerleave', resetParallax);
}

initialiseHeroMotion();

const about = document.querySelector('.about');
const aboutPhoto = document.querySelector('.about__photo');
const aboutPhotoHitbox = document.querySelector('.about__photo-hitbox');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (about) {
  const aboutObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        about.classList.add('is-visible');
        aboutObserver.unobserve(about);
      }
    },
    { threshold: 0.16 }
  );

  aboutObserver.observe(about);
}

function resetAboutPhoto() {
  aboutPhoto.style.transform = '';
}

function moveAboutPhoto(event) {
  if (reducedMotion.matches || window.matchMedia('(max-width: 700px)').matches) return;

  const bounds = aboutPhotoHitbox.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;

  aboutPhoto.style.transform = `translate3d(${x * 7}px, ${y * 7}px, 0)`;
}

if (aboutPhoto && aboutPhotoHitbox) {
  aboutPhotoHitbox.addEventListener('pointermove', moveAboutPhoto);
  aboutPhotoHitbox.addEventListener('pointerleave', resetAboutPhoto);
}

const brandingChapter = document.querySelector('.branding-chapter');

if (brandingChapter) {
  const brandingObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        brandingChapter.classList.add('is-visible');
        brandingObserver.unobserve(brandingChapter);
      }
    },
    { threshold: 0.16 }
  );

  brandingObserver.observe(brandingChapter);
}
