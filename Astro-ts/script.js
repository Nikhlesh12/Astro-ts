const loader = document.getElementById('loader');
const bookingForm = document.getElementById('bookingForm');
const nextStep = document.getElementById('nextStep');
const prevStep = document.getElementById('prevStep');
const bookingSteps = Array.from(document.querySelectorAll('.booking-step'));
const bookingProgressBar = document.getElementById('bookingProgressBar');
const bookingProgressLabel = document.getElementById('bookingProgressLabel');
const cursorWrap = document.getElementById('cursor');
const cursorLabel = cursorWrap.querySelector('.cursor-label');
const themeToggle = document.querySelector('[data-theme-toggle]');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const navClose = document.querySelector('.nav-close');
const progressBar = document.getElementById('progressBar');
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const galleryLightbox = document.getElementById('galleryLightbox');
const galleryLightboxClose = document.getElementById('galleryLightboxClose');
const galleryLightboxImage = document.getElementById('galleryLightboxImage');
const galleryLightboxTitle = document.getElementById('galleryLightboxTitle');
const galleryLightboxDescription = document.getElementById('galleryLightboxDescription');

let activeStep = 0;
const storedTheme = localStorage.getItem('ts-theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let themeActive = storedTheme ? storedTheme === 'cosmic' : prefersDark;
let cursorPosition = { x: 0, y: 0 };

const updateBookingUI = () => {
  bookingSteps.forEach((step, index) => {
    step.classList.toggle('booking-step-active', index === activeStep);
  });

  const progressValue = ((activeStep + 1) / bookingSteps.length) * 100;
  bookingProgressBar.style.width = `${progressValue}%`;
  bookingProgressLabel.textContent = `Step ${activeStep + 1} of ${bookingSteps.length}`;
  nextStep.textContent = activeStep === bookingSteps.length - 1 ? 'Submit' : 'Continue';
  prevStep.disabled = activeStep === 0;
};

const setTheme = (dark) => {
  document.body.classList.toggle('cosmic', dark);
  themeToggle.querySelector('.theme-label').textContent = dark ? 'Cosmic' : 'Divine';
  themeActive = dark;
  localStorage.setItem('ts-theme', dark ? 'cosmic' : 'divine');
};

const validateStep = () => {
  const inputs = Array.from(bookingSteps[activeStep].querySelectorAll('input, select'));
  return inputs.every((field) => field.checkValidity());
};

nextStep.addEventListener('click', () => {
  if (!validateStep()) {
    bookingSteps[activeStep].querySelector('input, select').reportValidity();
    return;
  }

  if (activeStep < bookingSteps.length - 1) {
    activeStep += 1;
    updateBookingUI();
  } else {
    const formData = new FormData(bookingForm);
    const bookingDetails = Object.fromEntries(formData.entries());
    openLightbox(`Booking confirmed for ${bookingDetails.name} on ${bookingDetails.date} at ${bookingDetails.time}`);
    bookingForm.reset();
    activeStep = 0;
    updateBookingUI();
  }
});

prevStep.addEventListener('click', () => {
  if (activeStep > 0) {
    activeStep -= 1;
    updateBookingUI();
  }
});

const openLightbox = (message) => {
  lightbox.classList.add('active');
  document.getElementById('lightboxTitle').textContent = message;
  lightbox.setAttribute('aria-hidden', 'false');
};

const closeLightbox = () => {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
};

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

const openGalleryLightbox = (item) => {
  if (!galleryLightbox) return;
  const title = item.dataset.title || 'Gallery Preview';
  const description = item.dataset.description || 'A premium visual preview from the TS experience.';
  const imageClass = item.dataset.image || 'image-1';

  galleryLightboxTitle.textContent = title;
  galleryLightboxDescription.textContent = description;
  galleryLightboxImage.className = `gallery-lightbox-image ${imageClass}`;
  galleryLightbox.classList.add('active');
  galleryLightbox.setAttribute('aria-hidden', 'false');
};

const closeGalleryLightbox = () => {
  if (!galleryLightbox) return;
  galleryLightbox.classList.remove('active');
  galleryLightbox.setAttribute('aria-hidden', 'true');
};

galleryLightboxClose?.addEventListener('click', closeGalleryLightbox);
galleryLightbox?.addEventListener('click', (event) => {
  if (event.target === galleryLightbox) closeGalleryLightbox();
});

document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => openGalleryLightbox(item));
});

themeToggle.addEventListener('click', () => setTheme(!themeActive));

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  const expanded = mainNav.classList.contains('open');
  menuToggle.setAttribute('aria-expanded', expanded);
});

if (navClose) {
  navClose.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
}

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

const cursorTarget = { x: 0, y: 0 };
let cursorEnabled = true;
let cursorNeedsUpdate = false;
let scrollNeedsUpdate = false;

const handleMouseMove = (event) => {
  cursorTarget.x = event.clientX;
  cursorTarget.y = event.clientY;
  cursorNeedsUpdate = true;
};

const handleMouseOver = (event) => {
  const target = event.target.closest('.interactive');
  if (target) {
    cursorWrap.classList.add('big');
    cursorLabel.textContent = target.dataset.cursorLabel || 'View';
  }
};

const handleMouseOut = () => {
  cursorWrap.classList.remove('big');
  cursorLabel.textContent = '';
};

const handleScroll = () => {
  scrollNeedsUpdate = true;
};

const rafUpdate = () => {
  if (cursorNeedsUpdate && cursorEnabled) {
    cursorNeedsUpdate = false;
    cursorWrap.style.transform = `translate3d(${cursorTarget.x}px, ${cursorTarget.y}px, 0)`;
  }

  if (scrollNeedsUpdate) {
    scrollNeedsUpdate = false;
    const totalScrollable = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = totalScrollable > 0 ? (window.scrollY / totalScrollable) * 100 : 0;
    progressBar.style.width = `${scrollProgress}%`;
  }

  requestAnimationFrame(rafUpdate);
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-visible');
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal-hidden').forEach((item) => revealObserver.observe(item));

if (!isTouchDevice) {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseover', handleMouseOver);
  window.addEventListener('mouseout', handleMouseOut);
}
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('load', () => {
  if (!isTouchDevice) {
    cursorWrap.classList.add('active');
    requestAnimationFrame(rafUpdate);
  }

  setTimeout(() => {
    loader.classList.add('loader-hidden');
  }, 400);

  setTheme(themeActive);
  updateBookingUI();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
