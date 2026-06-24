/* ============================================================
   Pradish G — Portfolio | script.js
   Pure vanilla JS · No dependencies
   ============================================================ */

(() => {
  'use strict';

  /* ----------------------------------------------------------
     0. CONSTANTS & HELPERS
  ---------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const MOBILE_BP = 1024;
  const NAV_HEIGHT = 80;

  /* ----------------------------------------------------------
     1. THEME TOGGLE
     – Dark mode default, persisted via localStorage
     – Falls back to prefers-color-scheme
  ---------------------------------------------------------- */
  const initTheme = () => {
    const toggle = $('#themeToggle');
    if (!toggle) return;

    const STORAGE_KEY = 'theme';
    const root = document.documentElement;

    // SVG icons for sun / moon
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>`;

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3
        7 7 0 0 0 21 12.79z"></path>
    </svg>`;

    /** Apply a theme and update the toggle icon */
    const applyTheme = (theme) => {
      root.setAttribute('data-theme', theme);
      toggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    };

    // Determine initial theme
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(initial);

    // Toggle handler
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  };

  /* ----------------------------------------------------------
     2. CUSTOM CURSOR (desktop only)
     – Dot follows instantly, outline trails with rAF lerp
     – Scales up on interactive elements
  ---------------------------------------------------------- */
  const initCustomCursor = () => {
    if (window.innerWidth < MOBILE_BP) return;

    // Create cursor elements
    const dot = document.createElement('div');
    dot.classList.add('cursor-dot');
    const outline = document.createElement('div');
    outline.classList.add('cursor-outline');
    document.body.appendChild(dot);
    document.body.appendChild(outline);
    document.body.classList.add('cursor-active');

    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    const LERP = 0.15; // smoothing factor

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows immediately
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Outline trails via rAF
    const animateOutline = () => {
      outlineX += (mouseX - outlineX) * LERP;
      outlineY += (mouseY - outlineY) * LERP;
      outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
      requestAnimationFrame(animateOutline);
    };
    requestAnimationFrame(animateOutline);

    // Scale up on interactive elements
    const interactiveSelector = 'a, button, .skill-chip, input, textarea, [role="button"]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        dot.classList.add('cursor-hover');
        outline.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        dot.classList.remove('cursor-hover');
        outline.classList.remove('cursor-hover');
      }
    });

    // Hide when cursor leaves the viewport
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      outline.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      outline.style.opacity = '1';
    });

    // Cleanup on resize below breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth < MOBILE_BP) {
        dot.remove();
        outline.remove();
        document.body.classList.remove('cursor-active');
      }
    });
  };

  /* ----------------------------------------------------------
     3. SCROLL PROGRESS BAR
     – scaleX-based width for smooth GPU-accelerated rendering
  ---------------------------------------------------------- */
  const initScrollProgress = () => {
    const bar = $('#scrollProgress');
    if (!bar) return;

    let ticking = false;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  };

  /* ----------------------------------------------------------
     4. NAVBAR
     – 'scrolled' class for sticky style
     – IntersectionObserver active-section highlighting
     – Mobile hamburger toggle
  ---------------------------------------------------------- */
  const initNavbar = () => {
    const nav = $('#navbar');
    const navLinks = $('.nav-links');
    const mobileToggle = $('#mobileToggle');
    const links = $$('.nav-link');

    if (!nav) return;

    // SVG hamburger & close icons
    const hamburgerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>`;

    const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;

    /* --- Scrolled state --- */
    let scrollTicking = false;
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
      scrollTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(onScroll);
        scrollTicking = true;
      }
    }, { passive: true });

    /* --- Active section highlighting via IntersectionObserver --- */
    const sections = $$('section[id]');
    if (sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              links.forEach((link) => {
                link.classList.toggle(
                  'active',
                  link.getAttribute('href') === `#${id}`
                );
              });
            }
          });
        },
        { rootMargin: `-${NAV_HEIGHT}px 0px -40% 0px`, threshold: 0.1 }
      );
      sections.forEach((sec) => observer.observe(sec));
    }

    /* --- Mobile toggle --- */
    if (mobileToggle && navLinks) {
      let isOpen = false;

      const setMenuState = (open) => {
        isOpen = open;
        navLinks.classList.toggle('open', open);
        mobileToggle.innerHTML = open ? closeIcon : hamburgerIcon;
        mobileToggle.setAttribute('aria-expanded', String(open));
        mobileToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        // Prevent body scroll when menu open
        document.body.style.overflow = open ? 'hidden' : '';
      };

      // Initialize icon
      mobileToggle.innerHTML = hamburgerIcon;
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Open menu');

      mobileToggle.addEventListener('click', () => setMenuState(!isOpen));

      // Close when a link is clicked
      links.forEach((link) => {
        link.addEventListener('click', () => {
          if (isOpen) setMenuState(false);
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) setMenuState(false);
      });
    }
  };

  /* ----------------------------------------------------------
     5. TYPING EFFECT
     – Cycles through titles with type / delete animation
  ---------------------------------------------------------- */
  const initTypingEffect = () => {
    const el = $('.typing-text');
    if (!el) return;

    const words = [
      'Software Engineer',
      'Backend Developer',
      'ML Enthusiast',
      'Data Scientist',
    ];

    const TYPING_SPEED = 80;   // ms per character typed
    const DELETING_SPEED = 50; // ms per character deleted
    const PAUSE_AFTER = 2000;  // ms pause when word is complete
    const PAUSE_BEFORE = 500;  // ms pause before next word

    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const tick = () => {
      const current = words[wordIdx];

      if (isDeleting) {
        charIdx--;
        el.textContent = current.substring(0, charIdx);
      } else {
        charIdx++;
        el.textContent = current.substring(0, charIdx);
      }

      let delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

      // Word fully typed
      if (!isDeleting && charIdx === current.length) {
        delay = PAUSE_AFTER;
        isDeleting = true;
      }

      // Word fully deleted
      if (isDeleting && charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        delay = PAUSE_BEFORE;
      }

      setTimeout(tick, delay);
    };

    // Kick off after a brief delay so page paint settles
    setTimeout(tick, 600);
  };

  /* ----------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS
     – .reveal elements gain .visible with staggered delay
  ---------------------------------------------------------- */
  const initScrollReveal = () => {
    const elements = $$('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        // Group entries that just became visible
        const visible = entries.filter((e) => e.isIntersecting);

        visible.forEach((entry, i) => {
          // Stagger each element within this batch
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  };

  /* ----------------------------------------------------------
     7. COUNTER ANIMATION
     – Animates numbers from 0 → target over 1500 ms
  ---------------------------------------------------------- */
  const initCounters = () => {
    const counters = $$('.stat-number');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const raw = el.textContent.trim();

      // Parse number and suffix, e.g. '3+', '8.02', '100%'
      const match = raw.match(/^([\d.]+)(.*)$/);
      if (!match) return;

      const target = parseFloat(match[1]);
      const suffix = match[2] || '';
      const isDecimal = match[1].includes('.');
      const decimalPlaces = isDecimal ? (match[1].split('.')[1]?.length || 0) : 0;

      const DURATION = 1500;
      const STEPS = 60;
      const stepTime = DURATION / STEPS;
      let current = 0;
      let step = 0;

      const update = () => {
        step++;
        // Ease-out quad
        const progress = 1 - Math.pow(1 - step / STEPS, 2);
        current = target * progress;

        if (step >= STEPS) {
          el.textContent = (isDecimal ? target.toFixed(decimalPlaces) : Math.floor(target)) + suffix;
          return;
        }

        el.textContent = (isDecimal ? current.toFixed(decimalPlaces) : Math.floor(current)) + suffix;
        setTimeout(update, stepTime);
      };

      // Reset to 0 before animating
      el.textContent = (isDecimal ? (0).toFixed(decimalPlaces) : '0') + suffix;
      update();
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  };

  /* ----------------------------------------------------------
     8. SMOOTH SCROLL
     – All #hash links scroll smoothly with navbar offset
  ---------------------------------------------------------- */
  const initSmoothScroll = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });

      // Update URL without jump
      history.pushState(null, '', href);
    });
  };

  /* ----------------------------------------------------------
     9. CONTACT FORM
     – Validates, constructs mailto:, shows success feedback
  ---------------------------------------------------------- */
  const initContactForm = () => {
    const form = $('#contactForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.textContent || 'Send Message';

    /** Highlight a field as invalid */
    const setInvalid = (field) => {
      field.classList.add('invalid');
      field.addEventListener('input', () => field.classList.remove('invalid'), { once: true });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect values
      const name = form.querySelector('#name') || form.querySelector('[name="name"]');
      const email = form.querySelector('#email') || form.querySelector('[name="email"]');
      const subject = form.querySelector('#subject') || form.querySelector('[name="subject"]');
      const message = form.querySelector('#message') || form.querySelector('[name="message"]');

      // Basic validation
      const requiredFields = [name, email, subject, message].filter(Boolean);
      let valid = true;
      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          setInvalid(field);
          valid = false;
        }
      });

      if (!valid) return;

      // Build mailto
      const subjectVal = encodeURIComponent(subject?.value.trim() || 'Portfolio Contact');
      const body = encodeURIComponent(
        `Name: ${name?.value.trim() || 'N/A'}\n` +
        `Email: ${email?.value.trim() || 'N/A'}\n\n` +
        `${message?.value.trim() || ''}`
      );

      const mailto = `mailto:pradishg05@gmail.com?subject=${subjectVal}&body=${body}`;
      window.open(mailto, '_self');

      // Success feedback
      if (submitBtn) {
        submitBtn.textContent = '✓ Message Sent!';
        submitBtn.style.borderColor = 'var(--accent)';
        submitBtn.classList.add('success');
        submitBtn.disabled = true;
      }

      // Reset after delay
      setTimeout(() => {
        form.reset();
        if (submitBtn) {
          submitBtn.textContent = originalBtnText;
          submitBtn.style.borderColor = '';
          submitBtn.classList.remove('success');
          submitBtn.disabled = false;
        }
      }, 2500);
    });
  };

  /* ----------------------------------------------------------
     10. AVATAR FALLBACK
     – Shows initials 'PG' if image fails to load
  ---------------------------------------------------------- */
  const initAvatarFallback = () => {
    const avatar = $('.hero-avatar img, .avatar-img');
    if (!avatar) return;

    avatar.addEventListener('error', () => {
      const parent = avatar.parentElement;
      avatar.style.display = 'none';

      // Only add fallback once
      if (parent.querySelector('.avatar-fallback')) return;

      const fallback = document.createElement('div');
      fallback.classList.add('avatar-fallback');
      fallback.textContent = 'PG';
      fallback.setAttribute('aria-label', 'Pradish G');
      parent.appendChild(fallback);
    });
  };

  /* ----------------------------------------------------------
     11. PAGE LOAD SEQUENCE
     – Adds 'loaded' class to body to trigger CSS fade-in
  ---------------------------------------------------------- */
  const initPageLoad = () => {
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100);
  };

  /* ----------------------------------------------------------
     12. KEYBOARD NAVIGATION
     – Enables focus outlines only for keyboard users
  ---------------------------------------------------------- */
  const initKeyboardNav = () => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  };

  /* ----------------------------------------------------------
     BOOTSTRAP — wire everything on DOMContentLoaded
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initPageLoad();
    initTheme();
    initCustomCursor();
    initScrollProgress();
    initNavbar();
    initTypingEffect();
    initScrollReveal();
    initCounters();
    initSmoothScroll();
    initContactForm();
    initAvatarFallback();
    initKeyboardNav();
  });
})();
