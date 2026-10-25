/**
 * 太阁英语立志传 · PWA 离线运行与资产缓存 Service Worker (sw.js)
 * - 纯单机离线可用：断网也能畅玩战术卡牌决斗、宅邸装扮与集市贸易
 * - 极速加载：核心 App Shell 秒开
 * - 智能缓存更新：Stale-While-Revalidate 机制，自动感知版本更新并平滑替换
 */

const CACHE_NAME = 'taikou-english-v36';

const PRECACHE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'css/modal.css',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'js/words-data.js',
  'js/phonics.js',
  'js/progress.js',
  'js/speech.js',
  'js/skill-cards.js',
  'js/quest-system.js',
  'js/officer-system.js',
  'js/nanban-trade.js',
  'js/minigame-dojo.js',
  'js/minigame-temple.js',
  'js/hero.js',
  'js/game-characters.js',
  'js/treasure-hunt.js',
  'js/tokichiro-estate.js',
  'js/taikou-theater.js',
  'js/lexicon-scrolls.js',
  'js/game-map.js',
  'js/minigame-tea.js',
  'js/minigame-medicine.js',
  'js/taikou-town.js',
  'js/overworld.js',
  'js/game-engine.js',
  'js/scenic-world.js',
  'js/siege-battle.js',
  'js/card-battle.js',
  'js/honor-scroll.js',
  'js/ui.js',
  'js/app.js'
];

// 安装阶段：预缓存核心静态资源
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] 预缓存太阁英语核心资产...');
      return cache.addAll(PRECACHE_ASSETS.map((url) => new Request(url, { cache: 'no-cache' })))
        .catch((err) => {
          console.warn('[ServiceWorker] 部分资产预缓存跳过:', err);
        });
    })
  );
});

// 激活阶段：清理旧版本缓存，立即接管所有客户端
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] 移除历史旧缓存:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截阶段：HTML 页面网络优先确保实时更新；静态资产 Stale-While-Revalidate 离线秒开
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 仅拦截 http/https 的 GET 请求
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  // 页面导航请求 (index.html)：网络优先保证最新版本即时可见，断网时离线回退
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match('./').then(res => res || caches.match('index.html')))
    );
    return;
  }

  // 静态资产请求：优先匹配本地缓存秒开，并在后台异步更新缓存 (Stale-While-Revalidate)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(req).then((cachedResponse) => {
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // 如果本地已有缓存，则直接秒回本地缓存；否则等待网络响应
        return cachedResponse || fetchPromise;
      });
    })
  );
});
