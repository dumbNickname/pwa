const APP_PREFIX = 'ApplicationName_'     // Identifier for this app (this needs to be consistent across every cache update)
const VERSION = 'version_01'              // Version of the off-line cache (change this value every time you want to update cache)
const CACHE_NAME = APP_PREFIX + VERSION
const urlsToCache = [                            // Add URL you want to cache in this list.
  '/',
  '/polyfills.bundle.js',
  '/inline.bundle.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700',
]

self.addEventListener('install', event => {
    // Perform install steps
    console.log('installing worker')
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('installing cache : ' + CACHE_NAME)
        const promises = [
          'http://covers.openlibrary.org/b/isbn/9780321356680-S.jpg',
          'http://covers.openlibrary.org/b/isbn/9781617290459-S.jpg',
          'http://covers.openlibrary.org/b/isbn/9780596517748-S.jpg',
        ].map(url => new Request(url, { mode: 'no-cors' }))
        .map(request => fetch(request).then(response => cache.put(request, response)));

        return cache.addAll(urlsToCache)
          .then(() => Promise.all(promises))
      })
    )
  });


// Delete outdated caches
self.addEventListener('activate', event => {
  console.log('activating worker')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log(cacheNames)
      return Promise.all(
        cacheNames.filter(cacheName => cacheName.indexOf(VERSION) === -1)
          .map(cacheName => caches.delete(cacheName))
      )
    })
  )
})


self.addEventListener('fetch', event => {
  // console.log('fetch request : ' + event.request.url)
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) { // if cache is available, respond with cache
        console.log('responding with cache : ' + event.request.url)
        return response
      } else {       // if there are no cache, try fetching request
        console.log('file is not cached, fetching : ' + event.request.url)
        return fetch(event.request)
      }

      // You can omit if/else for console.log & put one line below like this too.
      // return request || fetch(e.request)
    })
  )
})
