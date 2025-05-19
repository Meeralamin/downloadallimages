// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getImages") {
    // Execute script to get all images from the active tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: getAllImages
      }, (results) => {
        if (results && results[0]) {
          sendResponse({images: results[0].result});
        } else {
          sendResponse({images: []});
        }
      });
    });
    return true; // Required for async sendResponse
  }
});

// Function to get all images from the page
function getAllImages() {
  const images = [];
  
  // Get regular images
  document.querySelectorAll('img').forEach(img => {
    if (img.src && img.width > 50 && img.height > 50 && !img.src.startsWith('data:')) {
      images.push({
        src: img.src,
        width: img.width,
        height: img.height,
        alt: img.alt || '',
        filename: getImageFilename(img.src)
      });
    }
  });
  
  // Get background images
  Array.from(document.querySelectorAll('*')).forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.backgroundImage && style.backgroundImage !== 'none' && !el.classList.contains('img-download-btn')) {
      const bgUrl = style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
      if (bgUrl && !bgUrl.startsWith('data:')) {
        images.push({
          src: bgUrl,
          width: el.offsetWidth,
          height: el.offsetHeight,
          alt: 'Background Image',
          filename: getImageFilename(bgUrl)
        });
      }
    }
  });
  
  // Helper function to extract filename
  function getImageFilename(url) {
    const urlParts = url.split('/');
    let filename = urlParts[urlParts.length - 1];
    
    if (filename.includes('?')) {
      filename = filename.split('?')[0];
    }
    
    if (!filename.includes('.')) {
      filename += '.jpg';
    }
    
    return filename || 'image.jpg';
  }
  
  return images;
}