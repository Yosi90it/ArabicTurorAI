// Push-Benachrichtigungen Utility Functions

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private vapidPublicKey: string | null = null;

  // Prüft ob Push-Benachrichtigungen unterstützt werden
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Registriert Service Worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.log('Push-Benachrichtigungen werden nicht unterstützt');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registriert:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker Registrierung fehlgeschlagen:', error);
      return null;
    }
  }

  // Fragt nach Benachrichtigungs-Berechtigung
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Benachrichtigungs-Berechtigung:', permission);
    return permission;
  }

  // Lädt den öffentlichen VAPID-Schlüssel vom Server
  async loadVapidPublicKey(): Promise<string | null> {
    if (this.vapidPublicKey) {
      return this.vapidPublicKey;
    }

    try {
      const response = await fetch('/api/push-vapid-key');
      if (response.ok) {
        const data = await response.json();
        this.vapidPublicKey = data.publicKey;
        return this.vapidPublicKey;
      }
    } catch (error) {
      console.error('Fehler beim Laden des VAPID-Schlüssels:', error);
    }
    
    return null;
  }

  // Erstellt Push-Subscription
  async createPushSubscription(): Promise<PushSubscriptionData | null> {
    const registration = await this.registerServiceWorker();
    if (!registration) {
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.log('Benachrichtigungs-Berechtigung verweigert');
      return null;
    }

    try {
      const vapidKey = await this.loadVapidPublicKey();
      if (!vapidKey) {
        console.error('VAPID-Schlüssel konnte nicht geladen werden');
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      console.log('Push-Subscription erstellt:', subscriptionData);
      return subscriptionData;
    } catch (error) {
      console.error('Fehler beim Erstellen der Push-Subscription:', error);
      return null;
    }
  }

  // Sendet Subscription-Daten an Server
  async sendSubscriptionToServer(subscriptionData: PushSubscriptionData): Promise<boolean> {
    try {
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData)
      });

      if (response.ok) {
        console.log('Push-Subscription an Server gesendet');
        return true;
      } else {
        console.error('Fehler beim Senden der Push-Subscription:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Netzwerk-Fehler beim Senden der Push-Subscription:', error);
      return false;
    }
  }

  // Kompletter Setup-Prozess
  async setupPushNotifications(): Promise<boolean> {
    try {
      const subscriptionData = await this.createPushSubscription();
      if (!subscriptionData) {
        return false;
      }

      const success = await this.sendSubscriptionToServer(subscriptionData);
      if (success) {
        // Speichere Subscription-Status lokal
        localStorage.setItem('pushNotificationsEnabled', 'true');
        localStorage.setItem('pushSubscriptionData', JSON.stringify(subscriptionData));
      }

      return success;
    } catch (error) {
      console.error('Setup der Push-Benachrichtigungen fehlgeschlagen:', error);
      return false;
    }
  }

  // Prüft ob Push-Benachrichtigungen aktiviert sind
  isPushEnabled(): boolean {
    return localStorage.getItem('pushNotificationsEnabled') === 'true';
  }

  // Deaktiviert Push-Benachrichtigungen
  async disablePushNotifications(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      localStorage.removeItem('pushNotificationsEnabled');
      localStorage.removeItem('pushSubscriptionData');
      
      // Benachrichtige Server über Deaktivierung
      await fetch('/api/push-unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Deaktivieren der Push-Benachrichtigungen:', error);
      return false;
    }
  }

  // Zeigt eine Test-Benachrichtigung
  async showTestNotification(): Promise<void> {
    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification('Test-Benachrichtigung', {
          body: 'Push-Benachrichtigungen funktionieren!',
          icon: '/icon-192.png',
          tag: 'test'
        });
      }
    }
  }

  // Hilfsfunktionen für Base64-Konvertierung
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Singleton-Instanz exportieren
export const pushNotificationManager = new PushNotificationManager();