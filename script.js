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

// ----------------------------------------------------
// 1. Program Finder Logic
// ----------------------------------------------------
const programs = [
    { title: "Chest Explosion", part: "chest", level: "intermediate", link: "chest.html", desc: "Intense chest workout for mass." },
    { title: "Beginner Full Body", part: "all", level: "beginner", link: "#workouts", desc: "Start your journey here." },
    { title: "Back Width & Thickness", part: "back", level: "advanced", link: "#", desc: "Build a cobra back." },
    { title: "Leg Day Destruction", part: "legs", level: "advanced", link: "#", desc: "Can you walk after this?" },
    { title: "Arm Blaster", part: "arms", level: "intermediate", link: "#", desc: "Biceps & Tricpes supersets." },
    { title: "Shoulder Boulder", part: "shoulders", level: "intermediate", link: "#", desc: "3D Delts routine." }
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
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('bmr-age').value);
        const height = parseFloat(document.getElementById('bmr-height').value);
        const weight = parseFloat(document.getElementById('bmr-weight').value);
        const activity = parseFloat(document.getElementById('bmr-activity').value);

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

// ----------------------------------------------------
// 3. Workout Timer Logic
// ----------------------------------------------------
let timerInterval;
let timerSeconds = 0;
let isTimerRunning = false;

const timerDisplayMin = document.getElementById('timer-minutes');
const timerDisplaySec = document.getElementById('timer-seconds');

function updateTimerDisplay() {
    const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const s = (timerSeconds % 60).toString().padStart(2, '0');
    if (timerDisplayMin) timerDisplayMin.innerText = m;
    if (timerDisplaySec) timerDisplaySec.innerText = s;
}

function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            pauseTimer();
            alert("หมดเวลาพัก!");
        }
    }, 1000);
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 0;
    updateTimerDisplay();
}

window.setTimer = function (seconds) {
    pauseTimer();
    timerSeconds = seconds;
    updateTimerDisplay();
    startTimer();
}

// Event Listeners for Timer
const btnTimerStart = document.getElementById('timer-start');
const btnTimerPause = document.getElementById('timer-pause');
const btnTimerReset = document.getElementById('timer-reset');
const timerWidget = document.getElementById('workout-timer-widget');
const timerToggleBtn = document.querySelector('.timer-toggle-btn');

if (btnTimerStart) {
    btnTimerStart.addEventListener('click', startTimer);
    btnTimerPause.addEventListener('click', pauseTimer);
    btnTimerReset.addEventListener('click', resetTimer);
}

if (timerToggleBtn && timerWidget) {
    timerToggleBtn.addEventListener('click', () => {
        timerWidget.classList.toggle('minimized');
    });
}


