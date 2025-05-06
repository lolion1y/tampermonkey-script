// ==UserScript==
// @name         Disable twitter vibrate
// @namespace    http://tampermonkey.net/
// @version      0721
// @description  Disable twitter vibrate for mobile
// @author       lolion1y
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    if (navigator.vibrate) {
        navigator.vibrate = function () { };
    }
})();
