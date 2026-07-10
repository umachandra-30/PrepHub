/* ==========================================================================
   Placement Preparation Hub - Practice Workspace Script
   ========================================================================== */

// Page States
let currentSubjectSlug = null;
let currentSubjectName = "";
let currentCategorySlug = null;
let allQuestions = [];
let filteredQuestions = [];
let currentIndex = 0;

let selectedOption = null;
let isAnswerChecked = false;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Central Registry
    const registry = await fetchRegistry();
    if (!registry) {
        showToast("Error loading portal datasets. Please refresh.", "danger");
        return;
    }

    // 2. Resolve Active Subject & Question Parameters
    const params = new URLSearchParams(window.location.search);
    let subjectParam = params.get('subject');
    let qidParam = parseInt(params.get('qid')) || null;
    let searchParam = params.get('search') || null;

    // Resolve subject if not specified
    if (!subjectParam) {
        // Find first subject in first category as fallback
        const firstCatKey = Object.keys(registry.categories)[0];
        subjectParam = Object.keys(registry.categories[firstCatKey].subjects)[0];
    }

    // Locate category and subject in registry
    let resolvedSubject = null;
    let resolvedCategoryKey = null;
    for (const [catKey, cat] of Object.entries(registry.categories)) {
        if (cat.subjects[subjectParam]) {
            resolvedSubject = cat.subjects[subjectParam];
            resolvedCategoryKey = catKey;
            break;
        }
    }

    if (!resolvedSubject) {
        showToast("Subject not found. Loading default pathway...", "warning");
        // Fallback to first available
        resolvedCategoryKey = 'technical';
        subjectParam = 'dsa';
        resolvedSubject = registry.categories[resolvedCategoryKey].subjects[subjectParam];
    }

    currentSubjectSlug = subjectParam;
    currentSubjectName = resolvedSubject.name;
    currentCategorySlug = resolvedCategoryKey;

    // 3. Load Dataset Questions
    allQuestions = await fetchSubjectQuestions(currentCategorySlug, currentSubjectSlug);
    filteredQuestions = [...allQuestions];

    // 4. Setup Filters
    setupFiltersUI(resolvedSubject);

    // 5. Apply Initial Search URL Parameters if any
    if (searchParam) {
        const searchBox = document.getElementById('q-search-box');
        if (searchBox) searchBox.value = searchParam;
        applyFilters();
    }

    // 6. Resolve Initial Question Index
    if (qidParam) {
        const qIndex = filteredQuestions.findIndex(q => q.id === qidParam);
        if (qIndex !== -1) {
            currentIndex = qIndex;
        }
    }

    // 7. Bind Interactive Events
    bindWorkspaceEvents();

    // 8. Trigger Initial Render
    renderSidebarQuestions();
    renderQuestion();

});

/**
 * Populates dropdown selects with unique subject-specific topics and companies
 */
function setupFiltersUI(subjectMeta) {
    const topicSelect = document.getElementById('filter-topic');
    const companySelect = document.getElementById('filter-company');

    if (topicSelect && subjectMeta.topics) {
        topicSelect.innerHTML = '<option value="">All Topics</option>' + 
            subjectMeta.topics.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    if (companySelect && subjectMeta.companies) {
        companySelect.innerHTML = '<option value="">All Companies</option>' + 
            subjectMeta.companies.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

/**
 * Filter questions based on search query, difficulty, topic, and company
 */
function applyFilters() {
    const searchQuery = document.getElementById('q-search-box').value.toLowerCase().trim();
    const diffFilter = document.getElementById('filter-difficulty').value;
    const topicFilter = document.getElementById('filter-topic').value;
    const companyFilter = document.getElementById('filter-company').value;

    filteredQuestions = allQuestions.filter(q => {
        // Search matches
        const matchesSearch = !searchQuery || 
            q.question.toLowerCase().includes(searchQuery) ||
            q.topic.toLowerCase().includes(searchQuery) ||
            q.tags.toLowerCase().includes(searchQuery) ||
            q.companyAsked.toLowerCase().includes(searchQuery);

        // Difficulty matches
        const matchesDiff = !diffFilter || q.difficulty === diffFilter;

        // Topic matches
        const matchesTopic = !topicFilter || q.topic === topicFilter;

        // Company matches
        const matchesCompany = !companyFilter || q.companyAsked.split(';').includes(companyFilter);

        return matchesSearch && matchesDiff && matchesTopic && matchesCompany;
    });

    currentIndex = 0; // Reset index to first matched item
    renderSidebarQuestions();
    renderQuestion();
}

/**
 * Render sidebar questions list matching filter conditions
 */
function renderSidebarQuestions() {
    const container = document.getElementById('q-list');
    if (!container) return;

    if (filteredQuestions.length === 0) {
        container.innerHTML = `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.875rem;">
                <i class="lucide-alert-circle" style="font-size:1.5rem; margin-bottom:0.5rem; display:block;"></i>
                No questions match filters
            </div>
        `;
        return;
    }

    const progress = getProgress();
    const completedList = progress[currentSubjectSlug]?.completed || [];

    let html = '';
    filteredQuestions.forEach((q, idx) => {
        const isCompleted = completedList.includes(q.id);
        const isActive = idx === currentIndex;
        
        let statusIcon = '';
        if (isCompleted) {
            const isCorrect = progress[currentSubjectSlug]?.correct.includes(q.id);
            statusIcon = isCorrect 
                ? '<i class="lucide-check-circle-2 q-item-status completed" title="Correct"></i>'
                : '<i class="lucide-x-circle q-item-status" style="color:var(--danger);" title="Incorrect"></i>';
        }

        html += `
            <div class="sidebar-q-item ${isActive ? 'active' : ''}" onclick="selectQuestionByIndex(${idx})">
                <div class="q-item-header">
                    <span>Q#${q.id} &bull; ${q.difficulty}</span>
                    ${statusIcon}
                </div>
                <div class="q-item-title" title="${q.question}">${q.question}</div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Auto scroll active item into view inside the sidebar
    const activeItem = container.querySelector('.sidebar-q-item.active');
    if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Click handler bound dynamically
 */
window.selectQuestionByIndex = function(index) {
    currentIndex = index;
    renderSidebarQuestions();
    renderQuestion();
    
    // If mobile, close the drawer when a question is clicked
    const sidebar = document.getElementById('q-sidebar');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        document.getElementById('sidebar-drawer-btn').innerHTML = '<i class="lucide-list"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

/**
 * Renders the question inside the reading viewport
 */
function renderQuestion() {
    const viewport = document.getElementById('practice-viewport');
    if (!viewport) return;

    if (filteredQuestions.length === 0) {
        viewport.innerHTML = `
            <div class="question-workspace flex-center" style="height:350px; text-align:center; color: var(--text-secondary);">
                <div>
                    <i class="lucide-file-x" style="font-size:3rem; color:var(--text-secondary); margin-bottom:1rem;"></i>
                    <h2>No Practice Question Selected</h2>
                    <p>Adjust your search criteria or select another path category.</p>
                </div>
            </div>
        `;
        return;
    }

    const q = filteredQuestions[currentIndex];
    
    // Reset states
    selectedOption = null;
    isAnswerChecked = false;

    // Track Bookmark
    const bookmarked = isBookmarked(currentSubjectSlug, q.id);



    viewport.innerHTML = `
        <div class="question-workspace animate-fade" id="workspace-card">
            
            <!-- Question header context -->
            <div class="workspace-header">
                <div class="workspace-meta">
                    <span class="card-badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                    <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:600;">
                        Question ${currentIndex + 1} of ${filteredQuestions.length} &bull; ${q.topic}
                    </span>
                </div>
                <div class="workspace-actions">
                    <button class="icon-btn" id="q-bookmark" title="Bookmark Question">
                        <i class="lucide-bookmark" style="${bookmarked ? 'fill: var(--primary); color: var(--primary);' : ''}"></i>
                    </button>
                    <button class="icon-btn" id="q-share" title="Share Question">
                        <i class="lucide-share-2"></i>
                    </button>
                    <button class="icon-btn" id="q-copy" title="Copy Question">
                        <i class="lucide-copy"></i>
                    </button>
                </div>
            </div>

            <!-- Question statement text -->
            <div class="workspace-question-text">${q.question}</div>

            <!-- Interactive Options -->
            <div class="options-container">
                <button class="option-btn" data-opt="A">
                    <div class="option-prefix">A</div>
                    <span class="option-text">${q.optionA}</span>
                </button>
                <button class="option-btn" data-opt="B">
                    <div class="option-prefix">B</div>
                    <span class="option-text">${q.optionB}</span>
                </button>
                <button class="option-btn" data-opt="C">
                    <div class="option-prefix">C</div>
                    <span class="option-text">${q.optionC}</span>
                </button>
                <button class="option-btn" data-opt="D">
                    <div class="option-prefix">D</div>
                    <span class="option-text">${q.optionD}</span>
                </button>
            </div>

            <!-- Action buttons -->
            <div class="reveal-actions" style="margin-bottom: 0; border-bottom: none;">
                <button class="btn btn-primary" id="q-check-btn" disabled>
                    <i class="lucide-check"></i>
                    <span>Check Answer</span>
                </button>
                <button class="btn btn-secondary" id="q-reveal-btn">
                    <i class="lucide-eye"></i>
                    <span>Reveal Explanation</span>
                </button>
            </div>

            <!-- Hidden Feedback panel -->
            <div class="info-panel hidden" id="q-answer-panel" style="margin-top: 1.5rem;">
                <div class="info-panel-title success-text">
                    <i class="lucide-check-circle-2"></i>
                    <span>Correct Answer: Option ${q.correctAnswer} (${q.answer})</span>
                </div>
                <p id="q-explanation-text"><strong>Explanation:</strong> ${q.explanation || 'No step-by-step explanation available.'}</p>
            </div>

            <!-- Meta Section: Asked In & Tags -->
            <div class="question-tags-section">
                ${q.companyAsked ? `
                    <div>
                        <div class="tag-list-label"><i class="lucide-building-2"></i> <span>Asked In Companies:</span></div>
                        <div class="tag-bubble-list" style="margin-top: 0.5rem;">
                            ${q.companyAsked.split(';').map(c => `<span class="company-bubble">${c}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${q.tags ? `
                    <div>
                        <div class="tag-list-label"><i class="lucide-tag"></i> <span>Tags:</span></div>
                        <div class="tag-bubble-list" style="margin-top: 0.5rem;">
                            ${q.tags.split(';').map(t => `<span class="tag-bubble">${t}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top: 0.5rem; text-align:right;">
                    Source: ${q.source || 'Placement Hub'}
                </div>
            </div>

            <!-- Workspace Navigation arrows -->
            <div class="workspace-footer" style="border-top:1px solid var(--border-color); padding-top: 1.5rem;">
                <button class="btn btn-secondary" id="nav-random" title="Random Question">
                    <i class="lucide-shuffle"></i>
                    <span>Random Q</span>
                </button>
                <div class="nav-arrows">
                    <button class="btn btn-secondary" id="nav-prev" ${currentIndex === 0 ? 'disabled' : ''}>
                        <i class="lucide-chevron-left"></i>
                        <span>Previous</span>
                    </button>
                    <button class="btn btn-secondary" id="nav-next" ${currentIndex === filteredQuestions.length - 1 ? 'disabled' : ''}>
                        <span>Next</span>
                        <i class="lucide-chevron-right"></i>
                    </button>
                </div>
            </div>

        </div>
    `;

    // Bind Question Element Action Listeners
    setupQuestionEvents(q);
}

/**
 * Event setups for option buttons, reveal, copy, share, bookmarks inside question viewport
 */
function setupQuestionEvents(q) {
    const optButtons = document.querySelectorAll('.option-btn');
    const checkBtn = document.getElementById('q-check-btn');
    const revealBtn = document.getElementById('q-reveal-btn');
    const bookmarkBtn = document.getElementById('q-bookmark');
    const shareBtn = document.getElementById('q-share');
    const copyBtn = document.getElementById('q-copy');
    
    // Navigation items
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    const randomBtn = document.getElementById('nav-random');

    // Option Clicking
    optButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isAnswerChecked) return; // Block selection changes once evaluated
            
            optButtons.forEach(b => b.classList.remove('selected'));
            
            selectedOption = e.currentTarget.getAttribute('data-opt');
            e.currentTarget.classList.add('selected');
            
            checkBtn.disabled = false;
        });
    });

    // Check Answer Clicked
    checkBtn.addEventListener('click', () => {
        if (!selectedOption || isAnswerChecked) return;
        
        isAnswerChecked = true;
        checkBtn.disabled = true;

        // Block options clicking
        optButtons.forEach(btn => btn.disabled = true);

        const isCorrect = selectedOption === q.correctAnswer;

        // Save progress locally
        markQuestionCompleted(currentSubjectSlug, q.id, isCorrect);

        // Highlight correct and incorrect options
        optButtons.forEach(btn => {
            const optLetter = btn.getAttribute('data-opt');
            if (optLetter === q.correctAnswer) {
                btn.classList.add('correct-reveal');
            } else if (optLetter === selectedOption && !isCorrect) {
                btn.classList.add('wrong-reveal');
            }
        });

        // Trigger updates in sidebar checkmark/status icons
        renderSidebarQuestions();

        // Reveal answer panel
        const answerPanel = document.getElementById('q-answer-panel');
        answerPanel.classList.remove('hidden');
        revealBtn.innerHTML = '<i class="lucide-eye-off"></i><span>Hide Explanation</span>';

        if (isCorrect) {
            showToast("Correct Answer!", "success");
        } else {
            showToast(`Incorrect! The correct answer is Option ${q.correctAnswer}`, "danger");
        }
    });

    // Reveal Explanation Clicked
    revealBtn.addEventListener('click', () => {
        const answerPanel = document.getElementById('q-answer-panel');
        const isHidden = answerPanel.classList.toggle('hidden');
        revealBtn.innerHTML = isHidden 
            ? '<i class="lucide-eye"></i><span>Reveal Explanation</span>'
            : '<i class="lucide-eye-off"></i><span>Hide Explanation</span>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    // Bookmark Toggle Clicked
    bookmarkBtn.addEventListener('click', () => {
        const bookmarked = toggleBookmark(q, currentSubjectSlug, currentSubjectName, currentCategorySlug);
        const icon = bookmarkBtn.querySelector('i');
        if (bookmarked) {
            icon.style.fill = 'var(--primary)';
            icon.style.color = 'var(--primary)';
        } else {
            icon.style.fill = '';
            icon.style.color = '';
        }
    });

    // Share Question Clicked
    shareBtn.addEventListener('click', () => {
        shareQuestion(q, currentSubjectSlug);
    });

    // Copy Question Clicked
    copyBtn.addEventListener('click', () => {
        const textToCopy = `Question:\n${q.question}\nA) ${q.optionA}\nB) ${q.optionB}\nC) ${q.optionC}\nD) ${q.optionD}\n\nCorrect Option: ${q.correctAnswer}\nAnswer: ${q.answer}\nExplanation: ${q.explanation}`;
        copyToClipboard(textToCopy);
    });

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < filteredQuestions.length - 1) {
                currentIndex++;
                renderSidebarQuestions();
                renderQuestion();
            }
        });
    }

    // Prev button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                renderSidebarQuestions();
                renderQuestion();
            }
        });
    }

    // Random button
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            if (filteredQuestions.length > 1) {
                let randIndex;
                do {
                    randIndex = Math.floor(Math.random() * filteredQuestions.length);
                } while (randIndex === currentIndex);
                currentIndex = randIndex;
                renderSidebarQuestions();
                renderQuestion();
            }
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Handles sidebar toggling and dropdown/search filter events
 */
function bindWorkspaceEvents() {
    // Mobile Sidebar Drawer Toggler
    const drawerBtn = document.getElementById('sidebar-drawer-btn');
    const sidebar = document.getElementById('q-sidebar');
    if (drawerBtn && sidebar) {
        drawerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            const isActive = sidebar.classList.contains('active');
            drawerBtn.innerHTML = isActive ? '<i class="lucide-x"></i>' : '<i class="lucide-list"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    // Filters Listeners
    const searchBox = document.getElementById('q-search-box');
    const diffSelect = document.getElementById('filter-difficulty');
    const topicSelect = document.getElementById('filter-topic');
    const companySelect = document.getElementById('filter-company');

    if (searchBox) {
        searchBox.addEventListener('input', () => applyFilters());
    }
    if (diffSelect) {
        diffSelect.addEventListener('change', () => applyFilters());
    }
    if (topicSelect) {
        topicSelect.addEventListener('change', () => applyFilters());
    }
    if (companySelect) {
        companySelect.addEventListener('change', () => applyFilters());
    }

    // Keyboard Shortcuts (Arrow keys & option selection)
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    // Ignore key presses inside inputs/selects to avoid hijacking normal typing
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (filteredQuestions.length === 0) return;

    // Previous Question (Left Arrow)
    if (e.key === 'ArrowLeft') {
        const prevBtn = document.getElementById('nav-prev');
        if (prevBtn && !prevBtn.disabled) {
            prevBtn.click();
        }
    }
    // Next Question (Right Arrow)
    else if (e.key === 'ArrowRight') {
        const nextBtn = document.getElementById('nav-next');
        if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
        }
    }
    // Options Selection (Keys 1, 2, 3, 4 map to options A, B, C, D)
    else if (['1', '2', '3', '4'].includes(e.key) && !isAnswerChecked) {
        const optMapping = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        const letter = optMapping[e.key];
        const optBtn = document.querySelector(`.option-btn[data-opt="${letter}"]`);
        if (optBtn) optBtn.click();
    }
    // Check Answer (Enter key)
    else if (e.key === 'Enter') {
        const checkBtn = document.getElementById('q-check-btn');
        if (checkBtn && !checkBtn.disabled) {
            checkBtn.click();
        }
    }
}
