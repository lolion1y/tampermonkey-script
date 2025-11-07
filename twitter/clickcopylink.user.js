// ==UserScript==
// @name         One Click Copy Link Button for Twitter(X)
// @namespace    http://tampermonkey.net/
// @version      2.3.8
// @description  Add a button to copy the URL of a tweet on Twitter without clicking dropdown. Default to twitter but customizable.
// @author       lolion1y
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://tweetdeck.twitter.com/*
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    const config = {
        like: GM_getValue("like", true),
        retweet: GM_getValue("retweet", true)
    };

    GM_registerMenuCommand(`Like (Current: ${config.like ? 'Enabled' : 'Disabled'})`, () => {
        const userConfirm = confirm(`Do you want to ${config.like ? 'disable' : 'enable'} like?
Current: ${config.like ? 'Enabled' : 'Disabled'}`);
        if (userConfirm) {
            config.like = !config.like;
            config.like !== true
                ? GM_setValue('like', config.like)
                : GM_deleteValue('like');
        }
    });

    GM_registerMenuCommand(`Retweet (Current: ${config.retweet ? 'Enabled' : 'Disabled'})`, () => {
        const userConfirm = confirm(`Do you want to ${config.retweet ? 'disable' : 'enable'} retweet?
Current: ${config.retweet ? 'Enabled' : 'Disabled'}`);
        if (userConfirm) {
            config.retweet = !config.retweet;
            config.retweet !== true
                ? GM_setValue('retweet', config.retweet)
                : GM_deleteValue('retweet');
        }
    });

    const baseUrl = 'https://twitter.com';
    const defaultSVG = '<svg class="icon icon-tabler icon-tabler-clipboard" viewBox="0 0 24 24" width="1.25em" height="1.25em" stroke-width="2" stroke="#71767C" fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2 M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /></g></svg>';
    const copiedSVG = '<svg class="icon icon-tabler icon-tabler-clipboard-check" viewBox="0 0 24 24" width="1.25em" height="1.25em" stroke-width="2" stroke="#00abfb" fill="none" stroke-linecap="round" stroke-linejoin="round"><g><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2 M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z M9 14l2 2l4 -4" /></g></svg>';

    function addCopyButtonToTweets() {
        const tweets = document.querySelectorAll('button[data-testid="like"], button[data-testid="unlike"]');

        tweets.forEach(buttonDiv => {
            const parentDiv = buttonDiv.parentElement;
            const tweet = (parentDiv.closest('article[data-testid="tweet"]') || parentDiv.closest('div[role="group"]'));
            if (tweet && !tweet.querySelector('.custom-copy-icon')) {
                const copyIcon = document.createElement('div');
                copyIcon.classList.add('custom-copy-icon');
                copyIcon.setAttribute('aria-label', 'Copy link');
                copyIcon.setAttribute('role', 'button');
                copyIcon.style.cssText = 'display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; transition-duration: 0.2s; cursor: pointer; padding: 0px 16px 0px 8px; margin: 0px -16px 0px -8px;';
                copyIcon.innerHTML = defaultSVG;

                copyIcon.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const tweetUrl = extractTweetUrl(tweet);
                    if (!tweetUrl) return;
                    try {
                        await navigator.clipboard.writeText(tweetUrl)
                        console.log('Tweet link copied!');
                        copyIcon.innerHTML = copiedSVG;
                        if (config.like) {
                            const likeButton = tweet.querySelector('button[data-testid="like"]');
                            if (likeButton) {
                                likeButton.click();
                            }
                        }
                        if (config.retweet) {
                            const retweetButton = tweet.querySelector('button[data-testid="retweet"]');
                            if (tweet.querySelector('button[data-testid="like"]') && retweetButton) {
                                await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 200));
                                retweetButton.click();
                            }
                        }
                    } catch (e) {
                        console.error('Error copying link: ', e);
                    }
                });

                const parentDivClone = parentDiv.cloneNode(true);
                parentDiv.parentNode.insertBefore(parentDivClone, parentDiv.nextSibling);
                parentDivClone.innerHTML = '';
                parentDivClone.appendChild(copyIcon);
            }
        });
    }

    function extractTweetUrl(tweetElement) {

        const linkElement = tweetElement.querySelector('a[href*="/status/"] > time');
        if (linkElement) {
            let url = linkElement.parentElement.getAttribute('href');
            if (!url.startsWith('/')) {
                url = '/' + url;
            }
            url = url.split('/').slice(0, 4).join('/');
            return `${baseUrl}${url}`;
        }

        const fallbackLink = tweetElement.querySelector('a[href*="/status/"]');
        if (fallbackLink) {
            let url = fallbackLink.getAttribute('href');
            if (!url.startsWith('/')) {
                url = '/' + url;
            }
            url = url.split('/').slice(0, 4).join('/');
            return `${baseUrl}${url}`;
        }

        return null;
    }

    const observer = new MutationObserver(addCopyButtonToTweets);
    observer.observe(document.body, { childList: true, subtree: true });

    addCopyButtonToTweets();
})();