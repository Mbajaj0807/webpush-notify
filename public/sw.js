    // sw.js

    self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Push received:', data);
    const options = {
        body: data.body, 
        requireInteraction: true,
        silent: false,
        icon: 'https://socioshop.in/img/general/SocioShop_Logo_blue%20.png', 
        image: 'image.png' 
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
    
    });

    self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://google.com') 
    );
    });
