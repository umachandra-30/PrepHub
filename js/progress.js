/* ==========================================================================
   Placement Preparation Hub - Progress Dashboard Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Central Registry
    const registry = await fetchRegistry();
    if (!registry) {
        showToast("Error loading progress metadata. Please try refreshing.", "danger");
        return;
    }

    // 2. Render Statistics
    renderProgressStats(registry);

    // 3. Initialize User Profile Card
    initProfileUI();

    // 4. Bind Reset button
    const resetBtn = document.getElementById('clear-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => resetAllProgress(registry));
    }

    // 5. Listen for backend sync completion to refresh charts and profile details
    window.addEventListener('sync-completed', () => {
        renderProgressStats(registry);
        initProfileUI();
    });
});

/**
 * Handles initialization and form submissions on the User Profile Card
 */
function initProfileUI() {
    const loggedInSection = document.getElementById('profile-logged-in');
    const loggedOutSection = document.getElementById('profile-logged-out');
    if (!loggedInSection || !loggedOutSection) return;

    if (window.isLoggedIn && window.isLoggedIn()) {
        loggedInSection.classList.remove('hidden');
        loggedOutSection.classList.add('hidden');

        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');

        const savedProfile = JSON.parse(localStorage.getItem('hub-profile')) || {};
        const cognitoEmail = localStorage.getItem('hub_user_email') || '';

        if (nameInput) nameInput.value = savedProfile.name || '';
        if (emailInput) emailInput.value = savedProfile.email || cognitoEmail;

        const form = document.getElementById('profile-form');
        if (form && !form.dataset.bound) {
            form.dataset.bound = "true";
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = nameInput.value.trim();
                const email = emailInput.value.trim();

                if (window.syncProfileToBackend) {
                    const success = await window.syncProfileToBackend(name, email);
                    if (success && window.renderHeaderFooter) {
                        window.renderHeaderFooter();
                    }
                }
            });
        }
    } else {
        loggedInSection.classList.add('hidden');
        loggedOutSection.classList.remove('hidden');
    }
}

/**
 * Computes metrics and renders gauge dials, category progress, and detailed lists
 */
function renderProgressStats(registry) {
    const progress = getProgress();
    const bookmarks = getBookmarks();

    let totalQuestionsPortal = 0;
    let totalCompleted = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    // Track category metrics
    const categoryStats = {
        technical: { total: 0, completed: 0 },
        aptitude: { total: 0, completed: 0 },
        reasoning: { total: 0, completed: 0 },
        verbal: { total: 0, completed: 0 }
    };

    // Track detailed subject data for listing
    const subjectList = [];

    // 1. Aggregate statistics
    Object.entries(registry.categories).forEach(([catKey, cat]) => {
        Object.entries(cat.subjects).forEach(([subSlug, sub]) => {
            const totalQ = sub.questionCount;
            totalQuestionsPortal += totalQ;
            categoryStats[catKey].total += totalQ;

            const subProg = progress[subSlug] || { completed: [], correct: [], wrong: [] };
            const compQ = subProg.completed.length;
            totalCompleted += compQ;
            categoryStats[catKey].completed += compQ;

            const correctQ = subProg.correct.length;
            const wrongQ = subProg.wrong.length;
            totalCorrect += correctQ;
            totalWrong += wrongQ;

            const subAccuracy = compQ > 0 ? Math.round((correctQ / compQ) * 100) : 0;
            const subProgressPct = totalQ > 0 ? Math.round((compQ / totalQ) * 100) : 0;

            subjectList.push({
                slug: subSlug,
                name: sub.name,
                categoryName: cat.name,
                total: totalQ,
                completed: compQ,
                correct: correctQ,
                accuracy: subAccuracy,
                percentage: subProgressPct
            });
        });
    });

    // 2. Render Overall circular score dial
    const overallProgressPct = totalQuestionsPortal > 0 ? Math.round((totalCompleted / totalQuestionsPortal) * 100) : 0;
    const overallCircle = document.getElementById('overall-progress-circle');
    const overallPctDisplay = document.getElementById('overall-pct-display');
    const overallMetricsList = document.getElementById('overall-metrics-list');

    if (overallCircle) overallCircle.style.setProperty('--progress-val', overallProgressPct);
    if (overallPctDisplay) overallPctDisplay.innerText = `${overallProgressPct}%`;

    const overallAccuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0;

    if (overallMetricsList) {
        overallMetricsList.innerHTML = `
            <div class="progress-metric-row">
                <span class="progress-metric-lbl">Completed Questions</span>
                <span class="progress-metric-val">${totalCompleted} / ${totalQuestionsPortal}</span>
            </div>
            <div class="progress-metric-row">
                <span class="progress-metric-lbl">Accuracy Rate</span>
                <span class="progress-metric-val" style="color:${overallAccuracy >= 50 ? 'var(--success)' : 'var(--danger)'};">${overallAccuracy}%</span>
            </div>
            <div class="progress-metric-row" style="border-bottom:1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
                <span class="progress-metric-lbl">Correct / Wrong Answers</span>
                <span class="progress-metric-val" style="font-size:0.8rem; color:var(--text-secondary);">${totalCorrect} Correct &bull; ${totalWrong} Incorrect</span>
            </div>
            <div class="progress-metric-row">
                <span class="progress-metric-lbl">Active Bookmarks</span>
                <span class="progress-metric-val">${bookmarks.length} saved</span>
            </div>
        `;
    }

    // 3. Render Category Progress bars
    const categoryBarsList = document.getElementById('category-bars-list');
    if (categoryBarsList) {
        let catHtml = '';
        Object.entries(categoryStats).forEach(([key, stats]) => {
            const name = registry.categories[key].name;
            const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            catHtml += `
                <div class="subject-progress-item">
                    <div class="sub-prog-meta">
                        <span>${name}</span>
                        <span>${stats.completed}/${stats.total} (${pct}%)</span>
                    </div>
                    <div class="dist-bar-container" style="height: 8px;">
                        <div class="dist-bar" style="width: ${pct}%; background-color: var(--accent);"></div>
                    </div>
                </div>
            `;
        });
        categoryBarsList.innerHTML = catHtml;
    }

    // 4. Render Subject detailed list table layout
    const subjectDetailedList = document.getElementById('subject-detailed-list');
    if (subjectDetailedList) {
        let subHtml = '';
        
        // Sort subjects alphabetically or by progress level. We'll order them alphabetically.
        subjectList.sort((a, b) => a.name.localeCompare(b.name));

        subjectList.forEach(s => {
            const accuracyDisplay = s.completed > 0 ? `${s.accuracy}% Accuracy` : 'Not Available';
            
            subHtml += `
                <div class="subject-progress-item" style="border-bottom: 1px solid var(--border-color); padding-bottom:1.25rem; margin-bottom:1rem; display:grid; grid-template-columns: 1.2fr 1.5fr 1fr; align-items:center; gap: 1.5rem;">
                    <div>
                        <div style="font-weight:700; font-size:0.95rem;">${s.name}</div>
                        <span style="font-size:0.7rem; color:var(--text-secondary); background:var(--bg-primary); padding: 0.15rem 0.4rem; border-radius: 4px; font-weight:600; margin-top: 0.25rem; display:inline-block;">${s.categoryName}</span>
                    </div>
                    <div>
                        <div class="sub-prog-meta" style="font-size:0.75rem; margin-bottom:0.35rem; color:var(--text-secondary);">
                            <span>Completed: ${s.completed}/${s.total}</span>
                            <span>${s.percentage}%</span>
                        </div>
                        <div class="dist-bar-container" style="height:6px;">
                            <div class="dist-bar" style="width:${s.percentage}%; background-color:var(--primary);"></div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.8rem; font-weight:600; color:${s.completed > 0 && s.accuracy >= 50 ? 'var(--success)' : 'var(--text-secondary)'};">${accuracyDisplay}</span>
                        <a href="questions.html?subject=${s.slug}" class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.75rem; border-radius:var(--border-radius-sm);">
                            <span>Practice</span>
                            <i class="lucide-chevron-right" style="font-size: 0.85rem;"></i>
                        </a>
                    </div>
                </div>
            `;
        });

        // Strip borders from last child
        subjectDetailedList.innerHTML = subHtml;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Wipe LocalStorage progress database
 */
function resetAllProgress(registry) {
    if (confirm("WARNING: This will permanently wipe all completed questions, stats, and accuracy metrics. Are you sure you want to proceed?")) {
        localStorage.removeItem('hub-progress');
        
        // Sync empty progress database to backend for logged-in users
        if (window.syncProgressToBackend) {
            window.syncProgressToBackend({});
        }

        renderProgressStats(registry);
        showToast("Progress records have been reset!", "info");
    }
}
