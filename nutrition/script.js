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

    // --- State ---
    let lastTDEE = 0;
    let selectedGoal = 'maintain';
    let selectedGender = 'male';

    // --- Surplus / Deficit inputs ---
    const bulkSurplusInput = document.getElementById('bulkSurplus');
    const cutDeficitInput = document.getElementById('cutDeficit');

    function getSurplus() {
        return Math.max(0, parseInt(bulkSurplusInput.value) || 500);
    }

    function getDeficit() {
        return Math.max(0, parseInt(cutDeficitInput.value) || 500);
    }

    // Goal kcal mapping (dynamic)
    function getGoalCalories() {
        return {
            bulk: lastTDEE + getSurplus(),
            maintain: lastTDEE,
            cut: Math.max(0, lastTDEE - getDeficit())
        };
    }

    function getSelectedGoalKcal() {
        return getGoalCalories()[selectedGoal] || lastTDEE;
    }

    // --- Update goal result values ---
    function updateGoalResults() {
        const goals = getGoalCalories();
        const bulkEl = document.getElementById('goalBulkResult');
        const maintainEl = document.getElementById('goalMaintain');
        const cutEl = document.getElementById('goalCutResult');

        if (bulkEl) bulkEl.textContent = goals.bulk.toLocaleString();
        if (maintainEl) maintainEl.textContent = goals.maintain.toLocaleString();
        if (cutEl) cutEl.textContent = Math.max(0, goals.cut).toLocaleString();

        // Range values (fixed 300-500)
        const bulkMinEl = document.getElementById('goalBulkMin');
        const bulkMaxEl = document.getElementById('goalBulkMax');
        const cutMinEl = document.getElementById('goalCutMin');
        const cutMaxEl = document.getElementById('goalCutMax');

        if (bulkMinEl) bulkMinEl.textContent = (lastTDEE + 300).toLocaleString();
        if (bulkMaxEl) bulkMaxEl.textContent = (lastTDEE + 500).toLocaleString();
        if (cutMinEl) cutMinEl.textContent = Math.max(0, lastTDEE - 300).toLocaleString();
        if (cutMaxEl) cutMaxEl.textContent = Math.max(0, lastTDEE - 500).toLocaleString();
    }


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
    // === GOAL ADJUSTER (+/- buttons & input) ===
    // =============================================

    // +/- buttons
    document.querySelectorAll('.goal-adj-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // ไม่ให้ trigger goal card click
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;

            let val = parseInt(input.value) || 500;
            const step = parseInt(input.step) || 50;

            if (btn.classList.contains('goal-adj-minus')) {
                val = Math.max(parseInt(input.min) || 100, val - step);
            } else {
                val = Math.min(parseInt(input.max) || 1500, val + step);
            }

            input.value = val;
            updateGoalResults();
            updateMacroUI();
        });
    });

    // Surplus/Deficit input change
    document.querySelectorAll('.goal-adj-input').forEach(input => {
        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('input', () => {
            updateGoalResults();
            updateMacroUI();
        });
        input.addEventListener('change', () => {
            // Clamp on blur
            let val = parseInt(input.value) || 500;
            val = Math.max(parseInt(input.min) || 100, Math.min(parseInt(input.max) || 1500, val));
            input.value = val;
            updateGoalResults();
            updateMacroUI();
        });
    });

    // =============================================
    // === GOAL SELECTION (Bulk / Maintain / Cut) ===
    // =============================================

    const goalLabels = {
        bulk: 'Bulk',
        maintain: 'Maintain',
        cut: 'Cut'
    };

    const goalCards = document.querySelectorAll('.goal-selectable');

    goalCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // ถ้ากดที่ adjuster อย่าเปลี่ยน goal
            if (e.target.closest('.goal-adjuster')) return;

            goalCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedGoal = card.dataset.goal;

            updateMacroUI();

            const macroSection = document.querySelector('.result-macros');
            if (macroSection) {
                setTimeout(() => {
                    macroSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        });
    });

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
        const goalKcal = getSelectedGoalKcal();

        // Sync sliders ↔ inputs
        macroProteinRange.value = m.protein;
        macroCarbsRange.value = m.carbs;
        macroFatRange.value = m.fat;
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
        const proteinKcal = Math.round(goalKcal * m.protein / 100);
        const carbsKcal = Math.round(goalKcal * m.carbs / 100);
        const fatKcal = Math.round(goalKcal * m.fat / 100);
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
        document.getElementById('macroDonutTotal').textContent = Math.round(goalKcal).toLocaleString();

        // Update goal label (แสดง goal ที่เลือก + kcal surplus/deficit)
        const goalNameEl = document.getElementById('macroGoalName');
        const goalKcalEl = document.getElementById('macroGoalKcal');
        let labelText = goalLabels[selectedGoal];
        if (selectedGoal === 'bulk') labelText += ' (+' + getSurplus() + ')';
        if (selectedGoal === 'cut') labelText += ' (-' + getDeficit() + ')';
        if (goalNameEl) goalNameEl.textContent = labelText;
        if (goalKcalEl) goalKcalEl.textContent = Math.round(goalKcal).toLocaleString() + ' kcal';

        // Update donut chart
        const donutProtein = document.getElementById('donutProtein');
        const donutCarbs = document.getElementById('donutCarbs');
        const donutFat = document.getElementById('donutFat');

        donutProtein.setAttribute('stroke-dasharray', `${m.protein} ${100 - m.protein}`);
        donutProtein.setAttribute('stroke-dashoffset', '0');
        donutCarbs.setAttribute('stroke-dasharray', `${m.carbs} ${100 - m.carbs}`);
        donutCarbs.setAttribute('stroke-dashoffset', `-${m.protein}`);
        donutFat.setAttribute('stroke-dasharray', `${m.fat} ${100 - m.fat}`);
        donutFat.setAttribute('stroke-dashoffset', `-${m.protein + m.carbs}`);

        // Highlight matching preset
        document.querySelectorAll('.macro-preset').forEach(p => {
            p.classList.toggle('active',
                parseInt(p.dataset.protein) === m.protein &&
                parseInt(p.dataset.carbs) === m.carbs &&
                parseInt(p.dataset.fat) === m.fat
            );
        });
    }

    // --- Range slider events ---
    if (macroProteinRange) {
        macroProteinRange.addEventListener('input', () => { macroProteinPercent.value = macroProteinRange.value; updateMacroUI(); });
        macroCarbsRange.addEventListener('input', () => { macroCarbsPercent.value = macroCarbsRange.value; updateMacroUI(); });
        macroFatRange.addEventListener('input', () => { macroFatPercent.value = macroFatRange.value; updateMacroUI(); });

        macroProteinPercent.addEventListener('input', () => { macroProteinRange.value = macroProteinPercent.value; updateMacroUI(); });
        macroCarbsPercent.addEventListener('input', () => { macroCarbsRange.value = macroCarbsPercent.value; updateMacroUI(); });
        macroFatPercent.addEventListener('input', () => { macroFatRange.value = macroFatPercent.value; updateMacroUI(); });

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

        lastTDEE = Math.round(tdee);

        // Reset goal to maintain
        selectedGoal = 'maintain';
        goalCards.forEach(c => c.classList.remove('active'));
        const maintainCard = document.getElementById('goalCardMaintain');
        if (maintainCard) maintainCard.classList.add('active');

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

        // Update goal results
        updateGoalResults();

        // Update macros
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

    // === Download Image (Canvas-based) ===
    const btnDownloadImage = document.getElementById('btnDownloadImage');
    if (btnDownloadImage) {
        btnDownloadImage.addEventListener('click', () => {
            const resultsContent = document.getElementById('resultsContent');
            if (!resultsContent || resultsContent.style.display === 'none') return;

            const originalHTML = btnDownloadImage.innerHTML;
            btnDownloadImage.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>กำลังสร้างรูป...</span>';
            btnDownloadImage.disabled = true;

            setTimeout(() => {
                try {
                    generateResultImage();
                } catch(e) {
                    console.error(e);
                    alert('ไม่สามารถสร้างรูปได้');
                } finally {
                    btnDownloadImage.innerHTML = originalHTML;
                    btnDownloadImage.disabled = false;
                }
            }, 100);
        });
    }

    function generateResultImage() {
        // Gather all data from DOM
        const bmr = document.getElementById('resultBMR')?.textContent || '0';
        const tdee = document.getElementById('resultTDEE')?.textContent || '0';
        const method = document.getElementById('resultMethodBadge')?.textContent || '';
        const formula = document.getElementById('resultFormulaUsed')?.textContent || '';
        const activityUsed = document.getElementById('resultActivityUsed')?.textContent || '';
        const bulkResult = document.getElementById('goalBulkResult')?.textContent || '0';
        const bulkSurplusVal = document.getElementById('bulkSurplus')?.value || '500';
        const bulkMin = document.getElementById('goalBulkMin')?.textContent || '0';
        const bulkMax = document.getElementById('goalBulkMax')?.textContent || '0';
        const maintain = document.getElementById('goalMaintain')?.textContent || '0';
        const cutResult = document.getElementById('goalCutResult')?.textContent || '0';
        const cutDeficitVal = document.getElementById('cutDeficit')?.value || '500';
        const cutMin = document.getElementById('goalCutMin')?.textContent || '0';
        const cutMax = document.getElementById('goalCutMax')?.textContent || '0';
        const proteinGrams = document.getElementById('summaryProtein')?.textContent || '0g';
        const carbsGrams = document.getElementById('summaryCarbs')?.textContent || '0g';
        const fatGrams = document.getElementById('summaryFat')?.textContent || '0g';
        const proteinPct = document.getElementById('macroProteinPercent')?.value || '30';
        const carbsPct = document.getElementById('macroCarbsPercent')?.value || '45';
        const fatPct = document.getElementById('macroFatPercent')?.value || '25';
        const macroKcal = document.getElementById('macroDonutTotal')?.textContent || '0';
        const proteinKcal = document.getElementById('macroProteinKcal')?.textContent || '0 kcal';
        const carbsKcal = document.getElementById('macroCarbsKcal')?.textContent || '0 kcal';
        const fatKcal = document.getElementById('macroFatKcal')?.textContent || '0 kcal';
        const selectedGoalLabel = document.getElementById('macroGoalName')?.textContent || 'Maintain';

        // LBM info
        const lbmInfo = document.getElementById('resultLBMInfo');
        const lbmVisible = lbmInfo && lbmInfo.style.display !== 'none';
        const lbmVal = document.getElementById('resultLBMValue')?.textContent || '';
        const fatMassVal = document.getElementById('resultFatMass')?.textContent || '';

        // Canvas size
        const W = 600;
        const canvas = document.createElement('canvas');
        const scale = 2;

        // Estimate height dynamically
        let estimatedH = 1020;
        if (lbmVisible) estimatedH += 60;
        canvas.width = W * scale;
        canvas.height = estimatedH * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        // Colors
        const BG = '#0d0d12';
        const BG2 = '#141419';
        const BG3 = '#1a1a22';
        const BORDER = 'rgba(255,255,255,0.07)';
        const ACCENT = '#00e5a0';
        const TEXT1 = '#ffffff';
        const TEXT2 = 'rgba(255,255,255,0.6)';
        const TEXT3 = 'rgba(255,255,255,0.35)';
        const GREEN = '#22c55e';
        const RED = '#ef4444';
        const PROTEIN_C = '#ef4444';
        const CARBS_C = '#f59e0b';
        const FAT_C = '#8b5cf6';

        // Helper functions
        function roundRect(x, y, w, h, r) {
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

        function drawCard(x, y, w, h, bg = BG2, border = BORDER) {
            ctx.save();
            roundRect(x, y, w, h, 12);
            ctx.fillStyle = bg;
            ctx.fill();
            ctx.strokeStyle = border;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }

        function text(t, x, y, font, color, align = 'left') {
            ctx.save();
            ctx.font = font;
            ctx.fillStyle = color;
            ctx.textAlign = align;
            ctx.fillText(t, x, y);
            ctx.restore();
        }

        // -- Background --
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, estimatedH);

        // Subtle top glow
        const grd = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, 300);
        grd.addColorStop(0, 'rgba(0,229,160,0.05)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, 300);

        let y = 0;

        // ── HEADER ──
        y += 44;

        // Logo diamond icon
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = ACCENT;
        ctx.textAlign = 'center';
        ctx.fillText('◈', W/2, y);
        ctx.restore();
        y += 26;

        // Logo text — measure each part, then center combined
        ctx.save();
        ctx.font = 'bold 20px Inter, Arial, sans-serif';
        const nutritionW = ctx.measureText('nutrition').width;
        ctx.restore();

        ctx.save();
        ctx.font = '600 20px Inter, Arial, sans-serif';
        const limborotW = ctx.measureText('.limborot').width;
        ctx.restore();

        const totalLogoW = nutritionW + limborotW;
        const logoStartX = W/2 - totalLogoW/2;

        ctx.save();
        ctx.font = 'bold 20px Inter, Arial, sans-serif';
        ctx.fillStyle = ACCENT;
        ctx.textAlign = 'left';
        ctx.fillText('nutrition', logoStartX, y);
        ctx.restore();

        ctx.save();
        ctx.font = '600 20px Inter, Arial, sans-serif';
        ctx.fillStyle = TEXT1;
        ctx.textAlign = 'left';
        ctx.fillText('.limborot', logoStartX + nutritionW, y);
        ctx.restore();
        y += 22;

        // Date
        const now = new Date();
        const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
        const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear() + 543}`;
        text(dateStr, W/2, y + 14, '400 13px Inter, Arial, sans-serif', TEXT3, 'center');
        y += 32;

        // Method badge — set font FIRST then measure
        ctx.save();
        ctx.font = '600 12px Inter, Arial, sans-serif';
        const methodTextW = ctx.measureText(method).width;
        ctx.restore();

        const badgePadX = 28;
        const badgeH = 30;
        const badgeW = methodTextW + badgePadX * 2;
        const badgeX = W/2 - badgeW/2;

        ctx.save();
        roundRect(badgeX, y, badgeW, badgeH, 15);
        ctx.fillStyle = 'rgba(0,229,160,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,229,160,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        text(method, W/2, y + 20, '600 12px Inter, Arial, sans-serif', ACCENT, 'center');
        y += badgeH + 20;

        const PAD = 24;
        const CW = W - PAD * 2;

        // ── BMR CARD ──
        drawCard(PAD, y, CW, lbmVisible ? 100 : 80);
        text('BMR (อัตราเผาผลาญขั้นพื้นฐาน)', PAD + 16, y + 24, '500 12px Inter,sans-serif', TEXT2);
        text(bmr, W - PAD - 16, y + 54, 'bold 32px Inter,sans-serif', TEXT1, 'right');
        text('kcal/วัน', W - PAD - 16, y + 70, '400 11px Inter,sans-serif', TEXT3, 'right');
        text(formula, PAD + 16, y + 66, '400 11px Inter,sans-serif', TEXT3);

        if (lbmVisible) {
            // LBM info row
            text('Lean Body Mass:', PAD + 16, y + 86, '400 11px Inter,sans-serif', TEXT3);
            text(lbmVal, PAD + 120, y + 86, '600 11px Inter,sans-serif', TEXT2);
            text('มวลไขมัน:', PAD + 180, y + 86, '400 11px Inter,sans-serif', TEXT3);
            text(fatMassVal, PAD + 240, y + 86, '600 11px Inter,sans-serif', TEXT2);
            y += 100;
        } else {
            y += 80;
        }
        y += 12;

        // ── TDEE CARD ──
        const tdeeH = 110;
        ctx.save();
        roundRect(PAD, y, CW, tdeeH, 12);
        ctx.fillStyle = BG2;
        ctx.fill();
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // glow inside
        const tgrd = ctx.createLinearGradient(PAD, y, PAD, y + tdeeH);
        tgrd.addColorStop(0, 'rgba(0,229,160,0.06)');
        tgrd.addColorStop(1, 'transparent');
        ctx.fillStyle = tgrd;
        ctx.fill();
        ctx.restore();

        text('TDEE ของคุณ', W/2, y + 26, '600 13px Inter,sans-serif', ACCENT, 'center');
        text(tdee, W/2, y + 72, 'bold 44px Inter,sans-serif', ACCENT, 'center');
        text('แคลอรี่ / วัน', W/2, y + 90, '400 12px Inter,sans-serif', TEXT3, 'center');
        text(activityUsed, W/2, y + 105, '400 10px Inter,sans-serif', TEXT3, 'center');
        y += tdeeH + 14;

        // ── GOALS ──
        text('เป้าหมายแคลอรี่ต่อวัน', PAD, y + 14, '600 13px Inter,sans-serif', TEXT2);
        y += 26;

        const gW = (CW - 16) / 3;

        // Bulk
        const bulkBorder = 'rgba(34,197,94,0.3)';
        ctx.save();
        roundRect(PAD, y, gW, 90, 10);
        ctx.fillStyle = 'rgba(34,197,94,0.05)';
        ctx.fill();
        ctx.strokeStyle = bulkBorder;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        text('Bulk', PAD + gW/2, y + 20, 'bold 12px Inter,sans-serif', GREEN, 'center');
        text(bulkResult, PAD + gW/2, y + 50, 'bold 20px Inter,sans-serif', GREEN, 'center');
        text(`+${bulkSurplusVal} kcal`, PAD + gW/2, y + 65, '400 10px Inter,sans-serif', TEXT3, 'center');
        text(`(${bulkMin} – ${bulkMax})`, PAD + gW/2, y + 80, '400 9px Inter,sans-serif', TEXT3, 'center');

        // Maintain
        const mX = PAD + gW + 8;
        ctx.save();
        roundRect(mX, y, gW, 90, 10);
        ctx.fillStyle = 'rgba(0,229,160,0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,229,160,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        text('Maintain', mX + gW/2, y + 20, 'bold 12px Inter,sans-serif', ACCENT, 'center');
        text(maintain, mX + gW/2, y + 50, 'bold 20px Inter,sans-serif', ACCENT, 'center');
        text('TDEE', mX + gW/2, y + 65, '400 10px Inter,sans-serif', TEXT3, 'center');

        // Cut
        const cX = PAD + gW*2 + 16;
        ctx.save();
        roundRect(cX, y, gW, 90, 10);
        ctx.fillStyle = 'rgba(239,68,68,0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(239,68,68,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        text('Cut', cX + gW/2, y + 20, 'bold 12px Inter,sans-serif', RED, 'center');
        text(cutResult, cX + gW/2, y + 50, 'bold 20px Inter,sans-serif', RED, 'center');
        text(`-${cutDeficitVal} kcal`, cX + gW/2, y + 65, '400 10px Inter,sans-serif', TEXT3, 'center');
        text(`(${cutMin} – ${cutMax})`, cX + gW/2, y + 80, '400 9px Inter,sans-serif', TEXT3, 'center');

        y += 90 + 14;

        // ── MACROS CARD ──
        const macH = 220;
        drawCard(PAD, y, CW, macH);
        text(`สัดส่วนสารอาหาร (Macros) — ${selectedGoalLabel}`, W/2, y + 22, '600 12px Inter,sans-serif', TEXT2, 'center');

        // Donut
        const cx2 = PAD + 80, cy2 = y + macH/2 + 10, r = 52, lineW = 10;
        const p = parseInt(proteinPct), c2 = parseInt(carbsPct), f = parseInt(fatPct);
        const tau = 2 * Math.PI;
        const startAngle = -Math.PI / 2;

        function drawDonutSegment(start, pct, color) {
            if (pct <= 0) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx2, cy2, r, start, start + (pct / 100) * tau);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineW;
            ctx.lineCap = 'butt';
            ctx.stroke();
            ctx.restore();
        }

        // BG ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx2, cy2, r, 0, tau);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = lineW;
        ctx.stroke();
        ctx.restore();

        const proteinAngle = startAngle;
        const carbsAngle = proteinAngle + (p / 100) * tau;
        const fatAngle = carbsAngle + (c2 / 100) * tau;
        drawDonutSegment(proteinAngle, p, PROTEIN_C);
        drawDonutSegment(carbsAngle, c2, CARBS_C);
        drawDonutSegment(fatAngle, f, FAT_C);

        text(macroKcal, cx2, cy2 + 6, 'bold 16px Inter,sans-serif', TEXT1, 'center');
        text('kcal', cx2, cy2 + 20, '400 10px Inter,sans-serif', TEXT3, 'center');

        // Macro list
        const listX = PAD + 155;
        const rowH = 52;
        const macros = [
            { label: 'โปรตีน', grams: proteinGrams, kcal: proteinKcal, pct: p + '%', color: PROTEIN_C },
            { label: 'คาร์โบไฮเดรต', grams: carbsGrams, kcal: carbsKcal, pct: c2 + '%', color: CARBS_C },
            { label: 'ไขมัน', grams: fatGrams, kcal: fatKcal, pct: f + '%', color: FAT_C },
        ];

        macros.forEach((m, i) => {
            const my = y + 42 + i * rowH;
            // dot
            ctx.beginPath();
            ctx.arc(listX + 6, my + 8, 5, 0, Math.PI * 2);
            ctx.fillStyle = m.color;
            ctx.fill();

            text(m.label, listX + 18, my + 13, '600 13px Inter,sans-serif', TEXT1);
            text(m.pct, W - PAD - 16, my + 13, 'bold 14px Inter,sans-serif', m.color, 'right');
            text(`${m.grams}  ·  ${m.kcal}`, listX + 18, my + 30, '400 11px Inter,sans-serif', TEXT3);

            // separator
            if (i < macros.length - 1) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(listX, my + 42);
                ctx.lineTo(W - PAD, my + 42);
                ctx.stroke();
                ctx.restore();
            }
        });

        y += macH + 14;

        // ── DISCLAIMER ──
        text('⚠  ค่า TDEE เป็นประมาณค่าเท่านั้น ผลลัพธ์อาจแตกต่างตามปัจจัยของแต่ละบุคคล', W/2, y + 16, '400 10px Inter,sans-serif', 'rgba(255,200,0,0.4)', 'center');
        y += 30;

        // ── FOOTER ──
        // Divider line
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(W - PAD, y);
        ctx.stroke();
        ctx.restore();
        y += 16;
        text('© 2026 Limborot  ·  nutrition.limborot.com', W/2, y + 12, '400 11px Inter,sans-serif', TEXT3, 'center');
        y += 36;

        // Trim canvas to actual used height
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = W * scale;
        finalCanvas.height = y * scale;
        const fCtx = finalCanvas.getContext('2d');
        fCtx.drawImage(canvas, 0, 0, W * scale, y * scale, 0, 0, W * scale, y * scale);

        // Download
        const link = document.createElement('a');
        const d = new Date();
        const fname = `TDEE_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}.png`;
        link.download = fname;
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
    }

    // === Reset ===
    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            document.getElementById('resultsContent').style.display = 'none';
            document.getElementById('resultsPlaceholder').style.display = 'flex';
            lastTDEE = 0;
            selectedGoal = 'maintain';

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

            // Reset surplus/deficit
            if (bulkSurplusInput) bulkSurplusInput.value = 500;
            if (cutDeficitInput) cutDeficitInput.value = 500;

            // Reset macros
            if (macroProteinPercent) {
                macroProteinPercent.value = 30; macroCarbsPercent.value = 45; macroFatPercent.value = 25;
                macroProteinRange.value = 30; macroCarbsRange.value = 45; macroFatRange.value = 25;
            }

            // Reset goal cards
            goalCards.forEach(c => c.classList.remove('active'));
            const maintainCard = document.getElementById('goalCardMaintain');
            if (maintainCard) maintainCard.classList.add('active');

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
