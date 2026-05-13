// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  
  // Active link highlighting
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  navToggle.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.textContent = '☰';
  });
});

// ===== SCROLL REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), index * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ===== TYPING EFFECT FOR GREETING =====
const greeting = document.querySelector('.hero-greeting');
if (greeting) {
  const text = greeting.textContent;
  greeting.textContent = '';
  greeting.style.borderRight = '2px solid var(--secondary)';
  let i = 0;
  const typeInterval = setInterval(() => {
    greeting.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(typeInterval);
      setTimeout(() => { greeting.style.borderRight = 'none'; }, 1500);
    }
  }, 50);
}

// ===== MOUSE-FOLLOW GLOW ON PROJECT CARDS =====
document.querySelectorAll('.project-card, .skill-category').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(108, 99, 255, 0.06), rgba(26, 26, 46, 0.6) 60%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = 'rgba(26, 26, 46, 0.6)';
  });
});

// ===== SKILL CHIP HOVER COLORS =====
document.querySelectorAll('.skill-chip').forEach(chip => {
  const colors = ['#6C63FF', '#00D4AA', '#FF6B9D', '#FFB785', '#41EEC2', '#C4C0FF'];
  chip.addEventListener('mouseenter', () => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    chip.style.borderColor = color;
    chip.style.background = color + '20';
    chip.style.boxShadow = `0 0 12px ${color}30`;
  });
  chip.addEventListener('mouseleave', () => {
    chip.style.borderColor = '';
    chip.style.background = '';
    chip.style.boxShadow = '';
  });
});

// ===== SMOOTH COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const text = el.textContent;
      const numMatch = text.match(/[\d.]+/);
      if (numMatch) {
        const target = parseFloat(numMatch[0]);
        const suffix = text.replace(numMatch[0], '');
        const duration = 1500;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = (Number.isInteger(target) ? Math.floor(current) : current.toFixed(2)) + suffix;
        }, duration / steps);
      }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

// ===== CONTACT FORM =====
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Sending... ⏳';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = 'Message Sent! ✅';
    btn.style.background = 'var(--secondary)';
    e.target.reset();
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 2500);
  }, 1500);
}

// ===== PARALLAX FOR BG SHAPES =====
window.addEventListener('scroll', () => {
  const shapes = document.querySelectorAll('.bg-shapes .shape');
  const scrollY = window.scrollY;
  shapes.forEach((shape, i) => {
    const speed = (i + 1) * 0.02;
    shape.style.transform = `translateY(${scrollY * speed}px)`;
  });
});

// ===== AVATAR FALLBACK =====
const avatar = document.getElementById('heroAvatar');
if (avatar) {
  avatar.addEventListener('error', () => {
    avatar.style.display = 'none';
    const wrap = avatar.parentElement;
    wrap.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:5rem;font-family:var(--font-head);font-weight:700;color:#fff;position:relative;z-index:1;">PG</div>`;
  });
}
