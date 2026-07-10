/* ==========================================================================
   Placement Preparation Hub - Bookmarks Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    renderBookmarks();

    const clearBtn = document.getElementById('clear-bookmarks-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllBookmarks);
    }
});

/**
 * Renders all saved bookmarks from LocalStorage
 */
function renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    const clearBtn = document.getElementById('clear-bookmarks-btn');
    if (!container) return;

    const bookmarks = getBookmarks();

    if (bookmarks.length === 0) {
        if (clearBtn) clearBtn.classList.add('hidden');
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary); background: var(--bg-secondary); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
                <i class="lucide-bookmark" style="font-size: 3.5rem; color: var(--text-secondary); margin-bottom: 1.25rem; display: inline-block;"></i>
                <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Bookmarks Found</h2>
                <p style="margin-bottom: 2rem; font-size: 0.95rem;">You haven't bookmarked any practice questions yet. Explore categories to start saving challenges.</p>
                <a href="categories.html" class="btn btn-primary">
                    <span>Browse Paths</span>
                    <i class="lucide-compass"></i>
                </a>
            </div>
        `;
        return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');

    let html = '';
    bookmarks.forEach((q) => {
        html += `
            <div class="bookmark-card animate-fade" id="bookmark-card-${q.subjectSlug}-${q.id}">
                <button class="bookmark-remove-btn" onclick="removeSingleBookmark('${q.subjectSlug}', ${q.id})" title="Remove Bookmark">
                    <i class="lucide-x"></i>
                </button>

                <div class="workspace-meta" style="margin-bottom: 1rem;">
                    <span class="card-badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">
                        ${q.subjectName} &bull; ${q.topic}
                    </span>
                </div>

                <h3 style="font-size: 1.1rem; font-weight: 600; line-height: 1.5; margin-bottom: 1.5rem; padding-right: 2rem;">
                    ${q.question}
                </h3>

                <!-- Self-test choices inside bookmark list -->
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <button class="option-btn" style="padding: 0.65rem 1rem; font-size: 0.85rem;" onclick="checkBookmarkOption(this, 'A', '${q.correctAnswer}', '${q.explanation}')">
                        <div class="option-prefix" style="width:1.2rem; height:1.2rem; min-width:1.2rem; font-size:0.65rem;">A</div>
                        <span>${q.optionA}</span>
                    </button>
                    <button class="option-btn" style="padding: 0.65rem 1rem; font-size: 0.85rem;" onclick="checkBookmarkOption(this, 'B', '${q.correctAnswer}', '${q.explanation}')">
                        <div class="option-prefix" style="width:1.2rem; height:1.2rem; min-width:1.2rem; font-size:0.65rem;">B</div>
                        <span>${q.optionB}</span>
                    </button>
                    <button class="option-btn" style="padding: 0.65rem 1rem; font-size: 0.85rem;" onclick="checkBookmarkOption(this, 'C', '${q.correctAnswer}', '${q.explanation}')">
                        <div class="option-prefix" style="width:1.2rem; height:1.2rem; min-width:1.2rem; font-size:0.65rem;">C</div>
                        <span>${q.optionC}</span>
                    </button>
                    <button class="option-btn" style="padding: 0.65rem 1rem; font-size: 0.85rem;" onclick="checkBookmarkOption(this, 'D', '${q.correctAnswer}', '${q.explanation}')">
                        <div class="option-prefix" style="width:1.2rem; height:1.2rem; min-width:1.2rem; font-size:0.65rem;">D</div>
                        <span>${q.optionD}</span>
                    </button>
                </div>

                <!-- Explanation Panel (Initially Hidden) -->
                <div class="info-panel hidden" style="margin-bottom: 1.5rem; padding: 1rem; border-radius: var(--border-radius-sm);">
                    <div class="info-panel-title success-text" style="font-size: 0.9rem; margin-bottom: 0.5rem;">
                        <i class="lucide-check-circle-2" style="font-size: 1.15rem;"></i>
                        <span>Correct Answer: Option ${q.correctAnswer} (${q.answer})</span>
                    </div>
                    <p style="font-size: 0.8rem; line-height: 1.5;"><strong>Explanation:</strong> ${q.explanation || 'No step-by-step explanation available.'}</p>
                </div>

                <div style="display: flex; gap: 0.75rem; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
                    <a href="questions.html?subject=${q.subjectSlug}&qid=${q.id}" class="btn btn-secondary" style="padding: 0.45rem 1rem; font-size: 0.8rem; border-radius: var(--border-radius-sm);">
                        <i class="lucide-pencil-ruler"></i>
                        <span>Solve in Workspace</span>
                    </a>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Remove a single bookmark with transition animation
 */
window.removeSingleBookmark = function(subjectSlug, id) {
    let bookmarks = getBookmarks();
    bookmarks = bookmarks.filter(b => !(b.subjectSlug === subjectSlug && b.id === id));
    localStorage.setItem('hub-bookmarks', JSON.stringify(bookmarks));
    if (window.syncBookmarksToBackend) {
        window.syncBookmarksToBackend(bookmarks);
    }

    const card = document.getElementById(`bookmark-card-${subjectSlug}-${id}`);
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(1rem)';
        setTimeout(() => {
            card.remove();
            // Re-render to show empty state if zero bookmarks left
            if (bookmarks.length === 0) {
                renderBookmarks();
            }
        }, 300);
    }
    showToast("Bookmark removed!", "info");
};

/**
 * Check selected option inside bookmark cards dynamically
 */
window.checkBookmarkOption = function(clickedBtn, selectedLetter, correctLetter, explanation) {
    const parentContainer = clickedBtn.parentElement;
    const optionBtns = parentContainer.querySelectorAll('.option-btn');
    const card = parentContainer.parentElement;
    const infoPanel = card.querySelector('.info-panel');

    // Disable choices clicking for this card
    optionBtns.forEach(btn => btn.disabled = true);

    const isCorrect = selectedLetter === correctLetter;

    // Apply color highlights
    optionBtns.forEach(btn => {
        const text = btn.querySelector('.option-prefix').innerText;
        if (text === correctLetter) {
            btn.classList.add('correct-reveal');
        } else if (text === selectedLetter && !isCorrect) {
            btn.classList.add('wrong-reveal');
        }
    });

    // Reveal explanation panel
    if (infoPanel) {
        infoPanel.classList.remove('hidden');
    }

    if (isCorrect) {
        showToast("Correct!", "success");
    } else {
        showToast(`Incorrect! Correct option is ${correctLetter}`, "danger");
    }
};

/**
 * Wipe bookmarks database
 */
function clearAllBookmarks() {
    if (confirm("Are you sure you want to clear all bookmarks?")) {
        localStorage.removeItem('hub-bookmarks');
        if (window.syncBookmarksToBackend) {
            window.syncBookmarksToBackend([]);
        }
        renderBookmarks();
        showToast("All bookmarks cleared!", "info");
    }
}
