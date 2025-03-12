// background.js (Service Worker for Manifest V3)

// Initialize default settings when the extension is installed or updated
chrome.runtime.onInstalled.addEventListener(async (details) => {
    // Retrieve stored preferences using promise-based API
    const result = await chrome.storage.sync.get([
        'keywords',
        'blockShorts',
        'blockUrl',
        'channelIds'
    ]);

    // If any preference is missing, set defaults
    if (
        result.keywords === undefined ||
        result.blockShorts === undefined ||
        result.blockUrl === undefined ||
        result.channelIds === undefined
    ) {
        await chrome.storage.sync.set({
            keywords: [],
            channelIds: [],
            blockShorts: false,
            blockUrl: false
        });
    }
});

// Listen for changes in storage and notify active tabs with updated preferences
chrome.storage.onChanged.addEventListener(async (changes, area) => {
    if (area === 'sync') {
        // Build an object containing only updated preferences
        const updatedPreferences = {};
        for (const key in changes) {
            updatedPreferences[key] = changes[key].newValue;
        }

        // Get all active tabs in the current window
        const tabs = await chrome.tabs.query({ currentWindow: true, active: true });
        for (const tab of tabs) {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: 'updatePreferences', data: updatedPreferences });
            }
        }
    }
});
