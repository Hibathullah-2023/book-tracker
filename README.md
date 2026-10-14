# Book Tracker

A clean, cozy, and accessible personal reading list tracker designed to keep track of what you read in one place. Built with zero dependencies using plain HTML, CSS, and Vanilla JavaScript with browser local storage.

[Live Demo](https://hibathullah-2023.github.io/book-tracker/)

## Features

- **Add Books**: Record book title, author, reading status (*To read*, *Reading*, *Finished*), and optional short notes (with a live 300-character counter).
- **Reading List**: Displays all books in reverse chronological order (newest first).
- **Live Search**: Instantly filter books by title or author as you type.
- **Status Filter Tabs**: Quick-filter pills (*All*, *To read*, *Reading*, *Finished*) showing live book counts.
- **Reading Statistics**: A quiet, muted summary line showing total counts across all categories (e.g. *"3 finished, 1 reading, 2 to read"*).
- **Inline Status Change**: Update any book's reading status on the fly directly from its card dropdown.
- **Inline Editing**: Edit title, author, and notes directly on the card with full validation and Save/Cancel controls.
- **Book Deletion**: Remove books with a browser confirmation dialog.
- **1 to 5 Star Ratings**: Rate books marked as *Finished*. Click a star to rate, or click the selected star again to clear the rating.
- **Finished Date**: Automatically records and displays the completion date (*"Finished on 14 Oct 2026"*) when marked Finished.
- **Dark Mode**: Supports system color scheme preference (`prefers-color-scheme`) with a persistent toggle button in the header.
- **Strict Design System**: Built with strict CSS custom properties, accessible contrast ratios in both light and dark themes, 44px tap targets, and smooth micro-interactions.
- **Mobile Responsive**: Fully usable on viewports down to 360px wide with no horizontal scrolling.
- **Offline Persistence**: All records and theme preferences are saved immediately to `localStorage`.

---

## Technology Stack

- **Markup**: Semantic HTML5 with explicit ARIA accessibility attributes.
- **Styles**: Plain CSS3 using custom CSS variables (design tokens), flexbox, and responsive media queries. No external fonts, icons, or CSS frameworks.
- **Logic**: Vanilla JavaScript (ES6+), strictly manipulating DOM elements via `textContent` and `value` to eliminate any XSS or HTML injection risks.
- **Storage**: Browser `localStorage` API.

---

## Running Locally

No build tools, package managers, or dependencies are required.

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/book_tracker.git
   cd book_tracker
   ```
2. Open `index.html` directly in your browser:
   - Double-click `index.html` in your file manager, or
   - Start a lightweight local server:
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Or using Node.js
     npx serve .
     ```
3. Open `http://localhost:8000` in your web browser.

---

## How I Built It with AI

This project was built iteratively with pair-programming AI assistance following a strict engineering discipline:

1. **Plan & Incremental Steps**: The app was designed in phases, developing one feature at a time rather than generating a monolithic codebase all at once.
2. **Hand Testing**: After each feature was built, it was manually tested in the browser across edge cases before making any git commit.
3. **Strict Design System**: Defined a cohesive palette, typography scale, spacing tokens, and micro-interactions in CSS without altering HTML structure or JavaScript IDs.
4. **Code Review & Hardening**: Conducted a line-by-line review covering XSS security, accessibility, edge cases, and focus management.

### Bugs Found & Fixed During Development

- **Stale Star Rating on Status Toggle**: Changing a book away from *Finished* and back left stale ratings on screen. Fixed by ensuring status changes away from *Finished* delete both the rating and the timestamp from the data model, cleanly re-rendering the card.
- **Crash on Corrupted Saved Data**: If `localStorage` contained corrupted or `null` entries, the initial render crashed. Fixed by adding schema validation in `loadBooks()` to filter only valid book objects.
- **Lost Keyboard Focus After Re-render**: Because re-rendering refreshed DOM nodes, pressing <kbd>Enter</kbd> on a star rating, status dropdown, or edit action caused keyboard focus to drop to `document.body`. Fixed by adding data attributes and restoring focus back to the exact element (or moving to the search input after a deletion).

---

## License

MIT License. Feel free to use and adapt this project for your own reading tracking!
