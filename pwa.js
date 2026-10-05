/* Installation support; Buddy's existing interaction stays in index.html. */
(() => {
  const release = 'wrb-20261004-02';
  const button = document.getElementById('installWRB');
  const status = document.getElementById('installStatus');
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
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      window.__wrbInstallPrompt = null;
      button.classList.add('hidden');
      showStatus(choice.outcome === 'accepted'
        ? 'Installation requested. When it finishes, open the WRB icon in your apps.'
        : 'Installation cancelled. You can keep using Buddy here.');
    } catch (_) {
      showStatus('Installation did not finish. You can keep using Buddy here.');
    } finally { button.disabled = false; }
  });
  window.addEventListener('appinstalled', () => {
    window.__wrbInstallPrompt = null;
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
