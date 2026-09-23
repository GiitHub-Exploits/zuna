// ZUNA TAILORS - Web Push Notification Utility & PWA Registration

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return registration;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

export async function getVapidPublicKey() {
  try {
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/push/vapid-public-key");
    if (!res.ok) throw new Error('Failed to fetch VAPID key');
    const data = await res.json();
    return data.publicKey;
  } catch (err) {
    console.error('Error getting VAPID public key:', err);
    return null;
  }
}

export async function subscribeUserToPush(userId, isAdmin = false) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push Notifications not supported by this browser.');
    return { success: false, reason: 'unsupported' };
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) return { success: false, reason: 'no-sw' };

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return { success: false, reason: 'permission-denied' };
    }

    const publicKey = await getVapidPublicKey();
    if (!publicKey) return { success: false, reason: 'no-key' };

    let subscription = await registration.pushManager.getSubscription();

    // If no existing subscription or expired, create new one
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // Send subscription to backend linked to userId and isAdmin flag
    const res = await fetch(import.meta.env.VITE_API_URL + "/api/push/subscribe", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        userId: userId || 'anonymous',
        isAdmin: Boolean(isAdmin),
        userAgent: navigator.userAgent
      })
    });

    const data = await res.json();
    console.log('✅ Push notification subscription synced with server:', data);
    return { success: true, subscription };
  } catch (err) {
    console.error('Error subscribing to push notifications:', err);
    return { success: false, error: err.message };
  }
}

export async function syncPushStatus(userId, isAdmin = false) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    await subscribeUserToPush(userId, isAdmin);
  }
}
