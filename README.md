# RepoNavigator

RepoNavigator is a sleek, single-page application designed to fetch, display, and navigate a GitHub user's profile and repositories. It provides a clean, high-performance interface for browsing repo details, filtering, sorting, and reading READMEs, all without leaving a single page.

## Features

-   **Dynamic User Profile:** Fetches and displays the target user's profile card, including their avatar, name, bio, and key stats (followers, following, repo count).
-   **Profile README:** Automatically fetches and renders the user's special `username/username` profile README directly on the main page.
-   **Full Repository Fetching:** Retrieves all public repositories for a user, automatically handling GitHub's API pagination.
-   **Instant Filtering & Sorting:**
    -   **Filter by Name:** Instantly search all fetched repos by name.
    -   **Filter by Tech:** A dynamic dropdown is populated with all unique languages *and* repository topics (e.g., `react`, `python`, `django`) found in the user's repos.
    -   **Sort:** Order repositories by Stars, Name, or Last Updated date.
-   **Modal README Viewer:**
    -   Click any repository card to open its README in a clean, scrollable modal.
    -   Accurately renders Markdown, including code blocks, inline code, and emojis (via proper UTF-8 decoding).
    -   Prevents background page scroll (scroll-chaining) when the modal is open.
-   **Smart Caching:**
    -   All API requests (profile, repos, and profile README) are cached in the browser's `localStorage` for 30 minutes.
    -   This dramatically speeds up subsequent visits and reduces API rate limit consumption. A "Refresh" button allows for bypassing the cache.
-   **Modern UI/UX:**
    -   A responsive, high-contrast "Material 3" inspired dark theme.
    -   Clean, card-based layout for repositories.
    -   Displays key repo stats: language, stars, forks, and last update time.
    -   Includes loading spinners and clear error messages.
-   **GitHub Token Support:** Includes an optional field for a GitHub Personal Access Token (PAT) to increase API rate limits for heavy use.

## Tech Stack

-   **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3
-   **API:** GitHub v3 REST API
-   **Libraries:** `marked.js` (for client-side Markdown-to-HTML conversion)
-   **Tooling:** None! This project is build-less and runs directly in the browser.
