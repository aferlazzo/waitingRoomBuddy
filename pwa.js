/* Installation support; Buddy's existing interaction stays in index.html. */
(() => {
  const android = /Android/i.test(navigator.userAgent);
  const button = document.getElementById('installWRB');
  const status = document.getElementById('installStatus');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  let installAttempt = 0;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const showStatus = text => { status.textContent = text; status.classList.remove('hidden'); };
  function refresh() {
    if (standalone()) {
      button.classList.add('hidden');
      showStatus('Waiting Room Buddy is running as an app.');
    } else {
      button.disabled = false;
      button.textContent = android ? 'Download Android app' : 'Install Waiting Room Buddy';
      button.classList.remove('hidden');
      if (android) showStatus('Install the Android app, then reopen it from the Waiting Room Buddy icon in your apps.');
      else status.classList.add('hidden');
    }
  }
  window.__wrbShowInstall = refresh;
  button.addEventListener('click', async () => {
    if (android) {
      location.assign('/android-install.html');
      return;
    }
    if (button.textContent === 'Check installation again') return;
    const prompt = window.__wrbInstallPrompt;
    if (!prompt) {
      showStatus('To install WRB, use this browser’s Install or Add to Home Screen command. On iPhone or iPad, open WRB in Safari and choose Share, then Add to Home Screen.');
      return;
    }
    button.disabled = true;
    showStatus('Opening the browser’s installation confirmation…');
    const attempt = ++installAttempt;
    let timer;
    try {
      const result = await Promise.race([
        (async () => {
          await prompt.prompt();
          return await prompt.userChoice;
        })(),
        new Promise(resolve => {
          timer = setTimeout(() => resolve({ outcome: 'timeout' }), 8000);
        })
      ]);
      if (attempt !== installAttempt) return;
      window.__wrbInstallPrompt = null;
      if (result.outcome === 'accepted') {
        button.classList.add('hidden');
        showStatus('Installation requested. When it finishes, open the WRB icon in your apps.');
      } else if (result.outcome === 'timeout') {
        button.classList.remove('hidden');
        button.textContent = 'Check installation again';
        showStatus('The browser has not returned an installation result. If a confirmation is open, finish it there. Otherwise, tap Check installation again to reload WRB and request a fresh installation offer.');
      } else {
        button.classList.remove('hidden');
        button.textContent = 'Check installation again';
        showStatus('Installation cancelled. Tap Check installation again when you want to retry.');
      }
    } catch (_) {
      window.__wrbInstallPrompt = null;
      button.textContent = 'Check installation again';
      showStatus('The browser could not open installation. Tap Check installation again to request a fresh offer.');
    } finally {
      clearTimeout(timer);
      button.disabled = false;
    }
  });
  button.addEventListener('click', () => {
    if (button.textContent === 'Check installation again' && !button.disabled) location.reload();
  });
  window.addEventListener('appinstalled', () => {
    ++installAttempt;
    window.__wrbInstallPrompt = null;
    button.disabled = false;
    button.classList.add('hidden');
    showStatus('Waiting Room Buddy was installed. Open the WRB icon in your apps.');
  });
  window.matchMedia('(display-mode: standalone)').addEventListener('change', refresh);
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
        await registration.update();
      } catch (_) { /* Online Buddy and Android downloads remain available. */ }
    });
  }
  refresh();
})();
