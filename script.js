// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const closeMenu = document.querySelector('.close-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu ul li a');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });
}

if (closeMenu && mobileMenu) {
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
}

// Close mobile menu when a link is clicked
if (mobileLinks.length > 0) {
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) mobileMenu.classList.remove('active');
        });
    });
}

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
if (fadeElements.length > 0) {
    fadeElements.forEach(el => {
        observer.observe(el);
    });
}

// Beast Mode Toggle
const beastModeToggle = document.getElementById('beastModeToggle');
const body = document.body;

// Check LocalStorage on Load
if (localStorage.getItem('beastMode_config') === 'enabled') {
    body.classList.add('beast-mode');
    if (beastModeToggle) beastModeToggle.checked = true;
}

if (beastModeToggle) {
    beastModeToggle.addEventListener('change', () => {
        if (beastModeToggle.checked) {
            body.classList.add('beast-mode');
            localStorage.setItem('beastMode_config', 'enabled');
            // Optional: Trigger a vibration if supported (for mobile)
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
        } else {
            body.classList.remove('beast-mode');
            localStorage.setItem('beastMode_config', 'disabled');
        }
    });
}

// AI Popup Logic
const aiPopup = document.getElementById('aiPopupOverlay');
const closeAiPopup = document.getElementById('closeAiPopup');

if (aiPopup && closeAiPopup) {
    // Show popup after a small delay
    setTimeout(() => {
        aiPopup.classList.add('show');
    }, 500);

    closeAiPopup.addEventListener('click', () => {
        aiPopup.classList.remove('show');
    });

    // Also close if clicked outside
    aiPopup.addEventListener('click', (e) => {
        if (e.target === aiPopup) {
            aiPopup.classList.remove('show');
        }
    });
}

// ----------------------------------------------------
// 1. Program Finder Logic
// ----------------------------------------------------
const programs = [
    { title: "Chest Explosion", part: "chest", level: "intermediate", link: "chest.html", desc: "Intense chest workout for mass." },
    { title: "Beginner Full Body", part: "all", level: "beginner", link: "index.html#workouts", desc: "Start your journey here." },
    { title: "Back Width & Thickness", part: "back", level: "advanced", link: "back.html", desc: "Build a cobra back." },
    { title: "Leg Day Destruction", part: "legs", level: "advanced", link: "legs.html", desc: "Can you walk after this?" },
    { title: "Arm Blaster", part: "arms", level: "intermediate", link: "arms.html", desc: "Biceps & Tricpes supersets." },
    { title: "Shoulder Boulder", part: "shoulders", level: "intermediate", link: "shoulders.html", desc: "3D Delts routine." }
];

const finderPart = document.getElementById('finder-part');
const finderLevel = document.getElementById('finder-level');
const finderResults = document.getElementById('finder-results');

function filterPrograms() {
    if (!finderPart || !finderLevel || !finderResults) return;

    const part = finderPart.value;
    const level = finderLevel.value;

    const filtered = programs.filter(p => {
        return (part === 'all' || p.part === part) &&
            (level === 'all' || p.level === level);
    });

    finderResults.innerHTML = '';

    if (filtered.length === 0) {
        finderResults.innerHTML = '<p style="color: grey; text-align: center;">ไม่พบตารางฝึกที่ตรงกับเงื่อนไข</p>';
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'result-card fade-in';
        card.innerHTML = `
            <div class="result-info">
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
            </div>
            <a href="${p.link}" class="btn secondary" style="font-size: 0.8rem; padding: 5px 15px;">View</a>
        `;
        finderResults.appendChild(card);
    });
}

// Initial Load
if (finderPart) {
    finderPart.addEventListener('change', filterPrograms);
    finderLevel.addEventListener('change', filterPrograms);
    // Load initial data
    window.addEventListener('load', filterPrograms);
}

// ----------------------------------------------------
// 2. Minimal BMR Calculator Logic
// ----------------------------------------------------
const btnCalc = document.getElementById('btn-calculate');

if (btnCalc) {
    btnCalc.addEventListener('click', () => {
        const genderInput = document.querySelector('input[name="gender"]:checked');
        const ageInput = document.getElementById('bmr-age');
        const heightInput = document.getElementById('bmr-height');
        const weightInput = document.getElementById('bmr-weight');
        const activityInput = document.getElementById('bmr-activity');

        if (!genderInput || !ageInput || !heightInput || !weightInput || !activityInput) return;

        const gender = genderInput.value;
        const age = parseFloat(ageInput.value);
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        const activity = parseFloat(activityInput.value);

        if (!age || !height || !weight) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        // Mifflin-St Jeor Equation
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        const tdee = Math.round(bmr * activity);

        // Update UI
        document.getElementById('res-maintenance').innerText = tdee;
        document.getElementById('res-cut').innerText = tdee - 500;
        document.getElementById('res-bulk').innerText = tdee + 300;

        document.getElementById('bmr-result').classList.remove('hidden');
    });
}
