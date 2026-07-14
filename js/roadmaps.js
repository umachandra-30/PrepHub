/* ==========================================================================
   Placement Preparation Hub - Career Roadmaps Script
   ========================================================================== */

// 11 Career Roadmaps data from prompt
const ROADMAPS_DATA = [
    {
        id: "frontend",
        title: "Front-End Developer",
        difficulty: "Beginner-Intermediate",
        duration: "8-10 Weeks",
        desc: "Master building engaging, responsive, and visually stunning web interfaces using modern standards and component frameworks.",
        tags: ["HTML5", "CSS3", "JavaScript", "React", "Tailwind CSS", "Build Tools"],
        colorClass: "color-frontend",
        icon: "layout",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQAGzcpCAPRUTKfZhi_SjD74Aa_8t_9HwfbrJj_9_B1oYgs?e=l4kpki"
    },
    {
        id: "ai-data-scientist",
        title: "AI Data Scientist",
        difficulty: "Advanced",
        duration: "14-16 Weeks",
        desc: "Formulate business experiments, design data pipelines, and train forecasting architectures using statistics and ML.",
        tags: ["Python", "Pandas", "Scikit-Learn", "Statistics", "Data Visualization", "SQL"],
        colorClass: "color-ai",
        icon: "brain-circuit",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQAI4AZy4oOsS4j9o0rmTSJIASwqx-JiSOLvpo6tjPQ78Mk?e=NuIfNC"
    },
    {
        id: "ai-engineer",
        title: "AI Engineer",
        difficulty: "Advanced",
        duration: "12-14 Weeks",
        desc: "Deploy large language models (LLMs), build production agents, implement vector stores, and optimize inference layers.",
        tags: ["PyTorch", "LLMs", "LangChain", "Vector DBs", "Prompting", "APIs"],
        colorClass: "color-ai",
        icon: "cpu",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQAI4AZy4oOsS4j9o0rmTSJIASwqx-JiSOLvpo6tjPQ78Mk?e=NuIfNC"
    },
    {
        id: "backend",
        title: "Backend Developer",
        difficulty: "Intermediate-Advanced",
        duration: "10-12 Weeks",
        desc: "Design high-concurrency API structures, handle database queries, optimize caching layers, and scale architecture modules.",
        tags: ["Node.js", "Express", "Python", "SQL", "Redis", "REST APIs", "Docker"],
        colorClass: "color-backend",
        icon: "server",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQDS2wM91boMTqgfPYz8WSiPAfi3ctPEwCb04vXLHqcrM0Y?e=A6aKYm"
    },
    {
        id: "data-analyst",
        title: "Data Analyst",
        difficulty: "Beginner-Intermediate",
        duration: "6-8 Weeks",
        desc: "Inspect, filter, clean, and represent business intelligence findings using structured queries and dashboards.",
        tags: ["SQL", "Excel", "Tableau", "Power BI", "Data Cleaning", "Descriptive Stats"],
        colorClass: "color-data",
        icon: "bar-chart-3",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQAzDIrnDy-KQaTPdmNakxOyAV_8E7QTupg-TZTFfptDsbU?e=9LQAnm"
    },
    {
        id: "data-engineer",
        title: "Data Engineer",
        difficulty: "Intermediate-Advanced",
        duration: "12-14 Weeks",
        desc: "Construct robust, automated data pipelines, scale storage schemas, design warehouses, and handle big data architecture.",
        tags: ["Hadoop", "Spark", "Kafka", "Airflow", "ETL Pipelines", "Snowflake"],
        colorClass: "color-data",
        icon: "database",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQAahhMIVkM1T7tBxMwyMBvNAXg-c6PKY_g2tHG9NYtxKSk?e=c58mfe"
    },
    {
        id: "devops",
        title: "DevOps Engineer",
        difficulty: "Intermediate-Advanced",
        duration: "10-12 Weeks",
        desc: "Automate delivery chains, orchestrate container instances, configure virtual clouds, and handle cluster monitoring.",
        tags: ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Linux Bash"],
        colorClass: "color-devops",
        icon: "infinity",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQDGR1Vwu83HQ4Tpu78V0PpyASHZ7z_c-DlEQnhE6MPNOm8?e=GBu9eS"
    },
    {
        id: "full-stack",
        title: "Full-Stack Developer",
        difficulty: "Intermediate-Advanced",
        duration: "12-16 Weeks",
        desc: "Construct complete, functional applications by integrating rich responsive clients with scalable database backends.",
        tags: ["React", "Node.js", "Express", "SQL & NoSQL", "Web Security", "Cloud Deploy"],
        colorClass: "color-fullstack",
        icon: "layers",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQAc4LzEfVE5RYthpnACHzrSAeGhooX4MtfEcf2d4w62jwo?e=68u88e"
    },
    {
        id: "game-developer",
        title: "Game Developer",
        difficulty: "Intermediate-Advanced",
        duration: "12-14 Weeks",
        desc: "Design interactive digital environments, script gameplay mechanics, learn shading concepts, and program engine modules.",
        tags: ["C++", "C#", "Unity", "Unreal Engine", "3D Math", "Physics Engines"],
        colorClass: "color-game",
        icon: "gamepad-2",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQBLVypfxiLSQr1lBg0rNvy1Ad9NSy9TsFgm2DyfwbpYg-I?e=Tg4ed5"
    },
    {
        id: "ios",
        title: "iOS Developer",
        difficulty: "Intermediate",
        duration: "8-10 Weeks",
        desc: "Design native mobile environments for Apple devices using Swift, SwiftUI layouts, and localized storage logic.",
        tags: ["Swift", "SwiftUI", "Xcode", "UIKit", "Core Data", "App Store Guidelines"],
        colorClass: "color-mobile",
        icon: "smartphone",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQCoO2TrWuMlR6XTsDAvpCc2ATApmVGSH7V0Hb7HzS0Y_Qw?e=FTKYeA"
    },
    {
        id: "machine-learning",
        title: "Machine Learning Engineer",
        difficulty: "Advanced",
        duration: "14-16 Weeks",
        desc: "Tune deep neural layers, construct model pipelines, validate feature choices, and orchestrate model packaging structures.",
        tags: ["Python", "PyTorch", "MLOps", "Model Tuning", "Probability", "Algorithms"],
        colorClass: "color-ai",
        icon: "brain",
        url: "https://1drv.ms/b/c/273B5B19D54D148D/IQAmM7YZ6suqQ4ylt__CHWaSAXMgUgNuDQTKvv07vkelGqk?e=Pm4ktr"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const isAuthorized = window.isLoggedIn && window.isLoggedIn();
    const authorizedView = document.getElementById('authorized-view');
    const unauthorizedView = document.getElementById('unauthorized-view');

    if (isAuthorized) {
        if (authorizedView) authorizedView.classList.remove('hidden');
        if (unauthorizedView) unauthorizedView.classList.add('hidden');
        
        // Initial render
        renderRoadmaps(ROADMAPS_DATA);
        
        // Setup Search and Filters
        setupFilters();
    } else {
        if (unauthorizedView) unauthorizedView.classList.remove('hidden');
        if (authorizedView) authorizedView.classList.add('hidden');
    }
});

/**
 * Render roadmap cards into the DOM grid
 * @param {Array} roadmaps List of roadmaps to display
 */
function renderRoadmaps(roadmaps) {
    const container = document.getElementById('roadmaps-container');
    if (!container) return;

    if (roadmaps.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary); background: var(--bg-secondary); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
                <i class="lucide-compass" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem; display: inline-block;"></i>
                <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Matching Pathways</h3>
                <p style="font-size: 0.95rem;">We couldn't find any career roadmaps matching your filter query. Try searching for a different role or tag.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    let html = '';
    roadmaps.forEach(r => {
        // Map difficulty level to badges
        let difficultyBadgeClass = 'badge-medium';
        if (r.difficulty.includes('Beginner')) difficultyBadgeClass = 'badge-easy';
        if (r.difficulty === 'Advanced') difficultyBadgeClass = 'badge-hard';

        // Render tags
        const tagsHtml = r.tags.map(t => `<span class="roadmap-tag-pill">${t}</span>`).join('');

        html += `
            <div class="roadmap-card animate-fade">
                <div>
                    <div class="card-header-row">
                        <div class="roadmap-icon-container ${r.colorClass}">
                            <i class="lucide-${r.icon}"></i>
                        </div>
                        <span class="card-badge ${difficultyBadgeClass}">
                            ${r.difficulty}
                        </span>
                    </div>

                    <div class="roadmap-duration">
                        <i class="lucide-clock" style="width: 13px; height: 13px;"></i>
                        <span>Preparation: ${r.duration}</span>
                    </div>
                    
                    <h3 class="roadmap-title-text">${r.title}</h3>
                    <p class="roadmap-desc">${r.desc}</p>
                </div>

                <div>
                    <div class="roadmap-tags">
                        ${tagsHtml}
                    </div>

                    <div class="roadmap-actions">
                        <button class="btn btn-primary" onclick="window.open('${r.url}', '_blank')" style="flex-grow: 1; justify-content: center; font-size: 0.85rem; padding: 0.55rem 1rem;">
                            <i class="lucide-external-link" style="margin-right: 0.4rem;"></i>
                            <span>View Path</span>
                        </button>
                        <button class="btn btn-secondary" onclick="copyRoadmapLink('${r.url}')" style="justify-content: center; font-size: 0.85rem; padding: 0.55rem 1rem;" title="Copy Roadmap Link">
                            <i class="lucide-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Refresh icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Filter the roadmaps dynamically based on input events
 */
function setupFilters() {
    const searchInput = document.getElementById('roadmap-search-input');
    const difficultyFilter = document.getElementById('roadmap-difficulty-filter');

    const filterHandler = () => {
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const difficulty = difficultyFilter ? difficultyFilter.value : '';

        const filtered = ROADMAPS_DATA.filter(r => {
            const matchesQuery = !query || 
                r.title.toLowerCase().includes(query) ||
                r.desc.toLowerCase().includes(query) ||
                r.tags.some(t => t.toLowerCase().includes(query));

            const matchesDifficulty = !difficulty || r.difficulty === difficulty;

            return matchesQuery && matchesDifficulty;
        });

        renderRoadmaps(filtered);
    };

    if (searchInput) searchInput.addEventListener('input', filterHandler);
    if (difficultyFilter) difficultyFilter.addEventListener('change', filterHandler);
}

/**
 * Copy roadmap link to clipboard and show toast
 * @param {string} url Signed S3 PDF url
 */
window.copyRoadmapLink = function(url) {
    if (window.copyToClipboard) {
        window.copyToClipboard(url, 'Roadmap PDF link copied to clipboard!');
    } else {
        navigator.clipboard.writeText(url)
            .then(() => alert('Roadmap PDF link copied to clipboard!'))
            .catch(() => alert('Failed to copy roadmap link.'));
    }
};
