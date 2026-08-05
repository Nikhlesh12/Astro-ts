const loader = document.getElementById('loader');
const bookingForm = document.getElementById('bookingForm');
const nextStep = document.getElementById('nextStep');
const prevStep = document.getElementById('prevStep');
const bookingSteps = Array.from(document.querySelectorAll('.booking-step'));
const bookingProgressBar = document.getElementById('bookingProgressBar');
const bookingProgressLabel = document.getElementById('bookingProgressLabel');
const cursorWrap = document.getElementById('cursor');
const cursorLabel = cursorWrap.querySelector('.cursor-label');
const interactiveItems = document.querySelectorAll('.interactive');
const themeToggle = document.querySelector('[data-theme-toggle]');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const progressBar = document.getElementById('progressBar');
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');

let activeStep = 0;
const storedTheme = localStorage.getItem('ts-theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
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

themeToggle.addEventListener('click', () => setTheme(!themeActive));

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  const expanded = mainNav.classList.contains('open');
  menuToggle.setAttribute('aria-expanded', expanded);
});

const handleMouseMove = (event) => {
  cursorPosition = { x: event.clientX, y: event.clientY };
  cursorWrap.style.transform = `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`;
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
  const scrollProgress = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = `${scrollProgress}%`;
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-visible');
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal-hidden').forEach((item) => revealObserver.observe(item));

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseover', handleMouseOver);
window.addEventListener('mouseout', handleMouseOut);
window.addEventListener('scroll', handleScroll);
window.addEventListener('load', () => {
  cursorWrap.classList.add('active');

  setTimeout(() => {
    loader.classList.add('loader-hidden');
  }, 900);

  setTheme(themeActive);
  updateBookingUI();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
