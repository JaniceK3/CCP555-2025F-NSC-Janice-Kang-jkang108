// src/app.js
import { signIn, getUser, signOut } from './auth';
import { createFragment, getApiBaseUrl, getUserFragments } from './api';

const selectors = {};

const mapSelectors = () => {
  selectors.userSection = document.querySelector('#user');
  selectors.loginBtn = document.querySelector('#login');
  selectors.logoutBtn = document.querySelector('#logout');
  selectors.controlsSection = document.querySelector('#controls');
  selectors.fragmentsSection = document.querySelector('#fragments-section');
  selectors.fragmentsList = document.querySelector('#fragments-list');
  selectors.form = document.querySelector('#fragment-form');
  selectors.contentField = document.querySelector('#fragment-content');
  selectors.feedback = document.querySelector('#feedback');
  selectors.apiBase = document.querySelector('#api-base');
};

const setFeedback = (message, variant = 'info') => {
  if (!selectors.feedback) return;
  selectors.feedback.textContent = message;
  selectors.feedback.dataset.variant = variant;
};

const renderFragments = (fragments, apiBaseUrl) => {
  if (!selectors.fragmentsList) return;
  selectors.fragmentsList.innerHTML = '';
  if (!fragments || fragments.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No fragments yet.';
    selectors.fragmentsList.appendChild(empty);
    return;
  }

  fragments.forEach((fragment) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = new URL(`/v1/fragments/${fragment.id}`, apiBaseUrl);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = fragment.id;

    const meta = document.createElement('div');
    meta.textContent = `${fragment.type} • ${fragment.size} bytes • updated ${new Date(
      fragment.updated
    ).toLocaleString()}`;

    item.appendChild(link);
    item.appendChild(meta);
    selectors.fragmentsList.appendChild(item);
  });
};

const toggleAuthenticatedUI = (isAuthenticated) => {
  if (selectors.userSection) selectors.userSection.hidden = !isAuthenticated;
  if (selectors.controlsSection) selectors.controlsSection.hidden = !isAuthenticated;
  if (selectors.fragmentsSection) selectors.fragmentsSection.hidden = !isAuthenticated;
  if (selectors.loginBtn) selectors.loginBtn.disabled = isAuthenticated;
  if (selectors.logoutBtn) {
    selectors.logoutBtn.disabled = !isAuthenticated;
    selectors.logoutBtn.hidden = !isAuthenticated;
  }
  if (!isAuthenticated) {
    if (selectors.fragmentsList) selectors.fragmentsList.innerHTML = '';
    if (selectors.contentField) selectors.contentField.value = '';
    setFeedback('');
  }
};

async function init() {
  mapSelectors();

  if (selectors.apiBase) {
    selectors.apiBase.textContent = getApiBaseUrl();
  }

  selectors.loginBtn?.addEventListener('click', () => signIn());
  selectors.logoutBtn?.addEventListener('click', () => signOut());

  const user = await getUser();
  if (!user) {
    toggleAuthenticatedUI(false);
    return;
  }

  const usernameEl = selectors.userSection?.querySelector('.username');
  if (usernameEl) {
    usernameEl.textContent = user.username;
  }
  toggleAuthenticatedUI(true);

  selectors.form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const contentField = selectors.contentField;
    if (!contentField) {
      setFeedback('Fragment input not found in the DOM.', 'error');
      return;
    }

    const content = contentField.value.trim();
    if (!content) {
      setFeedback('Please enter some text before submitting.', 'warn');
      return;
    }

    const submitBtn = selectors.form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setFeedback('Creating fragment…', 'info');
    try {
      const { fragment, location } = await createFragment(user, content);
      setFeedback(
        `Fragment ${fragment.id} created! ${location ? `Location: ${location}` : ''}`,
        'success'
      );
      contentField.value = '';
      const { fragments } = await getUserFragments(user);
      renderFragments(fragments, getApiBaseUrl());
    } catch (error) {
      setFeedback(`Unable to create fragment: ${error.message}`, 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  try {
    const { fragments } = await getUserFragments(user);
    renderFragments(fragments, getApiBaseUrl());
    if (!fragments || fragments.length === 0) {
      setFeedback('Create your first fragment above.', 'info');
    } else {
      setFeedback('Fragments loaded.', 'success');
    }
  } catch (error) {
    setFeedback(`Unable to load fragments: ${error.message}`, 'error');
  }
}

addEventListener('DOMContentLoaded', init);
