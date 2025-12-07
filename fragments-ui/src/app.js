// src/app.js
import { signIn, getUser, signOut } from './auth';
import {
  createFragment,
  deleteFragment,
  updateFragment,
  getApiBaseUrl,
  getUserFragments,
} from './api';

const selectors = {};
let currentUser = null;

const mapSelectors = () => {
  selectors.userSection = document.querySelector('#user');
  selectors.loginBtn = document.querySelector('#login');
  selectors.logoutBtn = document.querySelector('#logout');
  selectors.controlsSection = document.querySelector('#controls');
  selectors.fragmentsSection = document.querySelector('#fragments-section');
  selectors.fragmentsList = document.querySelector('#fragments-list');
  selectors.form = document.querySelector('#fragment-form');
  selectors.contentField = document.querySelector('#fragment-content');
  selectors.fileField = document.querySelector('#fragment-file');
  selectors.typeField = document.querySelector('#fragment-type');
  selectors.feedback = document.querySelector('#feedback');
  selectors.locationInfo = document.querySelector('#location-info');
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

    const actions = document.createElement('div');
    actions.className = 'fragment-actions';

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => openFragment(fragment.id));
    actions.appendChild(viewBtn);

    if (fragment.type === 'text/markdown') {
      const htmlBtn = document.createElement('button');
      htmlBtn.type = 'button';
      htmlBtn.textContent = 'View HTML';
      htmlBtn.addEventListener('click', () => openFragment(fragment.id, 'html'));
      actions.appendChild(htmlBtn);
    }

    if (fragment.type.startsWith('image/')) {
      const jpegBtn = document.createElement('button');
      jpegBtn.type = 'button';
      jpegBtn.textContent = 'View JPEG';
      jpegBtn.addEventListener('click', () => openFragment(fragment.id, 'jpg'));
      actions.appendChild(jpegBtn);
    }

    if (fragment.type.startsWith('text/') || fragment.type === 'application/json') {
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        const currentContent = prompt('Enter new content for this fragment:');
        if (currentContent === null) return;
        const type = fragment.type;
        let payload = currentContent;
        if (type === 'application/json') {
          try {
            payload = JSON.stringify(JSON.parse(currentContent));
          } catch (err) {
            setFeedback(`Invalid JSON: ${err.message}`, 'error');
            return;
          }
        }
        editBtn.disabled = true;
        setFeedback(`Updating fragment ${fragment.id}…`, 'info');
        try {
          await updateFragment(currentUser, fragment.id, payload, type);
          const { fragments: updated } = await getUserFragments(currentUser);
          renderFragments(updated, apiBaseUrl);
          setFeedback(`Fragment ${fragment.id} updated.`, 'success');
        } catch (err) {
          setFeedback(`Unable to update fragment: ${err.message}`, 'error');
        } finally {
          editBtn.disabled = false;
        }
      });
      actions.appendChild(editBtn);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      if (!currentUser) return;
      deleteBtn.disabled = true;
      setFeedback(`Deleting fragment ${fragment.id}…`, 'info');
      try {
        await deleteFragment(currentUser, fragment.id);
        const { fragments: updated } = await getUserFragments(currentUser);
        renderFragments(updated, apiBaseUrl);
        setFeedback(`Fragment ${fragment.id} deleted.`, 'success');
      } catch (err) {
        setFeedback(`Unable to delete fragment: ${err.message}`, 'error');
      } finally {
        deleteBtn.disabled = false;
      }
    });
    actions.appendChild(deleteBtn);

    item.appendChild(link);
    item.appendChild(meta);
    item.appendChild(actions);
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
    updateLocationInfo('');
    setFeedback('');
  }
};

const updateLocationInfo = (location) => {
  if (!selectors.locationInfo) return;
  if (!location) {
    selectors.locationInfo.hidden = true;
    selectors.locationInfo.innerHTML = '';
    return;
  }
  selectors.locationInfo.hidden = false;
  const link = document.createElement('a');
  link.href = location;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = location;
  selectors.locationInfo.innerHTML = 'Last fragment Location: ';
  selectors.locationInfo.appendChild(link);
};

const openFragment = async (fragmentId, extension = '') => {
  if (!currentUser) {
    setFeedback('Unable to view fragment: not authenticated', 'error');
    return;
  }

  try {
    const suffix = extension ? `.${extension}` : '';
    const targetUrl = new URL(`/v1/fragments/${fragmentId}${suffix}`, getApiBaseUrl());
    const response = await fetch(targetUrl, {
      headers: currentUser.authorizationHeaders(extension === 'html' ? 'text/html' : undefined),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type') || '';
    const isImage = contentType.startsWith('image/');
    const body = isImage ? await response.blob() : await response.text();
    const viewer = window.open('', '_blank');
    if (isImage) {
      const url = URL.createObjectURL(body);
      viewer.document.write(`<img src="${url}" alt="fragment image" />`);
      viewer.document.close();
    } else if (extension === 'html' || contentType.startsWith('text/html')) {
      viewer.document.write(body);
      viewer.document.close();
    } else {
      viewer.document.write(`<pre style="white-space: pre-wrap">${body}</pre>`);
      viewer.document.close();
    }
  } catch (error) {
    setFeedback(`Unable to load fragment: ${error.message}`, 'error');
  }
};

async function init() {
  mapSelectors();

  if (selectors.apiBase) {
    selectors.apiBase.textContent = getApiBaseUrl();
  }

  selectors.loginBtn?.addEventListener('click', () => signIn());
  selectors.logoutBtn?.addEventListener('click', () => signOut());
  selectors.typeField?.addEventListener('change', (event) => {
    if (!selectors.contentField) return;
    const type = event.target.value;
    const isImage = type.startsWith('image/');
    // toggle inputs
    if (selectors.contentField) {
      selectors.contentField.disabled = isImage;
      selectors.contentField.placeholder = isImage
        ? 'Select an image file below'
        : 'Type some text and submit to create a fragment';
    }
    if (selectors.fileField) {
      selectors.fileField.disabled = !isImage;
      if (!isImage) selectors.fileField.value = '';
    }

    if (type === 'application/json') {
      selectors.contentField.placeholder = 'Enter valid JSON (e.g., {"hello":"world"})';
    } else if (type === 'text/markdown') {
      selectors.contentField.placeholder = 'Enter Markdown (e.g., # Title)';
    } else {
      selectors.contentField.placeholder = 'Type some text and submit to create a fragment';
    }
  });

  const user = await getUser();
  if (!user) {
    toggleAuthenticatedUI(false);
    return;
  }
  currentUser = user;

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

    const typeField = selectors.typeField;
    const type = typeField?.value || 'text/plain';
    const isImage = type.startsWith('image/');
    let payload = content;

    if (isImage) {
      const fileInput = selectors.fileField;
      const file = fileInput?.files?.[0];
      if (!file) {
        setFeedback('Please select an image file to upload.', 'warn');
        return;
      }
      payload = await file.arrayBuffer();
    } else {
      if (!content) {
        setFeedback('Please enter some text before submitting.', 'warn');
        return;
      }
      if (type === 'application/json') {
        try {
          payload = JSON.stringify(JSON.parse(content));
        } catch (error) {
          setFeedback(`Invalid JSON: ${error.message}`, 'error');
          return;
        }
      }
    }

    const submitBtn = selectors.form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setFeedback('Creating fragment…', 'info');
    try {
      const { fragment, location } = await createFragment(user, payload, type);
      setFeedback(
        `Fragment ${fragment.id} created! ${location ? `Location: ${location}` : ''}`,
        'success'
      );
      updateLocationInfo(location);
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
