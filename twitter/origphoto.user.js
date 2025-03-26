// ==UserScript==
// @name         Twitter original images
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  View original quality images.
// @author       lolion1y
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://pbs.twimg.com/media/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const defaultconfig = {
        fullsize: true,
        preview: false
    };

    const config = {
        fullsize: GM_getValue("fullsize", defaultconfig.fullsize),
        preview: GM_getValue("preview", defaultconfig.preview)
    };

    GM_registerMenuCommand(`Fullsize (Current: ${config.fullsize ? 'Enabled' : 'Disabled'})`, () => {
        const userConfirm = confirm(`Do you want to ${config.fullsize ? 'disable' : 'enable'} fullsize?
Current: ${config.fullsize ? 'Enabled' : 'Disabled'}`);
        if (userConfirm) {
            config.fullsize = !config.fullsize;
            if (config.fullsize === defaultconfig.fullsize) {
                GM_deleteValue('fullsize');
            } else {
                GM_setValue('fullsize', config.fullsize);
            }
        }
    });

    GM_registerMenuCommand(`Preview (Current: ${config.preview ? 'Enabled' : 'Disabled'})`, () => {
        const userConfirm = confirm(`Do you want to ${config.preview ? 'disable' : 'enable'} preview?
Current: ${config.preview ? 'Enabled' : 'Disabled'}`);
        if (userConfirm) {
            config.preview = !config.preview;
            if (config.preview === defaultconfig.preview) {
                GM_deleteValue('preview');
            } else {
                GM_setValue('preview', config.preview);
            }
        }
    });

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
