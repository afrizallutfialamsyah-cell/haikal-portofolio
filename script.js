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

  function scrollToDesktopScene(event, sceneSelector) {
    if (window.innerWidth <= 900 || reducedMotion.matches) return;

    const scene = document.querySelector(sceneSelector);
    if (!scene) return;

    event.preventDefault();
    const sceneTop = window.scrollY + scene.getBoundingClientRect().top;
    const scrollDistance = Math.max(0, scene.offsetHeight - window.innerHeight);
    window.scrollTo({ top: sceneTop + scrollDistance, behavior: 'smooth' });
  }

  document.querySelectorAll('a[href="#graphic-design"]').forEach((link) => {
    link.addEventListener('click', (event) => scrollToDesktopScene(event, '.about-branding-scene'));
  });

  document.querySelectorAll('a[href="#illustration"]').forEach((link) => {
    link.addEventListener('click', (event) => scrollToDesktopScene(event, '.page-eight-nine-scene'));
  });

  document.querySelectorAll('a[href="#campaign"]').forEach((link) => {
    link.addEventListener('click', (event) => scrollToDesktopScene(event, '.page-fourteen-fifteen-scene'));
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

function initialiseAboutBrandingScroll() {
  const scene = document.querySelector('.about-branding-scene');
  const stage = scene?.querySelector('.about-branding-stage');
  const graphicDesign = stage?.querySelector('.branding-chapter');
  const originalAbout = document.querySelector('.about-scroll-scene > .about');
  const originalAboutArtboard = originalAbout?.querySelector('.about__artboard');

  if (
    !scene ||
    !stage ||
    !graphicDesign ||
    !originalAbout ||
    !originalAboutArtboard ||
    reducedMotion.matches
  ) return;

  if (window.innerWidth <= 900) return;

  let frameRequested = false;
  let sceneStart = 0;
  let transitionActive = false;

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => value * value * (3 - 2 * value);

  function measureScene() {
    sceneStart = window.scrollY + scene.getBoundingClientRect().top;
  }

  function resetMobileState() {
    stage.style.removeProperty('visibility');
    originalAbout.style.removeProperty('visibility');
    originalAboutArtboard.style.removeProperty('--about-exit-opacity');
    originalAboutArtboard.style.removeProperty('--about-exit-x');
    originalAboutArtboard.style.removeProperty('--about-exit-y');
    originalAboutArtboard.style.removeProperty('--about-exit-scale');
    originalAboutArtboard.style.removeProperty('--about-native-top');
    originalAboutArtboard.style.removeProperty('--about-native-left');
    originalAboutArtboard.style.removeProperty('--about-native-width');
    originalAboutArtboard.style.removeProperty('--about-native-height');
    graphicDesign.style.removeProperty('opacity');
    graphicDesign.style.removeProperty('transform');
    document.documentElement.classList.remove('is-about-branding-transitioning');
    transitionActive = false;
  }

  function updateScene() {
    frameRequested = false;

    const scrollDistance = Math.max(1, scene.offsetHeight - window.innerHeight);
    const progress = clamp((window.scrollY - sceneStart) / scrollDistance);
    const hasStarted = window.scrollY >= sceneStart - 1;
    const isMobile = window.innerWidth <= 900;
    const aboutProgress = smooth(clamp((progress - 0.02) / 0.7));
    const graphicProgress = smooth(clamp((progress - 0.4) / 0.46));
    const aboutOpacity = 1 - clamp((progress - 0.62) / 0.13);

    const wasTransitionActive = transitionActive;
    if (hasStarted && !wasTransitionActive) {
      const bounds = originalAboutArtboard.getBoundingClientRect();
      originalAboutArtboard.style.setProperty('--about-native-top', `${bounds.top}px`);
      originalAboutArtboard.style.setProperty('--about-native-left', `${bounds.left}px`);
      originalAboutArtboard.style.setProperty('--about-native-width', `${bounds.width}px`);
      originalAboutArtboard.style.setProperty('--about-native-height', `${bounds.height}px`);
    }

    stage.style.visibility = hasStarted ? 'visible' : 'hidden';
    document.documentElement.classList.toggle('is-about-branding-transitioning', hasStarted);
    transitionActive = hasStarted;

    if (!hasStarted && wasTransitionActive) {
      originalAboutArtboard.style.removeProperty('--about-native-top');
      originalAboutArtboard.style.removeProperty('--about-native-left');
      originalAboutArtboard.style.removeProperty('--about-native-width');
      originalAboutArtboard.style.removeProperty('--about-native-height');
    }

    originalAboutArtboard.style.setProperty('--about-exit-opacity', aboutOpacity.toFixed(3));
    originalAboutArtboard.style.setProperty('--about-exit-x', `${(isMobile ? -58 : -72) * aboutProgress}vw`);
    originalAboutArtboard.style.setProperty('--about-exit-y', `${(isMobile ? -52 : -68) * aboutProgress}vh`);
    originalAboutArtboard.style.setProperty('--about-exit-scale', (1 - (isMobile ? 0.28 : 0.34) * aboutProgress).toFixed(4));

    graphicDesign.style.opacity = graphicProgress.toFixed(3);
    graphicDesign.style.transform = `translate3d(${(isMobile ? 32 : 46) * (1 - graphicProgress)}vw, ${(isMobile ? 24 : 30) * (1 - graphicProgress)}vh, 0) scale(${((isMobile ? 0.82 : 0.74) + (isMobile ? 0.18 : 0.26) * graphicProgress).toFixed(4)})`;

    if (hasStarted && graphicProgress < 0.72) {
      document.documentElement.style.setProperty('--persistent-header-color', '#343236');
    }
  }

  function requestSceneUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScene);
  }

  function handleResize() {
    measureScene();
    requestSceneUpdate();
  }

  measureScene();
  window.addEventListener('scroll', requestSceneUpdate, { passive: true });
  window.addEventListener('resize', handleResize);
  window.addEventListener('load', handleResize, { once: true });
  requestSceneUpdate();
}

initialiseAboutBrandingScroll();

function initialisePageFiveObjectHover() {
  const page = document.querySelector('.portfolio-page--five');
  const objects = [...(page?.querySelectorAll('.page-five__object') || [])];

  if (!page || !objects.length || reducedMotion.matches || !window.matchMedia('(hover: hover)').matches) return;

  const hitMaps = new Map();
  let frameRequested = false;
  let pointerX = 0;
  let pointerY = 0;

  function prepareHitMap(object) {
    if (!object.naturalWidth || !object.naturalHeight) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    canvas.width = object.naturalWidth;
    canvas.height = object.naturalHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(object, 0, 0);
    hitMaps.set(object, { canvas, context });
  }

  function updateHoverState() {
    frameRequested = false;

    objects.forEach((object) => {
      const hitMap = hitMaps.get(object);
      if (!hitMap) return;
      const bounds = object.getBoundingClientRect();
      const x = Math.floor(((pointerX - bounds.left) / bounds.width) * hitMap.canvas.width);
      const y = Math.floor(((pointerY - bounds.top) / bounds.height) * hitMap.canvas.height);
      const inside = x >= 0 && y >= 0 && x < hitMap.canvas.width && y < hitMap.canvas.height;
      const alpha = inside ? hitMap.context.getImageData(x, y, 1, 1).data[3] : 0;
      object.classList.toggle('is-pointer-over-object', alpha > 20);
    });
  }

  page.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateHoverState);
  }, { passive: true });

  page.addEventListener('pointerleave', () => {
    objects.forEach((object) => object.classList.remove('is-pointer-over-object'));
  });

  objects.forEach((object) => {
    if (object.complete) prepareHitMap(object);
    else object.addEventListener('load', () => prepareHitMap(object), { once: true });
  });
}

initialisePageFiveObjectHover();

function initialisePageSevenPhoneHover() {
  const page = document.querySelector('.portfolio-page--seven');
  const phones = [...(page?.querySelectorAll('.page-seven__phone') || [])];

  if (!page || !phones.length || reducedMotion.matches || !window.matchMedia('(hover: hover)').matches) return;

  const hitMaps = new Map();
  let frameRequested = false;
  let pointerX = 0;
  let pointerY = 0;

  function prepareHitMap(phone) {
    if (!phone.naturalWidth || !phone.naturalHeight) return;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    canvas.width = phone.naturalWidth;
    canvas.height = phone.naturalHeight;
    context.drawImage(phone, 0, 0);
    hitMaps.set(phone, { canvas, context });
  }

  function updateHoverState() {
    frameRequested = false;

    phones.forEach((phone) => {
      const hitMap = hitMaps.get(phone);
      if (!hitMap) return;
      const bounds = phone.getBoundingClientRect();
      const x = Math.floor(((pointerX - bounds.left) / bounds.width) * hitMap.canvas.width);
      const y = Math.floor(((pointerY - bounds.top) / bounds.height) * hitMap.canvas.height);
      const inside = x >= 0 && y >= 0 && x < hitMap.canvas.width && y < hitMap.canvas.height;
      const alpha = inside ? hitMap.context.getImageData(x, y, 1, 1).data[3] : 0;
      phone.classList.toggle('is-pointer-over-phone', alpha > 20);
    });
  }

  page.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateHoverState);
  }, { passive: true });

  page.addEventListener('pointerleave', () => {
    phones.forEach((phone) => phone.classList.remove('is-pointer-over-phone'));
  });

  phones.forEach((phone) => {
    if (phone.complete) prepareHitMap(phone);
    else phone.addEventListener('load', () => prepareHitMap(phone), { once: true });
  });
}

initialisePageSevenPhoneHover();

function initialisePageEightNineScroll() {
  const scene = document.querySelector('.page-eight-nine-scene');
  const stage = scene?.querySelector('.page-eight-nine-stage');
  const pageEight = document.querySelector('.portfolio-page--eight');
  const pageEightArtboard = pageEight?.querySelector('.portfolio-page__artboard');
  const pageNine = stage?.querySelector('.portfolio-page--nine');

  if (!scene || !stage || !pageEight || !pageEightArtboard || !pageNine || reducedMotion.matches) return;

  if (window.innerWidth <= 900) return;

  let frameRequested = false;
  let sceneStart = 0;
  let transitionActive = false;

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => value * value * (3 - 2 * value);

  function measureScene() {
    sceneStart = window.scrollY + scene.getBoundingClientRect().top;
  }

  function resetMobileState() {
    stage.style.removeProperty('visibility');
    pageEightArtboard.style.removeProperty('--page-eight-exit-opacity');
    pageEightArtboard.style.removeProperty('--page-eight-exit-x');
    pageEightArtboard.style.removeProperty('--page-eight-exit-y');
    pageEightArtboard.style.removeProperty('--page-eight-exit-scale');
    pageEightArtboard.style.removeProperty('--page-eight-native-top');
    pageEightArtboard.style.removeProperty('--page-eight-native-left');
    pageEightArtboard.style.removeProperty('--page-eight-native-width');
    pageEightArtboard.style.removeProperty('--page-eight-native-height');
    pageNine.style.removeProperty('opacity');
    pageNine.style.removeProperty('transform');
    document.documentElement.classList.remove('is-page-eight-nine-transitioning');
    transitionActive = false;
  }

  function updateScene() {
    frameRequested = false;

    const scrollDistance = Math.max(1, scene.offsetHeight - window.innerHeight);
    const progress = clamp((window.scrollY - sceneStart) / scrollDistance);
    const hasStarted = window.scrollY >= sceneStart - 1;
    const pageEightProgress = smooth(clamp((progress - 0.02) / 0.7));
    const pageNineProgress = smooth(clamp((progress - 0.4) / 0.46));
    const pageEightOpacity = 1 - clamp((progress - 0.62) / 0.13);
    const isMobile = window.innerWidth <= 900;

    const wasTransitionActive = transitionActive;

    if (hasStarted && !wasTransitionActive) {
      const bounds = pageEightArtboard.getBoundingClientRect();
      pageEightArtboard.style.setProperty('--page-eight-native-top', `${bounds.top}px`);
      pageEightArtboard.style.setProperty('--page-eight-native-left', `${bounds.left}px`);
      pageEightArtboard.style.setProperty('--page-eight-native-width', `${bounds.width}px`);
      pageEightArtboard.style.setProperty('--page-eight-native-height', `${bounds.height}px`);
    }

    stage.style.visibility = hasStarted ? 'visible' : 'hidden';
    document.documentElement.classList.toggle('is-page-eight-nine-transitioning', hasStarted);
    transitionActive = hasStarted;

    if (!hasStarted && wasTransitionActive) {
      pageEightArtboard.style.removeProperty('--page-eight-native-top');
      pageEightArtboard.style.removeProperty('--page-eight-native-left');
      pageEightArtboard.style.removeProperty('--page-eight-native-width');
      pageEightArtboard.style.removeProperty('--page-eight-native-height');
    }

    pageEightArtboard.style.setProperty('--page-eight-exit-opacity', pageEightOpacity.toFixed(3));
    pageEightArtboard.style.setProperty('--page-eight-exit-x', `${(isMobile ? -58 : -72) * pageEightProgress}vw`);
    pageEightArtboard.style.setProperty('--page-eight-exit-y', `${(isMobile ? -52 : -68) * pageEightProgress}vh`);
    pageEightArtboard.style.setProperty('--page-eight-exit-scale', (1 - (isMobile ? 0.28 : 0.34) * pageEightProgress).toFixed(4));

    pageNine.style.opacity = pageNineProgress.toFixed(3);
    pageNine.style.transform = `translate3d(${(isMobile ? 32 : 46) * (1 - pageNineProgress)}vw, ${(isMobile ? 24 : 30) * (1 - pageNineProgress)}vh, 0) scale(${((isMobile ? 0.82 : 0.74) + (isMobile ? 0.18 : 0.26) * pageNineProgress).toFixed(4)})`;
  }

  function requestSceneUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScene);
  }

  function handleResize() {
    measureScene();
    requestSceneUpdate();
  }

  measureScene();
  window.addEventListener('scroll', requestSceneUpdate, { passive: true });
  window.addEventListener('resize', handleResize);
  window.addEventListener('load', handleResize, { once: true });
  requestSceneUpdate();
}

initialisePageEightNineScroll();

function initialisePageFourteenFifteenScroll() {
  const scene = document.querySelector('.page-fourteen-fifteen-scene');
  const stage = scene?.querySelector('.page-fourteen-fifteen-stage');
  const pageFourteen = document.querySelector('.portfolio-page--fourteen');
  const pageFourteenBackground = pageFourteen?.querySelector('.portfolio-page__background');
  const pageFourteenArtboard = pageFourteen?.querySelector('.portfolio-page__artboard');
  const pageFifteen = stage?.querySelector('.portfolio-page--fifteen');
  const pageFourteenAssets = pageFourteen ? [...pageFourteen.querySelectorAll('img')] : [];

  if (!scene || !stage || !pageFourteen || !pageFourteenBackground || !pageFourteenArtboard || !pageFifteen || reducedMotion.matches) return;
  if (window.innerWidth <= 900) return;

  let frameRequested = false;
  let sceneStart = 0;
  let transitionActive = false;
  let motionStartProgress = null;

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => value * value * (3 - 2 * value);

  function measureScene() {
    sceneStart = window.scrollY + scene.getBoundingClientRect().top;
  }

  function updateScene() {
    frameRequested = false;

    const scrollDistance = Math.max(1, scene.offsetHeight - window.innerHeight);
    const progress = clamp((window.scrollY - sceneStart) / scrollDistance);
    const hasStarted = window.scrollY >= sceneStart - 1;
    const assetsReady = pageFourteenAssets.every((asset) => asset.complete && asset.naturalWidth > 0);

    if (!hasStarted) {
      motionStartProgress = null;
    } else if (assetsReady && motionStartProgress === null) {
      motionStartProgress = progress;
    }

    const motionProgress = motionStartProgress === null
      ? 0
      : clamp((progress - motionStartProgress) / Math.max(0.001, 1 - motionStartProgress));
    const pageFourteenProgress = smooth(clamp(motionProgress / 0.7));
    const pageFifteenProgress = smooth(clamp((motionProgress - 0.4) / 0.46));
    const pageFourteenOpacity = 1 - clamp((motionProgress - 0.62) / 0.13);
    const wasTransitionActive = transitionActive;

    if (hasStarted && !wasTransitionActive) {
      const backgroundBounds = pageFourteenBackground.getBoundingClientRect();
      const bounds = pageFourteenArtboard.getBoundingClientRect();
      pageFourteenBackground.style.setProperty('--page-fourteen-background-native-top', `${backgroundBounds.top}px`);
      pageFourteenBackground.style.setProperty('--page-fourteen-background-native-left', `${backgroundBounds.left}px`);
      pageFourteenBackground.style.setProperty('--page-fourteen-background-native-width', `${backgroundBounds.width}px`);
      pageFourteenBackground.style.setProperty('--page-fourteen-background-native-height', `${backgroundBounds.height}px`);
      pageFourteenArtboard.style.setProperty('--page-fourteen-native-top', `${bounds.top}px`);
      pageFourteenArtboard.style.setProperty('--page-fourteen-native-left', `${bounds.left}px`);
      pageFourteenArtboard.style.setProperty('--page-fourteen-native-width', `${bounds.width}px`);
      pageFourteenArtboard.style.setProperty('--page-fourteen-native-height', `${bounds.height}px`);
    }

    stage.style.visibility = hasStarted ? 'visible' : 'hidden';
    document.documentElement.classList.toggle('is-page-fourteen-fifteen-transitioning', hasStarted);
    transitionActive = hasStarted;

    if (hasStarted) {
      pageFourteen.style.setProperty('--portfolio-reveal', '1');
    }

    if (!hasStarted && wasTransitionActive) {
      pageFourteen.style.removeProperty('--portfolio-reveal');
      pageFourteenBackground.style.removeProperty('--page-fourteen-background-native-top');
      pageFourteenBackground.style.removeProperty('--page-fourteen-background-native-left');
      pageFourteenBackground.style.removeProperty('--page-fourteen-background-native-width');
      pageFourteenBackground.style.removeProperty('--page-fourteen-background-native-height');
      pageFourteenArtboard.style.removeProperty('--page-fourteen-native-top');
      pageFourteenArtboard.style.removeProperty('--page-fourteen-native-left');
      pageFourteenArtboard.style.removeProperty('--page-fourteen-native-width');
      pageFourteenArtboard.style.removeProperty('--page-fourteen-native-height');
    }

    const pageFourteenExitOpacity = pageFourteenOpacity.toFixed(3);
    const pageFourteenExitX = `${-72 * pageFourteenProgress}vw`;
    const pageFourteenExitY = `${-68 * pageFourteenProgress}vh`;
    const pageFourteenExitScale = (1 - 0.34 * pageFourteenProgress).toFixed(4);

    [pageFourteenBackground, pageFourteenArtboard].forEach((layer) => {
      layer.style.setProperty('--page-fourteen-exit-opacity', pageFourteenExitOpacity);
      layer.style.setProperty('--page-fourteen-exit-x', pageFourteenExitX);
      layer.style.setProperty('--page-fourteen-exit-y', pageFourteenExitY);
      layer.style.setProperty('--page-fourteen-exit-scale', pageFourteenExitScale);
    });

    pageFifteen.style.opacity = pageFifteenProgress.toFixed(3);
    pageFifteen.style.transform = `translate3d(${46 * (1 - pageFifteenProgress)}vw, ${30 * (1 - pageFifteenProgress)}vh, 0) scale(${(0.74 + 0.26 * pageFifteenProgress).toFixed(4)})`;
  }

  function requestSceneUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScene);
  }

  function handleResize() {
    measureScene();
    requestSceneUpdate();
  }

  measureScene();
  window.addEventListener('scroll', requestSceneUpdate, { passive: true });
  window.addEventListener('resize', handleResize);
  window.addEventListener('load', handleResize, { once: true });
  requestSceneUpdate();
}

initialisePageFourteenFifteenScroll();

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
