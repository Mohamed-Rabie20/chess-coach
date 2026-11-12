if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)&&location.hostname!=='localhost')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))
