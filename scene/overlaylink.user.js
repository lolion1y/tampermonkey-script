// ==UserScript==
// @name         Scene APK Direct Download
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Add overlay transparent links for APK files on Scene download page
// @author       lolion1y
// @match        *://download.omarea.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function extractFolderFromUrl(url) {
        const match = url.match(/[?&]folder=([^&]+)/);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function addOverlayLinks() {
        const folderName = extractFolderFromUrl(window.location.href);
        if (!folderName) return;
        const baseUrl = `https://download.omarea.com/${folderName}`;

        // find all version container divs
        const versionDivs = document.querySelectorAll('div.download-versions > div.version');
        versionDivs.forEach(versionDiv => {
            const existingLink = versionDiv.querySelector('a.overlay-link');
            const nameDiv = versionDiv.querySelector('div.name');
            if (!nameDiv) return;
            const fileName = nameDiv.textContent.trim();

            // process APK files
            if (fileName.endsWith('.apk')) {
                if (existingLink) return;

                // create transparent overlay link
                const encodedFileName = encodeURIComponent(fileName);
                const fullUrl = `${baseUrl}/${encodedFileName}`;
                const overlayLink = document.createElement('a');
                overlayLink.href = fullUrl;
                overlayLink.className = 'overlay-link';
                overlayLink.style.cssText = `position: absolute; inset: 0; z-index: 10; opacity: 0; cursor: pointer;`;
                overlayLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    versionDiv.click();
                });

                // append link div
                versionDiv.style.position = 'relative';
                versionDiv.appendChild(overlayLink);
            } else {
                // remove overlay link for non-APK file
                if (existingLink) {
                    existingLink.remove();
                    versionDiv.removeAttribute('style');
                }
            }
        });
    }

    addOverlayLinks()
    const observer = new MutationObserver(addOverlayLinks);
    observer.observe(document.body, { childList: true, subtree: true });
})();