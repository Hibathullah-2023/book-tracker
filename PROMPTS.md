--Prompt 1: Plan
I'm building a small Book Tracker web app as part of a job selection task.
I want to build it step by step, one feature at a time, and test each step
before moving on. Please don't write any code yet.

WHAT THE APP DOES
A simple web page where someone keeps a list of books they want to read.

Must-have features:
1. Add a book with a title, an author, and a status (To read, Reading,
   or Finished). Title and author are required.
2. Show the list of books, newest first.
3. Search the list by title or author.
4. Change a book's status (for example from Reading to Finished).
5. Keep the data when the page is refreshed, using the browser's
   local storage.

Optional extras (I'll add these later if time allows):
- Delete a book
- Show counts, like "3 finished, 2 to read"
- A layout that works well on a phone

TECHNOLOGY
- Plain HTML, CSS and JavaScript only. No frameworks, no server, no database.
- It must be easy to host online for free (for example GitHub Pages).

WHAT I WANT FROM YOU NOW
1. Tell me which files you would create and what each file is for.
2. Suggest a simple data structure for one book (what fields it needs).
3. Propose a build order, one small step at a time, starting with
   "add a book and show the list". For each step, tell me what I should
   test by hand (including mistakes on purpose, like an empty title).
4. Point out anything in my requirements that is unclear or that could
   go wrong.

Keep the plan short and written for a beginner.

--Prompt 2: Add a book and show the list (*Almost same prompt template for each feature adding*)
Using the plan, create the files and build ONLY this step:

- A form with: title (text), author (text), and status (a dropdown with
  To read, Reading, Finished).
- Title and author are required. If either is empty or only spaces, don't
  add the book and show a clear error message next to the form.
- Trim extra spaces from the title and author before saving.
- Show the list of books below the form, newest first. Each book shows
  its title, author, and status.
- Show a friendly message when the list is empty, like "No books yet".
- Clear the form after a book is added.

Do NOT add saving, search, or status changes yet. Keep the code simple
and add short comments so a beginner can follow it.
After the code, give me a list of things to test by hand.

Prompt 2.2 (one step at a time): let the user change a book's status from the list.

- Each book card has a status dropdown (To read, Reading, Finished)
  showing its current status.
- Changing it updates that book, saves to localStorage right away, and
  updates the badge/colour on the card.
- Find the book by its unique id, not by its position in the list or by
  its title, so the right book changes even if two books have the same
  title.
- The change must survive a page refresh.
- Make sure each new book gets a unique id. If books could get the same
  id (for example when added in the same millisecond), fix that and tell
  me what you changed.
- Keep newest-first order after a status change (a status change must
  not move the book).
- Keep all earlier features working (validation, trimming, safe text,
  saving, loading).

Do NOT add search, delete or counts yet.
Keep the code simple, with short comments for a beginner.

After the code, tell me what to test by hand.

--Prompt 3:Design 
I want to restyle my Book Tracker with a strict design system. This is
STYLING ONLY: do not change logic, features, ids used by JavaScript, or
behaviour. Plain CSS with CSS variables, no external fonts or libraries.

Do not restyle anything yet. First, create the design tokens in
style.css as CSS variables, then show me the list.

COLOURS (light / dark)
- background: #FAF7F2 / #16130F
- surface (cards, inputs): #FFFFFF / #1F1B16
- text: #1F1B16 / #F2EDE4
- muted text: #6B6358 / #A39A8C
- border: #E7E0D5 / #3A342C
- accent (buttons, focus ring): #B4533C / #E07A5F
- To read: #B7791F, Reading: #2B6CB0, Finished: #2F855A
  (use a lighter tint of each in dark mode so it stays readable)

TYPOGRAPHY
- Headings: Georgia, "Times New Roman", serif
- Body: system-ui, -apple-system, "Segoe UI", sans-serif
- Scale: 14px (small), 16px (body, and inputs), 20px, 28px, 40px (title)
- Line height 1.5 for body, 1.2 for headings

SPACING: 4, 8, 12, 16, 24, 32, 48 px only.
RADIUS: 8px (inputs, buttons), 12px (cards), 999px (pills).
SHADOW: one soft shadow level only, used on cards.
LAYOUT: left-aligned content, max width 760px, centred on the page.

BANNED (do not use any of these):
- purple, violet or blue-purple gradients, or gradient text
- glassmorphism or blur effects
- glowing hover effects or neon shadows
- emojis in headings or buttons
- a centred hero section
- bouncing, spinning or pulsing animations
- more than one shadow style, or more than two font families

Contrast must be readable in both themes. Tell me which files changed.

--Prompt 4 (one time the AI got something wrong): Fix the bug
I found a bug in the star rating. Steps to reproduce:
1. Mark a book as Finished and give it a rating.
2. Change its status to Reading (or To read).
3. Change it back to Finished.
The card shows the old rating state, and I have to refresh the page to
see the correct one.

Please fix ONLY this bug. Do not add features or change other behaviour.

Required behaviour:
- When a book's status changes away from Finished, remove its rating
  (and finishedAt, if not already done), save to localStorage, and
  re-render the list straight away.
- When a book's status changes to Finished, it starts with no rating
  and a fresh finishedAt date.
- The card must always be redrawn from the saved book data after a
  status change, with no stale values left on screen and no need to
  refresh.
- The rating control must be built fresh on each render from
  book.rating, and shown only when the status is Finished.
- Check that this also works while a search or status filter is active.

First explain in plain words what was causing the bug, then show the
fix, then tell me what to test by hand.

--Prompt 5 (Review prompt):     
   Review my whole app (index.html, style.css, app.js) as a careful code
   reviewer. Do NOT add features or change the design.
   - List bugs and edge cases, especially old saved books missing notes,
     rating, or finishedAt.
   - Check that no user text goes through innerHTML.
   - Find unused or duplicated code and confusing names.
   - Check accessibility: labels, keyboard use, focus visibility,
     contrast in light and dark mode.
   - Suggest only small, safe fixes and explain each in plain words.