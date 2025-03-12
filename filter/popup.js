document.addEventListener('DOMContentLoaded', () => {
    const keywordsTextarea = document.getElementById('keywords');
    const blockShortsCheckbox = document.getElementById('block-shorts');
    const blockUrlCheckbox = document.getElementById('block-url');
    const saveButton = document.getElementById('save');
    const channelurltextArea = document.getElementById('channelId');

    // Load saved preferences and populate the controls
    chrome.storage.sync.get(['keywords', 'blockShorts', 'blockUrl', 'channelIds'], (result) => {
        keywordsTextarea.value = (result.keywords || []).join('\n');
        blockShortsCheckbox.checked = result.blockShorts || false;
        blockUrlCheckbox.checked = result.blockUrl || false;
        channelurltextArea.value = (result.channelIds || []).join('\n')
    });

    // Save preferences on button click
    saveButton.addEventListener('click', () => {
        const keywords = keywordsTextarea.value.trim().split('\n').filter(keyword => keyword.length > 0);
        const blockShorts = blockShortsCheckbox.checked;
        const blockUrl = blockUrlCheckbox.checked;
        const channelIds = channelurltextArea.value.trim().split('\n').filter(channel => channel.length > 0);

        chrome.storage.sync.set({ keywords, blockShorts, blockUrl, channelIds }, () => {
            alert('Preferences saved!');
        });
    });
});
