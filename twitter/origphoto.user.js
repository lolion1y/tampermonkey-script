// ==UserScript==
// @name         Twitter original images
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  View original quality images.
// @author       lolion1y
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://pbs.twimg.com/media/*
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const config = {
        fullsize: true,
        preview: false
    }

    if (config.fullsize || config.preview) {

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
            if (config.fullsize) {
                const images = target.querySelectorAll('img');
                images.forEach((image) => {
                    const originUrl = getOriginUrl(image.src);
                    if (originUrl && image.src !== originUrl) {
                        image.src = originUrl;
                    }
                });
            }

            if (config.preview) {
                const divs = target.querySelectorAll('div');
                divs.forEach((div) => {
                    const backgroundImage = div.style.backgroundImage.match(/url\(([^)]+)\)/);
                    const originalUrl = getOriginUrl(backgroundImage ? backgroundImage[1] : '');
                    if (originalUrl) {
                        div.style.backgroundImage = `url(${originalUrl})`;
                    }
                });
            }
        };

        const observer = new MutationObserver(() => {
            replaceImageUrls(document);
        });

        observer.observe(document.body, { childList: true, subtree: true });

        replaceImageUrls(document);
    };
})();
