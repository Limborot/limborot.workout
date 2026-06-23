/* ================================================
   TDEE Calculator — Nutrition by Limborot
   Calculator Logic & Interactions
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // === Navigation ===
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll effect
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('show');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('show');
        });
    });

    // === Scroll Animations (Intersection Observer) ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.knowledge-card, .method-card, .activity-card, .comparison-table-wrapper').forEach(el => {
        observer.observe(el);
    });

    // === Calculator Tab Switching ===
    const tabStandard = document.getElementById('tabStandard');
    const tabLBM = document.getElementById('tabLBM');
    const formStandard = document.getElementById('formStandard');
    const formLBM = document.getElementById('formLBM');

    tabStandard.addEventListener('click', () => {
        tabStandard.classList.add('active');
        tabLBM.classList.remove('active');
        formStandard.classList.add('active');
        formLBM.classList.remove('active');
    });

    tabLBM.addEventListener('click', () => {
        tabLBM.classList.add('active');
        tabStandard.classList.remove('active');
        formLBM.classList.add('active');
        formStandard.classList.remove('active');
    });

    // === Gender Toggle ===
    const genderMale = document.getElementById('genderMale');
    const genderFemale = document.getElementById('genderFemale');
    let selectedGender = 'male';

    genderMale.addEventListener('click', () => {
        genderMale.classList.add('active');
        genderFemale.classList.remove('active');
        selectedGender = 'male';
    });

    genderFemale.addEventListener('click', () => {
        genderFemale.classList.add('active');
        genderMale.classList.remove('active');
        selectedGender = 'female';
    });

    // === Activity Level Selection ===
    let stdActivityFactor = 1.55;
    let lbmActivityFactor = 1.55;

    const stdActivityOptions = document.querySelectorAll('#stdActivity .activity-option');
    const lbmActivityOptions = document.querySelectorAll('#lbmActivity .activity-option');

    stdActivityOptions.forEach(option => {
        option.addEventListener('click', () => {
            stdActivityOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            stdActivityFactor = parseFloat(option.dataset.value);
        });
    });

    lbmActivityOptions.forEach(option => {
        option.addEventListener('click', () => {
            lbmActivityOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            lbmActivityFactor = parseFloat(option.dataset.value);
        });
    });

    // === Activity Level Labels ===
    const activityLabels = {
        1.2: 'Sedentary (×1.2)',
        1.375: 'Lightly Active (×1.375)',
        1.55: 'Moderately Active (×1.55)',
        1.725: 'Very Active (×1.725)',
        1.9: 'Extra Active (×1.9)'
    };

    // === Form Validation ===
    function validateInput(input) {
        const value = parseFloat(input.value);
        if (isNaN(value) || value <= 0) {
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 600);
            return false;
        }
        input.classList.remove('error');
        return true;
    }

    // === Animated Number Counter ===
    function animateNumber(element, targetValue, duration = 800, suffix = '') {
        const startValue = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (targetValue - startValue) * eased);

            element.textContent = current.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // === Display Results ===
    function displayResults(bmr, tdee, method, activityFactor, extraData = {}) {
        const resultsPlaceholder = document.getElementById('resultsPlaceholder');
        const resultsContent = document.getElementById('resultsContent');

        resultsPlaceholder.style.display = 'none';
        resultsContent.style.display = 'block';

        // Method Badge
        const methodBadge = document.getElementById('resultMethodBadge');
        if (method === 'standard') {
            methodBadge.textContent = 'Mifflin-St Jeor (น้ำหนักตัว)';
            methodBadge.classList.remove('alt');
        } else {
            methodBadge.textContent = 'Katch-McArdle (Lean Body Mass)';
            methodBadge.classList.add('alt');
        }

        // BMR
        const resultBMR = document.getElementById('resultBMR');
        animateNumber(resultBMR, Math.round(bmr));

        // Formula Used
        const formulaUsed = document.getElementById('resultFormulaUsed');
        if (method === 'standard') {
            formulaUsed.textContent = extraData.gender === 'male'
                ? '(10×W) + (6.25×H) − (5×A) + 5'
                : '(10×W) + (6.25×H) − (5×A) − 161';
        } else {
            formulaUsed.textContent = '370 + (21.6 × LBM)';
        }

        // LBM Info (only for Katch-McArdle)
        const lbmInfo = document.getElementById('resultLBMInfo');
        if (method === 'lbm' && extraData.lbm) {
            lbmInfo.style.display = 'grid';
            document.getElementById('resultLBMValue').textContent = extraData.lbm.toFixed(1) + ' kg';
            document.getElementById('resultFatMass').textContent = extraData.fatMass.toFixed(1) + ' kg';
        } else {
            lbmInfo.style.display = 'none';
        }

        // TDEE
        const resultTDEE = document.getElementById('resultTDEE');
        animateNumber(resultTDEE, Math.round(tdee), 1000);

        // Activity Used
        document.getElementById('resultActivityUsed').textContent =
            'Activity Factor: ' + activityLabels[activityFactor];

        // Goals
        const tdeeRounded = Math.round(tdee);
        animateNumber(document.getElementById('goalBulkMin'), tdeeRounded + 300, 900);
        animateNumber(document.getElementById('goalBulkMax'), tdeeRounded + 500, 900);
        animateNumber(document.getElementById('goalMaintain'), tdeeRounded, 900);
        animateNumber(document.getElementById('goalCutMin'), tdeeRounded - 300, 900);
        animateNumber(document.getElementById('goalCutMax'), tdeeRounded - 500, 900);

        // Macros (30% protein, 45% carbs, 25% fat)
        const proteinCals = tdeeRounded * 0.30;
        const carbsCals = tdeeRounded * 0.45;
        const fatCals = tdeeRounded * 0.25;

        const proteinGrams = Math.round(proteinCals / 4);
        const carbsGrams = Math.round(carbsCals / 4);
        const fatGrams = Math.round(fatCals / 9);

        animateNumber(document.getElementById('macroProtein'), proteinGrams, 800, 'g');
        animateNumber(document.getElementById('macroCarbs'), carbsGrams, 800, 'g');
        animateNumber(document.getElementById('macroFat'), fatGrams, 800, 'g');

        // Scroll to results on mobile
        if (window.innerWidth <= 1024) {
            setTimeout(() => {
                document.getElementById('resultsPanel').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 200);
        }
    }

    // === Standard Method Calculation (Mifflin-St Jeor) ===
    formStandard.addEventListener('submit', (e) => {
        e.preventDefault();

        const ageInput = document.getElementById('stdAge');
        const weightInput = document.getElementById('stdWeight');
        const heightInput = document.getElementById('stdHeight');

        // Validate
        const isAgeValid = validateInput(ageInput);
        const isWeightValid = validateInput(weightInput);
        const isHeightValid = validateInput(heightInput);

        if (!isAgeValid || !isWeightValid || !isHeightValid) return;

        const age = parseFloat(ageInput.value);
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);

        // Mifflin-St Jeor Formula
        let bmr;
        if (selectedGender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        const tdee = bmr * stdActivityFactor;

        displayResults(bmr, tdee, 'standard', stdActivityFactor, {
            gender: selectedGender
        });
    });

    // === LBM Method Calculation (Katch-McArdle) ===
    formLBM.addEventListener('submit', (e) => {
        e.preventDefault();

        const weightInput = document.getElementById('lbmWeight');
        const bodyFatInput = document.getElementById('lbmBodyFat');

        // Validate
        const isWeightValid = validateInput(weightInput);
        const isBodyFatValid = validateInput(bodyFatInput);

        if (!isWeightValid || !isBodyFatValid) return;

        const weight = parseFloat(weightInput.value);
        const bodyFat = parseFloat(bodyFatInput.value);

        // Katch-McArdle Formula
        const lbm = weight * (1 - bodyFat / 100);
        const fatMass = weight - lbm;
        const bmr = 370 + (21.6 * lbm);
        const tdee = bmr * lbmActivityFactor;

        displayResults(bmr, tdee, 'lbm', lbmActivityFactor, {
            lbm: lbm,
            fatMass: fatMass
        });
    });

    // === Reset Button ===
    document.getElementById('btnReset').addEventListener('click', () => {
        const resultsPlaceholder = document.getElementById('resultsPlaceholder');
        const resultsContent = document.getElementById('resultsContent');

        resultsContent.style.display = 'none';
        resultsPlaceholder.style.display = 'flex';

        // Clear all inputs
        document.querySelectorAll('.form-input').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });

        // Reset gender
        genderMale.classList.add('active');
        genderFemale.classList.remove('active');
        selectedGender = 'male';

        // Reset activity to Moderately Active
        stdActivityOptions.forEach(o => {
            o.classList.toggle('active', o.dataset.value === '1.55');
        });
        lbmActivityOptions.forEach(o => {
            o.classList.toggle('active', o.dataset.value === '1.55');
        });
        stdActivityFactor = 1.55;
        lbmActivityFactor = 1.55;

        // Scroll to calculator
        document.getElementById('calculator').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });

    // === Smooth Nav Link Highlighting ===
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-link-cta)');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = 'var(--accent-primary)';
            }
        });
    });

    // === Input Focus Animation ===
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.01)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // === Keyboard Support: Enter to calculate ===
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = input.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    });

});
