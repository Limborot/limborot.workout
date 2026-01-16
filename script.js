// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const closeMenu = document.querySelector('.close-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu ul li a');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
});

// Close mobile menu when a link is clicked
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Scroll Animations (Intersection Observer)
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

const fadeElements = document.querySelectorAll('.fade-in');
fadeElements.forEach(el => {
    observer.observe(el);
});

// Beast Mode Toggle
const beastModeToggle = document.getElementById('beastModeToggle');
const body = document.body;

beastModeToggle.addEventListener('change', () => {
    if (beastModeToggle.checked) {
        body.classList.add('beast-mode');
        // Optional: Trigger a vibration if supported (for mobile)
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    } else {
        body.classList.remove('beast-mode');
    }
});
