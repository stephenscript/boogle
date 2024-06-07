/* removeAI.js

- Improve search results on Google Search page

*/

class Boogle {
    callback: (() => void) | null;

    constructor() {
        this.callback = null;
    }

    private getAnchor = (): Element | null => {
        let anchorElement = null;

        anchorElement = document.querySelector(
            'div[data-al="AI overview is ready"]',
        );

        if (!anchorElement) {
            anchorElement = document.querySelector(
                'path[d = "M235.5 471C235.5 438.423 229.22 407.807 216.66 379.155C204.492 350.503 187.811 325.579 166.616 304.384C145.421 283.189 120.498 266.508 91.845 254.34C63.1925 241.78 32.5775 235.5 0 235.5C32.5775 235.5 63.1925 229.416 91.845 217.249C120.498 204.689 145.421 187.811 166.616 166.616C187.811 145.421 204.492 120.497 216.66 91.845C229.22 63.1925 235.5 32.5775 235.5 0C235.5 32.5775 241.584 63.1925 253.751 91.845C266.311 120.497 283.189 145.421 304.384 166.616C325.579 187.811 350.503 204.689 379.155 217.249C407.807 229.416 438.423 235.5 471 235.5C438.423 235.5 407.807 241.78 379.155 254.34C350.503 266.508 325.579 283.189 304.384 304.384C283.189 325.579 266.311 350.503 253.751 379.155C241.584 407.807 235.5 438.423 235.5 471Z"]',
            );
        }

        if (!anchorElement) {
            return null;
        }

        return anchorElement;
    };

    private getNthParent = (
        element: Element | null,
        n = 0,
    ): HTMLElement | Element | null => {
        let curr = element;

        while (curr && n > 0) {
            curr = curr.parentElement;
            n -= 1;
        }

        return curr;
    };

    private removeAI = () => {
        const anchor = this.getAnchor();

        if (anchor) {
            const aiElement = this.getNthParent(anchor, 10);
            if (aiElement) {
                aiElement.remove();

                console.log('Elements removed.');

                chrome.runtime.sendMessage(
                    { action: 'displayCount', data: { blockedCount: 1 } },
                    (response) => {},
                );

                this.dismount();
            }
        }
    };

    private removeAIElementsOnLoad = () => {
        this.callback = this.removeAI;
        document.addEventListener('load', this.callback, { capture: true });
    };

    private getIsParamLoaded = (url: string, key: string, value: string) => {
        const queryParams = new URLSearchParams(url);
        return queryParams.get(key) === value;
    };

    private handleLoadedMessage = () => {
        const isLoaded = this.getIsParamLoaded(
            window.location.href,
            'udm',
            '14',
        );

        if (isLoaded) {
            console.log('Boogle loaded.');
        } else {
            // console.log('Boogle failed to load.');
        }
    };

    public mount = () => {
        document.addEventListener('DOMContentLoaded', this.handleLoadedMessage);
    };

    private dismount = () => {
        if (this.callback) {
            // document.removeEventListener('DOMContentLoaded', this.callback, {capture: true});
            document.removeEventListener('load', this.callback, {
                capture: true,
            });
            console.log('Boogle dismounted.');
        }
    };
}

const boogle = new Boogle();
boogle.mount();
