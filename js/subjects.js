/* ==========================================================================
   Placement Preparation Hub - Subjects Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Parse URL Category parameter
    const params = new URLSearchParams(window.location.search);
    const categoryKey = (params.get('category') || 'technical').toLowerCase();

    // 2. Fetch Central Registry
    const registry = await fetchRegistry();
    if (!registry) {
        showToast("Error loading subjects data. Please try refreshing.", "danger");
        return;
    }

    const catData = registry.categories[categoryKey];
    if (!catData) {
        showToast("Invalid category selected. Redirecting...", "warning");
        setTimeout(() => {
            window.location.href = 'categories.html';
        }, 1500);
        return;
    }

    // 3. Render Titles & Meta
    document.title = `PrepHub - ${catData.name} Subjects`;
    document.getElementById('category-title').innerText = `${catData.name} Preparation`;
    document.getElementById('category-desc').innerText = catData.description;

    // 4. Render Subject Cards
    renderSubjectCards(categoryKey, catData.subjects);
});

/**
 * Render subject cards dynamically, loading personal stats from LocalStorage
 * @param {string} categoryKey category slug
 * @param {object} subjects list of subjects in this category
 */
function renderSubjectCards(categoryKey, subjects) {
    const container = document.getElementById('subjects-container');
    if (!container) return;

    const progress = getProgress();
    let html = '';

    if (Object.keys(subjects).length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem 0;">No subjects found in this category.</p>`;
        return;
    }

    Object.entries(subjects).forEach(([slug, sub]) => {
        // Calculate personal progress
        const completedList = progress[slug]?.completed || [];
        const completedCount = completedList.length;
        const totalCount = sub.questionCount;
        const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Calculate difficulty distribution percentages
        const dist = sub.difficultyDistribution;
        const easyCount = dist.Easy || 0;
        const mediumCount = dist.Medium || 0;
        const hardCount = dist.Hard || 0;

        const easyPct = totalCount > 0 ? Math.round((easyCount / totalCount) * 100) : 0;
        const mediumPct = totalCount > 0 ? Math.round((mediumCount / totalCount) * 100) : 0;
        const hardPct = totalCount > 0 ? Math.round((hardCount / totalCount) * 100) : 0;

        // Format topics list (max 4, rest as "+X more")
        const maxTopicsToShow = 4;
        let topicsHtml = '';
        if (sub.topics && sub.topics.length > 0) {
            const shownTopics = sub.topics.slice(0, maxTopicsToShow);
            topicsHtml = shownTopics.map(t => `<span class="tag-bubble">${t}</span>`).join('');
            if (sub.topics.length > maxTopicsToShow) {
                topicsHtml += `<span class="tag-bubble" style="background-color: transparent; border-style: dashed;">+${sub.topics.length - maxTopicsToShow} more</span>`;
            }
        }

        html += `
            <div class="subject-card">
                <div class="subject-header">
                    <h3 class="subject-title">${sub.name}</h3>
                    <div class="subject-qcount">${totalCount} Qs</div>
                </div>

                <!-- Personal Learning Progress -->
                <div style="margin: 0.5rem 0 1rem;">
                    <div class="sub-prog-meta" style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                        <span>Progress</span>
                        <span>${completedCount}/${totalCount} (${progressPct}%)</span>
                    </div>
                    <div class="dist-bar-container" style="height: 5px;">
                        <div class="dist-bar" style="width: ${progressPct}%; background-color: var(--primary);"></div>
                    </div>
                </div>

                <!-- Difficulty Distribution -->
                <div class="difficulty-distribution">
                    <div class="dist-bar-wrapper">
                        <span class="dist-label">Easy</span>
                        <div class="dist-bar-container">
                            <div class="dist-bar easy" style="width: ${easyPct}%;"></div>
                        </div>
                        <span class="dist-count">${easyCount}</span>
                    </div>
                    <div class="dist-bar-wrapper">
                        <span class="dist-label">Medium</span>
                        <div class="dist-bar-container">
                            <div class="dist-bar medium" style="width: ${mediumPct}%;"></div>
                        </div>
                        <span class="dist-count">${mediumCount}</span>
                    </div>
                    <div class="dist-bar-wrapper">
                        <span class="dist-label">Hard</span>
                        <div class="dist-bar-container">
                            <div class="dist-bar hard" style="width: ${hardPct}%;"></div>
                        </div>
                        <span class="dist-count">${hardCount}</span>
                    </div>
                </div>

                <!-- Topics Tag Bubbles -->
                <div class="tag-bubble-list" style="margin-bottom: 1.5rem;">
                    ${topicsHtml}
                </div>

                <!-- Action Button -->
                <a href="questions.html?subject=${slug}" class="btn btn-primary" style="margin-top: auto; width: 100%;">
                    <span>Start Practice</span>
                    <i class="lucide-play"></i>
                </a>
            </div>
        `;
    });

    container.innerHTML = html;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
