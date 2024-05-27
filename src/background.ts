class Icon {
    public isActive: boolean;

    constructor() {
        this.isActive = false;
    }

    public toggleActive(isActive: boolean) {
        const iconPath = isActive
            ? '../icons/icon128.png'
            : '../icons/icon128-dull.png';

        chrome.action.setIcon({
            path: {
                '128': iconPath,
            },
        });
    }
}

class Browser {
    public tabs: Set<number>;
    constructor() {
        this.tabs = new Set();
    }

    public getHasParam = (url: string, key: string, value: string) => {
        const urlObject = new URL(url);
        const params = new URLSearchParams(urlObject.search);

        return params.has(key, value);
    };

    public getIsGoogleSearch = (url: string = '') => {
        return url.startsWith('https://www.google.com/search?');
    };

    public addQueryParam = (
        url: string,
        key: string,
        value: string,
    ): string => {
        const urlObject = new URL(url);
        const params = new URLSearchParams(urlObject.search);

        params.set(key, value);

        // Update the search property of the URL object with the new query parameters
        urlObject.search = params.toString();

        // Return the updated URL
        return urlObject.toString();
    };

    public removeQueryParam = (url: string, key: string): string => {
        const urlObject = new URL(url);
        const params = new URLSearchParams(urlObject.search);

        params.delete(key);

        urlObject.search = params.toString();
        return urlObject.toString();
    };
}

const icon = new Icon();
const browser = new Browser();
const toggles: { [key: string]: boolean } = { udm14: true };

function onTabChange(url: string = '', tabId: number) {
    if (!toggles['udm14']) {
        return;
    }

    const isGoogleSearch = browser.getIsGoogleSearch(url);
    icon.toggleActive(isGoogleSearch);
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        onTabChange(tab.url, tab.id!);
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    onTabChange(tab.url, tab.id!);
});

// Listen for the onBeforeNavigate event
chrome.webNavigation.onCommitted.addListener((details) => {
    if (!toggles['udm14']) {
        return;
    }

    const isGoogleSearch = browser.getIsGoogleSearch(details.url);

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
    const updatedUrl = browser.addQueryParam(details.url, 'udm', '14');

    // Redirect to the modified URL
    if (updatedUrl !== details.url) {
        browser.tabs.add(details.tabId);
        chrome.tabs.update(details.tabId, { url: updatedUrl });
    }
});

// === From popup.ts ===

// Add an event listener for messages from the popup
chrome.runtime.onMessage.addListener(function (
    message: { data: { type: string; item: string } },
    sender,
    sendResponse,
) {
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
                        icon.toggleActive(toggles[item]);
                        let updatedUrl = '';
                        if (!toggles[item]) {
                            updatedUrl = browser.removeQueryParam(url!, 'udm');
                        } else {
                            updatedUrl = browser.addQueryParam(
                                url!,
                                'udm',
                                '14',
                            );
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
