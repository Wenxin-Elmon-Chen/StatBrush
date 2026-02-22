# Biostat Interview Flashcards

A clean web app for practicing biostatistics interview questions with adaptive recommendations.

## Features

- Generates interview-focused biostat flashcards from an internal question bank.
- Flip cards to reveal answers.
- Mark cards as **Relevant** or **Irrelevant**:
  - Topics marked irrelevant are weighted down for future recommendations.
  - Topics marked relevant are slightly weighted up.
- Save cards for review and remove/clear saved cards.
- Persists feedback and saved cards in browser local storage.

## Run locally

Open `index.html` directly in a browser, or run a local server:

```bash
python3 -m http.server 4173
```

Then browse to `http://localhost:4173`.
