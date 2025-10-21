# 🧭 RepoNavigator

RepoNavigator is a sleek, single-page application designed to fetch, display, and navigate a GitHub user's profile and repositories. It provides a clean, high-performance interface for browsing repo details, filtering, sorting, and reading READMEs, all without leaving a single page.

## ✨ Features

-   👤 **Dynamic User Profile:** Fetches and displays the target user's profile card, including their avatar, name, bio, and key stats (followers, following, repo count, and total public commits). The user's name links directly to their GitHub profile.
-   📖 **Profile README:** Automatically fetches and renders the user's special `username/username` profile README directly on the main page.
-   📦 **Full Repository Fetching:** Retrieves all public repositories for a user, automatically handling GitHub's API pagination.
-   ⚡ **Advanced Filtering & Sorting:**
    -   **Filter by Name:** Instantly search all fetched repos by name.
    -   **Filter by Tech:** A dynamic dropdown is populated with all unique languages *and* repository topics (e.g., `react`, `python`, `django`) found in the user's repos.
    -   **Filter by Commits:** Show repos within a minimum/maximum commit count range.
    -   **Sort:** Order repositories by Last Updated, Creation Date, Stars, Commits, or Name.
-   📊 **Commit History & Counts:**
    -   View the 30 most recent commits for any repo in a modal.
    -   Fetches and displays the total commit count for each repository.
    -   The user profile shows the total number of commits from all public repositories.
-   🔗 **Quick Repo Actions:**
    -   **Homepage Link:** An icon links directly to the repo's homepage, if one is provided.
    -   **Download:** A button to download the repo's default branch as a .zip file.
    -   **Copy Clone URL:** Instantly copy the `git clone` URL to the clipboard.
-   📄 **Modal README Viewer:** Click any repository card to open its README in a clean, scrollable modal.
-   💾 **Smart Caching:**
    -   All API requests (profile, repos, and profile README) are cached in the browser's `localStorage` for 30 minutes.
    -   This dramatically speeds up subsequent visits and reduces API rate limit consumption. A "Refresh" button allows for bypassing the cache.
-   🎨 **Modern UI/UX:**
    -   **Theme Switcher:** Choose between "Default Dark," "GitHub Dark," and "GitHub Contrast" themes.
    -   **Responsive Grid:** A fully responsive, card-based layout that automatically adjusts from 1 to 4 columns depending on screen size.
    -   **Skeleton Loader:** A skeleton screen mimics the card layout for better perceived performance.
    -   **Rich Stats:** Cards display key stats: language, stars, forks, last update time, creation date, and commit count.
    -   **Animations & Feedback:** Cards fade in smoothly, and "Copy" actions show a toast notification.
    -   **Accessibility:** Tooltips are provided for all interactive icons and stats.
-   🔑 **GitHub Token Support:** Includes an optional field for a GitHub Personal Access Token (PAT) to increase API rate limits for heavy use.

## 💻 Tech Stack

-   **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3
-   **API:** GitHub v3 REST API
-   **Libraries:** `marked.js` (for client-side Markdown-to-HTML conversion)
-   **Tooling:** None! This project is build-less and runs directly in the browser.

## Changelog

## 2025-10-21

### ✨ Features

  * **Commit History:** Added a "View Commits" button to each repo card, which opens a modal displaying the 30 most recent commits.
  * **Commit Count:** The app now fetches and displays the total commit count for each repository.
  * **Total Profile Commits:** The user profile section now shows the *total* number of commits from all public repositories displayed.
  * **New Sort Options:** Added "Sort by Commits" and "Sort by Creation Date" to the sorting dropdown.
  * **New Filter:** Added a filter to show repos within a min/max commit count range.
  * **Copy Clone URL:** Added a "Copy" button to each repo card to copy the `git clone` URL to the clipboard.
  * **Download Button:** Added a "Download ZIP" button to each card.
  * **Website Link:** Added a "Homepage" link icon to each card (if a homepage URL is provided in the repo data).
  * **Theme Changer:** Added a theme-switcher dropdown in the header to toggle between "Default Dark," "GitHub Dark," and "GitHub Contrast" themes.

### 🎨 UI & UX Improvements

  * **Skeleton Loader:** Replaced the single main spinner with a "skeleton loader" that mimics the card layout for a better perceived performance.
  * **Automatic Grid:** Removed the layout-switcher entirely. The grid is now fully automatic and responsive:
      * 1 column on mobile (`< 768px`)
      * 3 columns on tablets/desktops (`>= 768px`)
      * 4 columns on large desktops (`>= 1200px`)
  * **Card Animations:** Repo cards now fade in smoothly when loaded or filtered.
  * **Toast Notifications:** A toast message appears at the bottom of the screen to confirm the "Copy URL" action.
  * **Tooltips:** Added tooltips (`title` attributes) to all interactive elements on the repo card (repo name, homepage, download, copy, commits, and stats) for better accessibility.
  * **Profile Link:** Merged the "View on GitHub" button into the profile name. The user's name is now a primary-colored link that underlines on hover.
  * **Card Layout:**
      * Added the repo's "Creation Date" to the stats block.
      * Vertically centered the repo name with the link icons in the card header.

### ♻️ Refactoring & Fixes

  * **Resilience:** Commit count fetching is now resilient. If an API request fails for one repo (due to rate limiting or an empty repo), it defaults to `0` and does not crash the application or stop other counts from loading.
  * **Removed Features:** Removed all UI and logic for the "Show Private Repos" toggle to simplify the app's scope to public data.
  * **Removed Features:** Removed the user-selectable grid/list layout toggle.
  * **Performance:** Commit counts are fetched asynchronously after the main repo data is rendered, so the user sees the repo list immediately.