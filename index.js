document.addEventListener('DOMContentLoaded', () => {
    // --- Constants & State ---
    const GITHUB_API_URL = 'https://api.github.com';
    const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
    let allRepos = [];
    let currentUsername = '';

    // --- DOM Elements ---
    const usernameInput = document.getElementById('username-input');
    const tokenInput = document.getElementById('token-input');
    const fetchBtn = document.getElementById('fetch-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const filterInput = document.getElementById('filter-input');
    const sortSelect = document.getElementById('sort-select');
    const languageSelect = document.getElementById('language-select');
    const topicSelect = document.getElementById('topic-select');
    const repoList = document.getElementById('repo-list');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    
    // Profile Elements
    const profileSection = document.getElementById('profile-section');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileLogin = document.getElementById('profile-login');
    const profileBio = document.getElementById('profile-bio');
    const profileFollowers = document.getElementById('profile-followers');
    const profileFollowing = document.getElementById('profile-following');
    const profileRepos = document.getElementById('profile-repos');
    const profileLink = document.getElementById('profile-link');

    // Profile README Elements
    const profileReadmeContainer = document.getElementById('profile-readme-container');
    const profileReadmeContent = document.getElementById('profile-readme-content');

    // Modal Elements
    const readmeModal = document.getElementById('readme-modal');
    const modalLoader = document.getElementById('modal-loader');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const readmeContent = document.getElementById('readme-content');

    // --- Event Listeners ---
    fetchBtn.addEventListener('click', () => handleFetchRepos(false));
    refreshBtn.addEventListener('click', () => handleFetchRepos(true));
    filterInput.addEventListener('input', renderRepos);
    sortSelect.addEventListener('change', renderRepos);
    languageSelect.addEventListener('change', renderRepos);
    topicSelect.addEventListener('change', renderRepos);
    
    // Modal Listeners
    modalCloseBtn.addEventListener('click', hideReadmeModal);
    readmeModal.addEventListener('click', (e) => {
        if (e.target === readmeModal) {
            hideReadmeModal();
        }
    });
    
    repoList.addEventListener('click', (e) => {
        const card = e.target.closest('.repo-card');
        if (card) {
            const owner = card.dataset.owner;
            const repoName = card.dataset.repoName;
            fetchAndShowReadme(owner, repoName);
        }
    });

    // --- Core Functions ---

    /**
     * Main function to fetch repositories and profile.
     * Handles caching, API calls, and UI updates.
     * @param {boolean} forceRefresh - If true, bypasses the cache.
     */
    async function handleFetchRepos(forceRefresh = false) {
        currentUsername = usernameInput.value.trim();
        if (!currentUsername) {
            showError('Please enter a username.');
            return;
        }

        showLoader(true);
        showError('');
        repoList.innerHTML = '';
        profileSection.style.display = 'none';
        profileReadmeContainer.style.display = 'none';

        if (!forceRefresh) {
            const cachedRepos = getCache(currentUsername, 'repos');
            const cachedProfile = getCache(currentUsername, 'profile');
            const cachedProfileReadme = getCache(currentUsername, 'profileReadme');
            
            if (cachedRepos && cachedProfile) {
                console.log('Loading from cache...');
                allRepos = cachedRepos;
                renderProfile(cachedProfile);
                renderProfileReadme(cachedProfileReadme);
                populateFilters(allRepos);
                renderRepos();
                showLoader(false);
                return;
            }
        }

        try {
            console.log('Fetching from API...');
            // Fetch profile, repos, and profile README in parallel
            const [profile, repos, profileReadme] = await Promise.all([
                fetchUserData(`${GITHUB_API_URL}/users/${currentUsername}`),
                fetchAllPages(`${GITHUB_API_URL}/users/${currentUsername}/repos?per_page=100&sort=pushed`),
                fetchProfileReadme(currentUsername)
            ]);

            allRepos = repos;
            renderProfile(profile);
            renderProfileReadme(profileReadme);
            
            setCache(currentUsername, 'repos', allRepos);
            setCache(currentUsername, 'profile', profile);
            setCache(currentUsername, 'profileReadme', profileReadme);

            populateFilters(allRepos); // Updated function name
            renderRepos();
        } catch (error) {
            console.error('Error fetching data:', error);
            showError(error.message || 'Failed to fetch data.');
            allRepos = [];
            renderRepos();
            profileSection.style.display = 'none'; 
            profileReadmeContainer.style.display = 'none'; 
        } finally {
            showLoader(false);
        }
    }

    /**
     * Fetches user profile data (single page).
     */
    async function fetchUserData(url) {
        const headers = getAuthHeaders();
        const response = await fetch(url, { headers });

        if (!response.ok) {
            if (response.status === 404) throw new Error('User not found.');
            if (response.status === 403) throw new Error('API rate limit exceeded. Add a GitHub Token.');
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        return await response.json();
    }
    
    /**
     * Fetches the user's profile README (e.g., /repos/user/user/readme).
     */
    async function fetchProfileReadme(username) {
        try {
            const response = await fetch(`${GITHUB_API_URL}/repos/${username}/${username}/readme`, {
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('No profile README found.');
                    return null; 
                }
                throw new Error('Could not fetch profile README.');
            }
            return await response.json();
        } catch (error) {
            console.warn(error.message); 
            return null;
        }
    }

    /**
     * Fetches all pages from a paginated GitHub API endpoint.
     */
    async function fetchAllPages(url) {
        let results = [];
        let nextUrl = url;
        const headers = getAuthHeaders();

        while (nextUrl) {
            const response = await fetch(nextUrl, { headers });

            if (!response.ok) {
                if (response.status === 404) throw new Error('User not found.');
                if (response.status === 403) throw new Error('API rate limit exceeded. Add a GitHub Token.');
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            results = results.concat(data);

            const linkHeader = response.headers.get('Link');
            nextUrl = null;
            if (linkHeader) {
                const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));
                if (nextLink) {
                    nextUrl = nextLink.match(/<(.*?)>/)[1];
                }
            }
        }
        return results;
    }

    /**
     * Decodes Base64 (with emoji/UTF-8 support)
     */
    function decodeReadmeContent(base64Content) {
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    /**
     * Renders the user profile data into the DOM.
     */
    function renderProfile(profile) {
        profileAvatar.src = profile.avatar_url;
        profileAvatar.alt = `${profile.login} avatar`;
        profileName.textContent = profile.name || profile.login;
        profileLogin.textContent = `@${profile.login}`;
        profileBio.textContent = profile.bio || 'No bio provided.';
        profileFollowers.innerHTML = `<span class="material-symbols-outlined">group</span> ${profile.followers} followers`;
        profileFollowing.innerHTML = `<span class="material-symbols-outlined">person_add</span> ${profile.following} following`;
        profileRepos.innerHTML = `<span class="material-symbols-outlined">book</span> ${profile.public_repos} public repos`;
        profileLink.href = profile.html_url;
        profileSection.style.display = 'flex';
    }

    /**
     * Renders the user profile README data into the DOM.
     */
    function renderProfileReadme(readmeData) {
        if (!readmeData || !readmeData.content) {
            profileReadmeContainer.style.display = 'none';
            return;
        }
        
        try {
            const markdownContent = decodeReadmeContent(readmeData.content);
            profileReadmeContent.innerHTML = marked.parse(markdownContent);
            profileReadmeContainer.style.display = 'block';
        } catch (error) {
            console.error('Error parsing profile README:', error);
            profileReadmeContent.innerHTML = '<p class="error-message">Error parsing profile README.</p>';
            profileReadmeContainer.style.display = 'block';
        }
    }

    /**
     * Filters, sorts, and renders the `allRepos` data into the DOM.
     */
    function renderRepos() {
        const filterText = filterInput.value.toLowerCase();
        let filteredRepos = allRepos.filter(repo => repo.name.toLowerCase().includes(filterText));

        const selectedLang = languageSelect.value;
        if (selectedLang !== 'all') {
            filteredRepos = filteredRepos.filter(repo => repo.language === selectedLang);
        }

        const selectedTopic = topicSelect.value;
        if (selectedTopic !== 'all') {
            filteredRepos = filteredRepos.filter(repo => repo.topics && repo.topics.includes(selectedTopic));
        }

        const sortBy = sortSelect.value;
        filteredRepos.sort((a, b) => {
            if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'updated') return new Date(b.updated_at) - new Date(a.updated_at);
            return 0;
        });

        repoList.innerHTML = '';
        if (filteredRepos.length === 0 && allRepos.length > 0) {
             repoList.innerHTML = '<p class="error-message">No repositories match your criteria.</p>';
             return;
        }

        filteredRepos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'repo-card';
            card.dataset.owner = repo.owner.login;
            card.dataset.repoName = repo.name;
            
            const topicsHTML = repo.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('');

            card.innerHTML = `
                <div class="repo-card-header">
                    <h3>
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                            ${repo.name}
                        </a>
                    </h3>
                </div>
                <p class="description">${repo.description || 'No description provided.'}</p>
                ${repo.topics.length > 0 ? `<div class="repo-topics">${topicsHTML}</div>` : ''}
                <div class="repo-stats">
                    ${repo.language ? `
                    <span class="stat-item">
                        <span class="language-dot" style="background-color: ${getLangColor(repo.language)};"></span>
                        ${repo.language}
                    </span>` : ''}
                    <span class="stat-item">
                        <span class="material-symbols-outlined">star</span>
                        ${repo.stargazers_count}
                    </span>
                    <span class="stat-item">
                        <span class="material-symbols-outlined">share</span>
                        ${repo.forks_count}
                    </span>
                    <span class="stat-item">
                        <span class="material-symbols-outlined">update</span>
                        ${new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                </div>
            `;
            repoList.appendChild(card);
        });
    }

    /**
     * Populates the language and topic filter dropdowns.
     */
    function populateFilters(repos) {
        const langSet = new Set();
        const topicSet = new Set();
        
        repos.forEach(repo => {
            if (repo.language) {
                langSet.add(repo.language);
            }
            if (repo.topics) {
                repo.topics.forEach(topic => topicSet.add(topic));
            }
        });
        
        // Sort and populate languages
        const allLangs = [...langSet].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        languageSelect.innerHTML = '<option value="all">All Languages</option>';
        allLangs.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            languageSelect.appendChild(option);
        });

        // Sort and populate topics
        const allTopics = [...topicSet].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        topicSelect.innerHTML = '<option value="all">All Topics</option>';
        allTopics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
    }

    /**
     * Fetches and displays the README file for a given repository in a modal.
     */
    async function fetchAndShowReadme(owner, repoName) {
        showReadmeModal();
        try {
            const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repoName}/readme`, {
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                if (response.status === 404) throw new Error('README.md not found in this repository.');
                throw new Error('Could not fetch README.');
            }
            const data = await response.json();
            
            const markdownContent = decodeReadmeContent(data.content);

            readmeContent.innerHTML = marked.parse(markdownContent);
        } catch (error) {
            readmeContent.innerHTML = `<p class="error-message">${error.message}</p>`;
        } finally {
            modalLoader.style.display = 'none';
        }
    }

    // --- Modal & Utility Functions ---

    function showReadmeModal() {
        readmeContent.innerHTML = '';
        modalLoader.style.display = 'flex';
        readmeModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    }
    
    function hideReadmeModal() {
        readmeModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function getAuthHeaders() {
        const token = tokenInput.value.trim();
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        if (token) headers['Authorization'] = `token ${token}`;
        return headers;
    }

    function setCache(username, type, data) {
        localStorage.setItem(`gh_${type}_${username}`, JSON.stringify({ timestamp: Date.now(), data }));
    }

    function getCache(username, type) {
        const cached = localStorage.getItem(`gh_${type}_${username}`);
        if (cached === null) return null; 
        const parsed = JSON.parse(cached);
        if (parsed === null) return null;
        const { timestamp, data } = parsed;
        if (Date.now() - timestamp > CACHE_DURATION_MS) {
            localStorage.removeItem(`gh_${type}_${username}`);
            return null;
        }
        return data;
    }

    function showLoader(show) {
        loader.style.display = show ? 'flex' : 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
    }

    function getLangColor(lang) {
        const colors = {
            'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'HTML': '#e34c26',
            'CSS': '#563d7c', 'Python': '#3572A5', 'Java': '#b07219',
            'C#': '#178600', 'C++': '#f34b7d', 'Go': '#00ADD8',
            'Ruby': '#701516', 'PHP': '#4F5D95', 'Shell': '#89e051',
            'Svelte': '#ff3e00', 'Vue': '#4FC08D', 'Rust': '#dea584',
            'Kotlin': '#A97BFF', 'Dart': '#00B4AB', 'Swift': '#F05138',
            'Jupyter Notebook': '#DA5B0B'
        };
        return colors[lang] || '#cccccc';
    }
});