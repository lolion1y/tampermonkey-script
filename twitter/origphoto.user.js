// ==UserScript==
// @name         Twitter original images
// @namespace    http://tampermonkey.net/
// @version      1.6-1
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

    const getOrigImgUrl = (imgUrl) => {
        const match = imgUrl.match(/https:\/\/(pbs\.twimg\.com\/media\/[a-zA-Z0-9\-\_]+)(\?format=|\.)(jpg|png|webp)/);
        if (!match || /name=orig/.test(imgUrl)) return null;
        const format = match[3] === 'webp' ? 'jpg' : match[3];
        return `https://${match[1]}.${format}?name=orig`;
    };

    const replaceImgUrl = () => {
        if (config.fullsize) {
            const images = document.querySelectorAll('body [data-testid="tweetPhoto"] img,[data-testid="swipe-to-dismiss"] img');
            images.forEach((image) => {
                const tweetImgUrl = getOrigImgUrl(image.src);
                if (tweetImgUrl && image.src !== tweetImgUrl) {
                    image.src = tweetImgUrl;
                }
            });
        }
        if (config.preview) {
            const tweets = document.querySelectorAll('body [data-testid="tweetPhoto"] > div,[data-testid="swipe-to-dismiss"] > div > div > div > div');
            tweets.forEach((tweet) => {
                const backgroundImage = tweet.style.backgroundImage.match(/url\(([^)]+)\)/);
                const tweetImgUrl = getOrigImgUrl(backgroundImage ? backgroundImage[1] : '');
                if (tweetImgUrl) {
                    tweet.style.backgroundImage = `url(${tweetImgUrl})`;
                }
            });
        }
    };

    const observer = new MutationObserver(() => {
        replaceImgUrl();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    replaceImgUrl();
})();