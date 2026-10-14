// ==========================================================================
// Step 7: Book Tracker with Inline Edit (Title & Author)
// ==========================================================================

// Key name used to store book data in browser localStorage
const STORAGE_KEY = "bookTracker.books";
const THEME_KEY = "bookTracker.theme";

// Helper: Generate a unique ID (combines timestamp + random string to guarantee uniqueness)
function generateId() {
  return "book-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
}

// Load books from localStorage safely with error handling
function loadBooks() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);

    // If nothing has been saved yet, start with an empty array
    if (!rawData) {
      return [];
    }

    const parsedData = JSON.parse(rawData);

    // Ensure the data is actually an Array before using it
    if (Array.isArray(parsedData)) {
      return parsedData;
    }

    console.warn("Stored data is not a valid list. Starting fresh.");
    return [];
  } catch (error) {
    // If JSON is broken or localStorage is restricted, fallback gracefully
    console.error("Could not read books from localStorage:", error);
    return [];
  }
}

// Save the current books array into localStorage safely
function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (error) {
    console.error("Could not save books to localStorage:", error);
    showError("Warning: Could not save books. Local storage might be full or disabled.");
  }
}

// Master list of book objects (initialized from storage)
let books = loadBooks();

// Active status filter (defaults to "All")
let currentStatusFilter = "All";

// ID of the book currently being edited (null if no book is in edit mode)
let editingBookId = null;

// DOM Element references
const bookForm = document.getElementById("book-form");
const titleInput = document.getElementById("book-title");
const authorInput = document.getElementById("book-author");
const statusSelect = document.getElementById("book-status");
const formError = document.getElementById("form-error");
const searchInput = document.getElementById("search-input");
const statsSummary = document.getElementById("stats-summary");
const filterTabs = document.querySelectorAll(".tab-btn");
const countAllEl = document.getElementById("count-all");
const countToReadEl = document.getElementById("count-to-read");
const countReadingEl = document.getElementById("count-reading");
const countFinishedEl = document.getElementById("count-finished");
const bookList = document.getElementById("book-list");
const emptyState = document.getElementById("empty-state");
const noResultsState = document.getElementById("no-results-state");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// Apply light or dark theme to root element and update toggle icon
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

// Initialize theme from saved localStorage setting or system prefers-color-scheme
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
    return;
  }

  // Detect system color scheme preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

// Helper: Show an error message above the add form
function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

// Helper: Clear any visible add form error message
function clearError() {
  formError.textContent = "";
  formError.hidden = true;
}

// Helper: Get CSS class for status badges ("To read" -> "badge-to-read")
function getStatusBadgeClass(status) {
  switch (status) {
    case "Reading":
      return "badge-reading";
    case "Finished":
      return "badge-finished";
    case "To read":
    default:
      return "badge-to-read";
  }
}

// Update a book's status by its unique ID
function updateBookStatus(bookId, newStatus) {
  const bookToUpdate = books.find((b) => b.id === bookId);
  if (!bookToUpdate) {
    return;
  }

  // Update status property
  bookToUpdate.status = newStatus;

  // Persist immediately to localStorage
  saveBooks();

  // Re-render list and updated stats (keeps filters intact)
  renderBooks();
}

// Update a book's title and author while preserving its position and createdAt
function updateBookDetails(bookId, newTitle, newAuthor) {
  const bookToUpdate = books.find((b) => b.id === bookId);
  if (!bookToUpdate) {
    return;
  }

  // Update title and author only
  bookToUpdate.title = newTitle;
  bookToUpdate.author = newAuthor;

  // Persist immediately to localStorage
  saveBooks();

  // Exit edit mode and re-render
  editingBookId = null;
  renderBooks();
}

// Update a book's star rating (1-5 or 0 for cleared)
function updateBookRating(bookId, newRating) {
  const bookToUpdate = books.find((b) => b.id === bookId);
  if (!bookToUpdate) {
    return;
  }

  // Update rating
  bookToUpdate.rating = newRating;

  // Persist immediately to localStorage
  saveBooks();

  // Re-render
  renderBooks();
}

// Delete a book by its unique ID with confirmation
function deleteBook(bookId) {
  const confirmed = window.confirm("Delete this book?");
  if (!confirmed) {
    return;
  }

  // If this book was currently open in edit mode, clear edit state
  if (editingBookId === bookId) {
    editingBookId = null;
  }

  // Filter out the book from the master list
  books = books.filter((b) => b.id !== bookId);

  // Persist deletion immediately to localStorage
  saveBooks();

  // Re-render list and stats (works seamlessly with active filters)
  renderBooks();
}

// Calculate and render reading counts (tabs & summary bar)
function renderStats() {
  const allCount = books.length;
  const toReadCount = books.filter((b) => b.status === "To read").length;
  const readingCount = books.filter((b) => b.status === "Reading").length;
  const finishedCount = books.filter((b) => b.status === "Finished").length;

  // Update badge counts on the status filter tabs
  if (countAllEl) countAllEl.textContent = allCount;
  if (countToReadEl) countToReadEl.textContent = toReadCount;
  if (countReadingEl) countReadingEl.textContent = readingCount;
  if (countFinishedEl) countFinishedEl.textContent = finishedCount;

  // If there are no books in the tracker at all, hide the summary bar
  if (allCount === 0) {
    statsSummary.hidden = true;
    statsSummary.textContent = "";
    return;
  }

  // Display summary bar: e.g. "3 finished, 1 reading, 2 to read"
  statsSummary.hidden = false;
  statsSummary.textContent = `${finishedCount} finished, ${readingCount} reading, ${toReadCount} to read`;
}

// Render the list of books to the screen (handles search, filter, and edit modes)
function renderBooks() {
  // Always update counts whenever the view renders
  renderStats();

  // Clear existing list items
  bookList.innerHTML = "";

  // 1. If master list is completely empty, show empty state message
  if (books.length === 0) {
    emptyState.hidden = false;
    noResultsState.hidden = true;
    return;
  }
  emptyState.hidden = true;

  // 2. Read trimmed, lowercase search query
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // 3. Filter books matching BOTH the active status filter AND search query
  const visibleBooks = books.filter((book) => {
    const matchesStatus =
      currentStatusFilter === "All" || book.status === currentStatusFilter;

    const matchesSearch =
      !query ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // 4. If nothing matches the active filters, show "No books match your filters."
  if (visibleBooks.length === 0) {
    noResultsState.hidden = false;
    return;
  }
  noResultsState.hidden = true;

  // 5. Build and display each visible book card (newest first)
  visibleBooks.forEach((book) => {
    const li = document.createElement("li");
    li.className = "book-card";

    // ------------------------------------------------------------------
    // Case A: Book is currently in EDIT mode
    // ------------------------------------------------------------------
    if (editingBookId === book.id) {
      const editContainer = document.createElement("div");
      editContainer.className = "edit-form-container";

      // Inline validation error message
      const editError = document.createElement("div");
      editError.className = "card-edit-error";
      editError.hidden = true;

      // Edit title input (using .value avoids HTML injection)
      const editTitleInput = document.createElement("input");
      editTitleInput.type = "text";
      editTitleInput.className = "edit-input";
      editTitleInput.value = book.title;
      editTitleInput.placeholder = "Book Title";
      editTitleInput.setAttribute("aria-label", "Edit title for " + book.title);

      // Edit author input (using .value avoids HTML injection)
      const editAuthorInput = document.createElement("input");
      editAuthorInput.type = "text";
      editAuthorInput.className = "edit-input";
      editAuthorInput.value = book.author;
      editAuthorInput.placeholder = "Author";
      editAuthorInput.setAttribute("aria-label", "Edit author for " + book.title);

      // Action buttons: Save & Cancel
      const editActions = document.createElement("div");
      editActions.className = "edit-actions";

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn-save";
      saveBtn.textContent = "Save";

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn-cancel";
      cancelBtn.textContent = "Cancel";

      // Handle saving edits with full validation
      saveBtn.addEventListener("click", () => {
        const trimmedTitle = editTitleInput.value.trim();
        const trimmedAuthor = editAuthorInput.value.trim();

        if (!trimmedTitle && !trimmedAuthor) {
          editError.textContent = "Please enter both a title and an author.";
          editError.hidden = false;
          return;
        }
        if (!trimmedTitle) {
          editError.textContent = "Please enter a book title.";
          editError.hidden = false;
          return;
        }
        if (!trimmedAuthor) {
          editError.textContent = "Please enter an author name.";
          editError.hidden = false;
          return;
        }

        updateBookDetails(book.id, trimmedTitle, trimmedAuthor);
      });

      // Handle cancelling edit mode
      cancelBtn.addEventListener("click", () => {
        editingBookId = null;
        renderBooks();
      });

      editActions.appendChild(saveBtn);
      editActions.appendChild(cancelBtn);

      editContainer.appendChild(editError);
      editContainer.appendChild(editTitleInput);
      editContainer.appendChild(editAuthorInput);
      editContainer.appendChild(editActions);

      li.appendChild(editContainer);
    } else {
      // ------------------------------------------------------------------
      // Case B: Regular View mode
      // ------------------------------------------------------------------
      const infoDiv = document.createElement("div");
      infoDiv.className = "book-info";

      // Title element (textContent prevents HTML injection)
      const titleEl = document.createElement("h3");
      titleEl.className = "book-title";
      titleEl.textContent = book.title;

      // Author element (textContent prevents HTML injection)
      const authorEl = document.createElement("p");
      authorEl.className = "book-author";
      authorEl.textContent = "by " + book.author;

      infoDiv.appendChild(titleEl);
      infoDiv.appendChild(authorEl);

      // Star rating: ONLY visible when book status is "Finished"
      if (book.status === "Finished") {
        const ratingBar = document.createElement("div");
        ratingBar.className = "rating-bar";

        const ratingLabel = document.createElement("span");
        ratingLabel.className = "rating-label";
        ratingLabel.textContent = "Rating:";
        ratingBar.appendChild(ratingLabel);

        const starsGroup = document.createElement("div");
        starsGroup.className = "stars-group";
        starsGroup.setAttribute("role", "group");
        starsGroup.setAttribute(
          "aria-label",
          `Rating for ${book.title}: ${book.rating ? book.rating + " of 5 stars" : "Not rated"}`
        );

        // Safe fallback for older books without rating property
        const currentRating = book.rating || 0;

        for (let i = 1; i <= 5; i++) {
          const starBtn = document.createElement("button");
          starBtn.type = "button";
          starBtn.className = "star-btn" + (i <= currentRating ? " filled" : "");
          starBtn.textContent = "★";

          const label =
            i === currentRating
              ? `Rate ${i} star${i > 1 ? "s" : ""} (currently selected - click to clear)`
              : `Rate ${i} star${i > 1 ? "s" : ""}`;
          starBtn.setAttribute("aria-label", label);

          // Clicking the same star clears the rating; clicking another sets it
          starBtn.addEventListener("click", () => {
            const nextRating = book.rating === i ? 0 : i;
            updateBookRating(book.id, nextRating);
          });

          starsGroup.appendChild(starBtn);
        }

        ratingBar.appendChild(starsGroup);
        infoDiv.appendChild(ratingBar);
      }

      // Status badge
      const badgeEl = document.createElement("span");
      badgeEl.className = "badge " + getStatusBadgeClass(book.status);
      badgeEl.textContent = book.status;

      // Status change dropdown
      const selectEl = document.createElement("select");
      selectEl.className = "status-select";
      selectEl.setAttribute("aria-label", "Change reading status for " + book.title);

      const statuses = ["To read", "Reading", "Finished"];
      statuses.forEach((statusOption) => {
        const option = document.createElement("option");
        option.value = statusOption;
        option.textContent = statusOption;
        if (statusOption === book.status) {
          option.selected = true;
        }
        selectEl.appendChild(option);
      });

      // When the user picks a new status, update this book
      selectEl.addEventListener("change", (event) => {
        updateBookStatus(book.id, event.target.value);
      });

      // Edit button (switches this card into edit mode)
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-edit";
      editBtn.setAttribute("aria-label", "Edit " + book.title);
      editBtn.textContent = "Edit";

      editBtn.addEventListener("click", () => {
        editingBookId = book.id;
        renderBooks();
      });

      // Delete button with confirmation
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-delete";
      deleteBtn.setAttribute("aria-label", "Delete " + book.title);
      deleteBtn.textContent = "Delete";

      deleteBtn.addEventListener("click", () => {
        deleteBook(book.id);
      });

      // Actions container (badge + dropdown + edit + delete)
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "book-actions";
      actionsDiv.appendChild(badgeEl);
      actionsDiv.appendChild(selectEl);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      // Assemble the card
      li.appendChild(infoDiv);
      li.appendChild(actionsDiv);
    }

    bookList.appendChild(li);
  });
}

// Live search: filter results as the user types
searchInput.addEventListener("input", () => {
  renderBooks();
});

// Status filter tabs: click to switch active status tab
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Update active tab button style
    filterTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    // Set current filter and re-render
    currentStatusFilter = tab.dataset.status;
    renderBooks();
  });
});

// Handle form submission
bookForm.addEventListener("submit", (event) => {
  // Prevent browser default behavior (which reloads the whole page)
  event.preventDefault();

  // Clear any previous error
  clearError();

  // Get trimmed values (removes accidental leading/trailing spaces)
  const trimmedTitle = titleInput.value.trim();
  const trimmedAuthor = authorInput.value.trim();

  // Validation: Both fields are required and cannot be only spaces
  if (!trimmedTitle && !trimmedAuthor) {
    showError("Please enter both a title and an author.");
    return;
  }
  if (!trimmedTitle) {
    showError("Please enter a book title.");
    return;
  }
  if (!trimmedAuthor) {
    showError("Please enter an author name.");
    return;
  }

  // Create book object with a guaranteed unique ID
  const newBook = {
    id: generateId(),
    title: trimmedTitle,
    author: trimmedAuthor,
    status: statusSelect.value,
    rating: 0,
    createdAt: Date.now()
  };

  // Add the new book to the front of the master array (newest first)
  books.unshift(newBook);

  // Save the updated master list to localStorage
  saveBooks();

  // Re-render the list on screen (respects active search and status filter)
  renderBooks();

  // Reset the form inputs and return focus to the title field
  bookForm.reset();
  titleInput.focus();
});

// Theme Toggle: switch between light and dark themes
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}

// Follow system theme changes in real time if user hasn't explicitly set a preference
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

// Initialize theme on page open
initTheme();

// Initial render on page open (loads saved books from storage)
renderBooks();
