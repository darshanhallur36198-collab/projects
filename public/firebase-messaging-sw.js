importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAHfp8BPG0YlEU31Ibb0SsK73DH2GVle5M",
  authDomain: "gen-lang-client-0961616426.firebaseapp.com",
  projectId: "gen-lang-client-0961616426",
  storageBucket: "gen-lang-client-0961616426.firebasestorage.app",
  messagingSenderId: "1028230372776",
  appId: "1:1028230372776:web:773ee604bdd73ace5fd19d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
