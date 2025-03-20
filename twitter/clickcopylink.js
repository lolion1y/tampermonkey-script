// ==UserScript==
// @name         One Click Copy Link Button for Twitter(X)
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Add a button to copy the URL of a tweet on Twitter without clicking dropdown. Default to twitter but customizable.
// @author       lolion1y
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @match        https://tweetdeck.twitter.com/*
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const baseUrl = 'https://twitter.com';

    const defaultSVG = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-clipboard" viewBox="0 0 24 24" stroke-width="2" stroke="#71767C" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /></svg>';
    const copiedSVG = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-clipboard-check" viewBox="0 0 24 24" stroke-width="2" stroke="#00abfb" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 14l2 2l4 -4" /></svg>';

    function addCopyButtonToTweets() {
        const tweets = document.querySelectorAll('button[data-testid="like"], button[data-testid="unlike"]');

        tweets.forEach(likeButton => {
            const parentDiv = likeButton.parentElement;
            const tweet = (parentDiv.closest('article[data-testid="tweet"]') || parentDiv.closest('div[role="group"]'));
            if (tweet && !tweet.querySelector('.custom-copy-icon')) {
                const copyIcon = document.createElement('div');
                copyIcon.classList.add('custom-copy-icon');
                copyIcon.setAttribute('aria-label', 'Copy link');
                copyIcon.setAttribute('role', 'button');
                copyIcon.setAttribute('tabindex', '0');
                copyIcon.style.cssText = 'display: flex; align-items: center; justify-content: center; width: 19px; height: 19px; border-radius: 9999px; transition-duration: 0.2s; cursor: pointer;';
                copyIcon.innerHTML = defaultSVG;

                copyIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const tweetUrl = extractTweetUrl(tweet);
                    if (tweetUrl) {
                        navigator.clipboard.writeText(tweetUrl)
                            .then(() => {
                                console.log('Tweet link copied!');
                                copyIcon.innerHTML = copiedSVG;

                                const retweetButton = tweet.querySelector('button[data-testid="retweet"]');
                                const likeButton = tweet.querySelector('button[data-testid="like"]');

                                if (retweetButton) {
                                    retweetButton.click();
                                    console.log('Tweet retweeted!');
                                }

                                if (likeButton) {
                                    likeButton.click();
                                    console.log('Tweet liked!');
                                }
                            })
                            .catch(err => console.error('Error copying link: ', err));
                    }
                });

                const parentDivClone = parentDiv.cloneNode(true);
                parentDivClone.style.cssText = 'display: flex !important; align-items: center;';
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
