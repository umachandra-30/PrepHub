/* ==========================================================================
   Placement Preparation Hub - Shared Utility Functions
   ========================================================================== */

// Automatically intercept and wrap lucide.createIcons to translate class="lucide-*" into data-lucide="*"
(function() {
    let _lucide = window.lucide;
    const wrap = (val) => {
        if (val && val.createIcons && !val.createIcons.__wrapped) {
            const originalCreateIcons = val.createIcons;
            val.createIcons = function(options) {
                try {
                    const elements = document.querySelectorAll('[class*="lucide-"], [data-lucide]');
                    elements.forEach(el => {
                        let iconName = '';
                        el.classList.forEach(className => {
                            if (className.startsWith('lucide-') && className !== 'lucide-container' && className !== 'lucide') {
                                iconName = className.substring(7);
                            }
                        });

                        if (iconName) {
                            if (el.tagName.toLowerCase() === 'svg') {
                                const currentIcon = el.getAttribute('data-lucide');
                                if (currentIcon && currentIcon !== iconName) {
                                    const i = document.createElement('i');
                                    i.className = el.className.baseVal || el.className;
                                    i.setAttribute('data-lucide', iconName);
                                    if (el.style.cssText) i.style.cssText = el.style.cssText;
                                    el.parentNode.replaceChild(i, el);
                                }
                            } else {
                                if (el.getAttribute('data-lucide') !== iconName) {
                                    el.setAttribute('data-lucide', iconName);
                                }
                            }
                        }
                    });
                } catch (e) {
                    console.error("Error preprocessing lucide icons:", e);
                }
                return originalCreateIcons(options);
            };
            val.createIcons.__wrapped = true;
        }
        return val;
    };

    if (_lucide) {
        wrap(_lucide);
    } else {
        Object.defineProperty(window, 'lucide', {
            configurable: true,
            enumerable: true,
            get() {
                return _lucide;
            },
            set(val) {
                _lucide = wrap(val);
            }
        });
    }
})();

// Cognito Authentication Configuration
const COGNITO_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_djAcEVxhN',
    clientId: '6ad3gtr20eelnje7mp8ooilu6u',
    clientSecret: 'vtadcsrcc5e61jlinagpvgdjura8p1404534aefjejh9et9c89q',
    hostedUiUrl: 'https://us-east-1djacevxhn.auth.us-east-1.amazoncognito.com/login?client_id=6ad3gtr20eelnje7mp8ooilu6u&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fprep-hub-gamma.vercel.app%2F',
    redirectUri: 'https://prep-hub-gamma.vercel.app/',
    domain: 'https://us-east-1djacevxhn.auth.us-east-1.amazoncognito.com',
    apiGatewayUrl: 'https://vrxdrefcdf.execute-api.us-east-1.amazonaws.com/prod' // UPDATE THIS with your API Gateway Invoke URL once deployed
};

// --- Authentication Helper Functions ---

function isLoggedIn() {
    return !!localStorage.getItem('hub_id_token');
}

function getIdToken() {
    return localStorage.getItem('hub_id_token') || '';
}

function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT decoding failed:", e);
        return {};
    }
}

async function exchangeCodeForTokens(code) {
    const tokenUrl = `${COGNITO_CONFIG.domain}/oauth2/token`;
    const basicAuth = btoa(`${COGNITO_CONFIG.clientId}:${COGNITO_CONFIG.clientSecret}`);

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: COGNITO_CONFIG.clientId,
            code: code,
            redirect_uri: COGNITO_CONFIG.redirectUri
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${errorText}`);
    }

    const data = await response.json();
    if (data.id_token) {
        localStorage.setItem('hub_id_token', data.id_token);
        if (data.access_token) localStorage.setItem('hub_access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('hub_refresh_token', data.refresh_token);

        const payload = decodeJwtPayload(data.id_token);
        localStorage.setItem('hub_user_email', payload.email || '');

        // Fetch and load database records
        await syncUserData();
    }
}

window.loginUser = function () {
    window.location.href = COGNITO_CONFIG.hostedUiUrl;
};

window.logoutUser = function () {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('hub_id_token');
        localStorage.removeItem('hub_access_token');
        localStorage.removeItem('hub_refresh_token');
        localStorage.removeItem('hub_user_email');
        localStorage.removeItem('hub-bookmarks');
        localStorage.removeItem('hub-progress');
        localStorage.removeItem('hub-profile');
        showToast("Logged out successfully!", "info");
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    }
};

// --- Sync Functions ---

async function syncUserData() {
    if (!isLoggedIn()) return;
    const apiBase = COGNITO_CONFIG.apiGatewayUrl;
    if (!apiBase || apiBase.includes("<API_GATEWAY_URL>")) {
        console.warn("API Gateway URL not configured yet. Running in offline/localStorage fallback mode.");
        return;
    }
    try {
        const response = await fetch(`${apiBase}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getIdToken()}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data.bookmarks) localStorage.setItem('hub-bookmarks', JSON.stringify(data.bookmarks));
            if (data.progress) localStorage.setItem('hub-progress', JSON.stringify(data.progress));
            if (data.profile) localStorage.setItem('hub-profile', JSON.stringify(data.profile));
            // Trigger customized reload event
            window.dispatchEvent(new CustomEvent('sync-completed'));
        } else {
            console.error("Failed to sync user data from API:", response.statusText);
        }
    } catch (err) {
        console.error("Error during syncUserData:", err);
    }
}

async function syncBookmarksToBackend(bookmarks) {
    if (!isLoggedIn()) return;
    const apiBase = COGNITO_CONFIG.apiGatewayUrl;
    if (!apiBase || apiBase.includes("<API_GATEWAY_URL>")) return;
    try {
        await fetch(`${apiBase}/bookmark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getIdToken()}`
            },
            body: JSON.stringify({ bookmarks })
        });
    } catch (err) {
        console.error("Error syncing bookmarks to backend:", err);
    }
}

async function syncProgressToBackend(courses) {
    if (!isLoggedIn()) return;
    const apiBase = COGNITO_CONFIG.apiGatewayUrl;
    if (!apiBase || apiBase.includes("<API_GATEWAY_URL>")) return;
    try {
        await fetch(`${apiBase}/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getIdToken()}`
            },
            body: JSON.stringify({ courses })
        });
    } catch (err) {
        console.error("Error syncing progress to backend:", err);
    }
}

async function syncProfileToBackend(name, email) {
    if (!isLoggedIn()) return;
    const apiBase = COGNITO_CONFIG.apiGatewayUrl;
    if (!apiBase || apiBase.includes("<API_GATEWAY_URL>")) return;
    try {
        const response = await fetch(`${apiBase}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getIdToken()}`
            },
            body: JSON.stringify({ name, email })
        });
        if (response.ok) {
            const profile = { name, email };
            localStorage.setItem('hub-profile', JSON.stringify(profile));
            showToast("Profile updated successfully!", "success");
            return true;
        } else {
            console.error("Profile sync failed:", response.statusText);
            showToast("Failed to save profile changes to database.", "danger");
        }
    } catch (err) {
        console.error("Error syncing profile to backend:", err);
        showToast("Failed to connect to backend database.", "danger");
    }
    return false;
}

// Expose sync functions globally
window.syncBookmarksToBackend = syncBookmarksToBackend;
window.syncProgressToBackend = syncProgressToBackend;
window.syncProfileToBackend = syncProfileToBackend;
window.syncUserData = syncUserData;
window.isLoggedIn = isLoggedIn;
window.getIdToken = getIdToken;
window.toggleTheme = toggleTheme;



// Global registry cache
let cachedRegistry = null;

/**
 * Fetch the central data registry containing categories, subjects, and stats
 */
async function fetchRegistry() {
    if (cachedRegistry) return cachedRegistry;
    try {
        const response = await fetch('data/registry.json');
        if (!response.ok) throw new Error("Failed to fetch registry");
        cachedRegistry = await response.json();
        return cachedRegistry;
    } catch (err) {
        console.error("Error loading registry:", err);
        return null;
    }
}

/**
 * Fetch a specific subject's questions
 * @param {string} category category slug
 * @param {string} subject subject slug
 */
async function fetchSubjectQuestions(category, subject) {
    try {
        const response = await fetch(`data/${category}/${subject}.json`);
        if (!response.ok) throw new Error(`Failed to fetch questions for ${subject}`);
        return await response.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

/* ==========================================================================
   Theme Management (Light / Dark Mode)
   ========================================================================== */

function initTheme() {
    const savedTheme = localStorage.getItem('hub-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('hub-theme', newTheme);
    updateThemeToggleUI(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
}

function updateThemeToggleUI(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    if (theme === 'dark') {
        toggleBtn.innerHTML = '<i class="lucide-sun"></i>';
        toggleBtn.setAttribute('title', 'Switch to Light Mode');
    } else {
        toggleBtn.innerHTML = '<i class="lucide-moon"></i>';
        toggleBtn.setAttribute('title', 'Switch to Dark Mode');
    }
    // Re-initialize lucide icons for dynamic changes
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/* ==========================================================================
   LocalStorage State Management
   ========================================================================== */

// --- Bookmarks ---
function getBookmarks() {
    return JSON.parse(localStorage.getItem('hub-bookmarks')) || [];
}

function isBookmarked(subjectSlug, questionId) {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.subjectSlug === subjectSlug && b.id === questionId);
}

function toggleBookmark(question, subjectSlug, subjectName, categorySlug) {
    let bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.subjectSlug === subjectSlug && b.id === question.id);
    let bookmarked = false;

    if (index === -1) {
        bookmarks.push({
            ...question,
            subjectSlug,
            subjectName,
            categorySlug,
            bookmarkedAt: new Date().toISOString()
        });
        bookmarked = true;
        showToast('Question bookmarked successfully!', 'success');
    } else {
        bookmarks.splice(index, 1);
        showToast('Bookmark removed!', 'info');
    }
    localStorage.setItem('hub-bookmarks', JSON.stringify(bookmarks));

    // Sync to backend asynchronously
    syncBookmarksToBackend(bookmarks);

    return bookmarked;
}

// --- Completed & Progress Tracking ---
function getProgress() {
    return JSON.parse(localStorage.getItem('hub-progress')) || {};
    // Schema: { [subjectSlug]: { completed: [ids], correct: [ids], wrong: [ids] } }
}

function markQuestionCompleted(subjectSlug, questionId, isCorrect) {
    const progress = getProgress();
    if (!progress[subjectSlug]) {
        progress[subjectSlug] = { completed: [], correct: [], wrong: [] };
    }

    const subProg = progress[subjectSlug];
    if (!subProg.completed.includes(questionId)) {
        subProg.completed.push(questionId);
    }

    // Clean previous correct/wrong states for this question ID if retried
    subProg.correct = subProg.correct.filter(id => id !== questionId);
    subProg.wrong = subProg.wrong.filter(id => id !== questionId);

    if (isCorrect) {
        subProg.correct.push(questionId);
    } else {
        subProg.wrong.push(questionId);
    }

    localStorage.setItem('hub-progress', JSON.stringify(progress));

    // Sync to backend asynchronously
    syncProgressToBackend(progress);

    // Dispatch custom progress-updated event
    window.dispatchEvent(new CustomEvent('progress-updated'));
}



/* ==========================================================================
   AI Chatbot Local Database & Search Engine
   ========================================================================== */

let chatbotQA = [];
let isChatbotQALoading = false;
let isChatbotQALoaded = false;

async function loadChatbotQA() {
    if (isChatbotQALoaded || isChatbotQALoading) return;
    isChatbotQALoading = true;
    try {
        const response = await fetch('json/prephub-chatbot-2.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch chatbot data: ${response.statusText}`);
        }
        chatbotQA = await response.json();
        isChatbotQALoaded = true;
        isChatbotQALoading = false;
        console.log("Chatbot QA loaded successfully with", chatbotQA.length, "questions.");
    } catch (err) {
        console.error("Error loading chatbot QA:", err);
        isChatbotQALoading = false;
    }
}

async function findBotResponse(userQuery) {
    if (!isChatbotQALoaded) {
        await loadChatbotQA();
    }

    if (!chatbotQA || chatbotQA.length === 0) {
        return {
            answer: "I am having trouble accessing my database right now. Please try again in a moment.",
            suggestions: []
        };
    }

    const query = userQuery.trim().toLowerCase();
    
    // Stop words set for better keyword matching
    const stopWords = new Set(["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "placements", "placement", "prep", "prephub"]);

    const tokenize = (text) => {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
    };

    const userTokens = tokenize(query);
    if (userTokens.length === 0) {
        return {
            answer: "I didn't quite catch that. Could you please type a question?",
            suggestions: []
        };
    }

    const userKeywords = userTokens.filter(word => !stopWords.has(word));
    const queryTokensToUse = userKeywords.length > 0 ? userKeywords : userTokens;

    const scoredQuestions = [];

    for (const qa of chatbotQA) {
        const candidateTokens = tokenize(qa.question);
        const candidateKeywords = candidateTokens.filter(word => !stopWords.has(word));
        const candidateTokensToUse = candidateKeywords.length > 0 ? candidateKeywords : candidateTokens;

        // Calculate keyword intersection
        const candSet = new Set(candidateTokensToUse);
        let intersectionCount = 0;
        for (const token of queryTokensToUse) {
            if (candSet.has(token)) {
                intersectionCount++;
            }
        }

        // Score based on Jaccard-like ratio
        let score = 0;
        if (intersectionCount > 0) {
            score = intersectionCount / (queryTokensToUse.length + candidateTokensToUse.length - intersectionCount);
        }

        // Boost if exact match or substring match
        const cleanQuery = query.replace(/[^\w\s]/g, '').trim();
        const cleanQuestion = qa.question.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        if (cleanQuestion === cleanQuery) {
            score += 5.0; // exact match gets top priority
        } else if (cleanQuestion.includes(cleanQuery) || cleanQuery.includes(cleanQuestion)) {
            score += 2.0; // substring gets high priority
        }

        if (score > 0) {
            scoredQuestions.push({ qa, score });
        }
    }

    scoredQuestions.sort((a, b) => b.score - a.score);

    // If we have some matches above a threshold
    if (scoredQuestions.length > 0 && scoredQuestions[0].score >= 0.05) {
        const topMatch = scoredQuestions[0].qa;
        
        // Find top 3-4 alternative related suggestions, excluding the matched one
        const suggestions = [];
        for (let i = 1; i < scoredQuestions.length && suggestions.length < 3; i++) {
            suggestions.push(scoredQuestions[i].qa.question);
        }

        // If we don't have enough suggestions from similarity, let's add some from the same category
        if (suggestions.length < 3) {
            const sameCategory = chatbotQA.filter(qa => 
                qa.category === topMatch.category && 
                qa.question !== topMatch.question && 
                !suggestions.includes(qa.question)
            );
            while (suggestions.length < 3 && sameCategory.length > 0) {
                const randIdx = Math.floor(Math.random() * sameCategory.length);
                suggestions.push(sameCategory.splice(randIdx, 1)[0].question);
            }
        }

        return {
            answer: topMatch.answer,
            suggestions: suggestions
        };
    }

    // Fallback: pick 4 diverse random questions
    const defaultAnswer = "I couldn't find a direct answer to that in my database. As PrepHub's placement assistant, I can help you prepare for specific companies, interview rounds, coding strategies, and quantitative subjects. \n\nTry asking me one of the following:";
    const suggestions = [];
    const tempQA = [...chatbotQA];
    while (suggestions.length < 4 && tempQA.length > 0) {
        const randIdx = Math.floor(Math.random() * tempQA.length);
        const item = tempQA.splice(randIdx, 1)[0];
        if (!suggestions.includes(item.question)) {
            suggestions.push(item.question);
        }
    }

    return {
        answer: defaultAnswer,
        suggestions: suggestions
    };
}

/* ==========================================================================
   Common Layout Injector (Navbar & Footer)
   ========================================================================== */

function renderHeaderFooter() {
    const activePage = window.location.pathname.split("/").pop() || 'index.html';

    // Render Auth markup for desktop and mobile navbar integrations
    const isLoggedInUser = isLoggedIn();
    let desktopAuthHtml = '';
    let mobileAuthHtml = '';

    if (isLoggedInUser) {
        const email = localStorage.getItem('hub_user_email') || 'User';
        const displayEmail = email.split('@')[0];
        desktopAuthHtml = `
            <div class="user-profile-badge btn-auth" title="${email}" style="display: inline-flex; align-items: center; gap: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: var(--border-radius-md); font-size: 0.85rem; font-weight: 600; cursor: pointer;" onclick="window.location.href='progress.html'">
                <i class="lucide-user" style="color: var(--primary); font-size: 1rem;"></i>
                <span class="user-email-text" style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayEmail}</span>
            </div>
            <button class="btn btn-secondary btn-auth" onclick="logoutUser()" style="border-color: var(--danger); color: var(--danger);">
                <i class="lucide-log-out" style="font-size: 0.9rem;"></i>
                <span>Logout</span>
            </button>
        `;
        mobileAuthHtml = `
            <li class="mobile-only-auth" style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem;">
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; padding: 0 0.5rem;">
                        <i class="lucide-user" style="color: var(--primary);"></i>
                        <span>Logged in as <strong>${displayEmail}</strong></span>
                    </div>
                    <button class="btn btn-secondary" onclick="logoutUser()" style="width: 100%; text-align: center; border-color: var(--danger); color: var(--danger); justify-content: center;">
                        <i class="lucide-log-out" style="margin-right: 0.5rem;"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </li>
        `;
    } else {
        desktopAuthHtml = `
            <button class="btn btn-primary btn-auth" onclick="loginUser()">
                <i class="lucide-log-in" style="font-size: 0.9rem;"></i>
                <span>Login</span>
            </button>
        `;
        mobileAuthHtml = `
            <li class="mobile-only-auth" style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem;">
                <button class="btn btn-primary" onclick="loginUser()" style="width: 100%; justify-content: center;">
                    <i class="lucide-log-in" style="margin-right: 0.5rem;"></i>
                    <span>Login</span>
                </button>
            </li>
        `;
    }

    // 1. Inject Header
    const header = document.querySelector('header');
    if (header) {
        header.innerHTML = `
            <div class="container navbar">
                <a href="dashboard.html" class="logo">
                    <i class="lucide-graduation-cap"></i>
                    <span>PrepHub</span>
                </a>
                <ul class="nav-links" id="nav-links">
                    <li><a href="dashboard.html" class="${activePage === 'dashboard.html' || activePage === 'index.html' ? 'active' : ''}">Home</a></li>
                    <li><a href="categories.html" class="${activePage === 'categories.html' || activePage === 'subjects.html' || activePage === 'questions.html' ? 'active' : ''}">Categories</a></li>
                    <li><a href="companies.html" class="${activePage === 'companies.html' ? 'active' : ''}">Companies</a></li>
                    <li><a href="mocktest.html" class="${activePage === 'mocktest.html' ? 'active' : ''}">Mock Test</a></li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle" id="more-dropdown-toggle">
                            <span>More</span>
                            <i class="lucide-chevron-down" style="font-size: 0.8rem; margin-left: 0.25rem;"></i>
                        </a>
                        <ul class="dropdown-menu" id="more-dropdown-menu">
                            <li><a href="bookmarks.html" class="${activePage === 'bookmarks.html' ? 'active' : ''}"><i class="lucide-bookmark" style="font-size: 0.9rem; margin-right: 0.5rem; display: inline-block; vertical-align: middle;"></i><span>Bookmarks</span></a></li>
                            <li><a href="progress.html" class="${activePage === 'progress.html' ? 'active' : ''}"><i class="lucide-line-chart" style="font-size: 0.9rem; margin-right: 0.5rem; display: inline-block; vertical-align: middle;"></i><span>Progress</span></a></li>
                            <li><a href="hiring-trends.html" class="${activePage === 'hiring-trends.html' ? 'active' : ''}"><i class="lucide-trending-up" style="font-size: 0.9rem; margin-right: 0.5rem; display: inline-block; vertical-align: middle;"></i><span>Hiring Trends</span></a></li>
                            <li><a href="about.html" class="${activePage === 'about.html' ? 'active' : ''}"><i class="lucide-info" style="font-size: 0.9rem; margin-right: 0.5rem; display: inline-block; vertical-align: middle;"></i><span>About</span></a></li>
                            <li class="dropdown-divider"></li>
                            <li><a href="#" id="open-settings-btn"><i class="lucide-settings" style="font-size: 0.9rem; margin-right: 0.5rem; display: inline-block; vertical-align: middle;"></i><span>Settings</span></a></li>
                        </ul>
                    </li>
                    ${mobileAuthHtml}
                </ul>
                <div class="nav-actions">
                    <div class="search-container">
                        <input type="text" placeholder="Global Search..." id="global-search-input">
                        <i class="lucide-search"></i>
                    </div>
                    ${desktopAuthHtml}
                    <button class="icon-btn hamburger" id="menu-toggle" aria-label="Open Menu">
                        <i class="lucide-menu"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 2. Inject Footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = `
            <div class="container footer-grid">
                <div class="footer-about">
                    <a href="index.html" class="logo" style="margin-bottom: 1rem;">
                        <i class="lucide-graduation-cap"></i>
                        <span>PrepHub</span>
                    </a>
                    <p>PrepHub is a premium, distraction-free placement preparation platform designed to help students master core computer science concepts, quantitative aptitude, logical reasoning, and verbal abilities.</p>
                </div>
                <div class="footer-links">
                    <h4>Categories</h4>
                    <ul>
                        <li><a href="subjects.html?category=technical">Technical Prep</a></li>
                        <li><a href="subjects.html?category=aptitude">Quantitative Aptitude</a></li>
                        <li><a href="subjects.html?category=reasoning">Logical Reasoning</a></li>
                        <li><a href="subjects.html?category=verbal">Verbal Ability</a></li>
                    </ul>
                </div>
                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="companies.html">Target Companies</a></li>
                        <li><a href="mocktest.html">Mock Test Arena</a></li>
                        <li><a href="bookmarks.html">My Bookmarks</a></li>
                        <li><a href="progress.html">Performance Tracker</a></li>
                        <li><a href="about.html">About & Tech Stack</a></li>
                    </ul>
                </div>
            </div>
            <div class="container footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Placement Preparation Hub. All rights reserved.</p>
                <div class="social-links">
                    <a href="https://github.com" target="_blank" class="social-link" title="GitHub"><i class="lucide-github"></i></a>
                    <a href="https://linkedin.com" target="_blank" class="social-link" title="LinkedIn"><i class="lucide-linkedin"></i></a>
                    <a href="mailto:contact@prephub.com" class="social-link" title="Contact Us"><i class="lucide-mail"></i></a>
                </div>
            </div>
        `;
    }

    // 3. Inject Back to Top Button
    const b2t = document.createElement('button');
    b2t.className = 'icon-btn back-to-top';
    b2t.id = 'back-to-top';
    b2t.innerHTML = '<i class="lucide-arrow-up"></i>';
    b2t.setAttribute('title', 'Back to Top');
    document.body.appendChild(b2t);

    // 4. Inject Settings Modal Container
    let settingsModal = document.getElementById('settings-modal');
    if (!settingsModal) {
        settingsModal = document.createElement('div');
        settingsModal.id = 'settings-modal';
        settingsModal.className = 'modal-overlay hidden';
        settingsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="lucide-settings" style="color: var(--primary); margin-right: 0.5rem; display: inline-block; vertical-align: middle;"></i>Settings</h3>
                    <button id="close-settings-btn" class="modal-close-btn" aria-label="Close Settings">
                        <i class="lucide-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Name configuration -->
                    <div class="settings-section">
                        <label class="settings-label" for="settings-name-input">
                            <i class="lucide-user" style="display: inline-block; vertical-align: middle;"></i> Change Name
                        </label>
                        <div class="settings-input-group">
                            <input type="text" id="settings-name-input" placeholder="Enter your full name">
                            <button id="settings-save-name-btn" class="btn btn-primary" style="padding: 0.6rem 1.25rem;">Save</button>
                        </div>
                    </div>
                    
                    <!-- Theme switch -->
                    <div class="settings-section">
                        <div class="settings-row">
                            <div class="settings-info">
                                <label class="settings-label"><i class="lucide-palette" style="display: inline-block; vertical-align: middle;"></i> Color Theme</label>
                                <span class="settings-description">Toggle between dark and light modes</span>
                            </div>
                            <div class="theme-switch-container">
                                <button id="settings-theme-toggle" class="btn btn-secondary">
                                    <i class="lucide-moon"></i> <span>Dark Mode</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Delete account (danger zone) -->
                    <div class="settings-section danger-zone">
                        <div class="settings-row">
                            <div class="settings-info">
                                <label class="settings-label text-danger"><i class="lucide-trash-2" style="display: inline-block; vertical-align: middle;"></i> Danger Zone</label>
                                <span class="settings-description">Permanently wipe profile, progress, bookmarks, and local data.</span>
                            </div>
                            <button id="settings-delete-account-btn" class="btn btn-danger" style="background: var(--danger-bg); border-color: var(--danger); color: var(--danger);">
                                Delete Account
                            </button>
                        </div>
                        
                        <div id="delete-confirmation-container" class="hidden" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color);">
                            <p style="font-size: 0.85rem; color: var(--danger); margin-bottom: 0.75rem; font-weight: 500;">
                                Are you absolutely sure? This action is irreversible and will delete all progress and bookmark data.
                            </p>
                            <div style="display: flex; gap: 0.5rem;">
                                <button id="confirm-delete-btn" class="btn btn-danger" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Wipe & Delete</button>
                                <button id="cancel-delete-btn" class="btn btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);
    }

    // 5. Inject AI Chatbot FAB and Widget (Only if logged in)
    let chatbotFab = document.getElementById('chatbot-fab');
    let chatbotWidget = document.getElementById('chatbot-widget');

    if (isLoggedInUser) {
        if (!chatbotFab) {
            chatbotFab = document.createElement('button');
            chatbotFab.id = 'chatbot-fab';
            chatbotFab.className = 'chatbot-fab';
            chatbotFab.setAttribute('aria-label', 'Open AI Assistant');
            chatbotFab.innerHTML = '<i class="lucide-message-square"></i>';
            document.body.appendChild(chatbotFab);
        }

        if (!chatbotWidget) {
            chatbotWidget = document.createElement('div');
            chatbotWidget.id = 'chatbot-widget';
            chatbotWidget.className = 'chatbot-widget';
            chatbotWidget.innerHTML = `
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <span class="chatbot-header-status"></span>
                        <h4>PrepHub AI Assistant</h4>
                    </div>
                    <button id="chatbot-close-btn" class="chatbot-close-btn" aria-label="Close Chat">
                        <i class="lucide-x"></i>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages-list">
                    <div class="chat-message message-bot">
                        <div class="chat-message-text">
                            <p>Hi there! 👋 I am your PrepHub AI Placement Assistant. How can I help you prepare for your upcoming placement rounds today?</p>
                        </div>
                        <div class="chat-message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
                <form class="chatbot-input-container" id="chatbot-form">
                    <input type="text" id="chatbot-input" placeholder="Ask anything about placements..." autocomplete="off">
                    <button type="submit" class="chatbot-send-btn" aria-label="Send Message">
                        <i class="lucide-send"></i>
                    </button>
                </form>
            `;
            document.body.appendChild(chatbotWidget);
        }
    } else {
        if (chatbotFab) chatbotFab.remove();
        if (chatbotWidget) chatbotWidget.remove();
    }

    setupNavbarHandlers();
    
    // Set correct theme icon on initial load/reload
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeToggleUI(activeTheme);
}

function setupNavbarHandlers() {
    // Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            menuToggle.innerHTML = isOpen ? '<i class="lucide-x"></i>' : '<i class="lucide-menu"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    // Back to Top Scroll Logic
    const b2t = document.getElementById('back-to-top');
    if (b2t) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                b2t.classList.add('visible');
            } else {
                b2t.classList.remove('visible');
            }
        });
        b2t.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Global Search redirect
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && globalSearch.value.trim() !== '') {
                window.location.href = `questions.html?search=${encodeURIComponent(globalSearch.value.trim())}`;
            }
        });
    }

    // 1. More Dropdown Handler (Click/Hover support)
    const dropdownToggle = document.getElementById('more-dropdown-toggle');
    const dropdownMenu = document.getElementById('more-dropdown-menu');
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
            // Toggle chevron rotation
            const chevron = dropdownToggle.querySelector('.lucide-chevron-down');
            if (chevron) {
                chevron.style.transform = dropdownMenu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
                chevron.style.transition = 'transform 0.2s ease';
            }
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                const chevron = dropdownToggle.querySelector('.lucide-chevron-down');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
        });
    }

    // 2. Settings Modal Toggle Handlers
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsModal = document.getElementById('settings-modal');

    const initSettingsForm = () => {
        const savedProfile = JSON.parse(localStorage.getItem('hub-profile')) || {};
        const cognitoEmail = localStorage.getItem('hub_user_email') || '';
        const nameInput = document.getElementById('settings-name-input');
        if (nameInput) {
            nameInput.value = savedProfile.name || (cognitoEmail ? cognitoEmail.split('@')[0] : '');
        }
        updateSettingsThemeUI();
    };

    const updateSettingsThemeUI = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const themeBtn = document.getElementById('settings-theme-toggle');
        if (themeBtn) {
            if (currentTheme === 'dark') {
                themeBtn.innerHTML = '<i class="lucide-sun" style="font-size:0.9rem; margin-right:0.35rem; display:inline-block; vertical-align:middle;"></i> <span>Light Mode</span>';
            } else {
                themeBtn.innerHTML = '<i class="lucide-moon" style="font-size:0.9rem; margin-right:0.35rem; display:inline-block; vertical-align:middle;"></i> <span>Dark Mode</span>';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    if (openSettingsBtn && settingsModal) {
        openSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            initSettingsForm();
            settingsModal.classList.add('show');
            settingsModal.classList.remove('hidden');
            if (dropdownMenu) dropdownMenu.classList.remove('show'); // close dropdown
        });
    }

    if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('show');
            setTimeout(() => settingsModal.classList.add('hidden'), 300);
            // Hide delete confirmation container if it was shown
            const confirmContainer = document.getElementById('delete-confirmation-container');
            if (confirmContainer) confirmContainer.classList.add('hidden');
        });
    }

    // Close on overlay click
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                closeSettingsBtn.click();
            }
        });
    }

    // Settings Name Save Action
    const saveNameBtn = document.getElementById('settings-save-name-btn');
    const nameInput = document.getElementById('settings-name-input');
    if (saveNameBtn && nameInput) {
        saveNameBtn.addEventListener('click', async () => {
            const newName = nameInput.value.trim();
            if (!newName) {
                showToast("Please enter a name", "warning");
                return;
            }

            const email = localStorage.getItem('hub_user_email') || '';
            const profile = { name: newName, email: email };
            localStorage.setItem('hub-profile', JSON.stringify(profile));

            let success = true;
            if (window.isLoggedIn && window.isLoggedIn() && window.syncProfileToBackend) {
                success = await window.syncProfileToBackend(newName, email);
            } else {
                showToast("Name saved successfully!", "success");
            }

            if (success) {
                // Refresh header layout to display the new name
                renderHeaderFooter();
                // Dispatch event so profile page updates too
                window.dispatchEvent(new CustomEvent('sync-completed'));
            }
        });
    }

    // Settings Theme Toggle Action
    const settingsThemeBtn = document.getElementById('settings-theme-toggle');
    if (settingsThemeBtn) {
        settingsThemeBtn.addEventListener('click', () => {
            toggleTheme();
            updateSettingsThemeUI();
        });
    }

    // Delete Account Actions
    const deleteAccountBtn = document.getElementById('settings-delete-account-btn');
    const deleteConfirmContainer = document.getElementById('delete-confirmation-container');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    if (deleteAccountBtn && deleteConfirmContainer) {
        deleteAccountBtn.addEventListener('click', () => {
            deleteConfirmContainer.classList.remove('hidden');
        });
    }

    if (cancelDeleteBtn && deleteConfirmContainer) {
        cancelDeleteBtn.addEventListener('click', () => {
            deleteConfirmContainer.classList.add('hidden');
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            // WIPE ALL STATE
            localStorage.removeItem('hub_id_token');
            localStorage.removeItem('hub_access_token');
            localStorage.removeItem('hub_refresh_token');
            localStorage.removeItem('hub_user_email');
            localStorage.removeItem('hub-bookmarks');
            localStorage.removeItem('hub-progress');
            localStorage.removeItem('hub-profile');

            showToast("Your account data was successfully deleted!", "success");

            // Close modal
            if (settingsModal) {
                settingsModal.classList.remove('show');
                settingsModal.classList.add('hidden');
            }

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }

    // 3. AI Chatbot Interactivity
    const cbFab = document.getElementById('chatbot-fab');
    const cbWidget = document.getElementById('chatbot-widget');
    const cbCloseBtn = document.getElementById('chatbot-close-btn');
    const cbForm = document.getElementById('chatbot-form');
    const cbInput = document.getElementById('chatbot-input');
    const cbMessagesList = document.getElementById('chatbot-messages-list');

    let chatHistory = [];

    const formatMarkdownToHTML = (text) => {
        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Code blocks: ```code``` -> <pre><code>code</code></pre>
        escaped = escaped.replace(/```([\s\S]*?)```/g, (match, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });

        // Inline code: `code` -> <code>code</code>
        escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

        // Bold: **text** -> <strong>text</strong>
        escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

        // Bullet points: lines starting with * or - -> list items
        let lines = escaped.split('\n');
        let inList = false;
        let formattedLines = [];

        for (let line of lines) {
            let trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                if (!inList) {
                    formattedLines.push('<ul>');
                    inList = true;
                }
                formattedLines.push(`<li>${trimmed.substring(2)}</li>`);
            } else {
                if (inList) {
                    formattedLines.push('</ul>');
                    inList = false;
                }
                if (trimmed !== '') {
                    formattedLines.push(`<p>${line}</p>`);
                }
            }
        }
        if (inList) {
            formattedLines.push('</ul>');
        }

        return formattedLines.join('\n');
    };

    const handleChatSubmit = async (text) => {
        if (!text) return;
        
        const currentMessagesList = document.getElementById('chatbot-messages-list');
        if (!currentMessagesList) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'chat-message message-user';
        userMsgDiv.innerHTML = `
            <div class="chat-message-text">
                <p>${text}</p>
            </div>
            <div class="chat-message-time">${time}</div>
        `;
        currentMessagesList.appendChild(userMsgDiv);
        currentMessagesList.scrollTop = currentMessagesList.scrollHeight;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message message-bot typing-indicator-bubble';
        typingDiv.innerHTML = `
            <div class="chat-message-text">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        currentMessagesList.appendChild(typingDiv);
        currentMessagesList.scrollTop = currentMessagesList.scrollHeight;

        try {
            const responseData = await findBotResponse(text);
            typingDiv.remove();

            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'chat-message message-bot';
            
            let formattedHtml = formatMarkdownToHTML(responseData.answer);
            
            if (responseData.suggestions && responseData.suggestions.length > 0) {
                formattedHtml += `
                    <div class="chat-suggestions-container">
                        <p class="chat-suggestions-title">Related Questions:</p>
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            ${responseData.suggestions.map(q => {
                                const escapedQ = q.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                                return `
                                    <button type="button" class="chat-suggestion-btn" onclick="window.askChatbotQuestion('${escapedQ}')">
                                        ${q}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            botMsgDiv.innerHTML = `
                <div class="chat-message-text">
                    ${formattedHtml}
                </div>
                <div class="chat-message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            currentMessagesList.appendChild(botMsgDiv);
            currentMessagesList.scrollTop = currentMessagesList.scrollHeight;

            if (typeof lucide !== 'undefined') lucide.createIcons();

        } catch (err) {
            console.error("Chatbot Error:", err);
            typingDiv.remove();

            const errorMsgDiv = document.createElement('div');
            errorMsgDiv.className = 'chat-message message-bot';
            errorMsgDiv.innerHTML = `
                <div class="chat-message-text" style="border-color: var(--danger-bg); background: var(--danger-bg); color: var(--danger);">
                    <p><i class="lucide-alert-triangle" style="display:inline-block; vertical-align:middle; margin-right:0.25rem;"></i> Failed to get a response. Please try again.</p>
                </div>
                <div class="chat-message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            currentMessagesList.appendChild(errorMsgDiv);
            currentMessagesList.scrollTop = currentMessagesList.scrollHeight;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    };

    window.askChatbotQuestion = async (text) => {
        const activeWidget = document.getElementById('chatbot-widget');
        const activeFab = document.getElementById('chatbot-fab');
        if (activeWidget && !activeWidget.classList.contains('show')) {
            activeWidget.classList.add('show');
            if (activeFab) {
                activeFab.innerHTML = '<i class="lucide-x"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
        await handleChatSubmit(text);
    };

    if (cbFab && cbWidget && !cbFab.dataset.listenersBound) {
        cbFab.dataset.listenersBound = "true";
        cbFab.addEventListener('click', () => {
            cbWidget.classList.toggle('show');
            if (cbWidget.classList.contains('show')) {
                cbFab.innerHTML = '<i class="lucide-x"></i>';
                if (cbInput) cbInput.focus();
                if (cbMessagesList) cbMessagesList.scrollTop = cbMessagesList.scrollHeight;
                loadChatbotQA();
            } else {
                cbFab.innerHTML = '<i class="lucide-message-square"></i>';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    if (cbCloseBtn && cbWidget && cbFab && !cbCloseBtn.dataset.listenersBound) {
        cbCloseBtn.dataset.listenersBound = "true";
        cbCloseBtn.addEventListener('click', () => {
            cbWidget.classList.remove('show');
            cbFab.innerHTML = '<i class="lucide-message-square"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    if (cbForm && cbInput && cbMessagesList && !cbForm.dataset.listenersBound) {
        cbForm.dataset.listenersBound = "true";
        cbForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = cbInput.value.trim();
            if (!text) return;
            cbInput.value = '';
            await handleChatSubmit(text);
        });
    }


}

/* ==========================================================================
   Utilities (Toast, Clipboard, Share)
   ========================================================================== */

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'check-circle';
    if (type === 'warning') iconClass = 'alert-triangle';
    if (type === 'danger') iconClass = 'alert-circle';
    if (type === 'info') iconClass = 'info';

    toast.innerHTML = `
        <i class="lucide-${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons({
            attrs: {
                class: 'toast-icon'
            }
        });
    }

    // Auto remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(1rem)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyToClipboard(text, message = 'Question text copied to clipboard!') {
    navigator.clipboard.writeText(text)
        .then(() => showToast(message, 'success'))
        .catch(err => {
            console.error("Clipboard copy error:", err);
            showToast('Failed to copy to clipboard', 'danger');
        });
}

function shareQuestion(questionObj, subjectSlug) {
    const url = `${window.location.origin}${window.location.pathname.replace(/[^\/]*$/, 'questions.html')}?subject=${subjectSlug}&qid=${questionObj.id}`;
    copyToClipboard(url, 'Practice link copied! Share it with your friends.');
}

// Automatically bootstrap basic layouts on scripts load
window.addEventListener('DOMContentLoaded', async () => {
    loadChatbotQA();
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Intercept token exchange redirect from Hosted UI
        const loadingHeading = document.querySelector('body div h2');
        if (loadingHeading) {
            loadingHeading.innerText = "Authenticating with AWS Cognito...";
        }

        try {
            await exchangeCodeForTokens(code);
            showToast("Logged in successfully via Cognito!", "success");
        } catch (err) {
            console.error("Cognito login flow failure:", err);
            showToast("Failed to authenticate with Cognito", "danger");
        }
        // Redirect to a clean URL on dashboard.html
        window.location.href = 'dashboard.html';
        return;
    }

    const activePage = window.location.pathname.split("/").pop() || 'index.html';

    // Redirect index.html to dashboard.html directly (if not logged in redirection code path)
    if (activePage === 'index.html' || activePage === '') {
        window.location.href = 'dashboard.html';
        return;
    }

    // Sync state on load asynchronously
    if (isLoggedIn()) {
        await syncUserData();
    }

    initTheme();
    renderHeaderFooter();
});
