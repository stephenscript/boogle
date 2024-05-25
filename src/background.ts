const toggles: { [key: string]: boolean } = {
    udm14: true,
};
// Function to add or update a query parameter in a URL
function addQueryParam(url: string, key: string, value: string): string {
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);

    params.set(key, value);

    // Update the search property of the URL object with the new query parameters
    urlObject.search = params.toString();

    // Return the updated URL
    return urlObject.toString();
}

// Function to add or update a query parameter in a URL
function removeQueryParam(url: string, key: string): string {
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);

    params.delete(key);

    urlObject.search = params.toString();
    return urlObject.toString();
}

function getIsGoogleSearch(url: string = '') {
    return url.startsWith('https://www.google.com/search?');
}

function getHasParam(url: string, key: string, value: string) {
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);

    return params.has(key, value);
}

function setIconActive(isActive: boolean) {
    const iconPath = isActive
        ? '../icons/icon128.png'
        : '../icons/icon128-dull.png';

    chrome.action.setIcon({
        path: {
            '128': iconPath,
        },
    });
}

function onTabChange(url: string = '') {
    if (!toggles['udm14']) {
        return;
    }
    const isGoogleSearch = getIsGoogleSearch(url || '');
    const hasParam = getHasParam(url || '', 'udm', '14');
    setIconActive(isGoogleSearch);

    if (!hasParam) {
        const updatedUrl = addQueryParam(url, 'udm', '14');
        setTimeout(() => chrome.tabs.update({ url: updatedUrl }), 100);
    }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        onTabChange(tab.url);
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    onTabChange(tab.url);
});

// Listen for the onBeforeNavigate event
chrome.webNavigation.onCommitted.addListener((details) => {
    if (!toggles['udm14']) {
        return;
    }

    const isGoogleSearch = getIsGoogleSearch(details.url);

    if (!isGoogleSearch) {
        return;
    }

    const urlObject = new URL(details.url);
    const params = new URLSearchParams(urlObject.search);

    // Add query parameter only if not present
    if (params.get('udm')) {
        return;
    }

    // Append &udm=14 to all Google searches
    const updatedUrl = addQueryParam(details.url, 'udm', '14');

    // Redirect to the modified URL
    if (updatedUrl !== details.url) {
        chrome.tabs.update(details.tabId, { url: updatedUrl });
    }
});

// === From popup.ts ===

// Add an event listener for messages from the popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    const type = message.data.type;
    const item = message.data.item;

    if (type === 'toggle') {
        toggles[item] = !toggles[item];
        sendResponse(toggles[item]);

        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                if (tabs.length > 0) {
                    const url = tabs[0].url;

                    if (url?.startsWith('https://www.google.com/search?')) {
                        setIconActive(toggles[item]);
                        let updatedUrl = '';
                        if (!toggles[item]) {
                            updatedUrl = removeQueryParam(url!, 'udm');
                        } else {
                            updatedUrl = addQueryParam(url!, 'udm', '14');
                        }
                        chrome.tabs.update({ url: updatedUrl });
                    }
                } else {
                    console.error('Unable to get current tab.');
                }
            },
        );
    }

    if (type === 'getToggle') {
        sendResponse(toggles[item]);
    }
});
