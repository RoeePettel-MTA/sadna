// public/firebase-messaging-sw.js
self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};
  const title = data.title || 'התראה חדשה';
  const options = {
    body: data.body,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});