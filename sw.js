/* 旅のしおり Service Worker（ネットワーク優先＋オフラインフォールバック） */
const CACHE="tabi-shiori-v38";
self.addEventListener("install",e=>{self.skipWaiting();});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  let url;try{url=new URL(req.url);}catch(err){return;}
  if(url.origin!==self.location.origin)return; // 天気・経路等の外部APIは素通し（キャッシュしない）
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp)).catch(()=>{});}
      return res;
    }).catch(()=>caches.match(req).then(m=>m||caches.match("./")).then(m=>m||new Response("オフラインです。一度オンラインでページを開くと保存されます。",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}})))
  );
});
