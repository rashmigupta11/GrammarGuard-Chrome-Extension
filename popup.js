document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('toggleBtn');
  const statusText = document.querySelector('.status strong');

  // Load current state
  chrome.storage.local.get(['enabled'], (result) => {
    const isEnabled = result.enabled !== false; // Default to true
    updateUI(isEnabled);
  });

  btn.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
      const newState = !(result.enabled !== false);
      chrome.storage.local.set({ enabled: newState });
      updateUI(newState);
      
      // Reload current tab to apply changes
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if(tabs[0]) chrome.tabs.reload(tabs[0].id);
      });
    });
  });

  function updateUI(enabled) {
    statusText.textContent = enabled ? 'Active' : 'Disabled';
    statusText.style.color = enabled ? 'green' : 'red';
    btn.textContent = enabled ? 'Disable Extension' : 'Enable Extension';
  }
});