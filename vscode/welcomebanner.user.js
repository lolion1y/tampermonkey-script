// ==UserScript==
// @name         Disable VSCode web welcome banner
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Put the welcome banner dismissed flag on first visit
// @author       lolion1y
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vscode.dev
// @match        *://*.vscode.dev/*
// @match        *://*.github.dev/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const DB_NAME = 'vscode-web-state-db-global';
    const STORE_NAME = 'ItemTable';
    const KEY = 'workbench.banner.welcome.dismissed';

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async function checkFlagExists(db) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const getRequest = store.get(KEY);
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async function writeDismissedFlag() {
        try {
            const db = await openDB();

            // check if the flag is already exists
            const exists = await checkFlagExists(db);
            if (exists === "true") {
                console.log('Welcome banner dismissed flag already exists. No action needed.');
                db.close();
                return;
            }

            // put the flag
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put("true", KEY);

            return new Promise((resolve, reject) => {
                tx.oncomplete = () => {
                    db.close();
                    console.log('Welcome banner dismissed flag put successfully. Banner will not show.');
                    resolve();
                };
                tx.onerror = () => {
                    db.close();
                    console.error('Failed to write welcome banner dismissed flag:', tx.error);
                    reject(tx.error);
                };
            });
        } catch (e) {
            console.error('IndexedDB operation failed:', e);
        }
    }

    // after the page loads
    window.addEventListener('load', () => {
        writeDismissedFlag();
    });
})();
