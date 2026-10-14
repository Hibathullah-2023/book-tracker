// ==========================================================================
// Step 4: Book Tracker with Search & Filtering
// ==========================================================================

// Key name used to store book data in browser localStorage
const STORAGE_KEY = "bookTracker.books";

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

// Update a book's status by its unique ID
function updateBookStatus(bookId, newStatus) {
  // Find the exact book by unique ID in the master list
  const bookToUpdate = books.find((b) => b.id === bookId);
  if (!bookToUpdate) {
    return;
  }

  // Update status property
  bookToUpdate.status = newStatus;

  // Persist immediately to localStorage
  saveBooks();

  // Re-render list to reflect changes (keeps current search filter intact)
  renderBooks();
}

// Master list of book objects (initialized from storage)
let books = loadBooks();

// DOM Element references
const bookForm = document.getElementById("book-form");
const titleInput = document.getElementById("book-title");
const authorInput = document.getElementById("book-author");
const statusSelect = document.getElementById("book-status");
const formError = document.getElementById("form-error");
const searchInput = document.getElementById("search-input");
const bookList = document.getElementById("book-list");
const emptyState = document.getElementById("empty-state");
const noResultsState = document.getElementById("no-results-state");

// Helper: Show an error message above the form
function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

// Helper: Clear any visible error message
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

// Render the list of books to the screen (handles search filtering)
function renderBooks() {
  // Clear the existing list items
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

  // 3. Filter books matching title OR author (case-insensitive)
  const visibleBooks = query
    ? books.filter((book) => {
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author.toLowerCase().includes(query);
        return titleMatch || authorMatch;
      })
    : books;

  // 4. If search query yielded zero matches, show "No books match your search"
  if (visibleBooks.length === 0) {
    noResultsState.hidden = false;
    return;
  }
  noResultsState.hidden = true;

  // 5. Build and display each visible book card (newest first)
  visibleBooks.forEach((book) => {
    // Outer card item
    const li = document.createElement("li");
    li.className = "book-card";

    // Container for title and author
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

    // Actions container (badge + dropdown)
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "book-actions";
    actionsDiv.appendChild(badgeEl);
    actionsDiv.appendChild(selectEl);

    // Assemble the card
    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);

    bookList.appendChild(li);
  });
}

// Live search: filter results as the user types
searchInput.addEventListener("input", () => {
  renderBooks();
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
    createdAt: Date.now()
  };

  // Add the new book to the front of the master array (newest first)
  books.unshift(newBook);

  // Save the updated master list to localStorage
  saveBooks();

  // Re-render the list on screen (respects active search filter if any)
  renderBooks();

  // Reset the form inputs and return focus to the title field
  bookForm.reset();
  titleInput.focus();
});

// Initial render on page open (loads saved books from storage)
renderBooks();
