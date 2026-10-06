/* Installation support; Buddy's existing interaction stays in index.html. */
(() => {
  const release = 'wrb-20261006-06';
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
      button.textContent = window.__wrbInstallPrompt ? 'Install Waiting Room Buddy' : 'Install WRB';
      button.classList.remove('hidden');
      showStatus(window.__wrbInstallPrompt ? 'Waiting Room Buddy is ready to install.' : 'Install WRB on this device.');
    }
  }
  window.__wrbShowInstall = refresh;
  button.addEventListener('click', async () => {
    if (/Android/i.test(navigator.userAgent)) {
      location.assign('/android-install.html');
      return;
    }
    if (button.textContent === 'Check installation again') return;
    const prompt = window.__wrbInstallPrompt;
    if (!prompt) {
      if (/Android/i.test(navigator.userAgent)) {
        showStatus('Android has not offered the automatic installer. Open WRB from Chrome, then use Chrome’s Install app or Add to Home screen command.');
      } else {
        showStatus('This browser has not offered automatic installation. Use its Install or Add to Home Screen command.');
      }
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
      } catch (_) { showStatus('App setup could not finish. Buddy is still available in this browser.'); }
    });
  }
  const details = document.createElement('details');
  details.className = 'small';
  const summary = document.createElement('summary');
  summary.textContent = 'App installation check';
  const report = document.createElement('p');
  report.style.whiteSpace = 'pre-line';
  details.append(summary, report);
  document.querySelector('main').append(details);
  details.addEventListener('toggle', async () => {
    if (!details.open) return;
    const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration().catch(() => null) : null;
    report.textContent = [
      'Version: ' + release,
      'Secure connection: ' + (window.isSecureContext ? 'yes' : 'no'),
      'Launch mode: ' + (standalone() ? 'standalone app' : 'browser'),
      'Browser offers installation: ' + (window.__wrbInstallPrompt ? 'yes' : 'not currently'),
      'App helper: ' + (registration && registration.active ? 'active' : 'not active yet'),
      'Android: ' + (/Android/i.test(navigator.userAgent) ? 'yes' : 'no')
    ].join('\n');
  });
  refresh();
})();
