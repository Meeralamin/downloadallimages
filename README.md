# Image Downloader Chrome Extension

A powerful Chrome extension that adds download buttons to all images on web pages, allowing for one-click downloading of both regular images and background images.

## Features

- Automatically detects all images on a webpage
- Adds visible download buttons to each image
- Works with both regular `<img>` elements and CSS background images
- Shows a popup with a grid of all images on the current page
- Removes duplicate images based on URL
- Preserves original filenames when downloading
- Handles dynamically loaded images through MutationObserver
- Works across all websites

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and active

## Usage

### In-page Download Buttons

- Browse any website with images
- Blue download buttons will appear on top of all images
- Click any button to download the corresponding image

### Popup Interface

- Click the extension icon in the Chrome toolbar
- A popup will display a grid of all images on the current page
- Click the download button on any image in the grid to save it

## Files Overview

- `manifest.json`: Extension configuration and permissions
- `popup.html`: HTML structure for the extension popup
- `popup.js`: JavaScript for the popup functionality
- `content.js`: Content script that runs on web pages to add download buttons
- `background.js`: Background script for communication between popup and content script
- `styles.css`: Styling for the download buttons

## Technical Details

- Uses Chrome's Scripting API to interact with web pages
- Implements MutationObserver to detect dynamically loaded images
- Positions download buttons using fixed positioning with maximum z-index
- Handles window resize and scroll events to maintain button positioning
- Extracts filenames from image URLs for better download experience

## Permissions

- `activeTab`: Access to the currently active tab
- `scripting`: Ability to execute scripts in web pages

## License

MIT