/* ==========================================================================
   Placement Preparation Hub - Mock Test Script
   ========================================================================== */

// Setup State
let selectedQCount = 10;
let selectedCategories = ['technical', 'aptitude', 'reasoning', 'verbal'];

// Test State
let testQuestions = [];
let userAnswers = []; // holds choice letters: 'A', 'B', 'C', 'D' or null
let flaggedQuestions = []; // holds boolean states
let currentTestIndex = 0;

let timeLeft = 0; // seconds
let totalTestTime = 0; // seconds
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    bindSetupEvents();
});

/**
 * Setup screen selectors (count and category toggles)
 */
function bindSetupEvents() {
    const qcountSelectors = document.querySelectorAll('#qcount-selectors .mock-option-selector');
    const categorySelectors = document.querySelectorAll('#category-selectors .mock-checkbox-item');
    const startBtn = document.getElementById('start-test-btn');

    // Count selector
    qcountSelectors.forEach(btn => {
        btn.addEventListener('click', (e) => {
            qcountSelectors.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            selectedQCount = parseInt(e.currentTarget.getAttribute('data-val'));
        });
    });

    // Category selectors
    categorySelectors.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cat = e.currentTarget.getAttribute('data-val');
            const isActive = e.currentTarget.classList.contains('active');

            if (isActive) {
                // Prevent unchecking if it's the last active category
                if (selectedCategories.length === 1) {
                    showToast("Select at least one category to test!", "warning");
                    return;
                }
                e.currentTarget.classList.remove('active');
                e.currentTarget.querySelector('i').className = 'lucide-square';
                selectedCategories = selectedCategories.filter(c => c !== cat);
            } else {
                e.currentTarget.classList.add('active');
                e.currentTarget.querySelector('i').className = 'lucide-check-square';
                selectedCategories.push(cat);
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });

    // Start Button
    if (startBtn) {
        startBtn.addEventListener('click', startMockTestFlow);
    }
}

/**
 * Triggers loading questions in parallel, shuffling, and setting timer
 */
async function startMockTestFlow() {
    const registry = await fetchRegistry();
    if (!registry) {
        showToast("Error loading portal datasets. Please refresh.", "danger");
        return;
    }

    // Show loading text on button
    const startBtn = document.getElementById('start-test-btn');
    startBtn.disabled = true;
    startBtn.innerHTML = '<i class="lucide-loader-2 animate-spin" style="animation: loading-skeleton 1.5s infinite;"></i> Loading Test...';

    // Compile list of subjects across chosen categories
    const fetchPromises = [];
    selectedCategories.forEach(catKey => {
        const cat = registry.categories[catKey];
        if (cat && cat.subjects) {
            Object.entries(cat.subjects).forEach(([subSlug, sub]) => {
                fetchPromises.push(
                    fetchSubjectQuestions(catKey, subSlug)
                );
            });
        }
    });

    if (fetchPromises.length === 0) {
        showToast("No questions available for selected category configuration", "warning");
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="lucide-play-circle"></i> <span>Start Mock Test</span>';
        return;
    }

    try {
        // Fetch all selected files in parallel
        const results = await Promise.all(fetchPromises);
        let consolidatedQuestions = [];
        results.forEach(qList => {
            consolidatedQuestions = consolidatedQuestions.concat(qList);
        });

        if (consolidatedQuestions.length === 0) {
            showToast("Failed to compile questions list", "danger");
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="lucide-play-circle"></i> <span>Start Mock Test</span>';
            return;
        }

        // Shuffle questions array
        shuffleArray(consolidatedQuestions);

        // Slice up to selected count
        testQuestions = consolidatedQuestions.slice(0, selectedQCount);

        // Reset active test state
        userAnswers = new Array(testQuestions.length).fill(null);
        flaggedQuestions = new Array(testQuestions.length).fill(false);
        currentTestIndex = 0;
        
        // 1 minute per question
        timeLeft = testQuestions.length * 60;
        totalTestTime = timeLeft;

        // Transition view
        document.getElementById('setup-view').classList.add('hidden');
        document.getElementById('active-test-view').classList.remove('hidden');

        // Start timer countdown
        startTestTimer();

        // Render navigator grid
        renderGridNavigator();

        // Render first question
        renderMockQuestion();

        showToast("Mock test started! Good luck.", "info");

    } catch (err) {
        console.error(err);
        showToast("Error generating mock test. Please try again.", "danger");
    } finally {
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="lucide-play-circle"></i> <span>Start Mock Test</span>';
    }
}

/**
 * Shuffles arrays in-place using Fisher-Yates
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Handles countdown timer logic
 */
function startTestTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitMockTest(true); // Auto submit
        }
    }, 1000);
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    const box = document.getElementById('test-timer');
    if (!display) return;

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Color warning under 2 mins
    if (timeLeft < 120 && box) {
        box.style.color = '#EF4444';
        box.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    } else if (box) {
        box.style.color = '';
        box.style.backgroundColor = '';
    }
}

/**
 * Renders the question in active mock view
 */
function renderMockQuestion() {
    const q = testQuestions[currentTestIndex];
    
    // UI elements
    document.getElementById('mock-progress-lbl').innerText = `Question ${currentTestIndex + 1} of ${testQuestions.length}`;
    document.getElementById('mock-q-difficulty').className = `card-badge badge-${q.difficulty.toLowerCase()}`;
    document.getElementById('mock-q-difficulty').innerText = q.difficulty;
    document.getElementById('mock-q-topic').innerText = `${q.subject} &bull; ${q.topic}`;
    document.getElementById('mock-q-text').innerText = q.question;

    // Render Options
    const optContainer = document.getElementById('mock-options-container');
    const selected = userAnswers[currentTestIndex];

    optContainer.innerHTML = `
        <button class="option-btn ${selected === 'A' ? 'selected' : ''}" onclick="selectMockOption('A')">
            <div class="option-prefix">A</div>
            <span class="option-text">${q.optionA}</span>
        </button>
        <button class="option-btn ${selected === 'B' ? 'selected' : ''}" onclick="selectMockOption('B')">
            <div class="option-prefix">B</div>
            <span class="option-text">${q.optionB}</span>
        </button>
        <button class="option-btn ${selected === 'C' ? 'selected' : ''}" onclick="selectMockOption('C')">
            <div class="option-prefix">C</div>
            <span class="option-text">${q.optionC}</span>
        </button>
        <button class="option-btn ${selected === 'D' ? 'selected' : ''}" onclick="selectMockOption('D')">
            <div class="option-prefix">D</div>
            <span class="option-text">${q.optionD}</span>
        </button>
    `;

    // Flag button states
    const flagBtn = document.getElementById('mock-flag-btn');
    const isFlagged = flaggedQuestions[currentTestIndex];
    if (isFlagged) {
        flagBtn.classList.add('btn-primary');
        flagBtn.classList.remove('btn-secondary');
        flagBtn.innerHTML = '<i class="lucide-flag" style="fill:white;"></i><span>Flagged</span>';
    } else {
        flagBtn.classList.add('btn-secondary');
        flagBtn.classList.remove('btn-primary');
        flagBtn.innerHTML = '<i class="lucide-flag"></i><span>Flag for Review</span>';
    }

    // Previous / Next button disabling
    document.getElementById('mock-prev-btn').disabled = currentTestIndex === 0;
    document.getElementById('mock-next-btn').disabled = currentTestIndex === testQuestions.length - 1;

    // Highlight active element in navigator grid
    updateNavigatorHighlights();

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Choice button clicked
 */
window.selectMockOption = function(optionLetter) {
    userAnswers[currentTestIndex] = optionLetter;
    
    // Highlight buttons immediately
    const optButtons = document.querySelectorAll('#mock-options-container .option-btn');
    optButtons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(optionLetter)) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    updateNavigatorHighlights();
};

/**
 * Renders the navigator grid blocks
 */
function renderGridNavigator() {
    const container = document.getElementById('mock-grid-navigator');
    if (!container) return;

    let html = '';
    testQuestions.forEach((_, idx) => {
        html += `
            <button class="nav-q-btn" id="nav-block-${idx}" onclick="jumpToMockQuestion(${idx})">
                ${idx + 1}
            </button>
        `;
    });

    container.innerHTML = html;
}

window.jumpToMockQuestion = function(idx) {
    currentTestIndex = idx;
    renderMockQuestion();
};

/**
 * Updates CSS states for navigator grid boxes
 */
function updateNavigatorHighlights() {
    testQuestions.forEach((_, idx) => {
        const block = document.getElementById(`nav-block-${idx}`);
        if (!block) return;

        // Reset classes
        block.className = 'nav-q-btn';

        const isAnswered = userAnswers[idx] !== null;
        const isFlagged = flaggedQuestions[idx] === true;
        const isActive = idx === currentTestIndex;

        if (isActive) {
            block.classList.add('active');
        } else if (isFlagged) {
            block.classList.add('flagged');
        } else if (isAnswered) {
            block.classList.add('answered');
        }
    });
}

// Bind navigation keys inside test viewport
document.getElementById('mock-prev-btn').addEventListener('click', () => {
    if (currentTestIndex > 0) {
        currentTestIndex--;
        renderMockQuestion();
    }
});

document.getElementById('mock-next-btn').addEventListener('click', () => {
    if (currentTestIndex < testQuestions.length - 1) {
        currentTestIndex++;
        renderMockQuestion();
    }
});

document.getElementById('mock-flag-btn').addEventListener('click', () => {
    flaggedQuestions[currentTestIndex] = !flaggedQuestions[currentTestIndex];
    renderMockQuestion();
});

document.getElementById('submit-test-btn').addEventListener('click', () => {
    // Check if there are unanswered questions
    const unansweredCount = userAnswers.filter(ans => ans === null).length;
    let confirmMsg = "Are you sure you want to submit the mock test?";
    if (unansweredCount > 0) {
        confirmMsg = `You have ${unansweredCount} unanswered questions. ${confirmMsg}`;
    }

    if (confirm(confirmMsg)) {
        submitMockTest(false);
    }
});

/**
 * Evaluate test scores and present review details
 */
function submitMockTest(autoSubmit = false) {
    clearInterval(timerInterval);

    if (autoSubmit) {
        alert("Time limit expired! Your test is being auto-submitted.");
    }

    // Evaluate answers
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    testQuestions.forEach((q, idx) => {
        const ans = userAnswers[idx];
        if (ans === null) {
            skippedCount++;
        } else if (ans === q.correctAnswer) {
            correctCount++;
        } else {
            wrongCount++;
        }
    });

    const totalCount = testQuestions.length;
    const scorePercentage = Math.round((correctCount / totalCount) * 100);
    const timeSpentSeconds = totalTestTime - timeLeft;
    const timeSpentMins = Math.floor(timeSpentSeconds / 60);
    const timeSpentSecs = timeSpentSeconds % 60;
    const timeDisplay = `${timeSpentMins}m ${timeSpentSecs}s`;

    // Resolve performance rating
    let rating = "Needs Practice";
    let ratingDesc = "Review explanations below to improve your concepts and try again.";
    if (scorePercentage >= 80) {
        rating = "Excellent Performance!";
        ratingDesc = "Fantastic work! You are placement ready for these subjects.";
    } else if (scorePercentage >= 50) {
        rating = "Good Attempt";
        ratingDesc = "You have a solid foundation, but there is room for improvement.";
    }

    // Switch view
    document.getElementById('active-test-view').classList.add('hidden');
    const resultsView = document.getElementById('results-view');
    resultsView.classList.remove('hidden');

    // Build Review HTML list
    let reviewHtml = '';
    testQuestions.forEach((q, idx) => {
        const ansSelected = userAnswers[idx];
        const isCorrect = ansSelected === q.correctAnswer;
        
        let statusBadge = `<span class="card-badge badge-hard" style="margin-bottom:0;"><i class="lucide-x"></i> Skipped</span>`;
        if (ansSelected !== null) {
            statusBadge = isCorrect
                ? `<span class="card-badge badge-easy" style="margin-bottom:0;"><i class="lucide-check"></i> Correct</span>`
                : `<span class="card-badge badge-hard" style="margin-bottom:0;"><i class="lucide-x"></i> Wrong</span>`;
        }

        reviewHtml += `
            <div class="review-item">
                <div class="review-badge-row">
                    <span class="card-badge badge-${q.difficulty.toLowerCase()}" style="margin-bottom:0;">${q.difficulty}</span>
                    <span style="font-size:0.75rem; color:var(--text-secondary); font-weight:600; align-self:center;">Q${idx + 1} &bull; ${q.subject}</span>
                    <span style="margin-left:auto;">${statusBadge}</span>
                </div>
                
                <p style="font-weight:600; margin: 0.5rem 0 1rem; line-height: 1.5;">${q.question}</p>
                
                <!-- Option selections visual review -->
                <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
                    <div style="font-size:0.85rem; padding:0.5rem 1rem; border-radius:var(--border-radius-sm); border:1px solid var(--border-color); ${q.correctAnswer === 'A' ? 'background-color:rgba(34,197,94,0.1); border-color:var(--success); font-weight:600;' : ''} ${ansSelected === 'A' && !isCorrect ? 'background-color:rgba(239,68,68,0.1); border-color:var(--danger);' : ''}">
                        A) ${q.optionA}
                    </div>
                    <div style="font-size:0.85rem; padding:0.5rem 1rem; border-radius:var(--border-radius-sm); border:1px solid var(--border-color); ${q.correctAnswer === 'B' ? 'background-color:rgba(34,197,94,0.1); border-color:var(--success); font-weight:600;' : ''} ${ansSelected === 'B' && !isCorrect ? 'background-color:rgba(239,68,68,0.1); border-color:var(--danger);' : ''}">
                        B) ${q.optionB}
                    </div>
                    <div style="font-size:0.85rem; padding:0.5rem 1rem; border-radius:var(--border-radius-sm); border:1px solid var(--border-color); ${q.correctAnswer === 'C' ? 'background-color:rgba(34,197,94,0.1); border-color:var(--success); font-weight:600;' : ''} ${ansSelected === 'C' && !isCorrect ? 'background-color:rgba(239,68,68,0.1); border-color:var(--danger);' : ''}">
                        C) ${q.optionC}
                    </div>
                    <div style="font-size:0.85rem; padding:0.5rem 1rem; border-radius:var(--border-radius-sm); border:1px solid var(--border-color); ${q.correctAnswer === 'D' ? 'background-color:rgba(34,197,94,0.1); border-color:var(--success); font-weight:600;' : ''} ${ansSelected === 'D' && !isCorrect ? 'background-color:rgba(239,68,68,0.1); border-color:var(--danger);' : ''}">
                        D) ${q.optionD}
                    </div>
                </div>

                <div class="info-panel" style="margin-bottom:0; padding:1rem; border-radius:var(--border-radius-sm);">
                    <p style="font-size:0.85rem;"><strong>Explanation:</strong> ${q.explanation || 'No step-by-step explanation provided.'}</p>
                </div>
            </div>
        `;
    });

    resultsView.innerHTML = `
        <div class="results-summary-card">
            <h1 style="font-size: 2.25rem; font-family:'Outfit'; margin-bottom: 0.5rem;">Test Summary</h1>
            <p style="color:var(--text-secondary); margin-bottom: 2rem;">${ratingDesc}</p>
            
            <!-- Dynamic circular dial indicator -->
            <div class="results-ring-container" style="--percentage-score: ${scorePercentage};">
                <div class="results-ring-inner">${scorePercentage}%</div>
            </div>

            <h2 style="font-size: 1.5rem; margin-top: 1rem; color: ${scorePercentage >= 50 ? 'var(--success)' : 'var(--danger)'};">${rating}</h2>

            <div class="results-stats-grid">
                <div class="results-stat">
                    <div class="results-stat-num">${totalCount}</div>
                    <div class="results-stat-lbl">Questions</div>
                </div>
                <div class="results-stat">
                    <div class="results-stat-num correct">${correctCount}</div>
                    <div class="results-stat-lbl">Correct</div>
                </div>
                <div class="results-stat">
                    <div class="results-stat-num wrong">${wrongCount}</div>
                    <div class="results-stat-lbl">Wrong</div>
                </div>
                <div class="results-stat">
                    <div class="results-stat-num">${timeDisplay}</div>
                    <div class="results-stat-lbl">Time Taken</div>
                </div>
            </div>

            <button class="btn btn-primary" onclick="restartMockTestSetup()" style="padding:0.75rem 2rem;">
                <i class="lucide-refresh-cw"></i>
                <span>Start New Mock Test</span>
            </button>
        </div>

        <div class="results-review-section">
            <h3 style="font-size:1.5rem; font-family:'Outfit'; border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.5rem;">Review Responses</h3>
            ${reviewHtml}
        </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Return to setup form
 */
window.restartMockTestSetup = function() {
    document.getElementById('results-view').classList.add('hidden');
    document.getElementById('setup-view').classList.remove('hidden');
    
    // Reset inputs visual selection states if needed
    bindSetupEvents();
};
