/* Installation support; Buddy's existing interaction stays in index.html. */
(() => {
  const android = /Android/i.test(navigator.userAgent);
  const button = document.getElementById('installWRB');
  const status = document.getElementById('installStatus');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  button.classList.remove('hidden');
  button.textContent = android ? 'Install / download Android app' : 'Install Waiting Room Buddy';
  button.addEventListener('click', () => {
    if (android) { location.assign('/android-install.html'); return; }
    status.textContent = 'Use this browser’s Install or Add to Home Screen command. On iPhone or iPad, open WRB in Safari and choose Share, then Add to Home Screen.';
    status.classList.remove('hidden');
  });
  if ('serviceWorker' in navigator) window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      await registration.update();
    } catch (_) { /* Online Buddy and Android downloads remain available. */ }
  });
})();