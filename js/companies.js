/* ==========================================================================
   Placement Preparation Hub - Target Companies Script
   ========================================================================== */

// Gradients list for company avatar backgrounds
const gradients = [
    'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
    'linear-gradient(135deg, #10b981, #047857)', // Emerald
    'linear-gradient(135deg, #ec4899, #be185d)', // Pink
    'linear-gradient(135deg, #f59e0b, #b45309)', // Amber
    'linear-gradient(135deg, #8b5cf6, #5b21b6)', // Purple
    'linear-gradient(135deg, #ef4444, #b91c1c)', // Red
    'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
    'linear-gradient(135deg, #f43f5e, #be123c)', // Rose
    'linear-gradient(135deg, #84cc16, #4d7c0f)'  // Lime
];

/**
 * Returns a deterministic gradient index based on string hashing
 */
function getCompanyGradient(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
}

/**
 * Returns initials of a company name
 */
function getCompanyInitials(name) {
    if (!name) return 'C';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

document.addEventListener('DOMContentLoaded', async () => {
    const gridContainer = document.getElementById('companies-grid');
    const searchInput = document.getElementById('company-search');
    let companiesList = [];

    // Fetch company list data
    try {
        const response = await fetch('json/COMPANY-LIST.json');
        if (!response.ok) {
            throw new Error("Failed to load company directory");
        }
        companiesList = await response.json();
        
        // Render initial data
        renderCompanies(companiesList);
    } catch (err) {
        console.error("Error loading companies:", err);
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1;">
                    <i class="lucide-alert-circle" style="font-size: 2.5rem; color: var(--danger);"></i>
                    <h3>Error Loading Directory</h3>
                    <p>Could not fetch the target companies list. Please try reloading the page.</p>
                </div>
            `;
        }
    }

    // Set up search filter listener
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            const filtered = companiesList.filter(company => 
                company.company_name.toLowerCase().includes(query)
            );
            renderCompanies(filtered);
        });
    }

    /**
     * Renders company cards in the DOM
     */
    function renderCompanies(list) {
        if (!gridContainer) return;
        
        if (list.length === 0) {
            gridContainer.innerHTML = `
                <div class="no-results">
                    <i class="lucide-help-circle" style="font-size: 2.5rem; color: var(--text-secondary);"></i>
                    <h3>No Matching Companies Found</h3>
                    <p>Try searching for a different company name.</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = list.map(company => {
            const gradient = getCompanyGradient(company.company_name);
            const initials = getCompanyInitials(company.company_name);
            return `
                <div class="company-card animate-fade">
                    <div>
                        <div class="company-header">
                            <div class="company-avatar" style="background: ${gradient};">
                                ${initials}
                            </div>
                            <h3 class="company-name">${escapeHTML(company.company_name)}</h3>
                        </div>
                    </div>
                    <div class="company-actions">
                        <a href="${escapeHTML(company.landing_page)}" target="_blank" rel="noopener noreferrer" class="btn-website">
                            <span>Website</span>
                            <i class="lucide-external-link" style="width: 0.9rem; height: 0.9rem;"></i>
                        </a>
                        <a href="${escapeHTML(company.careers_page)}" target="_blank" rel="noopener noreferrer" class="btn-careers">
                            <span>Careers</span>
                            <i class="lucide-arrow-up-right" style="width: 0.9rem; height: 0.9rem;"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Initialize Lucide Icons for dynamic content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Simple HTML tag escaping helper
     */
    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
});
