/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d2c5229737f7ad9a259bfb2a2f96ffee"
  }, {
    "url": "pwa-512x512.png",
    "revision": "2e25ee6790778d47125896751ee16118"
  }, {
    "url": "pwa-192x192.png",
    "revision": "90ecbe0f664f899822dc6f5cc53c83dd"
  }, {
    "url": "index.html",
    "revision": "dc4e34233b980292891089464a6a3d23"
  }, {
    "url": "icon.svg",
    "revision": "c374b61fd8fe7c23d74d937fc7a9cd4f"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "df5e88a4d50088260730f9be3b74759f"
  }, {
    "url": "assets/purify.es-V6uLfjnH.js",
    "revision": null
  }, {
    "url": "assets/index.es-KFvFjIn5.js",
    "revision": null
  }, {
    "url": "assets/index-JF8Wvy4D.js",
    "revision": null
  }, {
    "url": "assets/index-Dpuc3Pfe.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "df5e88a4d50088260730f9be3b74759f"
  }, {
    "url": "icon.svg",
    "revision": "c374b61fd8fe7c23d74d937fc7a9cd4f"
  }, {
    "url": "pwa-192x192.png",
    "revision": "90ecbe0f664f899822dc6f5cc53c83dd"
  }, {
    "url": "pwa-512x512.png",
    "revision": "2e25ee6790778d47125896751ee16118"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "d2c5229737f7ad9a259bfb2a2f96ffee"
  }, {
    "url": "manifest.webmanifest",
    "revision": "fdea82dedbab3f571a4aff6d6b737816"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
