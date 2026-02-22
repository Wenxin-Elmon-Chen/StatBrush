# Biostat Interview Flashcards

A clean web app for practicing biostatistics interview questions with adaptive recommendations.

## Features

- Generates interview-focused flashcards dynamically (not from a fixed static list).
- Builds questions in batches and automatically generates a new batch when the queue runs out.
- Uses your **Relevant / Irrelevant** feedback by topic to steer future question generation.
- Keeps the current card visible when you mark feedback (no forced jump to the next card).
- Flip cards with a card-like 3D animation.
- Save cards for review and remove/clear saved cards.
- Persists feedback, saved cards, and pending question queue in browser local storage.

## Run locally

Open `index.html` directly in a browser, or run a local server:

```bash
python3 -m http.server 4173
```

Then browse to `http://localhost:4173`.
