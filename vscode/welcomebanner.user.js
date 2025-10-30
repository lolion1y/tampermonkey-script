// ==UserScript==
// @name         Disable VSCode web welcome banner
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Put the welcome banner dismissed flag
// @author       lolion1y
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vscode.dev
// @match        *://*.vscode.dev/*
// @match        *://*.github.dev/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const request = indexedDB.open('vscode-web-state-db-global');

    request.onupgradeneeded = function(event) {
        event.target.result.createObjectStore('ItemTable');
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['ItemTable'], 'readwrite');
        const objectStore = transaction.objectStore('ItemTable');
        objectStore.put('true', 'workbench.banner.welcome.dismissed')
    };
})();