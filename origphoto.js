// ==UserScript==
// @name         Twitter original images
// @namespace    http://tampermonkey.net/
// @version      0.721
// @description  View original quality images.
// @author       lolion1y
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://pbs.twimg.com/media/*
// ==/UserScript==

(function () {
    'use strict';

    const getOriginUrl = (imgUrl) => {
        const match = imgUrl.match(/https:\/\/(pbs\.twimg\.com\/media\/[a-zA-Z0-9\-\_]+)(\?format=|.)(jpg|jpeg|png|webp)/);
        if (!match) return false;
        const format = match[3] === 'webp' ? 'jpg' : match[3];
        if (match[2] === '?format=' || !/name=orig/.test(imgUrl)) {
            return `https://${match[1]}.${format}?name=orig`;
        }
        return false;
    };

    const replaceImageUrls = (target) => {
        const images = target.querySelectorAll('img');
        images.forEach((image) => {
            const originUrl = getOriginUrl(image.src);
            if (originUrl && image.src !== originUrl) {
                image.src = originUrl;
            }
        });
    };

    const observerCallback = (mutationsList) => {
        const processedNodes = new Set();
        mutationsList.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && !processedNodes.has(node)) {
                    replaceImageUrls(node);
                    processedNodes.add(node);
                }
            });
        });
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(document.body, { childList: true, subtree: true });

    replaceImageUrls(document.body);
})();