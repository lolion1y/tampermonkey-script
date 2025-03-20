// ==UserScript==
// @name         moegirl copy
// @namespace    http://tampermonkey.net/
// @version      0.721
// @description  moegirl copy
// @author       lolion1y
// @match        *://*.moegirl.org.cn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    document.addEventListener('copy', function (event) { event.stopPropagation(); }, true);

})();