const publicVapidKey = 'BPuAlMMOi1q8gPnhBCd_dqYB_NOI5EgH1NdoVRtM-2s6cObQbfVJWb98lj6RDc8csv2gknpiwm9IFGo3iXN6TrU';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function subscribeUser() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('Service Worker registered');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      console.log('User subscribed:', subscription);

      await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Subscription sent to server');
    } catch (error) {
      console.error('Subscription error:', error);
    }
  } else {
    console.warn('Service Worker is not supported in this browser.');
  }
}

subscribeUser();
