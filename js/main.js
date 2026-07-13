/* ==========================================================================
   Placement Preparation Hub - Home Dashboard Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Central Registry
    const registry = await fetchRegistry();
    if (!registry) {
        showToast("Error loading portal data. Please try refreshing.", "danger");
        return;
    }

    // 2. Render Global Statistics
    renderStats(registry);

    // 3. Render Category Cards
    renderFeaturedCategories(registry);

    // 4. Load Question of the Day (Deterministic by Date)
    await loadQuestionOfTheDay(registry);
});

/**
 * Calculates total subjects and questions across registry and renders stats
 */
function renderStats(registry) {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid) return;

    let totalCategories = Object.keys(registry.categories).length;
    let totalSubjects = 0;
    let totalQuestions = 0;

    Object.values(registry.categories).forEach(cat => {
        const subjects = Object.keys(cat.subjects);
        totalSubjects += subjects.length;
        Object.values(cat.subjects).forEach(sub => {
            totalQuestions += sub.questionCount;
        });
    });

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon total-cat"><i class="lucide-library"></i></div>
            <div>
                <div class="stat-number">${totalCategories}</div>
                <div class="stat-label">Total Categories</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon total-sub"><i class="lucide-book-open"></i></div>
            <div>
                <div class="stat-number">${totalSubjects}</div>
                <div class="stat-label">Total Subjects</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon total-ques"><i class="lucide-file-question"></i></div>
            <div>
                <div class="stat-number">${totalQuestions.toLocaleString()}</div>
                <div class="stat-label">Practice Questions</div>
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Renders the 4 category routes
 */
function renderFeaturedCategories(registry) {
    const container = document.getElementById('featured-categories-list');
    if (!container) return;

    let html = '';
    Object.entries(registry.categories).forEach(([key, cat]) => {
        const subjectCount = Object.keys(cat.subjects).length;
        let questionCount = 0;
        Object.values(cat.subjects).forEach(sub => {
            questionCount += sub.questionCount;
        });

        html += `
            <div class="category-card">
                <div class="category-icon"><i class="lucide-${cat.icon || 'book'}"></i></div>
                <h3>${cat.name}</h3>
                <p>${cat.description}</p>
                <div class="category-meta">
                    <div class="category-meta-item">Subjects: <span>${subjectCount}</span></div>
                    <div class="category-meta-item">Questions: <span>${questionCount}</span></div>
                </div>
                <a href="subjects.html?category=${key}" class="btn btn-secondary" style="width: 100%;">
                    <span>Explore Path</span>
                    <i class="lucide-arrow-right"></i>
                </a>
            </div>
        `;
    });

    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Load a single Question of the Day based on the current calendar date
 */
async function loadQuestionOfTheDay(registry) {
    const container = document.getElementById('qotd-container');
    if (!container) return;

    // Generate date seed
    const now = new Date();
    const dateSeed = now.getFullYear() * 372 + (now.getMonth() + 1) * 31 + now.getDate();

    // Compile list of all subjects
    const allSubjects = [];
    Object.entries(registry.categories).forEach(([catKey, cat]) => {
        Object.entries(cat.subjects).forEach(([subKey, sub]) => {
            allSubjects.push({
                categorySlug: catKey,
                subjectSlug: subKey,
                name: sub.name,
                questionCount: sub.questionCount
            });
        });
    });

    if (allSubjects.length === 0) return;

    // Pick deterministic subject
    const subjectIndex = dateSeed % allSubjects.length;
    const selectedSub = allSubjects[subjectIndex];

    // Load questions for that subject
    const questions = await fetchSubjectQuestions(selectedSub.categorySlug, selectedSub.subjectSlug);
    if (!questions || questions.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);">Unable to load daily question at this time.</p>`;
        return;
    }

    // Pick deterministic question
    const questionIndex = dateSeed % questions.length;
    const q = questions[questionIndex];

    // Check if bookmarked
    const bookmarked = isBookmarked(selectedSub.subjectSlug, q.id);

    container.innerHTML = `
        <div class="qotd-card" style="box-shadow: var(--shadow-sm);">
            <div class="workspace-header" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
                <div class="workspace-meta">
                    <span class="card-badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                    <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:600;">
                        ${selectedSub.name} &bull; ${q.topic}
                    </span>
                </div>
                <div class="workspace-actions">
                    <button class="icon-btn" id="qotd-bookmark" title="Bookmark Question">
                        <i class="lucide-bookmark" style="${bookmarked ? 'fill: var(--primary); color: var(--primary);' : ''}"></i>
                    </button>
                    <button class="icon-btn" id="qotd-share" title="Share Question">
                        <i class="lucide-share-2"></i>
                    </button>
                    <button class="icon-btn" id="qotd-copy" title="Copy Question">
                        <i class="lucide-copy"></i>
                    </button>
                </div>
            </div>
            
            <p class="qotd-question" style="margin-top: 1rem;">${q.question}</p>
            
            <div class="reveal-actions" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
                <a href="questions.html?subject=${selectedSub.subjectSlug}&qid=${q.id}" class="btn btn-primary">
                    <i class="lucide-pencil-ruler"></i>
                    <span>Solve on Hub</span>
                </a>
                <button class="btn btn-secondary" id="qotd-reveal-btn">
                    <i class="lucide-eye"></i>
                    <span>Reveal Answer</span>
                </button>
            </div>

            <div class="info-panel hidden" id="qotd-answer-panel" style="margin-top: 1.5rem; margin-bottom: 0;">
                <div class="info-panel-title success-text">
                    <i class="lucide-check-circle-2"></i>
                    <span>Correct Answer: Option ${q.correctAnswer} (${q.answer})</span>
                </div>
                <p><strong>Explanation:</strong> ${q.explanation || 'No explanation provided for this question.'}</p>
            </div>
        </div>
    `;

    // Bind Event Listeners
    document.getElementById('qotd-reveal-btn').addEventListener('click', (e) => {
        const panel = document.getElementById('qotd-answer-panel');
        const isHidden = panel.classList.toggle('hidden');
        e.currentTarget.innerHTML = isHidden 
            ? '<i class="lucide-eye"></i><span>Reveal Answer</span>'
            : '<i class="lucide-eye-off"></i><span>Hide Answer</span>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    document.getElementById('qotd-bookmark').addEventListener('click', (e) => {
        const active = toggleBookmark(q, selectedSub.subjectSlug, selectedSub.name, selectedSub.categorySlug);
        const icon = e.currentTarget.querySelector('i, svg');
        if (icon) {
            if (active) {
                icon.style.fill = 'var(--primary)';
                icon.style.color = 'var(--primary)';
            } else {
                icon.style.fill = '';
                icon.style.color = '';
            }
        }
    });

    document.getElementById('qotd-share').addEventListener('click', () => {
        shareQuestion(q, selectedSub.subjectSlug);
    });

    document.getElementById('qotd-copy').addEventListener('click', () => {
        const textToCopy = `Question:\n${q.question}\nA) ${q.optionA}\nB) ${q.optionB}\nC) ${q.optionC}\nD) ${q.optionD}\n\nAnswer: Option ${q.correctAnswer} (${q.answer})`;
        copyToClipboard(textToCopy);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}


