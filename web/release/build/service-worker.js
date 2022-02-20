const timestamp = 1645337822321;
const build = [
  "/_app/start-6aacd004.js",
  "/_app/assets/start-f6bd5930.css",
  "/_app/pages/__layout.svelte-0473ec33.js",
  "/_app/assets/pages/__layout.svelte-677051aa.css",
  "/_app/error.svelte-f297c77d.js",
  "/_app/pages/index.svelte-1373ef25.js",
  "/_app/pages/createMatch.svelte-d2d1a218.js",
  "/_app/assets/pages/owner/_id_.svelte-0ee7a395.css",
  "/_app/pages/matches.svelte-33318b33.js",
  "/_app/pages/players.svelte-a0f866b6.js",
  "/_app/pages/player/_id_.svelte-579dd4c9.js",
  "/_app/pages/match/_id_.svelte-118c23c2.js",
  "/_app/pages/owner/_id_.svelte-212215f8.js",
  "/_app/chunks/vendor-c564b019.js",
  "/_app/chunks/paths-28a87002.js",
  "/_app/chunks/config-189b06cb.js",
  "/_app/chunks/stores-5839b29b.js",
  "/_app/chunks/notifications-f6b9b417.js",
  "/_app/chunks/NavButton-5da891c2.js",
  "/_app/chunks/WalletAccess-5297724b.js",
  "/_app/chunks/index-3fc4b8e4.js",
  "/_app/chunks/graphql-126ef292.js"
];
const URLS_TO_PRE_CACHE = build.concat(["/createMatch/","/","/matches/","/owner/0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199/","/player/0/","/player/1/","/player/10/","/player/11/","/player/12/","/player/13/","/player/14/","/player/15/","/player/16/","/player/17/","/player/18/","/player/19/","/player/2/","/player/20/","/player/21/","/player/22/","/player/23/","/player/24/","/player/25/","/player/26/","/player/27/","/player/28/","/player/29/","/player/3/","/player/30/","/player/31/","/player/32/","/player/33/","/player/34/","/player/35/","/player/36/","/player/37/","/player/38/","/player/39/","/player/4/","/player/40/","/player/41/","/player/42/","/player/43/","/player/44/","/player/45/","/player/46/","/player/47/","/player/48/","/player/49/","/player/5/","/player/6/","/player/7/","/player/8/","/player/9/","/players/"]);
const CACHE_NAME = "cache-name" + timestamp;
let _logEnabled = true;
function log(...args) {
  if (_logEnabled) {
    console.debug(...args);
  }
}
self.addEventListener("message", function(event) {
  if (event.data && event.data.type === "debug") {
    _logEnabled = event.data.enabled && event.data.level >= 5;
  } else if (event.data === "skipWaiting") {
    log(`skipWaiting received`);
    self.skipWaiting();
  }
});
const pathname = self.location.pathname;
const base = pathname.substr(0, pathname.length - 18);
const urlsToPreCache = URLS_TO_PRE_CACHE.map((v) => base + v);
const regexesOnlineFirst = [];
{
  regexesOnlineFirst.push("localhost");
}
const regexesOnlineOnly = [];
const regexesCacheFirst = [self.location.origin, "https://rsms.me/inter/", "cdn", ".*\\.png$", ".*\\.svg$"];
const regexesCacheOnly = [];
log(`[Service Worker] Origin: ${self.location.origin}`);
self.addEventListener("install", (event) => {
  log("[Service Worker] Install");
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
    log(`[Service Worker] Creating cache: ${CACHE_NAME}`);
    return cache.addAll(urlsToPreCache);
  }).then(() => {
    log(`cache fully fetched!`);
  }));
});
self.addEventListener("activate", (event) => {
  log("[Service Worker] Activate");
  event.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.map((thisCacheName) => {
      if (thisCacheName !== CACHE_NAME) {
        log(`[Service Worker] Deleting: ${thisCacheName}`);
        return caches.delete(thisCacheName);
      }
    })).then(() => self.clients.claim());
  }));
});
const update = (request, cache) => {
  return fetch(request).then((response) => {
    return caches.open(CACHE_NAME).then((cache2) => {
      if (request.method === "GET" && request.url.startsWith("http")) {
        cache2.put(request, response.clone());
      }
      return response;
    });
  }).catch(() => {
    return cache;
  });
};
const cacheFirst = {
  method: (request, cache) => {
    log(`[Service Worker] Cache first: ${request.url}`);
    const fun = update(request, cache);
    return cache || fun;
  },
  regexes: regexesCacheFirst
};
const cacheOnly = {
  method: (request, cache) => {
    log(`[Service Worker] Cache only: ${request.url}`);
    return cache || update(request, cache);
  },
  regexes: regexesCacheOnly
};
const onlineFirst = {
  method: (request, cache) => {
    log(`[Service Worker] Online first: ${request.url}`);
    return update(request, cache);
  },
  regexes: regexesOnlineFirst
};
const onlineOnly = {
  method: (request) => {
    log(`[Service Worker] Online only: ${request.url}`);
    return fetch(request);
  },
  regexes: regexesOnlineOnly
};
async function getResponse(event) {
  const request = event.request;
  const registration = self.registration;
  if (event.request.mode === "navigate" && event.request.method === "GET" && registration.waiting && (await self.clients.matchAll()).length < 2) {
    log("only one client, skipWaiting as we navigate the page");
    registration.waiting.postMessage("skipWaiting");
    const response2 = new Response("", { headers: { Refresh: "0" } });
    return response2;
  }
  const response = await caches.match(request).then((cache) => {
    const patterns = [onlineFirst, onlineOnly, cacheFirst, cacheOnly];
    for (const pattern of patterns) {
      for (const regex of pattern.regexes) {
        if (RegExp(regex).test(request.url)) {
          return pattern.method(request, cache);
        }
      }
    }
    return onlineFirst.method(request, cache);
  });
  return response;
}
self.addEventListener("fetch", (event) => {
  event.respondWith(getResponse(event));
});
//# sourceMappingURL=service-worker.js.map
