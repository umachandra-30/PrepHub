/* ==========================================================================
   PrepHub - Hiring Trends Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    let trendsData = [];

    // Elements
    const cardsContainer = document.getElementById('trends-cards-list');
    const searchInput = document.getElementById('search-input');
    const companySelect = document.getElementById('company-select');
    const categorySelect = document.getElementById('category-select');
    const frequencySelect = document.getElementById('frequency-select');

    const totalTrendsDisplay = document.getElementById('stat-total-trends');
    const highFreqDisplay = document.getElementById('stat-high-freq');
    const totalCosDisplay = document.getElementById('stat-total-cos');

    // 1. Fetch JSON Data
    try {
        const response = await fetch('json/INTERVIEW_DATASET.json');
        if (!response.ok) throw new Error('Failed to load dataset');
        const data = await response.json();
        trendsData = data.interview_topics_dataset || [];

        // 2. Initialize Dashboard
        initDashboard(trendsData);
    } catch (error) {
        console.error('Error fetching trends:', error);
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="no-trends">
                    <i class="lucide-alert-circle"></i>
                    <h3>Error Loading Hiring Trends</h3>
                    <p>Make sure json/INTERVIEW_DATASET.json is placed in the correct workspace directory.</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    /**
     * Set up UI controls, stats counters, and filters
     */
    function initDashboard(data) {
        // Calculate dynamic filter options
        const uniqueCompanies = [...new Set(data.map(item => item.company_name))].sort();
        const uniqueCategories = [...new Set(data.map(item => item.category))].sort();

        // Populate dropdowns
        if (companySelect) {
            uniqueCompanies.forEach(co => {
                const opt = document.createElement('option');
                opt.value = co;
                opt.textContent = co;
                companySelect.appendChild(opt);
            });
        }

        if (categorySelect) {
            uniqueCategories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                categorySelect.appendChild(opt);
            });
        }

        // Calculate and render stats counters
        const totalTrends = data.length;
        const totalHighFreq = data.filter(item => item.frequency_weight === 'High').length;
        const totalCos = uniqueCompanies.length;

        if (totalTrendsDisplay) totalTrendsDisplay.textContent = totalTrends;
        if (highFreqDisplay) highFreqDisplay.textContent = totalHighFreq;
        if (totalCosDisplay) totalCosDisplay.textContent = totalCos;

        // Render initially
        renderTrends(data);

        // Bind filter event listeners
        const triggerFilter = () => {
            const query = searchInput.value.toLowerCase().trim();
            const selectedCompany = companySelect.value;
            const selectedCategory = categorySelect.value;
            const selectedFreq = frequencySelect.value;

            const filtered = data.filter(item => {
                const matchesSearch = item.topic.toLowerCase().includes(query) || 
                                      item.company_name.toLowerCase().includes(query) ||
                                      item.category.toLowerCase().includes(query);
                
                const matchesCompany = selectedCompany === 'all' || item.company_name === selectedCompany;
                const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
                const matchesFreq = selectedFreq === 'all' || item.frequency_weight.toLowerCase() === selectedFreq;

                return matchesSearch && matchesCompany && matchesCategory && matchesFreq;
            });

            renderTrends(filtered);
        };

        if (searchInput) searchInput.addEventListener('input', triggerFilter);
        if (companySelect) companySelect.addEventListener('change', triggerFilter);
        if (categorySelect) categorySelect.addEventListener('change', triggerFilter);
        if (frequencySelect) frequencySelect.addEventListener('change', triggerFilter);
    }

    /**
     * Renders array of trend objects as dynamic UI cards
     */
    function renderTrends(filteredData) {
        if (!cardsContainer) return;
        cardsContainer.innerHTML = '';

        if (filteredData.length === 0) {
            cardsContainer.innerHTML = `
                <div class="no-trends">
                    <i class="lucide-search-x" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
                    <h3 style="font-size:1.2rem; margin-bottom:0.5rem;">No matching trends found</h3>
                    <p style="font-size:0.9rem; color:var(--text-secondary);">Try clearing your search query or selecting a different filter.</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'trend-card';
            
            const freqClass = item.frequency_weight.toLowerCase();

            card.innerHTML = `
                <div>
                    <div class="trend-badge-container">
                        <span class="company-pill">
                            <i class="lucide-building-2" style="font-size: 0.75rem;"></i>
                            <span>${item.company_name}</span>
                        </span>
                        <span class="type-pill">${item.company_type}</span>
                    </div>
                    <h3 class="trend-topic">${item.topic}</h3>
                </div>
                <div class="trend-meta">
                    <span style="font-weight:600; color:var(--primary); font-size:0.75rem;">${item.category}</span>
                    <span class="freq-badge freq-${freqClass}">${item.frequency_weight}</span>
                </div>
            `;

            cardsContainer.appendChild(card);
        });

        // Initialize Lucide Icons for dynamically added elements
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
});
