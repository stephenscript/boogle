let input: HTMLInputElement | null = null;

const mount = () => {
    const versionTag = document.getElementById('version');
    versionTag!.innerText = 'v' + getVersion();
    let enabled = true;
    chrome.storage.sync.get(null, (config) => {
        if (config && Object.keys(config).length > 0) {
            enabled = config['udm14'];
        } else {
            console.log('Initial load. Boogle settings set as default.');
        }
        input = document.querySelector('input#udm14') as HTMLInputElement;
        input?.addEventListener('click', () => toggle('udm14'));
        input.checked = enabled;

        const logo = document.getElementById('logo') as HTMLImageElement;
        logo.src = enabled ? 'icons/icon128.png' : 'icons/icon128-dull.png';
    });
};

function toggle(item: string) {
    // Send a message to the background script with additional properties
    chrome.runtime.sendMessage(
        {
            data: {
                type: 'toggle',
                item: item,
            },
        },
        function (response) {
            const enabled = response;
            const logo = document.getElementById('logo') as HTMLImageElement;
            logo.src = enabled ? 'icons/icon128.png' : 'icons/icon128-dull.png';
        },
    );
}

function getVersion(): string {
    const manifest = chrome.runtime.getManifest();
    return manifest.version;
}

document.addEventListener('DOMContentLoaded', mount);
