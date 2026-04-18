// P.S. Calculadora Pastry Solutions - Service Worker v3
// © 2026 Paula Siepe - Todos los derechos reservados
const CACHE_NAME = 'pastry-v3';
const CACHE_URLS = ['/','/index.html','/manifest.json','/icons/icon-192x192.png','/icons/icon-512x512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CACHE_URLS).catch(()=>Promise.resolve())));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached) return cached;
    return fetch(e.request).then(r=>{
      if(r&&r.status===200&&r.type==='basic'){const c=r.clone();caches.open(CACHE_NAME).then(ca=>ca.put(e.request,c));}
      return r;
    }).catch(()=>caches.match('/')||caches.match('/index.html'));
  }));
});
self.addEventListener('push', e=>{
  const d=e.data?e.data.json():{};
  e.waitUntil(self.registration.showNotification(d.title||'🎂 Pastry Solutions',{
    body:d.body||'Tenés una entrega próxima',icon:'/icons/icon-192x192.png',
    badge:'/icons/icon-72x72.png',vibrate:[200,100,200],data:d,
    actions:[{action:'open',title:'Ver pedido'},{action:'dismiss',title:'Cerrar'}]
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  if(e.action==='dismiss') return;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    if(list.length>0){list[0].focus();return list[0].navigate('/');}
    return clients.openWindow('/');
  }));
});
