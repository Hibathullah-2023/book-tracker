// ==========================================================================
// Step 3: Book Tracker with Status Updates & LocalStorage
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
  // Find the exact book by unique ID
  const bookToUpdate = books.find((b) => b.id === bookId);
  if (!bookToUpdate) {
    return;
  }

  // Update status property
  bookToUpdate.status = newStatus;

  // Persist immediately to localStorage
  saveBooks();

  // Re-render list to reflect changes (keeps the exact same list order)
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
const bookList = document.getElementById("book-list");
const emptyState = document.getElementById("empty-state");

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

// Render the list of books to the screen
function renderBooks() {
  // Clear the existing list items
  bookList.innerHTML = "";

  // Show or hide the empty list message
  if (books.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  // Build and display each book card (newest first)
  books.forEach((book) => {
    // 1. Create outer card item
    const li = document.createElement("li");
    li.className = "book-card";

    // 2. Create container for title and author
    const infoDiv = document.createElement("div");
    infoDiv.className = "book-info";

    // 3. Title element (textContent prevents HTML injection)
    const titleEl = document.createElement("h3");
    titleEl.className = "book-title";
    titleEl.textContent = book.title;

    // 4. Author element (textContent prevents HTML injection)
    const authorEl = document.createElement("p");
    authorEl.className = "book-author";
    authorEl.textContent = "by " + book.author;

    infoDiv.appendChild(titleEl);
    infoDiv.appendChild(authorEl);

    // 5. Status badge
    const badgeEl = document.createElement("span");
    badgeEl.className = "badge " + getStatusBadgeClass(book.status);
    badgeEl.textContent = book.status;

    // 6. Status change dropdown
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

    // 7. Actions container (badge + dropdown)
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

  // Add the new book to the front of the array (newest first)
  books.unshift(newBook);

  // Save the updated list to localStorage
  saveBooks();

  // Re-render the list on screen
  renderBooks();

  // Reset the form inputs and return focus to the title field
  bookForm.reset();
  titleInput.focus();
});

// Initial render on page open (loads saved books from storage)
renderBooks();
