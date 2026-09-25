const HERO_MOTION_ENABLED = false;

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

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
    if (duration < 500) root.classList.add('intro-fallback');
    root.style.setProperty('--intro-fade-duration', `${duration}ms`);
    intro.style.setProperty('--intro-fade-duration', `${duration}ms`);
    root.classList.add('intro-revealing');

    window.setTimeout(() => {
      root.classList.remove('intro-active', 'intro-revealing', 'intro-fallback');
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
  if (reducedMotion.matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const bounds = aboutPhotoHitbox.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;

  aboutPhoto.style.transform = `translate3d(${x * 7}px, ${y * 7}px, 0)`;
}

if (aboutPhoto && aboutPhotoHitbox) {
  aboutPhotoHitbox.addEventListener('pointermove', moveAboutPhoto);
  aboutPhotoHitbox.addEventListener('pointerleave', resetAboutPhoto);
}

function initialiseHeroAboutScroll() {
  const hero = document.querySelector('.hero');
  const heroHeader = hero?.querySelector('.hero-header');
  const transitionScene = document.querySelector('.hero-about-scene');
  const aboutSection = document.querySelector('.about');
  const aboutScene = document.querySelector('.about-scroll-scene');
  const brandingSection = document.querySelector('.branding-chapter');
  const portfolioPages = [...document.querySelectorAll('.portfolio-page')];
  const root = document.documentElement;

  if (!hero || !heroHeader || !transitionScene || !aboutSection || !aboutScene || !brandingSection) return;

  const isReducedMotion = reducedMotion.matches;

  const lockedHeader = heroHeader.cloneNode(true);
  lockedHeader.classList.add('hero-header--scroll-lock');
  document.body.append(lockedHeader);
  heroHeader.setAttribute('aria-hidden', 'true');

  document.querySelectorAll('a[href="#about"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const sceneTop = window.scrollY + transitionScene.getBoundingClientRect().top;
      const targetTop = window.innerWidth > 900
        ? sceneTop + Math.max(0, transitionScene.offsetHeight - window.innerHeight) * 0.86
        : window.scrollY + aboutSection.getBoundingClientRect().top;

      window.scrollTo({
        top: targetTop,
        behavior: isReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  let frameRequested = false;

  function updateTransition() {
    frameRequested = false;
    const viewportHeight = window.innerHeight;
    const transitionSceneTop = transitionScene.getBoundingClientRect().top;
    const aboutTop = aboutSection.getBoundingClientRect().top;
    const aboutSceneTop = aboutScene.getBoundingClientRect().top;
    const brandingTop = brandingSection.getBoundingClientRect().top;
    const isExtendedScene = window.innerWidth > 900;
    const transitionDistance = Math.max(1, transitionScene.offsetHeight - viewportHeight);
    const progress = isExtendedScene
      ? Math.min(1, Math.max(0, -transitionSceneTop / transitionDistance))
      : Math.min(1, Math.max(0, (viewportHeight - aboutTop) / viewportHeight));
    const heroPhaseRaw = isExtendedScene ? Math.min(1, progress / 0.68) : progress;
    const heroPhase = heroPhaseRaw * heroPhaseRaw * (3 - 2 * heroPhaseRaw);
    const aboutPhaseRaw = isExtendedScene
      ? Math.min(1, Math.max(0, (progress - 0.5) / 0.34))
      : progress;
    const aboutPhase = aboutPhaseRaw * aboutPhaseRaw * (3 - 2 * aboutPhaseRaw);
    const aboutTravel = window.innerWidth * (window.innerWidth < 768 ? 0.72 : 0.46);
    const lateContentTravel = window.innerWidth * (window.innerWidth < 768 ? 0.68 : 0.42);
    const aboutOpacity = Math.min(1, Math.max(0, (aboutPhase - 0.06) / 0.86));
    const holdDistance = Math.max(1, aboutScene.offsetHeight - viewportHeight);
    const aboutHoldProgress = isExtendedScene
      ? progress
      : Math.min(1, Math.max(0, -aboutSceneTop / holdDistance));
    const appsProgress = isExtendedScene
      ? Math.min(1, Math.max(0, (aboutHoldProgress - 0.86) / 0.06))
      : Math.min(1, Math.max(0, (aboutHoldProgress - 0.18) / 0.38));
    const contactProgress = isExtendedScene
      ? Math.min(1, Math.max(0, (aboutHoldProgress - 0.93) / 0.06))
      : Math.min(1, Math.max(0, (aboutHoldProgress - 0.56) / 0.34));
    const overAbout = (isExtendedScene ? progress >= 0.72 : aboutTop <= viewportHeight * 0.42) && brandingTop > 72;
    const overPortfolioProject = portfolioPages.some((page) => {
      const bounds = page.getBoundingClientRect();
      return bounds.top <= 72 && bounds.bottom > 72;
    });
    const headerColor = overAbout && !overPortfolioProject ? '#343236' : '#f7f1e8';

    const heroProgress = isReducedMotion ? 0 : heroPhase;
    const visibleAboutOpacity = isReducedMotion ? 1 : aboutOpacity;
    const visibleAppsProgress = isReducedMotion ? 1 : appsProgress;
    const visibleContactProgress = isReducedMotion ? 1 : contactProgress;
    const heroTravelX = isExtendedScene ? -72 : -28;
    const heroTravelY = isExtendedScene ? -68 : -12;
    const heroScaleLoss = isExtendedScene ? 0.34 : 0.16;
    const heroOpacity = isReducedMotion || !isExtendedScene
      ? 1
      : 1 - Math.min(1, Math.max(0, (progress - 0.52) / 0.16));

    root.style.setProperty('--hero-scroll-x', `${heroProgress * heroTravelX}vw`);
    root.style.setProperty('--hero-scroll-y', `${heroProgress * heroTravelY}vh`);
    root.style.setProperty('--hero-scroll-scale', (1 - heroProgress * heroScaleLoss).toFixed(4));
    root.style.setProperty('--hero-scroll-opacity', heroOpacity.toFixed(3));
    root.style.setProperty('--about-scroll-x', `${isReducedMotion ? 0 : (1 - aboutPhase) * aboutTravel}px`);
    root.style.setProperty('--about-scroll-opacity', visibleAboutOpacity.toFixed(3));
    root.style.setProperty('--about-apps-opacity', visibleAppsProgress.toFixed(3));
    root.style.setProperty('--about-contact-opacity', visibleContactProgress.toFixed(3));
    root.style.setProperty('--about-apps-x', `${(1 - visibleAppsProgress) * lateContentTravel}px`);
    root.style.setProperty('--about-contact-x', `${(1 - visibleContactProgress) * lateContentTravel}px`);
    root.style.setProperty('--persistent-header-color', headerColor);
    root.classList.toggle('is-hero-about-transitioning', !isReducedMotion && progress > 0 && progress < 1);
    root.classList.toggle('is-hero-gone', !isReducedMotion && isExtendedScene && progress >= 0.68);
    root.classList.toggle('is-over-portfolio-project', overPortfolioProject);

    portfolioPages.forEach((page) => {
      const pageTop = page.getBoundingClientRect().top;
      const revealProgress = isReducedMotion
        ? 1
        : Math.min(1, Math.max(0, (viewportHeight - pageTop) / (viewportHeight * 0.62)));
      const reveal = revealProgress * revealProgress * (3 - 2 * revealProgress);
      page.style.setProperty('--portfolio-reveal', reveal.toFixed(3));
    });
  }

  function requestTransitionUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateTransition);
  }

  root.classList.add('hero-about-scroll');
  window.addEventListener('scroll', requestTransitionUpdate, { passive: true });
  window.addEventListener('resize', requestTransitionUpdate);
  requestTransitionUpdate();
}

initialiseHeroAboutScroll();

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
