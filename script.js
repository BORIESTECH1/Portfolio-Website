const navbar = document.querySelector('.topbar');
const modal = document.querySelector('#projectModal');
const closeModal = document.querySelector('.modal-close');
const projectButtons = document.querySelectorAll('button[data-project-id]');
const modalSlide = document.querySelector('#modalSlide');
const modalTitle = document.querySelector('#modalTitle');
const modalType = document.querySelector('#modalType');
const modalCaption = document.querySelector('#modalCaption');
const modalDots = document.querySelector('#modalDots');
const uploadInputs = document.querySelectorAll('[data-project-upload]');
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const qrTrigger = document.querySelector('.qr-trigger');
const qrModal = document.querySelector('#qrModal');
const qrModalClose = document.querySelector('.qr-modal-close');
const navSections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const projects = {
  'digital-hunt': {
    title: 'Digital Hunt',
    type: 'AI-assisted cinematic series',
    caption: 'Original technology thriller concept exploring investigation, digital mystery, and human storytelling.',
    previews: [
      { label: 'Digital Hunt / Preview 01', src: 'assets/digital-hunt/digital-hunt-01.jpg' },
      { label: 'Digital Hunt / Preview 02', src: 'assets/digital-hunt/digital-hunt-02.jpg' },
      { label: 'Digital Hunt / Preview 03', src: 'assets/digital-hunt/digital-hunt-03.jpg' }
    ]
  },
  'zero-to-future': {
    title: 'From Zero to the Future',
    type: 'Animated short concept',
    caption: 'A visual journey through invention, computing, digital transformation, and an imagined intelligent future.',
    previews: [
      { label: 'From Zero to the Future / Preview 01', src: 'assets/zero-to-future/zero-to-future-01.jpg' },
      { label: 'From Zero to the Future / Preview 02', src: 'assets/zero-to-future/zero-to-future-02.jpg' },
      { label: 'From Zero to the Future / Preview 03', src: 'assets/zero-to-future/zero-to-future-preview.png' }
    ]
  },
  'byte-lab': {
    title: 'ByteCampus',
    type: 'Interactive learning and game hub',
    caption: 'A responsive collection of computer learning experiences, browser games, and student-focused community tools.',
    previews: [
      { label: 'ByteCampus / Study Hub', src: 'assets/byte-lab/byte-lab-study-hub.jpeg' },
      { label: 'ByteCampus / Game Lab', src: 'assets/byte-lab/byte-lab-game-lab.jpeg' },
      { label: 'ByteCampus / Friends & Stories', src: 'assets/byte-lab/byte-lab-friends.jpeg' }
    ]
  },
  'pos-lab': {
    title: 'POS Guard',
    type: 'Fintech safety platform',
    caption: 'A multi-page POS application concept focused on safer transactions, account management, and clear financial workflows.',
    previews: [
      { label: 'POS Guard / Dashboard', src: 'assets/pos-lab/pos-lab-dashboard.jpeg' },
      { label: 'POS Guard / Profile', src: 'assets/pos-lab/pos-lab-profile.jpeg' },
      { label: 'POS Guard / Interfaces', src: 'assets/pos-lab/pos-lab-interfaces.jpeg' }
    ]
  }
};

let activeProject = null;
let activeSlide = 0;

updateGalleryThumbs('digital-hunt');
updateGalleryThumbs('zero-to-future');
updateGalleryThumbs('byte-lab');
updateGalleryThumbs('pos-lab');

uploadInputs.forEach((input) => {
  input.addEventListener('change', () => {
    const files = Array.from(input.files || []).slice(0, 3);
    if (!files.length) return;

    const projectId = input.dataset.projectUpload;
    const project = projects[projectId];
    if (!project) return;

    files.forEach((file, index) => {
      project.previews[index] = {
        label: `${project.title} / Preview ${String(index + 1).padStart(2, '0')}`,
        src: URL.createObjectURL(file)
      };
    });
    updateGalleryThumbs(projectId);
  });
});

if ('IntersectionObserver' in window) {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((item) => observer.observe(item));
}

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

if (navLinks.length && navSections.length) {
  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').slice(1);
      setActiveNav(targetId);
    });
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleSection) setActiveNav(visibleSection.target.id);
  }, {
    rootMargin: '-18% 0px -62% 0px',
    threshold: [0.1, 0.35, 0.65]
  });

  navSections.forEach((section) => sectionObserver.observe(section));
  setActiveNav(window.location.hash ? window.location.hash.slice(1) : navSections[0].id);
}


if (navToggle && nav) {
  const closeNavigation = () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeNavigation));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 640) closeNavigation();
  });
}

if (modal && closeModal) {
  projectButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openProject(button.dataset.projectId, Number(button.dataset.slide) || 0);
    });
  });

  document.querySelectorAll('[data-gallery-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.galleryDirection);
      activeSlide = (activeSlide + direction + activeProject.previews.length) % activeProject.previews.length;
      renderSlide();
    });
  });

  closeModal.addEventListener('click', closeProject);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeProject();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeProject();
  });
}

if (qrTrigger && qrModal && qrModalClose) {
  const closeQr = () => {
    qrModal.classList.remove('open');
    qrModal.setAttribute('aria-hidden', 'true');
  };

  qrTrigger.addEventListener('click', () => {
    qrModal.classList.add('open');
    qrModal.setAttribute('aria-hidden', 'false');
    qrModalClose.focus();
  });

  qrModalClose.addEventListener('click', closeQr);
  qrModal.addEventListener('click', (event) => {
    if (event.target === qrModal) closeQr();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeQr();
  });
}

function closeProject() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function openProject(projectId, slide = 0) {
  const project = projects[projectId];
  if (!project || !modal) return;
  activeProject = project;
  activeSlide = slide;
  modalTitle.textContent = project.title;
  modalType.textContent = project.type;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  renderSlide();
}

function renderSlide() {
  const preview = activeProject.previews[activeSlide];
  modalSlide.className = `modal-slide ${preview.className || ''}`;
  modalSlide.innerHTML = preview.src
    ? `<img src="${preview.src}" alt="${preview.label}" /><span>${preview.label}</span>`
    : `<span>${preview.label}</span>${preview.empty ? '<small>Add your image in the project gallery</small>' : ''}`;
  modalCaption.textContent = activeProject.caption;
  modalDots.innerHTML = activeProject.previews.map((item, index) =>
    `<button class="modal-dot${index === activeSlide ? ' active' : ''}" type="button" aria-label="Show preview ${index + 1}"></button>`
  ).join('');
  modalDots.querySelectorAll('.modal-dot').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      activeSlide = index;
      renderSlide();
    });
  });
}

function updateGalleryThumbs(projectId) {
  const project = projects[projectId];
  document.querySelectorAll(`.gallery-thumb[data-project-id="${projectId}"]`).forEach((thumb, index) => {
    const preview = project.previews[index];
    if (!preview.src) return;
    thumb.classList.remove('gallery-placeholder');
    thumb.style.backgroundImage = `url("${preview.src}")`;
    thumb.innerHTML = `<span>${preview.label.split(' / ')[1]}</span>`;
  });
}
