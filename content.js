// YouTube Split Screen Extension
(function() {
  'use strict';
  
  let splitEnabled = false;

  chrome.storage.sync.get(['splitEnabled'], (result) => {
    splitEnabled = result.splitEnabled !== false;
    
    if (window.location.pathname.includes('/watch')) {
      setTimeout(() => {
        if (splitEnabled) applySplit();
      }, 1500);
    }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'toggle') {
      splitEnabled = msg.enabled;
      msg.enabled ? applySplit() : removeSplit();
    }
  });

  function applySplit() {
    if (!window.location.pathname.includes('/watch')) return;
    if (document.querySelector('.yt-split-container')) return;
    
    const cols = document.querySelector('#columns');
    const pri = document.querySelector('#primary');
    const sec = document.querySelector('#secondary');
    
    if (!cols || !pri || !sec) {
      setTimeout(applySplit, 500);
      return;
    }
    
    const cont = document.createElement('div');
    cont.className = 'yt-split-container';
    
    const left = document.createElement('div');
    left.className = 'yt-split-left';
    
    const right = document.createElement('div');
    right.className = 'yt-split-right';
    
    cont.appendChild(left);
    cont.appendChild(right);
    
    cols.parentNode.insertBefore(cont, cols);
    cols.style.display = 'none';
    
    left.appendChild(pri);
    right.appendChild(sec);
    
    document.body.classList.add('yt-split-screen-enabled');
    
    let tick = false;
    window.addEventListener('scroll', () => {
      if (!tick) {
        requestAnimationFrame(() => {
          left.classList.toggle('fixed', window.pageYOffset > 0);
          tick = false;
        });
        tick = true;
      }
    }, { passive: true });
  }

  function removeSplit() {
    document.body.classList.remove('yt-split-screen-enabled');
    
    const cont = document.querySelector('.yt-split-container');
    const cols = document.querySelector('#columns');
    
    if (cont && cols) {
      const pri = document.querySelector('#primary');
      const sec = document.querySelector('#secondary');
      
      if (pri && sec) {
        cols.insertBefore(pri, cols.firstChild);
        cols.appendChild(sec);
      }
      
      cont.remove();
      cols.style.display = '';
    }
  }

  let last = location.href;
  new MutationObserver(() => {
    if (location.href !== last) {
      last = location.href;
      if (window.location.pathname.includes('/watch')) {
        setTimeout(() => {
          if (splitEnabled) applySplit();
        }, 1000);
      } else {
        removeSplit();
      }
    }
  }).observe(document, { subtree: true, childList: true });
})();
