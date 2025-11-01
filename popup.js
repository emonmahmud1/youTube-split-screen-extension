// Popup script for YouTube Split Screen Extension

const toggleSwitch = document.getElementById('toggleSwitch');
const statusDiv = document.getElementById('status');

// Load saved state
chrome.storage.sync.get(['splitEnabled'], function(result) {
  const isEnabled = result.splitEnabled !== false;
  toggleSwitch.checked = isEnabled;
  updateStatus(isEnabled);
});

// Handle toggle
toggleSwitch.addEventListener('change', function() {
  const isEnabled = this.checked;
  
  // Save state
  chrome.storage.sync.set({ splitEnabled: isEnabled });
  
  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggle',
        enabled: isEnabled
      }).catch(() => {});
    }
  });
  
  updateStatus(isEnabled);
});

function updateStatus(isEnabled) {
  if (isEnabled) {
    statusDiv.textContent = '✅ Split Screen Enabled';
    statusDiv.className = 'status enabled';
  } else {
    statusDiv.textContent = '❌ Split Screen Disabled';
    statusDiv.className = 'status disabled';
  }
}
