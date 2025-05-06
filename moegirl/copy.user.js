// ==UserScript==
// @name         moegirl copy
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  moegirl copy
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zh.moegirl.org.cn
// @author       lolion1y
// @match        *://*.moegirl.org.cn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    document.addEventListener('copy', function (event) { event.stopPropagation(); }, true);
})();