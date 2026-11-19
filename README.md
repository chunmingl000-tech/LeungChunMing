# Project Board Demo

A standalone, static project-board demo implemented in `index.html`, with a clean, professional design (navy and slate palette, Inter typeface).

## Features

- **Big KPI tiles** for total, in-progress, blocked, overdue and completion percentage.
- **Three tabs:** Status (drag-and-drop kanban board), Timeline (tasks by due date) and Projects (progress per project).
- **Filters** by project, assignee and priority, applied across all tabs.
- **Add, move and delete tasks**, with form validation.
- **IT assistant chatbot** (bottom right): a text question-and-answer assistant that searches built-in help notes and the live board, then answers with its sources. It runs entirely in the browser and speaks a short greeting when opened.
- **Meeting reminder popup** after 10 seconds on the page.
- **Optional background music**, generated in the browser with the Web Audio API. It starts only when you press play.
- **Accessibility:** keyboard-friendly controls, clear focus outlines, and motion turned off when the browser asks for reduced motion.

## Run locally

Open `index.html` in a modern web browser. No build step or dependencies are required. Fonts are loaded from Google Fonts and fall back to system fonts if offline.

The board starts with synthetic sample tasks. New tasks are held in memory only and are cleared when the page is refreshed. The demo does not send task data to an external service.

## GitHub Pages

The GitHub Actions workflow (`.github/workflows/pages.yml`) publishes only `index.html` to GitHub Pages when changes are pushed to the `main` branch.

Live site: https://chunmingl000-tech.github.io/LeungChunMing/
