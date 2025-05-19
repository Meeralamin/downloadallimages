// Function to add download buttons to all images on the page
function addDownloadButtons() {
  // Part 1: Handle regular img elements
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Skip already processed images
    if (img.dataset.downloadAdded) return;
    
    // Skip images with no source or data URIs
    if (!img.src || img.src.startsWith('data:')) return;
    
    // Accept all images regardless of size
    // Remove size restriction to catch more images
    
    // Mark as processed
    img.dataset.downloadAdded = 'true';
    
    // Add download button
    addDownloadButtonToImage(img, img.src);
  });
  
  // Part 2: Find all elements with background images
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(el => {
    // Skip already processed elements or download buttons themselves
    if (el.dataset.bgDownloadAdded || el.classList.contains('img-download-btn')) return;
    
    // Get computed style
    const style = window.getComputedStyle(el);
    
    // Check if element has background image
    if (style.backgroundImage && style.backgroundImage !== 'none') {
      // Extract URL from background-image property
      const bgUrl = style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
      
      // Skip data URIs
      if (!bgUrl || bgUrl.startsWith('data:')) return;
      
      // Accept all background images regardless of size
      // Remove size restriction
      
      // Mark as processed
      el.dataset.bgDownloadAdded = 'true';
      
      // Add download button for background image
      addDownloadButtonToBgElement(el, bgUrl);
    }
  });
}

// Helper function to add download button to regular images
function addDownloadButtonToImage(img, imgSrc) {
  // Create download button
  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'img-download-btn img-hover-btn';
  downloadBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  `;
  downloadBtn.title = 'Download Image';
  downloadBtn.href = imgSrc;
  downloadBtn.download = getImageFilename(imgSrc);
  
  // Add button directly to body for absolute positioning
  document.body.appendChild(downloadBtn);
  
  // Position button over image
  positionButtonOverImage(downloadBtn, img);
  
  // Reposition on window resize
  window.addEventListener('resize', () => {
    positionButtonOverImage(downloadBtn, img);
  });
  
  // Reposition on scroll
  window.addEventListener('scroll', () => {
    positionButtonOverImage(downloadBtn, img);
  });
}

// Helper function to add download button to elements with background images
function addDownloadButtonToBgElement(el, bgUrl) {
  // Create download button
  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'img-download-btn bg-image-btn';
  downloadBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  `;
  downloadBtn.title = 'Download Background Image';
  downloadBtn.href = bgUrl;
  downloadBtn.download = getImageFilename(bgUrl);
  
  // Ensure element has relative positioning
  const elStyle = window.getComputedStyle(el);
  if (elStyle.position === 'static') {
    el.style.position = 'relative';
  }
  
  // Add button to element
  el.appendChild(downloadBtn);
  
  // Position button in top-right corner
  downloadBtn.style.position = 'absolute';
  downloadBtn.style.top = '10px';
  downloadBtn.style.right = '10px';
  downloadBtn.style.zIndex = '99999'; // Increased z-index
  downloadBtn.style.opacity = '1'; // Always visible
  
  // Setup behavior (now just a placeholder function)
  setupHoverBehavior(el, downloadBtn);
}

// Helper function to setup hover behavior
function setupHoverBehavior(element, button) {
  // Make button always visible instead of only on hover
  button.style.opacity = '1';
  
  // Remove hover events since buttons should always be visible
  // We're keeping the function for compatibility but changing its behavior
}

// Helper function to position button over image
function positionButtonOverImage(button, img) {
  const rect = img.getBoundingClientRect();
  
  // Only position if the image is visible
  if (rect.width === 0 || rect.height === 0) return;
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  // Position in the top-right corner with some padding
  button.style.position = 'fixed';
  button.style.top = (rect.top + 10) + 'px';
  button.style.left = (rect.left + rect.width - 40) + 'px';
  button.style.zIndex = '2147483647'; // Maximum z-index value
  button.style.opacity = '1'; // Always visible
  button.style.pointerEvents = 'auto'; // Ensure clickable
}

// Helper function to extract filename from URL
function getImageFilename(url) {
  const urlParts = url.split('/');
  let filename = urlParts[urlParts.length - 1];
  
  // Remove query parameters if any
  if (filename.includes('?')) {
    filename = filename.split('?')[0];
  }
  
  // If no extension, add .jpg
  if (!filename.includes('.')) {
    filename += '.jpg';
  }
  
  return filename || 'image.jpg';
}

// Check if extension is enabled for current domain before adding buttons
function checkDomainAndAddButtons() {
  const currentDomain = window.location.hostname;
  
  chrome.storage.sync.get(['disabledDomains'], function(result) {
    const disabledDomains = result.disabledDomains || [];
    
    // If domain is not in disabled list, add buttons
    if (!disabledDomains.includes(currentDomain)) {
      addDownloadButtons();
    }
  });
}

// Run more frequently to catch all images
setTimeout(checkDomainAndAddButtons, 500);
setTimeout(checkDomainAndAddButtons, 1000);
setTimeout(checkDomainAndAddButtons, 2000);
setInterval(checkDomainAndAddButtons, 3000); // Run every 3 seconds

// Use MutationObserver to handle dynamically loaded images
const observer = new MutationObserver(mutations => {
  // Check if any new images or elements with background images were added
  const hasNewImages = mutations.some(mutation => {
    return Array.from(mutation.addedNodes).some(node => {
      // Check if node is an image
      if (node.nodeName === 'IMG') return true;
      
      // Check if node contains images
      if (node.nodeType === 1 && node.querySelector('img')) return true;
      
      // Check if node has background image
      if (node.nodeType === 1) {
        try {
          const style = window.getComputedStyle(node);
          return style.backgroundImage && style.backgroundImage !== 'none';
        } catch (e) {
          return false;
        }
      }
      
      return false;
    });
  });
  
  if (hasNewImages) {
    setTimeout(checkDomainAndAddButtons, 200);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Re-run when page is fully loaded
window.addEventListener('load', () => {
  setTimeout(checkDomainAndAddButtons, 1000);
});

// Re-run after a longer delay to catch lazy-loaded images
setTimeout(checkDomainAndAddButtons, 3000);

// Re-run periodically to catch slider changes and late-loading content
setInterval(checkDomainAndAddButtons, 5000);










