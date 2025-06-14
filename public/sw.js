    // sw.js

    self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Push received:', data);
    const options = {
        body: data.body, 
        requireInteraction: true,
        silent: false,
        icon: 'https://play-lh.googleusercontent.com/wrF58OGt27q7LaZDuF8uxYRgcS0zSqKgtnWssPOvRM1yvInSswYo_9828JC7TQ6imA=w480-h960-rw' ,     
        image: 'https://socioshop.in/img/general/SocioShop_Logo_blue%20.png', 
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
