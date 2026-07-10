/* ==========================================================================
   Placement Preparation Hub - Categories Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch Central Registry
    const registry = await fetchRegistry();
    if (!registry) {
        showToast("Error loading category registry. Please refresh the page.", "danger");
        return;
    }

    // 2. Render Categories Cards
    renderCategories(registry);
});

/**
 * Render all 4 core category cards with metadata counts
 */
function renderCategories(registry) {
    const container = document.getElementById('categories-list-container');
    if (!container) return;

    let html = '';
    
    // Hardcoded order to match user expectation: Technical, Aptitude, Reasoning, Verbal
    const categoryOrder = ['technical', 'aptitude', 'reasoning', 'verbal'];

    categoryOrder.forEach(key => {
        const cat = registry.categories[key];
        if (!cat) return;

        const subjectCount = Object.keys(cat.subjects).length;
        let questionCount = 0;
        
        Object.values(cat.subjects).forEach(sub => {
            questionCount += sub.questionCount;
        });

        html += `
            <div class="category-card" style="padding: 2.5rem 2rem; box-shadow: var(--shadow-md);">
                <div class="category-icon" style="font-size: 2.25rem; padding: 1rem;"><i class="lucide-${cat.icon || 'book'}"></i></div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">${cat.name}</h3>
                <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 2rem;">${cat.description}</p>
                <div class="category-meta" style="margin-bottom: 1.5rem; font-size: 0.875rem;">
                    <div class="category-meta-item">Subjects: <span style="font-size: 1rem;">${subjectCount}</span></div>
                    <div class="category-meta-item">Questions: <span style="font-size: 1rem;">${questionCount.toLocaleString()}</span></div>
                </div>
                <a href="subjects.html?category=${key}" class="btn btn-primary" style="width: 100%;">
                    <span>Start Learning</span>
                    <i class="lucide-arrow-right"></i>
                </a>
            </div>
        `;
    });

    container.innerHTML = html;
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
