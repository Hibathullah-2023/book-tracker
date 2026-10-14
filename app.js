// ==========================================================================
// Step 1: In-Memory Book Tracker
// ==========================================================================

// In-memory array to store book objects (resets on refresh for now)
const books = [];

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

  // Build and display each book card
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

    // Assemble the card
    li.appendChild(infoDiv);
    li.appendChild(badgeEl);

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

  // Create book object matching the agreed data structure
  const newBook = {
    id: "book-" + Date.now(),
    title: trimmedTitle,
    author: trimmedAuthor,
    status: statusSelect.value,
    createdAt: Date.now()
  };

  // Add the new book to the front of the array (newest first)
  books.unshift(newBook);

  // Re-render the list on screen
  renderBooks();

  // Reset the form inputs and return focus to the title field
  bookForm.reset();
  titleInput.focus();
});

// Initial render when page first loads
renderBooks();
