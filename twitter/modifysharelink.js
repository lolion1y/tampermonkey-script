// ==UserScript==
// @name         X to Twitter
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Replace `x` to `twitter` when sharing links
// @author       lolion1y
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://tweetdeck.twitter.com/*
// @match        https://x.com/*
// @match        https://*.x.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const convertUrl = (url) => {
        const regex = /^(https?:\/\/)?((?:www\.)?x\.com\/)([\w-]+\/status\/\d+)(\?.*)?$/;
        return url.replace(regex, 'https://twitter.com/$3');
    };

    const copyTextToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            console.log('URL converted and copied successfully:', text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    document.addEventListener('copy', function (e) {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.includes('x.com')) {
            e.preventDefault();
            const convertedUrl = convertUrl(selectedText);
            copyTextToClipboard(convertedUrl);
        }
    }, true);

})();