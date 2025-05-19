document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('images-container');
  const domainToggle = document.getElementById('domain-toggle');
  const toggleStatus = document.getElementById('toggle-status');
  const currentDomainSpan = document.getElementById('current-domain');
  let currentDomain = '';
  
  // Get current tab's domain
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const url = new URL(tabs[0].url);
    currentDomain = url.hostname;
    currentDomainSpan.textContent = `Current domain: ${currentDomain}`;
    
    // Check if domain is in disabled list
    chrome.storage.sync.get(['disabledDomains'], function(result) {
      const disabledDomains = result.disabledDomains || [];
      domainToggle.checked = !disabledDomains.includes(currentDomain);
      updateToggleStatus();
    });
  });
  
  // Handle domain toggle
  domainToggle.addEventListener('change', () => {
    chrome.storage.sync.get(['disabledDomains'], function(result) {
      let disabledDomains = result.disabledDomains || [];
      
      if (domainToggle.checked) {
        // Enable for this domain (remove from disabled list)
        disabledDomains = disabledDomains.filter(domain => domain !== currentDomain);
      } else {
        // Disable for this domain (add to disabled list)
        if (!disabledDomains.includes(currentDomain)) {
          disabledDomains.push(currentDomain);
        }
      }
      
      // Save updated list
      chrome.storage.sync.set({disabledDomains: disabledDomains}, function() {
        updateToggleStatus();
        
        // Reload current tab to apply changes
        chrome.tabs.reload();
      });
    });
  });
  
  function updateToggleStatus() {
    toggleStatus.textContent = domainToggle.checked ? 
      "Enabled for this domain" : 
      "Disabled for this domain";
  }
  
  // Request images from the active tab
  chrome.runtime.sendMessage({action: "getImages"}, (response) => {
    if (response && response.images && response.images.length > 0) {
      // Create image grid
      const grid = document.createElement('div');
      grid.className = 'image-grid';
      
      // Remove duplicates by URL
      const uniqueImages = removeDuplicates(response.images);
      
      // Add each image to the grid
      uniqueImages.forEach(img => {
        const item = document.createElement('div');
        item.className = 'image-item';
        
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = img.alt;
        imgEl.title = `${img.width}x${img.height}`;
        
        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'download-btn';
        downloadBtn.title = 'Download Image';
        downloadBtn.href = img.src;
        downloadBtn.download = img.filename;
        
        // Create SVG download icon
        downloadBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        `;
        
        item.appendChild(imgEl);
        item.appendChild(downloadBtn);
        grid.appendChild(item);
      });
      
      container.innerHTML = '';
      container.appendChild(grid);
    } else {
      container.innerHTML = '<div class="no-images">No images found on this page</div>';
    }
  });
  
  // Helper function to remove duplicate images
  function removeDuplicates(images) {
    const seen = new Set();
    return images.filter(img => {
      if (seen.has(img.src)) {
        return false;
      }
      seen.add(img.src);
      return true;
    });
  }
});


