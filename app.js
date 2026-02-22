const questionBank = [
  {
    id: 'survival-km',
    topic: 'survival analysis',
    question: 'When would you choose a Kaplan-Meier curve, and what does a step down represent?',
    answer:
      'Use Kaplan-Meier for time-to-event outcomes with censoring. Each step down reflects an observed event (for example, death or relapse) at that time point.',
  },
  {
    id: 'cox-hazard',
    topic: 'survival analysis',
    question: 'How do you interpret a hazard ratio of 0.65 from a Cox model?',
    answer:
      'A hazard ratio of 0.65 means the hazard in the exposed/treatment group is estimated to be 35% lower at any time, assuming proportional hazards.',
  },
  {
    id: 'pvalue-ci',
    topic: 'inference',
    question: 'What is the difference between a p-value and a 95% confidence interval?',
    answer:
      'A p-value measures compatibility of data with a null hypothesis, while a confidence interval gives a plausible range for the effect size and its precision.',
  },
  {
    id: 'power-sample',
    topic: 'study design',
    question: 'What key inputs are required for a sample size or power calculation in a two-arm trial?',
    answer:
      'You need expected effect size, variability/event rate assumptions, significance level (alpha), desired power, and allocation ratio/dropout assumptions.',
  },
  {
    id: 'confounding',
    topic: 'causal inference',
    question: 'What is confounding, and how can it be addressed in observational studies?',
    answer:
      'Confounding occurs when a third variable relates to both exposure and outcome. Address it through design (matching/restriction) and analysis (stratification, regression, propensity scores).',
  },
  {
    id: 'logistic-or',
    topic: 'regression',
    question: 'In logistic regression, how should you explain an odds ratio greater than 1 to a non-statistician?',
    answer:
      'An odds ratio above 1 indicates higher odds of the outcome for each unit increase in the predictor (or versus reference group), holding other variables constant.',
  },
  {
    id: 'missing-data',
    topic: 'data quality',
    question: 'What is the difference between MCAR, MAR, and MNAR missingness?',
    answer:
      'MCAR: missingness unrelated to any data; MAR: related to observed data; MNAR: related to unobserved values themselves. MNAR is hardest to handle without strong assumptions.',
  },
  {
    id: 'multiple-testing',
    topic: 'inference',
    question: 'Why is multiple testing correction important in genomics or biomarker screening?',
    answer:
      'Running many tests inflates false positives. Corrections like FDR control reduce spurious findings while preserving power better than strict family-wise approaches in high-dimensional settings.',
  },
];

const storageKeys = {
  feedback: 'biostat-feedback',
  saved: 'biostat-saved-cards',
};

const state = {
  currentCard: null,
  isBackVisible: false,
  feedbackByTopic: loadFromStorage(storageKeys.feedback, {}),
  savedCards: loadFromStorage(storageKeys.saved, []),
};

const ui = {
  questionText: document.getElementById('questionText'),
  answerText: document.getElementById('answerText'),
  frontFace: document.querySelector('.flashcard__face--front'),
  backFace: document.querySelector('.flashcard__face--back'),
  newCardBtn: document.getElementById('newCardBtn'),
  flipBtn: document.getElementById('flipBtn'),
  saveBtn: document.getElementById('saveBtn'),
  relevantBtn: document.getElementById('relevantBtn'),
  irrelevantBtn: document.getElementById('irrelevantBtn'),
  clearBtn: document.getElementById('clearBtn'),
  savedList: document.getElementById('savedList'),
  template: document.getElementById('savedCardTemplate'),
};

function loadFromStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function persistState() {
  localStorage.setItem(storageKeys.feedback, JSON.stringify(state.feedbackByTopic));
  localStorage.setItem(storageKeys.saved, JSON.stringify(state.savedCards));
}

function topicWeight(topic) {
  const feedback = state.feedbackByTopic[topic] || { relevant: 0, irrelevant: 0 };
  const baseWeight = 1;
  const penalty = feedback.irrelevant * 0.6;
  const reward = feedback.relevant * 0.15;
  return Math.max(0.2, baseWeight + reward - penalty);
}

function pickCard() {
  const weightedPool = questionBank.map((card) => ({
    card,
    weight: topicWeight(card.topic),
  }));

  const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const item of weightedPool) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item.card;
    }
  }

  return questionBank[0];
}

function showCard(card) {
  state.currentCard = card;
  state.isBackVisible = false;

  ui.questionText.textContent = `${card.question} (${card.topic})`;
  ui.answerText.textContent = card.answer;
  ui.backFace.hidden = true;
  ui.frontFace.hidden = false;

  [ui.flipBtn, ui.saveBtn, ui.relevantBtn, ui.irrelevantBtn].forEach((button) => {
    button.disabled = false;
  });
}

function flipCard() {
  if (!state.currentCard) return;
  state.isBackVisible = !state.isBackVisible;
  ui.frontFace.hidden = state.isBackVisible;
  ui.backFace.hidden = !state.isBackVisible;
  ui.flipBtn.textContent = state.isBackVisible ? 'Show Question' : 'Flip Card';
}

function addFeedback(topic, type) {
  if (!state.feedbackByTopic[topic]) {
    state.feedbackByTopic[topic] = { relevant: 0, irrelevant: 0 };
  }

  state.feedbackByTopic[topic][type] += 1;
  persistState();
}

function saveCurrentCard() {
  if (!state.currentCard) return;

  const alreadySaved = state.savedCards.some((card) => card.id === state.currentCard.id);
  if (alreadySaved) return;

  state.savedCards.unshift({ ...state.currentCard, savedAt: new Date().toISOString() });
  persistState();
  renderSavedCards();
}

function removeSavedCard(id) {
  state.savedCards = state.savedCards.filter((card) => card.id !== id);
  persistState();
  renderSavedCards();
}

function clearSavedCards() {
  state.savedCards = [];
  persistState();
  renderSavedCards();
}

function renderSavedCards() {
  ui.savedList.innerHTML = '';

  if (state.savedCards.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'saved-card';
    emptyItem.textContent = 'No saved flashcards yet.';
    ui.savedList.append(emptyItem);
    return;
  }

  for (const card of state.savedCards) {
    const fragment = ui.template.content.cloneNode(true);
    fragment.querySelector('.saved-card__question').textContent = card.question;
    fragment.querySelector('.saved-card__answer').textContent = card.answer;
    fragment.querySelector('.saved-card__meta').textContent = `Topic: ${card.topic}`;

    fragment.querySelector('.saved-card__remove').addEventListener('click', () => {
      removeSavedCard(card.id);
    });

    ui.savedList.append(fragment);
  }
}

ui.newCardBtn.addEventListener('click', () => {
  showCard(pickCard());
  ui.flipBtn.textContent = 'Flip Card';
});

ui.flipBtn.addEventListener('click', flipCard);
ui.saveBtn.addEventListener('click', saveCurrentCard);

ui.relevantBtn.addEventListener('click', () => {
  if (!state.currentCard) return;
  addFeedback(state.currentCard.topic, 'relevant');
  showCard(pickCard());
  ui.flipBtn.textContent = 'Flip Card';
});

ui.irrelevantBtn.addEventListener('click', () => {
  if (!state.currentCard) return;
  addFeedback(state.currentCard.topic, 'irrelevant');
  showCard(pickCard());
  ui.flipBtn.textContent = 'Flip Card';
});

ui.clearBtn.addEventListener('click', clearSavedCards);

renderSavedCards();
