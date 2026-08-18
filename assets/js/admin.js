'use strict';

  const ADMIN_EMAIL = 'sharpfacerobotics@gmail.com';
  const SITE_CONTENT_ID = 'site-content';
  const CMS_COLLECTION = 'siteContent';
  const CMS_DOC = 'ehs-main';
  const CMS_LOAD_PREFERENCE_KEY = 'ehs-cms-load-enabled';
  const CMS_LOAD_DEFAULT = true;
  const GITHUB_SYNC_ENDPOINT = 'REPLACE_WITH_GITHUB_SYNC_FUNCTION_URL';
  const LAYOUT_CONTAINER_SELECTOR = '.awards, .hero-ctas, .counters, .pillars, .bio-grid, .specs, .features-list, .sponsor-grid, .social-links';
  const LAYOUT_ITEM_SELECTOR = '.award, .btn, .counter, .pillar, .bio-card, .spec-row, .feat, .sponsor-card, .social-link';
  const firebaseConfig = {
    apiKey: "AIzaSyCpjYZZ5ewUBuysfDa-zj9NG4UpyycpM3U",
    authDomain: "sharp-face-robotics-website.firebaseapp.com",
    projectId: "sharp-face-robotics-website",
    storageBucket: "sharp-face-robotics-website.firebasestorage.app",
    messagingSenderId: "721099167616",
    appId: "1:721099167616:web:b12b9b9349878a0fae5365"
  };


  let auth = null;
  let db = null;
  let provider = null;
  let firebaseReady = false;
  let isAdmin = false;
  let editMode = false;
  let activeUserEmail = '';
  let sourceTemplateHtml = '';
  let dragSource = null;
  let cmsLoadEnabled = CMS_LOAD_DEFAULT;
  const adminUi = {};

  function initializeAdminUi() {
    adminUi.modal = document.getElementById('admin-modal');
    adminUi.panel = document.getElementById('admin-panel');
    refreshAdminNavRefs();
    adminUi.close = document.getElementById('admin-close-btn');
    adminUi.status = document.getElementById('admin-status');
    adminUi.login = document.getElementById('admin-login-btn');
    adminUi.edit = document.getElementById('admin-edit-btn');
    adminUi.save = document.getElementById('admin-save-btn');
    adminUi.cmsToggle = document.getElementById('admin-cms-toggle');
    adminUi.signOut = document.getElementById('admin-signout-btn');
    adminUi.commit = document.getElementById('admin-commit-btn');
    adminUi.copy = document.getElementById('admin-copy-btn');

    if (!adminUi.panel || !adminUi.modal || !adminUi.close || !adminUi.login || !adminUi.edit || !adminUi.save || !adminUi.cmsToggle || !adminUi.signOut || !adminUi.commit || !adminUi.copy) {
      return;
    }

    adminUi.login.addEventListener('click', signInAdmin);
    adminUi.close.addEventListener('click', closeAdminModal);
    adminUi.modal.addEventListener('click', event => {
      if (event.target === adminUi.modal) {
        closeAdminModal();
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && adminUi.modal.classList.contains('open')) {
        closeAdminModal();
      }
    });
    adminUi.edit.addEventListener('click', () => {
      setEditMode(!editMode);
      setStatus(editMode ? 'Edit mode enabled.' : 'Edit mode disabled.');
      updateAdminControls();
    });
    adminUi.save.addEventListener('click', saveSiteContent);
    adminUi.cmsToggle.addEventListener('click', toggleCmsLoadPreference);
    adminUi.signOut.addEventListener('click', signOutAdmin);
    adminUi.commit.addEventListener('click', commitToGithub);
    adminUi.copy.addEventListener('click', copyWebsiteCode);
    updateAdminControls();
  }

  function refreshAdminNavRefs() {
    adminUi.navDesktop =
      document.getElementById('admin-nav-trigger') ||
      document.querySelector('.nav-links button[onclick*="openAdminModal"]');
    adminUi.navMobile =
      document.getElementById('admin-nav-trigger-mobile') ||
      document.querySelector('.mobile-menu button[onclick*="openAdminModal"]');
  }

  function updateAdminNavLabels() {
    refreshAdminNavRefs();
    const label = isAdmin ? 'Admin Panel' : 'Admin Login';
    if (adminUi.navDesktop) {
      adminUi.navDesktop.textContent = label;
    }
    if (adminUi.navMobile) {
      adminUi.navMobile.textContent = label;
    }
  }

  function setStatus(message) {
    if (adminUi.status) {
      adminUi.status.textContent = message;
    }
  }

  function isFirebaseConfigured() {
    return Object.values(firebaseConfig).every(value =>
      typeof value === 'string' && value.trim().length > 0 && !value.startsWith('REPLACE_WITH_')
    );
  }

  function isGithubSyncConfigured() {
    return typeof GITHUB_SYNC_ENDPOINT === 'string'
      && GITHUB_SYNC_ENDPOINT.trim().length > 0
      && !GITHUB_SYNC_ENDPOINT.startsWith('REPLACE_WITH_');
  }

  async function initializeFirebase() {
    if (!isFirebaseConfigured()) {
      setStatus('Set Firebase keys in this file to enable secure admin login.');
      updateAdminControls();
      return;
    }

    if (typeof firebase === 'undefined') {
      setStatus('Firebase SDK did not load.');
      updateAdminControls();
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      auth = firebase.auth();
      db = firebase.firestore();
      provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      firebaseReady = true;
      auth.onAuthStateChanged(handleAuthState);
      setStatus('Ready. Sign in as ' + ADMIN_EMAIL + '.');
    } catch (error) {
      console.error('Firebase init error:', error);
      setStatus('Firebase setup failed. Check console.');
    }

    updateAdminControls();
  }

  async function handleAuthState(user) {
    if (!user) {
      isAdmin = false;
      activeUserEmail = '';
      if (editMode) {
        setEditMode(false);
      }
      setStatus(firebaseReady ? 'Not signed in.' : 'Admin auth unavailable.');
      updateAdminControls();
      return;
    }

    const email = (user.email || '').toLowerCase();
    if (email !== ADMIN_EMAIL) {
      setStatus('Access denied for ' + (user.email || 'unknown account') + '.');
      await auth.signOut();
      return;
    }

    isAdmin = true;
    activeUserEmail = email;
    setStatus('Signed in as ' + email + '.');
    updateAdminControls();
  }

  async function signInAdmin() {
    if (!firebaseReady || !auth || !provider) {
      setStatus('Firebase is not configured yet.');
      return;
    }

    try {
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error('Sign-in error:', error);
      setStatus('Sign-in failed. Check console.');
    }
  }

  async function signOutAdmin() {
    if (!auth) {
      return;
    }

    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign-out error:', error);
      setStatus('Sign-out failed. Check console.');
    }
  }

  async function commitToGithub() {
    if (!isAdmin || !auth || !auth.currentUser) {
      setStatus('Sign in as admin before committing.');
      return;
    }

    if (!isGithubSyncConfigured()) {
      setStatus('Set GITHUB_SYNC_ENDPOINT before committing.');
      return;
    }

    const commitInput = window.prompt(
      'Commit message for GitHub:',
      'chore: update website content via admin panel'
    );
    if (commitInput === null) {
      return;
    }

    const commitMessage = commitInput.trim() || 'chore: update website content via admin panel';
    setStatus('Committing to GitHub...');

    try {
      const idToken = await auth.currentUser.getIdToken(true);
      const response = await fetch(GITHUB_SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + idToken
        },
        body: JSON.stringify({
          path: 'index.html',
          commitMessage,
          html: createCommittableHtml()
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'GitHub sync request failed.');
      }

      const shortSha = data.commitSha ? String(data.commitSha).slice(0, 7) : '';
      if (shortSha) {
        setStatus('Committed to GitHub (' + shortSha + ').');
      } else {
        setStatus('Committed to GitHub.');
      }
    } catch (error) {
      console.error('GitHub commit error:', error);
      setStatus('GitHub commit failed. Check function logs.');
    }
  }

  async function copyWebsiteCode() {
    if (!isAdmin) {
      setStatus('Sign in as admin before copying code.');
      return;
    }

    const html = createCommittableHtml();
    if (!html || !html.trim()) {
      setStatus('No content available to copy.');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(html);
        setStatus('Website code copied. Paste into index.html and commit to GitHub.');
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch (error) {
      console.error('Clipboard copy error:', error);
      const copyWindow = window.open('', '_blank');
      if (copyWindow) {
        copyWindow.document.write('<pre style="white-space:pre-wrap;word-break:break-word;">' + html.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
        copyWindow.document.close();
        setStatus('Clipboard blocked. Opened code in a new tab for manual copy.');
      } else {
        setStatus('Clipboard blocked. Allow popups to view and copy the code.');
      }
    }
  }

  function updateAdminControls() {
    updateAdminNavLabels();

    if (!adminUi.panel) {
      return;
    }

    adminUi.login.disabled = isAdmin || !firebaseReady;
    adminUi.edit.disabled = !isAdmin;
    adminUi.save.disabled = !isAdmin;
    adminUi.signOut.disabled = !isAdmin;
    adminUi.commit.disabled = !isAdmin || !isGithubSyncConfigured();
    adminUi.copy.disabled = !isAdmin;
    adminUi.edit.textContent = editMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
    adminUi.cmsToggle.textContent = 'Use Firebase Content: ' + (cmsLoadEnabled ? 'On' : 'Off');
  }

  function getCmsLoadPreference() {
    try {
      const storedValue = window.localStorage.getItem(CMS_LOAD_PREFERENCE_KEY);
      if (storedValue === 'true') {
        return true;
      }
      if (storedValue === 'false') {
        return false;
      }
    } catch (error) {
      console.warn('Could not read CMS load preference:', error);
    }
    return CMS_LOAD_DEFAULT;
  }

  function setCmsLoadPreference(enabled) {
    cmsLoadEnabled = Boolean(enabled);
    try {
      window.localStorage.setItem(CMS_LOAD_PREFERENCE_KEY, cmsLoadEnabled ? 'true' : 'false');
    } catch (error) {
      console.warn('Could not save CMS load preference:', error);
    }
    updateAdminControls();
  }

  function toggleCmsLoadPreference() {
    const nextState = !cmsLoadEnabled;
    setCmsLoadPreference(nextState);
    if (nextState) {
      setStatus('Firebase content loading enabled. Reload to pull content from Firestore.');
      return;
    }
    setStatus('Firebase content loading disabled. Reload to use index.html content, then click Save Changes.');
  }

  function getSiteContentRoot() {
    return document.getElementById(SITE_CONTENT_ID);
  }

  function setEditMode(enabled) {
    if (!isAdmin && enabled) {
      return;
    }

    const root = getSiteContentRoot();
    if (!root) {
      return;
    }

    editMode = enabled;
    document.body.classList.toggle('edit-mode', enabled);
    applyTextEditingState(root, enabled);
    applyImageEditingState(root, enabled);
    applyLayoutEditingState(root, enabled);
  }

  function applyTextEditingState(root, enabled) {
    const inlineTags = new Set(['SPAN', 'STRONG', 'B', 'EM', 'SMALL', 'I', 'U', 'BR']);
    const candidates = Array.from(root.querySelectorAll('*')).filter(el => {
      if (el.closest('svg')) {
        return false;
      }
      if (['IMG', 'SVG', 'PATH', 'SCRIPT', 'STYLE', 'A', 'BUTTON'].includes(el.tagName)) {
        return false;
      }
      if (!el.textContent || !el.textContent.trim()) {
        return false;
      }
      const children = Array.from(el.children);
      if (!children.length) {
        return true;
      }
      return children.every(child => inlineTags.has(child.tagName));
    });

    candidates.forEach(el => {
      el.classList.toggle('admin-editable-text', enabled);
      if (enabled) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      } else {
        el.removeAttribute('contenteditable');
        el.removeAttribute('spellcheck');
      }
    });
  }

  function applyImageEditingState(root, enabled) {
    root.querySelectorAll('img').forEach(image => {
      image.classList.toggle('admin-editable-image', enabled);
      image.title = enabled ? 'Double-click to replace image source' : '';
    });

    if (root.dataset.imageEditorBound !== 'true') {
      root.addEventListener('dblclick', event => {
        if (!editMode || !isAdmin) {
          return;
        }

        const image = event.target.closest('img');
        if (!image) {
          return;
        }

        event.preventDefault();
        const nextSrc = window.prompt('Enter a new image URL or local path:', image.getAttribute('src') || '');
        if (nextSrc === null) {
          return;
        }

        const trimmedSrc = nextSrc.trim();
        if (trimmedSrc.length) {
          image.setAttribute('src', trimmedSrc);
        }

        const nextAlt = window.prompt('Enter alt text:', image.getAttribute('alt') || '');
        if (nextAlt !== null) {
          image.setAttribute('alt', nextAlt.trim());
        }
      });
      root.dataset.imageEditorBound = 'true';
    }
  }

  function applyLayoutEditingState(root, enabled) {
    const containers = root.querySelectorAll(LAYOUT_CONTAINER_SELECTOR);
    containers.forEach(container => {
      container.classList.toggle('admin-layout-container', enabled);
      container.removeEventListener('dragover', onLayoutDragOver);
      container.removeEventListener('drop', onLayoutDrop);
      if (enabled) {
        container.addEventListener('dragover', onLayoutDragOver);
        container.addEventListener('drop', onLayoutDrop);
      }

      Array.from(container.children).forEach(child => {
        if (!child.matches(LAYOUT_ITEM_SELECTOR)) {
          return;
        }

        child.classList.toggle('admin-layout-item', enabled);
        child.removeEventListener('dragstart', onLayoutDragStart);
        child.removeEventListener('dragend', onLayoutDragEnd);

        if (enabled) {
          child.setAttribute('draggable', 'true');
          child.addEventListener('dragstart', onLayoutDragStart);
          child.addEventListener('dragend', onLayoutDragEnd);
        } else {
          child.removeAttribute('draggable');
        }
      });
    });
  }

  function onLayoutDragStart(event) {
    if (!editMode) {
      return;
    }

    dragSource = event.currentTarget;
    dragSource.classList.add('admin-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', 'layout-move');
  }

  function onLayoutDragEnd() {
    if (dragSource) {
      dragSource.classList.remove('admin-dragging');
    }
    dragSource = null;
  }

  function onLayoutDragOver(event) {
    if (!editMode || !dragSource) {
      return;
    }

    const container = event.currentTarget;
    if (dragSource.parentElement !== container) {
      return;
    }

    event.preventDefault();
    const afterElement = getDropPosition(container, event.clientY);
    if (!afterElement) {
      container.appendChild(dragSource);
      return;
    }
    if (afterElement !== dragSource) {
      container.insertBefore(dragSource, afterElement);
    }
  }

  function onLayoutDrop(event) {
    if (!editMode) {
      return;
    }
    event.preventDefault();
  }

  function getDropPosition(container, y) {
    const draggableElements = [...container.querySelectorAll('.admin-layout-item:not(.admin-dragging)')];
    let closest = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    draggableElements.forEach(item => {
      const box = item.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closestOffset) {
        closestOffset = offset;
        closest = item;
      }
    });

    return closest;
  }

  async function saveSiteContent() {
    if (!isAdmin || !db) {
      setStatus('Sign in as admin before saving.');
      return;
    }

    const root = getSiteContentRoot();
    if (!root) {
      return;
    }

    setStatus('Saving changes...');
    try {
      const html = createPersistedMarkup(root);
      await db.collection(CMS_COLLECTION).doc(CMS_DOC).set({
        html,
        updatedBy: activeUserEmail || ADMIN_EMAIL,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      setStatus('Changes saved for all visitors.');
    } catch (error) {
      console.error('Save error:', error);
      setStatus('Save failed. Check console and Firestore permissions.');
    }
  }

  function removeEmptyClassAttributes(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.querySelectorAll('[class]').forEach(el => {
      const className = (el.getAttribute('class') || '').trim();
      if (!className) {
        el.removeAttribute('class');
      }
    });
  }

  function normalizeAdminNavButtons(root) {
    if (!root || !root.querySelector) {
      return;
    }

    const navDesktop =
      root.querySelector('#admin-nav-trigger') ||
      root.querySelector('.nav-links button[onclick*="openAdminModal"]');
    if (navDesktop) {
      navDesktop.id = 'admin-nav-trigger';
      navDesktop.textContent = 'Admin Login';
    }

    const navMobile =
      root.querySelector('#admin-nav-trigger-mobile') ||
      root.querySelector('.mobile-menu button[onclick*="openAdminModal"]');
    if (navMobile) {
      navMobile.id = 'admin-nav-trigger-mobile';
      navMobile.textContent = 'Admin Login';
    }
  }

  function cleanSiteRootForExport(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.removeAttribute('data-image-editor-bound');
    root.querySelectorAll('.admin-editable-text').forEach(el => el.classList.remove('admin-editable-text'));
    root.querySelectorAll('.admin-editable-image').forEach(el => {
      el.classList.remove('admin-editable-image');
      if (el.getAttribute('title') === 'Double-click to replace image source') {
        el.removeAttribute('title');
      }
    });
    root.querySelectorAll('.admin-layout-item').forEach(el => el.classList.remove('admin-layout-item'));
    root.querySelectorAll('.admin-layout-container').forEach(el => el.classList.remove('admin-layout-container'));
    root.querySelectorAll('.admin-dragging').forEach(el => el.classList.remove('admin-dragging'));
    root.querySelectorAll('.reveal.vis').forEach(el => el.classList.remove('vis'));
    root.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    root.querySelectorAll('[spellcheck]').forEach(el => el.removeAttribute('spellcheck'));
    root.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
    const mobileMenu = root.querySelector('#mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
    }

    const tilt = root.querySelector('#tilt');
    if (tilt) {
      tilt.removeAttribute('style');
      tilt.removeAttribute('data-tilt-bound');
    }

    root.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const homePage = root.querySelector('#page-home');
    if (homePage) {
      homePage.classList.add('active');
    }

    normalizeAdminNavButtons(root);
    removeEmptyClassAttributes(root);
  }

  function sanitizeLoadedRuntimeState(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.removeAttribute('data-image-editor-bound');
    root.querySelectorAll('.reveal.vis').forEach(el => el.classList.remove('vis'));
    root.querySelectorAll('img[title="Double-click to replace image source"]').forEach(el => el.removeAttribute('title'));
    const tilt = root.querySelector('#tilt');
    if (tilt) {
      tilt.removeAttribute('data-tilt-bound');
      tilt.removeAttribute('style');
    }
  }

  function mergeTemplateAdditions(targetRoot, templateRoot) {
    if (!targetRoot || !templateRoot || !targetRoot.querySelector || !templateRoot.querySelector) {
      return false;
    }

    let changed = false;

    function syncNavFromTemplate(navSelector) {
      const targetNav = targetRoot.querySelector(navSelector);
      const sourceNav = templateRoot.querySelector(navSelector);
      if (!targetNav || !sourceNav) {
        return;
      }

      if (targetNav.innerHTML !== sourceNav.innerHTML) {
        targetNav.innerHTML = sourceNav.innerHTML;
        changed = true;
      }
    }

    syncNavFromTemplate('.nav-links');
    syncNavFromTemplate('.mobile-menu');

    function addPageFromTemplate(pageId, insertBeforeSelector) {
      if (targetRoot.querySelector('#' + pageId)) {
        return;
      }

      const sourcePage = templateRoot.querySelector('#' + pageId);
      if (sourcePage) {
        const pageClone = sourcePage.cloneNode(true);
        const insertBeforePage = targetRoot.querySelector(insertBeforeSelector);
        if (insertBeforePage && insertBeforePage.parentNode) {
          insertBeforePage.parentNode.insertBefore(pageClone, insertBeforePage);
        } else {
          targetRoot.appendChild(pageClone);
        }
        changed = true;
      }
    }

    addPageFromTemplate('page-robot', '#page-ai, #page-sponsors, #page-contact');

    return changed;
  }

  function enforceCurrentSitePolicy(targetRoot, templateRoot) {
    if (!targetRoot || !templateRoot) {
      return;
    }

    targetRoot.querySelectorAll('#page-support, [data-page="support"]').forEach(el => el.remove());
    targetRoot.querySelectorAll('.bio-roles .role-badge').forEach(el => {
      const allowedRoles = ['mechanical', 'software', 'outreach', 'leadership'];
      if (!allowedRoles.some(role => el.classList.contains(role))) {
        el.remove();
      }
    });

    [
      '#page-home .hero-sub',
      '#page-home .awards',
      '#page-home .team-grid',
      '#page-team .team-grid',
      '#page-sponsors .sponsor-intro',
      '#page-sponsors .sponsor-cta-p'
    ].forEach(selector => {
      const current = targetRoot.querySelector(selector);
      const approved = templateRoot.querySelector(selector);
      if (current && approved) {
        current.replaceWith(approved.cloneNode(true));
      }
    });

    const contactEmail = 'contact30450@gmail.com';
    targetRoot.querySelectorAll('#email-text, #email-text-page').forEach(el => {
      el.textContent = contactEmail;
    });
  }

  function createPersistedMarkup(root) {
    const clone = root.cloneNode(true);
    cleanSiteRootForExport(clone);
    return clone.innerHTML;
  }

  function createCommittableHtml() {
    const sourceDoc = sourceTemplateHtml
      ? new DOMParser().parseFromString(sourceTemplateHtml, 'text/html')
      : null;
    const docClone = sourceDoc ? sourceDoc.documentElement : document.documentElement.cloneNode(true);

    if (!sourceDoc) {
      docClone.querySelectorAll('script[src*="apis.google.com"], script[gapi_processed]').forEach(el => el.remove());
      docClone.querySelectorAll('iframe[src*="/__/auth/iframe"], iframe[id^="I0_"], iframe[name^="I0_"]').forEach(el => el.remove());
    }

    const currentRoot = getSiteContentRoot();
    const siteRootClone = docClone.querySelector('#' + SITE_CONTENT_ID);
    if (currentRoot && siteRootClone) {
      const cleanRoot = currentRoot.cloneNode(true);
      cleanSiteRootForExport(cleanRoot);
      siteRootClone.innerHTML = cleanRoot.innerHTML;
    }

    const bodyClone = docClone.querySelector('body');
    if (bodyClone) {
      bodyClone.classList.remove('edit-mode');
    }

    const modalClone = docClone.querySelector('#admin-modal');
    if (modalClone) {
      modalClone.classList.remove('open');
      modalClone.setAttribute('aria-hidden', 'true');
    }

    const navDesktopClone = docClone.querySelector('#admin-nav-trigger');
    if (navDesktopClone) {
      navDesktopClone.textContent = 'Admin Login';
    }
    const navMobileClone = docClone.querySelector('#admin-nav-trigger-mobile');
    if (navMobileClone) {
      navMobileClone.textContent = 'Admin Login';
    }
    const statusClone = docClone.querySelector('#admin-status');
    if (statusClone) {
      statusClone.textContent = 'Not signed in.';
    }
    const editClone = docClone.querySelector('#admin-edit-btn');
    if (editClone) {
      editClone.textContent = 'Enter Edit Mode';
      editClone.setAttribute('disabled', '');
    }
    const saveClone = docClone.querySelector('#admin-save-btn');
    if (saveClone) {
      saveClone.setAttribute('disabled', '');
    }
    const signOutClone = docClone.querySelector('#admin-signout-btn');
    if (signOutClone) {
      signOutClone.setAttribute('disabled', '');
    }
    const commitClone = docClone.querySelector('#admin-commit-btn');
    if (commitClone) {
      commitClone.setAttribute('disabled', '');
    }
    const copyClone = docClone.querySelector('#admin-copy-btn');
    if (copyClone) {
      copyClone.setAttribute('disabled', '');
    }
    const loginClone = docClone.querySelector('#admin-login-btn');
    if (loginClone) {
      loginClone.removeAttribute('disabled');
    }

    normalizeAdminNavButtons(docClone);
    removeEmptyClassAttributes(docClone);
    return '<!DOCTYPE html>\n' + docClone.outerHTML;
  }

  async function cacheSourceTemplate() {
    if (sourceTemplateHtml) {
      return;
    }

    try {
      const sourceUrl = window.location.origin + window.location.pathname;
      const response = await fetch(sourceUrl, { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      sourceTemplateHtml = await response.text();
    } catch (error) {
      console.warn('Could not cache source template:', error);
    }
  }

  async function loadSiteContent() {
    if (!db) {
      return;
    }

    const root = getSiteContentRoot();
    if (!root) {
      return;
    }

    try {
      const snapshot = await db.collection(CMS_COLLECTION).doc(CMS_DOC).get();
      if (!snapshot.exists) {
        return;
      }

      const data = snapshot.data();
      if (data && typeof data.html === 'string' && data.html.trim().length > 0) {
        const templateRoot = root.cloneNode(true);
        const loadedRoot = document.createElement('div');
        loadedRoot.innerHTML = data.html;
        mergeTemplateAdditions(loadedRoot, templateRoot);
        enforceCurrentSitePolicy(loadedRoot, templateRoot);

        root.innerHTML = loadedRoot.innerHTML;
        sanitizeLoadedRuntimeState(root);
        updateAdminNavLabels();
      }
    } catch (error) {
      console.error('Load error:', error);
      setStatus('Could not load saved content from Firestore.');
    }
  }

  async function bootstrap() {
    if (typeof window.renderTeamBios === 'function') {
      window.renderTeamBios();
    }
    setCmsLoadPreference(getCmsLoadPreference());
    initializeAdminUi();
    await cacheSourceTemplate();
    await initializeFirebase();
    if (cmsLoadEnabled) {
      await loadSiteContent();
    } else {
      console.info('Firestore content load skipped by preference.');
    }
    if (typeof window.renderTeamBios === 'function') {
      window.renderTeamBios();
    }
    initRevealObserver();
    initTilt();
    setActiveNavLink('home');
  }

  bootstrap();
