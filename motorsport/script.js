// ── NAVBAR SCROLL ──
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ── MOBILE MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => mobileMenu.classList.remove('open'))
    );
}

// ── FADE-IN ON SCROLL ──
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        });
    }, { threshold: 0.1 });
    fadeEls.forEach(el => observer.observe(el));
}

// ── SECTION NAV ACTIVE + SCROLL ──
const tabBtns = document.querySelectorAll('.snav-btn');
const contentSections = document.querySelectorAll('.content-section');

if (tabBtns.length && contentSections.length) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (target) {
                const offset = 68 + 52; // navbar + section-nav height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Highlight active tab on scroll
    const secObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                tabBtns.forEach(b => b.classList.toggle('active', b.dataset.target === id));
            }
        });
    }, { threshold: 0.3, rootMargin: '-68px 0px -50% 0px' });
    contentSections.forEach(s => secObserver.observe(s));

    // Set first tab active by default
    tabBtns[0]?.classList.add('active');
}

// ── COUNTER ANIMATION (STATS BAR) ──
function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = start + suffix;
    }, 25);
}
const statNumbers = document.querySelectorAll('.stat-number[data-count]');
if (statNumbers.length) {
    const statsObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { animateCounter(e.target); statsObs.unobserve(e.target); }
        });
    }, { threshold: 0.5 });
    statNumbers.forEach(el => statsObs.observe(el));
}
