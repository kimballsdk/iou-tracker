
const CACHE_NAME = 'iou-tracker-cache-v9';
const urlsToCache = [
  '/iou-tracker/',
  '/iou-tracker/index.html',
  '/iou-tracker/index.tsx',
  '/iou-tracker/App.tsx',
  '/iou-tracker/types.ts',
  '/iou-tracker/hooks/useLocalStorage.ts',
  '/iou-tracker/components/Header.tsx',
  '/iou-tracker/components/BalanceDisplay.tsx',
  '/iou-tracker/components/HistoryList.tsx',
  '/iou-tracker/components/TransactionForm.tsx',
  '/iou-tracker/components/icons.tsx',
  '/iou-tracker/components/ProfileModal.tsx',
  '/iou-tracker/components/SettingsModal.tsx',
  '/iou-tracker/components/SummaryModal.tsx',
  '/iou-tracker/components/ConfirmationModal.tsx',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use a new array for addAll to avoid modifying the original
        const urlsToInstall = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(urlsToInstall);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
