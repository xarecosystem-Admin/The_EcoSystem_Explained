/* xAr Manifesto — Interaction & Motion */

// Smooth scroll (Lenis)
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => 1 - Math.pow(1 - t, 3),
  smoothWheel: true,
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// GSAP setup
if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal panels on enter
function initPanelReveals() {
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    if (!window.gsap || prefersReduced) { panel.classList.add('is-visible'); return; }

    // Ensure panel is visible immediately
    gsap.set(panel, {autoAlpha: 1, y: 0});
    panel.classList.add('is-visible');

    // stagger headlines and copy - only animate if they exist
    const cut = panel.querySelector('.cut');
    const copy = panel.querySelector('.copy');
    if (cut) {
      gsap.set(cut, { autoAlpha: 1, y: 0, scale: 1 });
    }
    if (copy) {
      gsap.set(copy, { autoAlpha: 1, y: 0 });
    }
  });

  // Smooth crossfade between panels
  if (window.gsap && !prefersReduced) {
    const panels = gsap.utils.toArray('[data-panel]');
    panels.forEach((p, i) => {
      if (i === panels.length - 1) return;
      ScrollTrigger.create({
        trigger: p,
        start: 'bottom 80%',
        onEnter: () => gsap.to(p, { autoAlpha: 0.6, duration: 0.6 }),
        onLeaveBack: () => gsap.to(p, { autoAlpha: 1, duration: 0.3 })
      });
    });
  }
}

// Matrix Mystique
async function initMatrix() {
  const grid = document.getElementById('matrix');
  const detail = document.getElementById('matrix-detail');
  if (!grid) return;
  try {
    const res = await fetch('content/matrix.json');
    const data = await res.json();

    const rows = data.rows; // array of rows, each row: array of 5 cells

    let unlockedRows = 0;
    function render() {
      grid.innerHTML = '';
      rows.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          const el = document.createElement('button');
          el.className = 'matrix__cell';
          el.setAttribute('role', 'gridcell');
          el.setAttribute('data-row', rIdx);
          el.setAttribute('data-col', cIdx);
          const locked = rIdx > unlockedRows;
          if (locked) el.setAttribute('aria-disabled', 'true');

          el.innerHTML = `
            <div class="matrix__title">${locked ? '&bull;&bull;&bull;' : cell.title}</div>
            <div class="matrix__cipher">${locked ? '██████' : cell.cipher}</div>
          `;

          function openDetail() {
            if (locked) return;
            detail.classList.add('is-open');
            detail.innerHTML = `
              <h3>${cell.title}</h3>
              <p class="matrix__reveal">${cell.truth}</p>
              <p>${cell.explain}</p>
            `;
            // progress unlock: when any cell in row clicked, unlock next row
            if (unlockedRows === rIdx && rIdx < rows.length - 1) {
              unlockedRows++;
              render();
            }
          }

          el.addEventListener('click', openDetail);
          el.addEventListener('keypress', (e) => { if (e.key === 'Enter') openDetail(); });
          grid.appendChild(el);
        });
      });
    }

    render();

  } catch (e) {
    console.error('Matrix failed to load', e);
  }
}

// Accessibility: keyboard grid navigation
function initMatrixKeyboardNav() {
  const grid = document.getElementById('matrix');
  if (!grid) return;
  grid.addEventListener('keydown', (e) => {
    const cells = Array.from(grid.querySelectorAll('.matrix__cell'));
    const cols = 5; // 5×4 grid
    const index = cells.indexOf(document.activeElement);
    if (index === -1) return;
    let next = null;
    switch (e.key) {
      case 'ArrowRight': next = Math.min(index + 1, cells.length - 1); break;
      case 'ArrowLeft': next = Math.max(index - 1, 0); break;
      case 'ArrowDown': next = Math.min(index + cols, cells.length - 1); break;
      case 'ArrowUp': next = Math.max(index - cols, 0); break;
    }
    if (next !== null && next !== index) { e.preventDefault(); cells[next].focus(); }
  });
}

// Mobile Nav Drawer
function initNav() {
  const toggle = document.querySelector('.nav__toggle');
  const drawer = document.getElementById('nav-drawer');
  if (!toggle || !drawer) return;
  const links = drawer.querySelectorAll('a');
  function set(open) {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', () => set(!drawer.classList.contains('is-open')));
  links.forEach(l => l.addEventListener('click', () => set(false)));
}

// Ambient Parallax
function initAmbientParallax() {
  if (!window.gsap || prefersReduced) return;
  const glow = document.querySelector('.bg__glow');
  const grid = document.querySelector('.bg__grid');
  const hero = document.querySelector('.hero');
  
  if (glow) {
    gsap.to(glow, { yPercent: 8, xPercent: -4, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
  }
  if (grid) {
    gsap.to(grid, { yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
  }
  // Ensure hero is visible immediately
  if (hero) {
    gsap.set(hero, { scale: 1, autoAlpha: 1 });
  }
}

  // Cinematic intro with typing effect and staged loading
  function initCinematicIntro() {
    const title = document.getElementById('cinematicTitle');
    if (!title) return;

    // Multi-language titles
    const titles = [
      { text: 'NOT A TOOL. NOT A SYSTEM.', lang: 'en', dir: 'ltr' },
      { text: 'ليست أداة. ليست نظامًا', lang: 'ar', dir: 'rtl' },
      { text: 'НЕ ИНСТРУМЕНТ. НЕ СИСТЕМА.', lang: 'ru', dir: 'ltr' },
      { text: '不是工具。不是系统。', lang: 'zh', dir: 'ltr' },
      { text: 'PAS UN OUTIL. PAS UN SYSTÈME.', lang: 'fr', dir: 'ltr' },
      { text: 'NO ES UNA HERRAMIENTA. NO ES UN SISTEMA.', lang: 'es', dir: 'ltr' }
    ];

    let currentIndex = 0;
    let isTyping = false;

    // Typing effect function
    function typeText(text, callback) {
      if (isTyping) return;
      isTyping = true;
      
      title.textContent = '';
      title.classList.add('typing');
      
      let charIndex = 0;
      const typingSpeed = 80; // milliseconds per character
      
      function typeChar() {
        if (charIndex < text.length) {
          title.textContent += text.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, typingSpeed);
        } else {
          // Typing complete
          setTimeout(() => {
            title.classList.remove('typing');
            isTyping = false;
            if (callback) callback();
          }, 1000); // Pause before removing cursor
        }
      }
      
      typeChar();
    }

    // Simple fade transition function
    function changeTitle() {
      if (isTyping) return;
      
      const nextIndex = (currentIndex + 1) % titles.length;
      const nextTitle = titles[nextIndex];
      
      // Simple fade out
      title.style.transition = 'opacity 0.5s ease-in-out';
      title.style.opacity = '0';
      
      setTimeout(() => {
        // Update language attributes
        title.setAttribute('dir', nextTitle.dir);
        title.setAttribute('lang', nextTitle.lang);
        
        // Handle Arabic font
        if (nextTitle.lang === 'ar') {
          title.classList.add('hero__title--ar');
        } else {
          title.classList.remove('hero__title--ar');
        }
        
        // Type the new text
        typeText(nextTitle.text, () => {
          currentIndex = nextIndex;
        });
        
        // Fade in during typing
        setTimeout(() => {
          title.style.opacity = '1';
        }, 100);
      }, 500);
    }

    // Start the sequence after staged loading
    setTimeout(() => {
      // Add staged loading animation
      title.classList.add('staged-title-load');
      
      // Type the first title
      setTimeout(() => {
        typeText(titles[0].text, () => {
          // Start the rotation after first title is typed
          setTimeout(() => {
            changeTitle();
            setInterval(changeTitle, 5000); // 5 seconds between titles
          }, 2000);
        });
      }, 500);
    }, 1500); // Wait for staged loading to complete
  }


  function init() {
    initNav();
    initAmbientParallax();
    initCinematicIntro();
    initPanelReveals();
    initMatrix().then(initMatrixKeyboardNav);
  }

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
