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