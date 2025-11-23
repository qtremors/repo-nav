# 🧭 GitNexus

**GitNexus** is a self-hosted, unified web application designed to discover, manage, and archive specific release assets (`.apk`, `.exe`, etc.) from GitHub repositories. It acts as the central **nexus** between public repository discovery and your own private, automated archive.

---

## 💡 Core Philosophy

This project was built to solve two distinct problems:
1.  **Discovery:** Finding interesting repositories, often buried within a specific user's profile.
2.  **Preservation:** Safely archiving specific release files (`.apk`, `.exe`) from repositories that might be deleted or changed in the future.

**GitNexus** unifies these two goals into a single, seamless workflow. You can **Explore** GitHub like a browser, and with one click, add any repository to your **Archiver** to be monitored and preserved.

---

## ✨ Features

### 1. Unified Search & Navigation
The entire application is driven by a single, powerful search bar in the main header.
* **Rate-Limit Friendly Search:** The app uses a "debouncing" technique, waiting until you stop typing (e.g., 300ms) before sending a query. A spinner appears in the search bar to show it's working, avoiding API calls on every keystroke.
* **Dual-Query Results:** A single dropdown menu appears showing clearly separated results for both **Users** (e.g., `👤 qtremors`) and **Repositories** (e.g., `📦 user/auto-archiver`).
* **Contextual Actions:**
    * Clicking a **User** switches the main view to the **Explore Mode**, loading that user's profile and all their repositories.
    * Clicking a **Repository** opens a **Repo Detail Modal** for immediate action.

### 2. The Dashboard (The Archiver)
This is the home page of **GitNexus**—your personal collection of tracked repositories.
* **Card-Based UI:** All tracked repos are displayed as responsive, easy-to-read cards.
* **"Check Updates" Workflow:** A single button concurrently scans all repos on your dashboard.
* **Live Status:** Cards update in real-time:
    * **Notification Dot:** A green dot appears if a new, downloadable file is found.
    * **Progress Bar:** A live progress bar displays during the download of an asset.
* **Per-Repo Filtering:** Set granular filters (e.g., `release`, `x64`, `beta`) to ensure you *only* download the specific files you want.
* **Local File Management:** Manage, view, and delete files you've already downloaded.

### 3. The Explore Mode (The Navigator)
This mode allows you to browse GitHub with the power of your original `RepoNavigator` project.
* **Full User View:** Loads a user's complete profile card (bio, stats, etc.).
* **Complete Repo List:** See a full grid of that user's public repositories.
* **Advanced Filtering:** Use all your original `RepoNavigator` filters for sorting by commits, language, stars, etc.
* **The Bridge:** Every repo card has an **"Add to Archiver"** button to add it to your Dashboard.

### 4. The Repo Detail Modal
This central hub for any repository contains:
* Full repository name, description, and stats.
* A rendered view of the repository's **README.md**.
* A browseable list of the latest **Commit History**.
* The **Unified Download Button** (Download .ZIP or Add to Archiver).

### 5. Robust Technical & UX Features
* **Flexible API Token:** Add your GitHub token securely via a **`.env` file** for backend operations or directly through a **"Settings" modal in the web UI** for frontend-driven requests.
* **Intelligent Caching:** All API calls (user profiles, repo lists) are cached in `localStorage`. This is critical for **release assets**, preventing the "Check Updates" button from re-fetching data for repos that haven't changed. User profiles also feature a "Fetch Latest Info" button to manually bypass the cache.
* **Instant State Management:** The frontend manages a global state in JavaScript. Any action (like adding a repo from the modal) is instantly reflected in all other parts of the app (like the main dashboard) without a page reload.
* **Full UI Feedback:**
    * **Toast Notifications:** All actions (e.g., "Repo Added," "Error: API Limit Reached") provide a clear toast message.
    * **Disabled States:** Buttons are disabled with a spinner during any ongoing API call or loading process to prevent duplicate actions.
    * **Empty States:** The Dashboard and Explore views have "empty state" UIs to guide new users, e.g., "Your Dashboard is empty. Use the search bar to add a repo."
* **Security & Management:**
    * **VirusTotal Scanning:** All downloaded release assets are automatically hashed and checked against the VirusTotal API.
    * **Consolidate Files:** A utility function to copy the *single latest file* from all archived folders into one `_LATEST_FILES_` directory.

---

## 🏛️ Project Architecture

**GitNexus** is a **monolithic Flask application** that serves a single-page JavaScript frontend, unifying two logical "apps."

* **Backend (Python / Flask):**
    * Serves the main `index.html` and all static assets (`.js`, `.css`).
    * Provides a simple REST API for all database and file operations (e.g., `/api/add_repo`, `/api/check_updates`).
    * Manages all interactions with the GitHub API for search and data-fetching.
    * Uses a **ThreadPoolExecutor** for concurrent, non-blocking "Check Updates" and download tasks.
    * Manages real-time UI updates (like progress bars) using **WebSockets (Flask-SocketIO)**.

* **Frontend (HTML/CSS/JS):**
    * A single-page application (SPA) that dynamically changes its view (`Dashboard` or `Explore`) without full page reloads.
    * The **Unified Search Bar** acts as the central router, directing the UI to either load a User's "Explore" page or open a "Repo Detail" modal.
    * All state is synchronized with the backend **SQLite** database, and a local JavaScript state ensures the UI updates instantly.

* **Data Flow (Adding a Repo):**
    1.  User searches for `dev/auto-archiver` in the **Unified Search**.
    2.  User clicks the repo. The **Repo Detail Modal** opens.
    3.  User clicks **"Add to Archiver"**.
    4.  The frontend sends a `POST` request to the backend's `/api/add_repo` endpoint **AND** updates the local JavaScript state array.
    5.  The Flask backend adds the repo to the **SQLite database**.
    6.  The user closes the modal. When they return to the Dashboard, the new repo is already visible (due to the state update) and is permanently saved (due to the backend update).

---

## 🚀 Future Roadmap

* **GitHub Sign-In (OAuth):** Implement "Sign in with GitHub" to allow **GitNexus** to fetch a user's **starred repositories**. This "Starred" list would act as a new, separate view (like Explore) from which users can add repos to their Archiver Dashboard.
* **Email Notifications:** Add a setting for users to configure their SMTP details (server, port, app password). The backend worker will then send an email notification when a new, matching release file is found and downloaded.
* **Dashboard Filtering & Grouping:** Implement the same advanced filtering, sorting, and grouping/tagging features from the Explore mode onto the main Dashboard, allowing users to manage large archives.
* **Persistent Job History:** Log the results of every "Check Updates" run to a new database table, creating a complete history of all downloaded files.
* **"Download All Releases":** Add an option to scan *all* releases for a repo, not just the latest.
* **Download Statistics:** A simple analytics view showing total files downloaded, disk space used, and most active repos.