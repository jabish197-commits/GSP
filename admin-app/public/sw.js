self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(self.registration.showNotification(data.title || "SJ Guppy Paradise", {
    body: data.body || "New customer activity",
    icon: data.icon || "/logo.png",
    badge: "/favicon.png",
    tag: data.tag || "sj-guppy-notification",
    data: { url: data.url || "/" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => windows[0]?.focus() || clients.openWindow(event.notification.data?.url || "/")));
});
