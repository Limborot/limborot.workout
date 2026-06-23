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

    // --- Store last calculation data for image download ---
    let lastCalcData = null;

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

        // Store calculation data for image download
        lastCalcData = {
            bmr: Math.round(bmr),
            tdee: lastTDEE,
            method,
            activityFactor,
            ...extraData
        };

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

    // =============================================
    // === DOWNLOAD IMAGE FEATURE ===
    // =============================================

    function drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function drawCard(ctx, x, y, w, h, opts = {}) {
        const { radius = 20, bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)' } = opts;
        drawRoundedRect(ctx, x, y, w, h, radius);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function drawDonutArc(ctx, cx, cy, radius, lineWidth, startAngle, endAngle, color) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function generateResultImage() {
        const W = 1080;
        const H = 1920;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // --- Background ---
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#050508');
        bgGrad.addColorStop(0.5, '#0a0a14');
        bgGrad.addColorStop(1, '#050508');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // --- Decorative glows ---
        const glow1 = ctx.createRadialGradient(200, 300, 0, 200, 300, 400);
        glow1.addColorStop(0, 'rgba(16,185,129,0.12)');
        glow1.addColorStop(1, 'transparent');
        ctx.fillStyle = glow1;
        ctx.fillRect(0, 0, W, 700);

        const glow2 = ctx.createRadialGradient(880, 1500, 0, 880, 1500, 450);
        glow2.addColorStop(0, 'rgba(6,182,212,0.08)');
        glow2.addColorStop(1, 'transparent');
        ctx.fillStyle = glow2;
        ctx.fillRect(400, 1100, 680, 820);

        // --- Outer card ---
        const pad = 50;
        drawCard(ctx, pad, pad, W - pad * 2, H - pad * 2, { radius: 32, bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)' });

        const cx = W / 2;
        let y = 110;

        // === HEADER ===
        // Logo
        ctx.font = '600 38px Inter, sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'center';
        ctx.fillText('◈', cx - 160, y + 8);
        ctx.font = '700 34px Inter, sans-serif';
        const logoGrad = ctx.createLinearGradient(cx - 140, y, cx + 140, y);
        logoGrad.addColorStop(0, '#10b981');
        logoGrad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = logoGrad;
        ctx.fillText('nutrition.limborot', cx + 10, y + 8);

        // Date
        y += 55;
        ctx.font = '400 24px Inter, sans-serif';
        ctx.fillStyle = '#525263';
        const now = new Date();
        const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
        ctx.fillText(dateStr, cx, y);

        // Divider
        y += 40;
        const divGrad = ctx.createLinearGradient(pad + 60, y, W - pad - 60, y);
        divGrad.addColorStop(0, 'transparent');
        divGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        divGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad + 60, y);
        ctx.lineTo(W - pad - 60, y);
        ctx.stroke();

        // === METHOD BADGE ===
        y += 45;
        const methodText = lastCalcData.method === 'standard' ? 'Mifflin-St Jeor (น้ำหนักตัว)' : 'Katch-McArdle (Lean Body Mass)';
        const badgeColor = lastCalcData.method === 'standard' ? '#10b981' : '#06b6d4';
        // Badge background
        ctx.font = '600 22px Inter, sans-serif';
        const badgeW = ctx.measureText(methodText).width + 48;
        drawRoundedRect(ctx, cx - badgeW / 2, y - 18, badgeW, 42, 21);
        ctx.fillStyle = badgeColor + '18';
        ctx.fill();
        ctx.strokeStyle = badgeColor + '40';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = badgeColor;
        ctx.textAlign = 'center';
        ctx.fillText(methodText, cx, y + 10);

        // === USER INFO CARD ===
        y += 60;
        const infoCardH = lastCalcData.method === 'standard' ? 185 : 145;
        drawCard(ctx, pad + 30, y, W - (pad + 30) * 2, infoCardH, { radius: 16, bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' });

        ctx.font = '600 22px Inter, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'left';
        ctx.fillText('ข้อมูลที่ใช้คำนวณ', pad + 60, y + 38);

        y += 60;
        ctx.font = '500 24px Inter, sans-serif';
        const infoLeft = pad + 60;
        const infoRight = cx + 40;

        if (lastCalcData.method === 'standard') {
            // Gender + Age
            ctx.fillStyle = '#525263';
            ctx.fillText('เพศ:', infoLeft, y + 10);
            ctx.fillStyle = '#f0f0f5';
            ctx.fillText(lastCalcData.gender === 'male' ? 'ชาย' : 'หญิง', infoLeft + 70, y + 10);

            ctx.fillStyle = '#525263';
            ctx.fillText('อายุ:', infoRight, y + 10);
            ctx.fillStyle = '#f0f0f5';
            const age = document.getElementById('stdAge').value;
            ctx.fillText(age + ' ปี', infoRight + 80, y + 10);

            y += 42;
            // Weight + Height
            ctx.fillStyle = '#525263';
            ctx.fillText('น้ำหนัก:', infoLeft, y + 10);
            ctx.fillStyle = '#f0f0f5';
            const weight = document.getElementById('stdWeight').value;
            ctx.fillText(weight + ' kg', infoLeft + 110, y + 10);

            ctx.fillStyle = '#525263';
            ctx.fillText('ส่วนสูง:', infoRight, y + 10);
            ctx.fillStyle = '#f0f0f5';
            const height = document.getElementById('stdHeight').value;
            ctx.fillText(height + ' cm', infoRight + 110, y + 10);

            y += 42;
        } else {
            ctx.fillStyle = '#525263';
            ctx.fillText('น้ำหนัก:', infoLeft, y + 10);
            ctx.fillStyle = '#f0f0f5';
            const weight = document.getElementById('lbmWeight').value;
            ctx.fillText(weight + ' kg', infoLeft + 110, y + 10);

            ctx.fillStyle = '#525263';
            ctx.fillText('Body Fat:', infoRight, y + 10);
            ctx.fillStyle = '#f0f0f5';
            const bf = document.getElementById('lbmBodyFat').value;
            ctx.fillText(bf + '%', infoRight + 130, y + 10);

            y += 42;
        }

        // Activity factor
        ctx.fillStyle = '#525263';
        ctx.fillText('Activity:', infoLeft, y + 10);
        ctx.fillStyle = '#f0f0f5';
        ctx.fillText(activityLabels[lastCalcData.activityFactor] || ('×' + lastCalcData.activityFactor), infoLeft + 120, y + 10);

        // === BMR RESULT CARD ===
        y += 75;
        drawCard(ctx, pad + 30, y, W - (pad + 30) * 2, 130, { radius: 16, bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' });

        ctx.font = '500 22px Inter, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'left';
        ctx.fillText('BMR (อัตราเผาผลาญขั้นพื้นฐาน)', pad + 60, y + 40);

        ctx.font = '800 48px JetBrains Mono, monospace';
        ctx.fillStyle = '#f0f0f5';
        ctx.textAlign = 'right';
        ctx.fillText(lastCalcData.bmr.toLocaleString(), W - pad - 70, y + 90);
        ctx.font = '400 22px Inter, sans-serif';
        ctx.fillStyle = '#525263';
        ctx.fillText(' kcal/วัน', W - pad - 70, y + 118);

        // === TDEE MAIN RESULT ===
        y += 160;
        const tdeeCardH = 180;
        // Gradient border card
        drawRoundedRect(ctx, pad + 28, y - 2, W - (pad + 28) * 2, tdeeCardH + 4, 18);
        const borderGrad = ctx.createLinearGradient(pad, y, W - pad, y + tdeeCardH);
        borderGrad.addColorStop(0, '#10b981');
        borderGrad.addColorStop(1, '#06b6d4');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 2;
        ctx.stroke();
        // Inner fill
        drawRoundedRect(ctx, pad + 30, y, W - (pad + 30) * 2, tdeeCardH, 16);
        ctx.fillStyle = 'rgba(16,185,129,0.06)';
        ctx.fill();

        ctx.font = '600 26px Inter, sans-serif';
        const tdeeLabel = ctx.createLinearGradient(cx - 80, y, cx + 80, y);
        tdeeLabel.addColorStop(0, '#10b981');
        tdeeLabel.addColorStop(1, '#06b6d4');
        ctx.fillStyle = tdeeLabel;
        ctx.textAlign = 'center';
        ctx.fillText('TDEE ของคุณ', cx, y + 45);

        ctx.font = '900 72px JetBrains Mono, monospace';
        const tdeeValGrad = ctx.createLinearGradient(cx - 120, y + 60, cx + 120, y + 130);
        tdeeValGrad.addColorStop(0, '#10b981');
        tdeeValGrad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = tdeeValGrad;
        ctx.fillText(lastCalcData.tdee.toLocaleString(), cx, y + 120);

        ctx.font = '400 24px Inter, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('แคลอรี่ / วัน', cx, y + 158);

        // === GOALS SECTION ===
        y += tdeeCardH + 40;
        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('เป้าหมายแคลอรี่ต่อวัน', cx, y);

        y += 25;
        const goalW = (W - pad * 2 - 60 - 30) / 3;
        const goalH = 120;
        const goals = [
            { label: 'Bulk', emoji: '📈', color: '#f59e0b', values: [(lastCalcData.tdee + 300), (lastCalcData.tdee + 500)], sub: '+300 ~ +500' },
            { label: 'Maintain', emoji: '⚖️', color: '#10b981', values: [lastCalcData.tdee], sub: 'TDEE' },
            { label: 'Cut', emoji: '📉', color: '#ef4444', values: [(lastCalcData.tdee - 300), (lastCalcData.tdee - 500)], sub: '-300 ~ -500' }
        ];

        goals.forEach((g, i) => {
            const gx = pad + 30 + i * (goalW + 15);
            drawCard(ctx, gx, y, goalW, goalH, { radius: 14, bg: g.color + '0D', border: g.color + '30' });

            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(g.emoji, gx + goalW / 2, y + 35);

            ctx.font = '600 20px Inter, sans-serif';
            ctx.fillStyle = g.color;
            ctx.fillText(g.label, gx + goalW / 2, y + 60);

            ctx.font = '700 28px JetBrains Mono, monospace';
            ctx.fillStyle = '#f0f0f5';
            if (g.values.length === 2) {
                ctx.fillText(g.values[0] + ' - ' + g.values[1], gx + goalW / 2, y + 92);
            } else {
                ctx.fillText(g.values[0].toLocaleString(), gx + goalW / 2, y + 92);
            }

            ctx.font = '400 16px Inter, sans-serif';
            ctx.fillStyle = '#525263';
            ctx.fillText(g.sub, gx + goalW / 2, y + 114);
        });

        // === MACROS SECTION ===
        y += goalH + 45;
        const macros = getMacroValues();
        const tdeeVal = lastCalcData.tdee;

        const proteinKcal = Math.round(tdeeVal * macros.protein / 100);
        const carbsKcal = Math.round(tdeeVal * macros.carbs / 100);
        const fatKcal = Math.round(tdeeVal * macros.fat / 100);
        const proteinG = Math.round(proteinKcal / 4);
        const carbsG = Math.round(carbsKcal / 4);
        const fatG = Math.round(fatKcal / 9);

        const macroCardH = 340;
        drawCard(ctx, pad + 30, y, W - (pad + 30) * 2, macroCardH, { radius: 16, bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' });

        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('สัดส่วนสารอาหาร (Macros)', cx, y + 38);

        // Donut chart
        const donutCx = pad + 200;
        const donutCy = y + 185;
        const donutR = 90;
        const donutW = 22;

        // Background circle
        ctx.beginPath();
        ctx.arc(donutCx, donutCy, donutR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = donutW;
        ctx.stroke();

        // Draw arcs
        const total = macros.protein + macros.carbs + macros.fat;
        const startOffset = -Math.PI / 2;
        const proteinAngle = (macros.protein / total) * Math.PI * 2;
        const carbsAngle = (macros.carbs / total) * Math.PI * 2;
        const fatAngle = (macros.fat / total) * Math.PI * 2;

        drawDonutArc(ctx, donutCx, donutCy, donutR, donutW, startOffset, startOffset + proteinAngle, '#ef4444');
        drawDonutArc(ctx, donutCx, donutCy, donutR, donutW, startOffset + proteinAngle, startOffset + proteinAngle + carbsAngle, '#f59e0b');
        drawDonutArc(ctx, donutCx, donutCy, donutR, donutW, startOffset + proteinAngle + carbsAngle, startOffset + proteinAngle + carbsAngle + fatAngle, '#8b5cf6');

        // Donut center text
        ctx.font = '800 32px JetBrains Mono, monospace';
        ctx.fillStyle = '#f0f0f5';
        ctx.textAlign = 'center';
        ctx.fillText(tdeeVal.toLocaleString(), donutCx, donutCy + 5);
        ctx.font = '400 18px Inter, sans-serif';
        ctx.fillStyle = '#525263';
        ctx.fillText('kcal', donutCx, donutCy + 28);

        // Macro breakdown list (right side)
        const listX = pad + 370;
        const macroList = [
            { name: 'โปรตีน', color: '#ef4444', pct: macros.protein, grams: proteinG, kcal: proteinKcal },
            { name: 'คาร์โบไฮเดรต', color: '#f59e0b', pct: macros.carbs, grams: carbsG, kcal: carbsKcal },
            { name: 'ไขมัน', color: '#8b5cf6', pct: macros.fat, grams: fatG, kcal: fatKcal }
        ];

        let listY = y + 95;
        macroList.forEach(m => {
            // Color dot
            ctx.beginPath();
            ctx.arc(listX, listY + 6, 8, 0, Math.PI * 2);
            ctx.fillStyle = m.color;
            ctx.fill();

            // Name
            ctx.font = '500 24px Inter, sans-serif';
            ctx.fillStyle = '#f0f0f5';
            ctx.textAlign = 'left';
            ctx.fillText(m.name, listX + 22, listY + 12);

            // Percentage
            ctx.font = '700 24px JetBrains Mono, monospace';
            ctx.fillStyle = m.color;
            ctx.textAlign = 'right';
            ctx.fillText(m.pct + '%', W - pad - 80, listY + 12);

            // Grams + kcal
            listY += 34;
            ctx.font = '400 20px Inter, sans-serif';
            ctx.fillStyle = '#525263';
            ctx.textAlign = 'left';
            ctx.fillText(m.grams + 'g  ·  ' + m.kcal + ' kcal', listX + 22, listY + 6);

            listY += 52;
        });

        // === LBM Info (if Katch-McArdle) ===
        if (lastCalcData.method === 'lbm' && lastCalcData.lbm) {
            y += macroCardH + 30;
            drawCard(ctx, pad + 30, y, W - (pad + 30) * 2, 80, { radius: 14, bg: 'rgba(6,182,212,0.05)', border: 'rgba(6,182,212,0.15)' });

            ctx.font = '500 22px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#525263';
            ctx.fillText('Lean Body Mass:', pad + 60, y + 35);
            ctx.fillStyle = '#06b6d4';
            ctx.font = '700 22px JetBrains Mono, monospace';
            ctx.fillText(lastCalcData.lbm.toFixed(1) + ' kg', pad + 280, y + 35);

            ctx.font = '500 22px Inter, sans-serif';
            ctx.fillStyle = '#525263';
            ctx.fillText('มวลไขมัน:', cx + 60, y + 35);
            ctx.fillStyle = '#06b6d4';
            ctx.font = '700 22px JetBrains Mono, monospace';
            ctx.fillText(lastCalcData.fatMass.toFixed(1) + ' kg', cx + 220, y + 35);
        }

        // === FOOTER ===
        const footerY = H - 130;
        // Divider
        const footDiv = ctx.createLinearGradient(pad + 60, footerY, W - pad - 60, footerY);
        footDiv.addColorStop(0, 'transparent');
        footDiv.addColorStop(0.5, 'rgba(255,255,255,0.08)');
        footDiv.addColorStop(1, 'transparent');
        ctx.strokeStyle = footDiv;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad + 60, footerY);
        ctx.lineTo(W - pad - 60, footerY);
        ctx.stroke();

        ctx.font = '400 20px Inter, sans-serif';
        ctx.fillStyle = '#525263';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️  ค่า TDEE เป็นการประมาณค่าเท่านั้น ผลลัพธ์อาจแตกต่างตามปัจจัยของแต่ละบุคคล', cx, footerY + 40);

        ctx.font = '500 20px Inter, sans-serif';
        ctx.fillStyle = '#525263';
        ctx.fillText('© 2026 Limborot  ·  nutrition.limborot.com', cx, footerY + 75);

        return canvas;
    }

    // === Download Button Event ===
    const btnDownload = document.getElementById('btnDownloadImage');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            if (!lastCalcData || lastTDEE === 0) return;

            btnDownload.classList.add('loading');

            // Use requestAnimationFrame to allow loading state to render
            requestAnimationFrame(() => {
                try {
                    const canvas = generateResultImage();
                    const link = document.createElement('a');
                    link.download = 'TDEE-Result-' + new Date().toISOString().slice(0, 10) + '.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } catch (err) {
                    console.error('Image generation failed:', err);
                } finally {
                    setTimeout(() => btnDownload.classList.remove('loading'), 600);
                }
            });
        });
    }

});
