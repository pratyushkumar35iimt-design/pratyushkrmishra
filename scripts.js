// utility functions
const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));
const raf = window.requestAnimationFrame || ((cb)=>setTimeout(cb,16));

// Configuration for sticky note (set to false to disable)
const SHOW_STICKY_NOTE = true;

// Initialize sticky note functionality
function initStickyNote() {
  if (!SHOW_STICKY_NOTE) {
    const stickyNote = q('#stickyNote');
    if (stickyNote) stickyNote.style.display = 'none';
    return;
  }

  const stickyNote = q('#stickyNote');
  const stickyClose = q('#stickyClose');
  
  if (stickyClose) {
    stickyClose.addEventListener('click', () => {
      stickyNote.style.transform = 'translateX(400px) rotate(10deg)';
      setTimeout(() => {
        stickyNote.style.display = 'none';
      }, 300);
    });
  }

  // Hide sticky note after 10 seconds
  setTimeout(() => {
    if (stickyNote && stickyNote.style.display !== 'none') {
      stickyNote.style.opacity = '0';
      setTimeout(() => {
        stickyNote.style.display = 'none';
      }, 300);
    }
  }, 10000);
}

// header sticky behavior
const header = q('#siteHeader');
window.addEventListener('scroll', ()=> {
  if(window.scrollY > 36) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, {passive:true});

// mobile navigation toggle
const navToggle = q('#navToggle');
const mainNav = q('#mainNav');
navToggle.addEventListener('click', ()=>{
  const open = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

// smooth anchor scrolling
qa('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if(href.startsWith('#')){
      e.preventDefault();
      const el = document.querySelector(href);
      if(el) {
        el.scrollIntoView({behavior:'smooth', block:'start'});
      }
      if(mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      }
    }
  });
});

// KPI counter animation
function animateCounter(el, target, duration=900){
  const start = +el.innerText || 0;
  const range = target - start;
  let startTime = null;
  
  function step(ts){
    if(!startTime) startTime = ts;
    const progress = Math.min((ts - startTime)/duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    el.innerText = Math.floor(start + range * easeOutQuart);
    if(progress < 1) raf(step);
  }
  raf(step);
}

// Initialize KPI counters when they come into view
qa('.kpi-number').forEach(el=>{
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        animateCounter(el, +el.dataset.target || 0, 900);
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:0.6});
  obs.observe(el);
});

// Animate elements on scroll
const viewEls = qa('.case, .about-story, .about-pillars, .skill, .tools-list, .contact-form, .contact-info');
const viewObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) {
      e.target.classList.add('in-view');
    }
  });
},{threshold:0.18, rootMargin: '0px 0px -50px 0px'});

viewEls.forEach(el=>viewObs.observe(el));

// Animate KPI tiles with stagger
const kpiTiles = qa('.kpi-tile');
const kpiObs = new IntersectionObserver((entries)=>{
  entries.forEach((entry, index) => {
    if(entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, index * 100);
      kpiObs.unobserve(entry.target);
    }
  });
},{threshold:0.3});

kpiTiles.forEach(tile => kpiObs.observe(tile));

// Animate KPI cards
const kpiCards = qa('.kpi');
const kpiCardObs = new IntersectionObserver((entries)=>{
  entries.forEach((entry, index) => {
    if(entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, index * 150);
      kpiCardObs.unobserve(entry.target);
    }
  });
},{threshold:0.3});

kpiCards.forEach(card => kpiCardObs.observe(card));

// Skill meters animation
qa('.meter-fill').forEach(m=>{
  const val = +m.dataset.fill || 70;
  const mo = new IntersectionObserver((entries)=>{
    if(entries[0].isIntersecting){
      setTimeout(() => {
        m.style.width = val + '%';
      }, 200);
      mo.unobserve(m);
    }
  }, {threshold:0.28});
  mo.observe(m);
});

// Timeline animation
const timeline = q('.timeline');
if(timeline) {
  const timelineObs = new IntersectionObserver((entries)=>{
    if(entries[0].isIntersecting) {
      timeline.classList.add('in-view');
      // Animate individual timeline items
      const timelineItems = qa('.timeline li');
      timelineItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('in-view');
        }, index * 100);
      });
      timelineObs.unobserve(timeline);
    }
  }, {threshold:0.2});
  timelineObs.observe(timeline);
}

// Before/After slider functionality
qa('.before-after').forEach(box=>{
  const after = box.querySelector('.after');
  const handle = box.querySelector('.slider-handle');
  let dragging = false;
  
  const setPos = x => {
    const rect = box.getBoundingClientRect();
    let pct = (x - rect.left) / rect.width * 100;
    pct = Math.max(6, Math.min(94, pct));
    after.style.width = pct + '%';
    handle.style.left = pct + '%';
  };
  
  // Mouse events
  box.addEventListener('pointerdown', e=>{ 
    dragging = true; 
    box.setPointerCapture(e.pointerId); 
    setPos(e.clientX); 
  });
  
  window.addEventListener('pointermove', e=>{ 
    if(dragging) setPos(e.clientX); 
  });
  
  window.addEventListener('pointerup', ()=>{ 
    dragging = false; 
  });
  
  // Touch events for mobile
  box.addEventListener('touchstart', e=>{ 
    dragging = true; 
    const touch = e.touches[0];
    setPos(touch.clientX); 
  });
  
  window.addEventListener('touchmove', e=>{ 
    if(dragging) {
      const touch = e.touches[0];
      setPos(touch.clientX); 
    }
  });
  
  window.addEventListener('touchend', ()=>{ 
    dragging = false; 
  });
});

// Contact form validation and submission
const contactForm = q('#contactForm');
if(contactForm){
  contactForm.addEventListener('submit', e=>{
    e.preventDefault();
    
    const name = contactForm.elements['name'].value.trim();
    const email = contactForm.elements['email'].value.trim();
    const message = contactForm.elements['message'].value.trim();
    
    // Basic validation
    let errors = [];
    
    if(!name || name.length < 2) {
      errors.push('Name must be at least 2 characters long.');
    }
    
    if(!email || !isValidEmail(email)) {
      errors.push('Please enter a valid email address.');
    }
    
    if(!message || message.length < 15) {
      errors.push('Message should be at least 15 characters long.');
    }
    
    if(errors.length > 0) {
      showError(errors.join('\n'));
      return;
    }
    
    // Show success message (in real implementation, this would send to a server)
    showSuccess('Message sent! I\'ll reply within 2 business days.');
    contactForm.reset();
  });
}

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showError(message) {
  // Create error toast
  const toast = document.createElement('div');
  toast.className = 'toast error';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if(toist.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

function showSuccess(message) {
  // Create success toast
  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-accent);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if(toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// Add parallax effect to hero section (subtle)
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = q('.hero');
  if(hero && scrolled < window.innerHeight) {
    const speed = 0.5;
    hero.style.transform = `translateY(${scrolled * speed}px)`;
  }
}, {passive: true});

// Enhanced scroll animations
function initScrollAnimations() {
  // Parallax effect for hero background
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = q('.hero');
    if(hero && scrolled < window.innerHeight) {
      const speed = 0.5;
      hero.style.transform = `translateY(${scrolled * speed}px)`;
    }
  }, {passive: true});

  // Floating animation for images
  const floatingElements = qa('.about-image, .pillar-image, .tools-image');
  floatingElements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.2}s`;
    el.classList.add('floating');
  });

  // Reveal animations on scroll
  const revealElements = qa('.case, .timeline li, .skill, .kpi-tile');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));
}

// Mouse move effect for interactive elements
function initMouseEffects() {
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    const cards = qa('.kpi, .case-left, .skill');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;
      const angleX = (e.clientY - cardY) * 0.01;
      const angleY = (e.clientX - cardX) * -0.01;
      
      if (Math.abs(e.clientX - cardX) < 200 && Math.abs(e.clientY - cardY) < 200) {
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(10px)`;
      } else {
        card.style.transform = '';
      }
    });
  });
}

// Initialize page animations on load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize sticky note
  initStickyNote();
  
  // Initialize enhanced animations
  initScrollAnimations();
  initMouseEffects();
  
  // Add initial animation classes
  setTimeout(() => {
    q('.hero-title')?.classList.add('in-view');
    q('.hero-sub')?.classList.add('in-view');
    q('.hero-ctas')?.classList.add('in-view');
  }, 100);
});

// Add floating animation CSS
const floatingCSS = `
  .floating {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .revealed {
    animation: reveal 0.6s ease forwards;
  }
  
  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = floatingCSS;
document.head.appendChild(styleSheet);

// Keyboard navigation enhancement
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && mainNav.classList.contains('open')) {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }
});

// Add focus management for mobile menu
navToggle.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    navToggle.click();
  }
});