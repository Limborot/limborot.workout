/* ================================================
   TDEE Calculator — Nutrition by Limborot
   Calculator Logic & Interactions
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // === Navigation ===
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('show');
        });
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('show');
            });
        });
    }

    // === Scroll Animations ===
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.knowledge-card, .method-card, .activity-card, .comparison-table-wrapper').forEach(el => {
        observer.observe(el);
    });

    // === Calculator (only if on calculator page) ===
    const tabStandard = document.getElementById('tabStandard');
    const tabLBM = document.getElementById('tabLBM');
    const formStandard = document.getElementById('formStandard');
    const formLBM = document.getElementById('formLBM');

    if (!tabStandard || !tabLBM) return;

    // --- Store last TDEE for macro recalculation ---
    let lastTDEE = 0;

    // === Tab Switching ===
    tabStandard.addEventListener('click', () => {
        tabStandard.classList.add('active');
        tabLBM.classList.remove('active');
        formStandard.classList.add('active');
        formLBM.classList.remove('active');
        const stdInfo = document.getElementById('formulaInfoStd');
        const lbmInfo = document.getElementById('formulaInfoLBM');
        if (stdInfo && lbmInfo) { stdInfo.style.display = ''; lbmInfo.style.display = 'none'; }
    });

    tabLBM.addEventListener('click', () => {
        tabLBM.classList.add('active');
        tabStandard.classList.remove('active');
        formLBM.classList.add('active');
        formStandard.classList.remove('active');
        const stdInfo = document.getElementById('formulaInfoStd');
        const lbmInfo = document.getElementById('formulaInfoLBM');
        if (stdInfo && lbmInfo) { stdInfo.style.display = 'none'; lbmInfo.style.display = ''; }
    });

    // === Formula Info Toggle ===
    const formulaToggleBtn = document.getElementById('formulaToggleStd');
    if (formulaToggleBtn) {
        formulaToggleBtn.addEventListener('click', () => {
            formulaToggleBtn.classList.toggle('active');
            const stdInfo = document.getElementById('formulaInfoStd');
            const lbmInfo = document.getElementById('formulaInfoLBM');
            const isStdActive = tabStandard.classList.contains('active');
            if (formulaToggleBtn.classList.contains('active')) {
                if (isStdActive && stdInfo) stdInfo.classList.add('show');
                if (!isStdActive && lbmInfo) lbmInfo.classList.add('show');
            } else {
                if (stdInfo) stdInfo.classList.remove('show');
                if (lbmInfo) lbmInfo.classList.remove('show');
            }
        });
    }

    // === Gender Toggle ===
    const genderMale = document.getElementById('genderMale');
    const genderFemale = document.getElementById('genderFemale');
    let selectedGender = 'male';

    if (genderMale && genderFemale) {
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
    }

    // === Activity Level ===
    let stdActivityFactor = 1.55;
    let lbmActivityFactor = 1.55;

    document.querySelectorAll('#stdActivity .activity-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#stdActivity .activity-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            stdActivityFactor = parseFloat(option.dataset.value);
        });
    });

    document.querySelectorAll('#lbmActivity .activity-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('#lbmActivity .activity-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            lbmActivityFactor = parseFloat(option.dataset.value);
        });
    });

    const activityLabels = {
        1.2: 'Sedentary (×1.2)', 1.375: 'Lightly Active (×1.375)',
        1.55: 'Moderately Active (×1.55)', 1.725: 'Very Active (×1.725)',
        1.9: 'Extra Active (×1.9)'
    };

    // === Validation ===
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

    // === Animated Number ===
    function animateNumber(element, targetValue, duration = 800, suffix = '') {
        const startTime = performance.now();
        function update(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(targetValue * eased).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // =============================================
    // === INTERACTIVE MACRO ADJUSTER ===
    // =============================================

    const macroProteinRange = document.getElementById('macroProteinRange');
    const macroCarbsRange = document.getElementById('macroCarbsRange');
    const macroFatRange = document.getElementById('macroFatRange');

    const macroProteinPercent = document.getElementById('macroProteinPercent');
    const macroCarbsPercent = document.getElementById('macroCarbsPercent');
    const macroFatPercent = document.getElementById('macroFatPercent');

    function getMacroValues() {
        return {
            protein: parseInt(macroProteinPercent.value) || 0,
            carbs: parseInt(macroCarbsPercent.value) || 0,
            fat: parseInt(macroFatPercent.value) || 0
        };
    }

    function updateMacroUI() {
        const m = getMacroValues();
        const total = m.protein + m.carbs + m.fat;
        const tdee = lastTDEE;

        // Sync range sliders with number inputs
        macroProteinRange.value = m.protein;
        macroCarbsRange.value = m.carbs;
        macroFatRange.value = m.fat;

        // Sync number inputs with range sliders
        macroProteinPercent.value = m.protein;
        macroCarbsPercent.value = m.carbs;
        macroFatPercent.value = m.fat;

        // Total badge
        const totalBadge = document.getElementById('macroTotalBadge');
        const totalPercentEl = document.getElementById('macroTotalPercent');
        const warnEl = document.getElementById('macroWarn');
        totalPercentEl.textContent = total;

        if (total === 100) {
            totalBadge.classList.remove('warning');
            totalBadge.classList.add('valid');
            warnEl.style.display = 'none';
        } else {
            totalBadge.classList.add('warning');
            totalBadge.classList.remove('valid');
            warnEl.style.display = 'block';
        }

        // Total bar
        document.getElementById('macroBarProtein').style.width = m.protein + '%';
        document.getElementById('macroBarCarbs').style.width = m.carbs + '%';
        document.getElementById('macroBarFat').style.width = m.fat + '%';

        // Calculate grams & kcal
        const proteinKcal = Math.round(tdee * m.protein / 100);
        const carbsKcal = Math.round(tdee * m.carbs / 100);
        const fatKcal = Math.round(tdee * m.fat / 100);

        const proteinGrams = Math.round(proteinKcal / 4);
        const carbsGrams = Math.round(carbsKcal / 4);
        const fatGrams = Math.round(fatKcal / 9);

        // Update slider values
        document.getElementById('macroProteinGrams').textContent = proteinGrams + 'g';
        document.getElementById('macroCarbsGrams').textContent = carbsGrams + 'g';
        document.getElementById('macroFatGrams').textContent = fatGrams + 'g';

        document.getElementById('macroProteinKcal').textContent = proteinKcal + ' kcal';
        document.getElementById('macroCarbsKcal').textContent = carbsKcal + ' kcal';
        document.getElementById('macroFatKcal').textContent = fatKcal + ' kcal';

        // Update summary
        document.getElementById('summaryProtein').textContent = proteinGrams + 'g';
        document.getElementById('summaryCarbs').textContent = carbsGrams + 'g';
        document.getElementById('summaryFat').textContent = fatGrams + 'g';
        document.getElementById('macroDonutTotal').textContent = Math.round(tdee).toLocaleString();

        // Update donut chart
        const circumference = 100; // percentage-based
        const proteinDash = m.protein;
        const carbsDash = m.carbs;
        const fatDash = m.fat;

        const donutProtein = document.getElementById('donutProtein');
        const donutCarbs = document.getElementById('donutCarbs');
        const donutFat = document.getElementById('donutFat');

        donutProtein.setAttribute('stroke-dasharray', `${proteinDash} ${circumference - proteinDash}`);
        donutProtein.setAttribute('stroke-dashoffset', '0');

        donutCarbs.setAttribute('stroke-dasharray', `${carbsDash} ${circumference - carbsDash}`);
        donutCarbs.setAttribute('stroke-dashoffset', `-${proteinDash}`);

        donutFat.setAttribute('stroke-dasharray', `${fatDash} ${circumference - fatDash}`);
        donutFat.setAttribute('stroke-dashoffset', `-${proteinDash + carbsDash}`);

        // Deactivate presets if custom
        const presets = document.querySelectorAll('.macro-preset');
        let matchedPreset = false;
        presets.forEach(p => {
            const pp = parseInt(p.dataset.protein);
            const pc = parseInt(p.dataset.carbs);
            const pf = parseInt(p.dataset.fat);
            if (pp === m.protein && pc === m.carbs && pf === m.fat) {
                p.classList.add('active');
                matchedPreset = true;
            } else {
                p.classList.remove('active');
            }
        });
    }

    // --- Range slider events ---
    if (macroProteinRange) {
        macroProteinRange.addEventListener('input', () => {
            macroProteinPercent.value = macroProteinRange.value;
            updateMacroUI();
        });
        macroCarbsRange.addEventListener('input', () => {
            macroCarbsPercent.value = macroCarbsRange.value;
            updateMacroUI();
        });
        macroFatRange.addEventListener('input', () => {
            macroFatPercent.value = macroFatRange.value;
            updateMacroUI();
        });

        // --- Number input events ---
        macroProteinPercent.addEventListener('input', () => {
            macroProteinRange.value = macroProteinPercent.value;
            updateMacroUI();
        });
        macroCarbsPercent.addEventListener('input', () => {
            macroCarbsRange.value = macroCarbsPercent.value;
            updateMacroUI();
        });
        macroFatPercent.addEventListener('input', () => {
            macroFatRange.value = macroFatPercent.value;
            updateMacroUI();
        });

        // --- Preset buttons ---
        document.querySelectorAll('.macro-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                macroProteinPercent.value = preset.dataset.protein;
                macroCarbsPercent.value = preset.dataset.carbs;
                macroFatPercent.value = preset.dataset.fat;
                macroProteinRange.value = preset.dataset.protein;
                macroCarbsRange.value = preset.dataset.carbs;
                macroFatRange.value = preset.dataset.fat;
                updateMacroUI();
            });
        });
    }

    // =============================================
    // === DISPLAY RESULTS ===
    // =============================================

    function displayResults(bmr, tdee, method, activityFactor, extraData = {}) {
        const resultsPlaceholder = document.getElementById('resultsPlaceholder');
        const resultsContent = document.getElementById('resultsContent');

        resultsPlaceholder.style.display = 'none';
        resultsContent.style.display = 'block';

        // Store TDEE for macro calculation
        lastTDEE = Math.round(tdee);

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
        animateNumber(document.getElementById('resultBMR'), Math.round(bmr));

        // Formula Used
        const formulaUsed = document.getElementById('resultFormulaUsed');
        if (method === 'standard') {
            formulaUsed.textContent = extraData.gender === 'male'
                ? '(10×W) + (6.25×H) − (5×A) + 5'
                : '(10×W) + (6.25×H) − (5×A) − 161';
        } else {
            formulaUsed.textContent = '370 + (21.6 × LBM)';
        }

        // LBM Info
        const lbmInfoEl = document.getElementById('resultLBMInfo');
        if (method === 'lbm' && extraData.lbm) {
            lbmInfoEl.style.display = 'grid';
            document.getElementById('resultLBMValue').textContent = extraData.lbm.toFixed(1) + ' kg';
            document.getElementById('resultFatMass').textContent = extraData.fatMass.toFixed(1) + ' kg';
        } else {
            lbmInfoEl.style.display = 'none';
        }

        // TDEE
        animateNumber(document.getElementById('resultTDEE'), lastTDEE, 1000);

        // Activity Used
        document.getElementById('resultActivityUsed').textContent =
            'Activity Factor: ' + activityLabels[activityFactor];

        // Goals
        animateNumber(document.getElementById('goalBulkMin'), lastTDEE + 300, 900);
        animateNumber(document.getElementById('goalBulkMax'), lastTDEE + 500, 900);
        animateNumber(document.getElementById('goalMaintain'), lastTDEE, 900);
        animateNumber(document.getElementById('goalCutMin'), lastTDEE - 300, 900);
        animateNumber(document.getElementById('goalCutMax'), lastTDEE - 500, 900);

        // Update macros with current slider values
        updateMacroUI();

        // Scroll to results on mobile
        if (window.innerWidth <= 1024) {
            setTimeout(() => {
                document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
    }

    // === Standard Method (Mifflin-St Jeor) ===
    formStandard.addEventListener('submit', (e) => {
        e.preventDefault();
        const ageInput = document.getElementById('stdAge');
        const weightInput = document.getElementById('stdWeight');
        const heightInput = document.getElementById('stdHeight');

        if (!validateInput(ageInput) || !validateInput(weightInput) || !validateInput(heightInput)) return;

        const age = parseFloat(ageInput.value);
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);

        let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (selectedGender === 'male' ? 5 : -161);
        displayResults(bmr, bmr * stdActivityFactor, 'standard', stdActivityFactor, { gender: selectedGender });
    });

    // === LBM Method (Katch-McArdle) ===
    formLBM.addEventListener('submit', (e) => {
        e.preventDefault();
        const weightInput = document.getElementById('lbmWeight');
        const bodyFatInput = document.getElementById('lbmBodyFat');

        if (!validateInput(weightInput) || !validateInput(bodyFatInput)) return;

        const weight = parseFloat(weightInput.value);
        const bodyFat = parseFloat(bodyFatInput.value);
        const lbm = weight * (1 - bodyFat / 100);
        const bmr = 370 + (21.6 * lbm);

        displayResults(bmr, bmr * lbmActivityFactor, 'lbm', lbmActivityFactor, { lbm, fatMass: weight - lbm });
    });

    // === Reset ===
    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            document.getElementById('resultsContent').style.display = 'none';
            document.getElementById('resultsPlaceholder').style.display = 'flex';
            lastTDEE = 0;

            document.querySelectorAll('.calc-form .form-input').forEach(input => {
                input.value = '';
                input.classList.remove('error');
            });

            if (genderMale && genderFemale) {
                genderMale.classList.add('active');
                genderFemale.classList.remove('active');
                selectedGender = 'male';
            }

            document.querySelectorAll('#stdActivity .activity-option, #lbmActivity .activity-option').forEach(o => {
                o.classList.toggle('active', o.dataset.value === '1.55');
            });
            stdActivityFactor = 1.55;
            lbmActivityFactor = 1.55;

            // Reset macros
            if (macroProteinPercent) {
                macroProteinPercent.value = 30; macroCarbsPercent.value = 45; macroFatPercent.value = 25;
                macroProteinRange.value = 30; macroCarbsRange.value = 45; macroFatRange.value = 25;
                updateMacroUI();
            }

            const calcSection = document.getElementById('calculator');
            if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // === Nav highlighting ===
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-link-cta)');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
        navLinks.forEach(l => {
            l.style.color = l.getAttribute('href') === '#' + current ? 'var(--accent-primary)' : '';
        });
    });

    // === Input animations ===
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.01)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });
        input.addEventListener('blur', () => { input.parentElement.style.transform = 'scale(1)'; });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); input.closest('form')?.dispatchEvent(new Event('submit')); }
        });
    });

});
