// Listen for push events
self.addEventListener('push', (event) => {
  // Parse the push event data
  const payload = event.data ? event.data.json() : { title: 'New Notification', body: { Message: 'You have a new message!' } };

  const title = payload.title;
  const body = payload.body;

  // Display the notification
  event.waitUntil(
    self.registration.showNotification(title, {
      icon: 'https://stellantisandyoucouk.github.io/imagesStore/bell-ringing.svg',
      body: body.Message,
      requireInteraction: true, // Keep the notification open until the user interacts with it
      badge: 'https://stellantisandyoucouk.github.io/imagesStore/bell-ringing.svg'
    })
  );
});

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const body = notification.data ? notification.data.body : {};

  // Close the notification
  notification.close();

  // Handle the click action
  if (body.Click) {
    event.waitUntil(
      clients.openWindow(body.Click) // Open the URL in a new window/tab
    );
    console.log("Notification clicked.");
  } else {
    console.log("No click action provided.");
  }
});

// Listen for notification close events
self.addEventListener('notificationclose', (event) => {
  console.log("Background Notification closed.");
});