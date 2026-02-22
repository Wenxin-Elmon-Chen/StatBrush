const topicCatalog = {
  'survival analysis': {
    interviewFocus: 'clinical trials and oncology studies',
    templates: [
      {
        question: 'In {focus}, when would you pick Kaplan-Meier over life-table methods?',
        answer:
          'Kaplan-Meier is preferred when exact event times are known and censoring occurs continuously. It updates survival estimates at each event time.',
      },
      {
        question: 'A Cox model in {focus} gives HR={hr}. How do you explain it to a hiring manager?',
        answer:
          'An HR of {hr} means the instantaneous event rate is about {(hrReduction)} lower in the treatment group, assuming proportional hazards.',
      },
      {
        question: 'What quick checks would you mention for proportional hazards assumptions in {focus}?',
        answer:
          'State you would inspect Schoenfeld residual trends, log-log survival curves, and time interaction terms to verify hazards are approximately proportional.',
      },
    ],
  },
  inference: {
    interviewFocus: 'A/B testing and endpoint analysis',
    templates: [
      {
        question: 'For {focus}, how do you differentiate statistical significance from clinical significance?',
        answer:
          'Statistical significance addresses signal vs noise under assumptions; clinical significance addresses whether the effect size is meaningful in practice.',
      },
      {
        question: 'When presenting {focus}, why include confidence intervals in addition to p-values?',
        answer:
          'Confidence intervals communicate the plausible effect range and precision, while p-values alone do not show magnitude or direction uncertainty.',
      },
      {
        question: 'In {focus}, what risk appears if you test many subgroup hypotheses without correction?',
        answer:
          'False positives inflate quickly; mention controlling FDR or family-wise error and pre-specifying key hypotheses.',
      },
    ],
  },
  'study design': {
    interviewFocus: 'phase II/III trial planning',
    templates: [
      {
        question: 'In {focus}, what inputs are essential for a sample-size calculation?',
        answer:
          'Specify alpha, target power, expected effect size, variance/event assumptions, allocation ratio, and attrition expectations.',
      },
      {
        question: 'How do Type I and Type II errors translate to business risk in {focus}?',
        answer:
          'Type I can promote ineffective interventions; Type II can miss effective ones. Both have cost, ethical, and timeline implications.',
      },
      {
        question: 'Why do interviewers care about endpoint hierarchy in {focus}?',
        answer:
          'Hierarchy protects error rates and clarifies interpretation when multiple primary/secondary endpoints are analyzed.',
      },
    ],
  },
  regression: {
    interviewFocus: 'real-world evidence projects',
    templates: [
      {
        question: 'In {focus}, how would you explain an adjusted odds ratio of {orValue}?',
        answer:
          'It means the odds of outcome are about {(orPercent)} higher in the exposed group after controlling for included covariates.',
      },
      {
        question: 'What interview-ready checks improve logistic model credibility in {focus}?',
        answer:
          'Mention calibration, influential points, multicollinearity checks, and validation metrics like AUC with confidence intervals.',
      },
      {
        question: 'When would you choose Poisson/negative binomial instead of logistic in {focus}?',
        answer:
          'Use count models when outcome is event counts over exposure time rather than binary yes/no outcomes.',
      },
    ],
  },
  'causal inference': {
    interviewFocus: 'observational healthcare datasets',
    templates: [
      {
        question: 'For {focus}, how do you briefly define confounding in an interview?',
        answer:
          'A confounder influences both exposure and outcome, creating biased associations unless controlled by design or adjustment.',
      },
      {
        question: 'In {focus}, when are propensity score methods useful?',
        answer:
          'They are useful for balancing observed covariates between groups via matching, weighting, or stratification before outcome modeling.',
      },
      {
        question: 'What limitation would you disclose for causal claims from {focus}?',
        answer:
          'Unmeasured confounding can remain, so sensitivity analyses and careful causal assumptions should be stated explicitly.',
      },
    ],
  },
  'data quality': {
    interviewFocus: 'biomarker and EHR pipelines',
    templates: [
      {
        question: 'In {focus}, how would you distinguish MCAR, MAR, and MNAR quickly?',
        answer:
          'MCAR is unrelated to data, MAR depends on observed variables, MNAR depends on unobserved values; MNAR needs stronger assumptions.',
      },
      {
        question: 'Why is complete-case analysis risky in {focus}?',
        answer:
          'It can reduce power and introduce bias when missingness is associated with predictors or outcomes.',
      },
      {
        question: 'What is a practical interview answer for handling missingness in {focus}?',
        answer:
          'Use multiple imputation under MAR assumptions, include predictors of missingness, and compare against sensitivity analyses.',
      },
    ],
  },
};

const storageKeys = {
  feedback: 'biostat-feedback',
  saved: 'biostat-saved-cards',
  queue: 'biostat-question-queue',
  counter: 'biostat-question-counter',
};

const state = {
  currentCard: null,
  isBackVisible: false,
  feedbackByTopic: loadFromStorage(storageKeys.feedback, {}),
  savedCards: loadFromStorage(storageKeys.saved, []),
  questionQueue: loadFromStorage(storageKeys.queue, []),
  questionCounter: loadFromStorage(storageKeys.counter, 0),
};

const ui = {
  questionText: document.getElementById('questionText'),
  answerText: document.getElementById('answerText'),
  flashcard: document.getElementById('flashcard'),
  feedbackStatus: document.getElementById('feedbackStatus'),
  newCardBtn: document.getElementById('newCardBtn'),
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
  localStorage.setItem(storageKeys.queue, JSON.stringify(state.questionQueue));
  localStorage.setItem(storageKeys.counter, JSON.stringify(state.questionCounter));
}

function topicWeight(topic) {
  const feedback = state.feedbackByTopic[topic] || { relevant: 0, irrelevant: 0 };
  const baseWeight = 1;
  const penalty = feedback.irrelevant * 0.55;
  const reward = feedback.relevant * 0.2;
  return Math.max(0.2, baseWeight + reward - penalty);
}

function weightedTopicPick() {
  const topics = Object.keys(topicCatalog);
  const weighted = topics.map((topic) => ({ topic, weight: topicWeight(topic) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);

  let threshold = Math.random() * total;
  for (const item of weighted) {
    threshold -= item.weight;
    if (threshold <= 0) return item.topic;
  }

  return topics[0];
}

function tokenValues() {
  const hr = (0.55 + Math.random() * 0.4).toFixed(2);
  const hrReduction = `${Math.round((1 - Number(hr)) * 100)}%`;
  const orValue = (1.2 + Math.random() * 1.4).toFixed(2);
  const orPercent = `${Math.round((Number(orValue) - 1) * 100)}%`;
  return { hr, hrReduction, orValue, orPercent };
}

function fillTemplate(text, topic) {
  const data = { ...tokenValues(), focus: topicCatalog[topic].interviewFocus };
  return text.replaceAll('{focus}', data.focus)
    .replaceAll('{hr}', data.hr)
    .replaceAll('{hrReduction}', data.hrReduction)
    .replaceAll('{orValue}', data.orValue)
    .replaceAll('{orPercent}', data.orPercent);
}

function generateQuestion(topic) {
  const topicInfo = topicCatalog[topic];
  const template = topicInfo.templates[Math.floor(Math.random() * topicInfo.templates.length)];

  state.questionCounter += 1;
  return {
    id: `q-${state.questionCounter}`,
    topic,
    question: fillTemplate(template.question, topic),
    answer: fillTemplate(template.answer, topic),
  };
}

function generateBatch(size = 8) {
  const batch = [];
  for (let index = 0; index < size; index += 1) {
    batch.push(generateQuestion(weightedTopicPick()));
  }
  state.questionQueue.push(...batch);
  persistState();
}

function getNextCard() {
  if (state.questionQueue.length === 0) {
    generateBatch();
  }

  const next = state.questionQueue.shift();
  persistState();
  return next;
}

function showCard(card) {
  state.currentCard = card;
  state.isBackVisible = false;
  ui.flashcard.classList.remove('is-flipped');

  ui.questionText.textContent = `${card.question} (${card.topic})`;
  ui.answerText.textContent = card.answer;

  [ui.saveBtn, ui.relevantBtn, ui.irrelevantBtn].forEach((button) => {
    button.disabled = false;
  });
}

function flipCard() {
  if (!state.currentCard) return;
  state.isBackVisible = !state.isBackVisible;
  ui.flashcard.classList.toggle('is-flipped', state.isBackVisible);
}

function addFeedback(topic, type) {
  if (!state.feedbackByTopic[topic]) {
    state.feedbackByTopic[topic] = { relevant: 0, irrelevant: 0 };
  }

  state.feedbackByTopic[topic][type] += 1;
  persistState();
}

function recordFeedback(type) {
  if (!state.currentCard) return;
  addFeedback(state.currentCard.topic, type);

  const message =
    type === 'relevant'
      ? `Marked as relevant. We'll recommend more ${state.currentCard.topic} cards.`
      : `Marked as irrelevant. We'll recommend fewer ${state.currentCard.topic} cards.`;

  ui.feedbackStatus.textContent = message;
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
  showCard(getNextCard());
  ui.feedbackStatus.textContent = '';
});


ui.flashcard.addEventListener('click', flipCard);
ui.flashcard.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    flipCard();
  }
});
ui.saveBtn.addEventListener('click', saveCurrentCard);
ui.relevantBtn.addEventListener('click', () => recordFeedback('relevant'));
ui.irrelevantBtn.addEventListener('click', () => recordFeedback('irrelevant'));
ui.clearBtn.addEventListener('click', clearSavedCards);

renderSavedCards();
