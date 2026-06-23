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

    // === Download Image ===
    const btnDownloadImage = document.getElementById('btnDownloadImage');
    if (btnDownloadImage) {
        btnDownloadImage.addEventListener('click', async () => {
            const resultsContent = document.getElementById('resultsContent');
            if (!resultsContent || resultsContent.style.display === 'none') return;

            // Change button text
            const originalHTML = btnDownloadImage.innerHTML;
            btnDownloadImage.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>กำลังสร้างรูป...</span>';
            btnDownloadImage.disabled = true;
            btnDownloadImage.style.opacity = '0.6';

            try {
                // Wait a tick for any animations to settle
                await new Promise(r => setTimeout(r, 300));

                const canvas = await html2canvas(resultsContent, {
                    backgroundColor: '#0a0a0f',
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    // Extra padding
                    onclone: (clonedDoc) => {
                        const clonedEl = clonedDoc.getElementById('resultsContent');
                        if (clonedEl) {
                            clonedEl.style.padding = '2rem';
                            clonedEl.style.borderRadius = '0';
                            // Hide download and reset buttons in the image
                            clonedEl.querySelectorAll('.btn-download, .btn-reset').forEach(btn => {
                                btn.style.display = 'none';
                            });
                            // Add branding watermark
                            const watermark = clonedDoc.createElement('div');
                            watermark.style.cssText = 'text-align:center;padding:1.5rem 0 0.5rem;font-size:13px;color:rgba(255,255,255,0.25);font-family:Inter,sans-serif;letter-spacing:0.5px;';
                            watermark.textContent = 'nutrition.limborot — TDEE Calculator';
                            clonedEl.appendChild(watermark);
                        }
                    }
                });

                // Download
                const link = document.createElement('a');
                const now = new Date();
                const dateStr = now.getFullYear() + '' +
                    String(now.getMonth() + 1).padStart(2, '0') +
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') +
                    String(now.getMinutes()).padStart(2, '0');
                link.download = `TDEE_Result_${dateStr}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

            } catch (err) {
                console.error('Screenshot failed:', err);
                alert('ไม่สามารถสร้างรูปได้ กรุณาลองอีกครั้ง');
            } finally {
                // Restore button
                btnDownloadImage.innerHTML = originalHTML;
                btnDownloadImage.disabled = false;
                btnDownloadImage.style.opacity = '1';
            }
        });
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
