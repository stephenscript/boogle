// === Classes ===

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
class Settings {
    public config: { [key: string]: boolean };
    constructor() {
        // default values
        this.config = {
            udm14: true,
        };
    }

    private saveSettings = () => {
        chrome.storage.sync.set(this.config, () => {
            console.log('Boogle settings saved: ', this.config);
        });
    };

    private loadSettings = () => {
        chrome.storage.sync.get(null, (config) => {
            if (config && Object.keys(config).length > 0) {
                this.config = config;
                console.log('Boogle settings loaded: ', this.config);
            } else {
                console.log('Initial load. Boogle settings set as default.');
            }
        });
    };

    private clearSettings = () => {
        chrome.storage.sync.clear(function () {
            if (chrome.runtime.lastError) {
                console.error(
                    'Error clearing settings:',
                    chrome.runtime.lastError,
                );
            } else {
                console.log('All Boogle settings cleared.');
            }
        });
    };

    public set = (key: string, value: any) => {
        this.config[key] = value;
        this.saveSettings();
    };

    public toggle = (key: string) => {
        this.config[key] = !this.config[key];
        this.saveSettings();
    };

    public initialize = () => {
        this.loadSettings();
    };
}

const main = () => {
    // === Initialize app ===
    const icon = new Icon();
    const browser = new Browser();
    const settings = new Settings();
    settings.initialize();
    icon.isActive = settings.config['udm'];

    // === Listeners ===

    function onTabChange(url: string = '', tabId: number) {
        if (!settings.config['udm14']) {
            return;
        }

        const isGoogleSearch = browser.getIsGoogleSearch(url);
        icon.toggleActive(isGoogleSearch);
    }

    chrome.tabs.onActivated.addListener((activeInfo) => {
        chrome.tabs.get(activeInfo.tabId, function (tab) {
            onTabChange(tab.url, activeInfo.tabId);
        });
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (!tab.id) {
            return;
        }

        chrome.tabs.query(
            { active: true, windowId: tab.windowId },
            (activeTabs) => {
                if (activeTabs.length > 0 && activeTabs[0].id === tabId) {
                    onTabChange(tab.url, tabId);
                }
            },
        );
    });

    chrome.webNavigation.onBeforeNavigate.addListener((details) => {
        if (details.frameId === 0) {
            const isGoogleSearch = browser.getIsGoogleSearch(details.url);

            if (!isGoogleSearch) {
                return;
            }

            const urlObject = new URL(details.url);
            const params = new URLSearchParams(urlObject.search);

            // Boogle is OFF and site IS NOT udm enabled
            if (!settings.config['udm14'] && !params.get('udm')) {
                return;
            }

            // Boogle is OFF and site IS not udm enabled
            if (!settings.config['udm14'] && params.get('udm')) {
                const updatedUrl = browser.removeQueryParam(details.url, 'udm');

                // Redirect to the modified URL
                if (updatedUrl !== details.url) {
                    chrome.tabs.update(details.tabId, { url: updatedUrl });
                }
                return;
            }

            // Boogle is ON but site IS udm enabled
            if (params.get('udm')) {
                return;
            }

            // Boogle is ON and site IS NOT udm enabled
            // Append &udm=14 to all Google searches
            const updatedUrl = browser.addQueryParam(details.url, 'udm', '14');

            // Redirect to the modified URL
            if (updatedUrl !== details.url) {
                chrome.tabs.update(details.tabId, { url: updatedUrl });
            }
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
            console.log('Boogle toggled.');
            settings.toggle(item);
            sendResponse(settings.config[item]);

            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    if (tabs.length > 0) {
                        const url = tabs[0].url;

                        if (url?.startsWith('https://www.google.com/search?')) {
                            icon.toggleActive(settings.config[item]);
                            let updatedUrl = '';
                            if (!settings.config[item]) {
                                updatedUrl = browser.removeQueryParam(
                                    url,
                                    'udm',
                                );
                            } else {
                                updatedUrl = browser.addQueryParam(
                                    url,
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
            sendResponse(settings.config[item]);
        }
    });
};

main();
