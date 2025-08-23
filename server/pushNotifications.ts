import webpush from 'web-push';

// VAPID Keys für Web Push (sollten in Produktion als Umgebungsvariablen gesetzt werden)
const vapidKeys = webpush.generateVAPIDKeys();

// Web Push konfigurieren
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  preferences?: {
    intervals: number[];
    selectedInterval: number;
    dailyGoal: number;
  };
}

// In-Memory Store für Demo (in Produktion sollte eine Datenbank verwendet werden)
const subscriptions = new Map<string, PushSubscription>();

export class PushNotificationService {
  
  // Speichert eine neue Push-Subscription
  static addSubscription(subscription: PushSubscription, userId?: string): boolean {
    try {
      const key = subscription.endpoint;
      subscriptions.set(key, { ...subscription, userId });
      console.log(`Push-Subscription hinzugefügt für ${userId || 'anonymous user'}`);
      return true;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Push-Subscription:', error);
      return false;
    }
  }

  // Entfernt eine Push-Subscription
  static removeSubscription(endpoint: string): boolean {
    try {
      const removed = subscriptions.delete(endpoint);
      console.log(`Push-Subscription entfernt: ${removed}`);
      return removed;
    } catch (error) {
      console.error('Fehler beim Entfernen der Push-Subscription:', error);
      return false;
    }
  }

  // Sendet eine Push-Benachrichtigung an eine spezifische Subscription
  static async sendNotification(
    subscription: PushSubscription, 
    payload: any
  ): Promise<boolean> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      };

      const result = await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );

      console.log('Push-Benachrichtigung gesendet:', result);
      return true;
    } catch (error) {
      console.error('Fehler beim Senden der Push-Benachrichtigung:', error);
      
      // Entferne ungültige Subscriptions
      if (error.statusCode === 410) {
        this.removeSubscription(subscription.endpoint);
      }
      
      return false;
    }
  }

  // Sendet Benachrichtigungen an alle Subscriptions
  static async sendToAll(payload: any): Promise<number> {
    let successCount = 0;
    const promises = Array.from(subscriptions.values()).map(async (subscription) => {
      const success = await this.sendNotification(subscription, payload);
      if (success) successCount++;
    });

    await Promise.all(promises);
    console.log(`Push-Benachrichtigungen gesendet: ${successCount}/${subscriptions.size}`);
    return successCount;
  }

  // Sendet personalisierte Lern-Erinnerungen
  static async sendLearningReminder(userId?: string): Promise<boolean> {
    const motivationalMessages = [
      "Zeit für deine tägliche Arabisch-Lerneinheit! 📚",
      "Halte deine Lernserie am Leben! 🔥", 
      "Jede Minute zählt für deinen Lernfortschritt! ⏰",
      "Dein Arabisch wartet auf dich! 🌟",
      "Kleine Schritte führen zu großen Erfolgen! 💪",
      "Bleib dran - du machst großartige Fortschritte! 🎯"
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    const payload = {
      title: 'ArabicAI Lern-Erinnerung',
      body: randomMessage,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: {
        url: '/dashboard',
        action: 'learning_reminder',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'start_learning',
          title: 'Jetzt lernen',
          icon: '/icons/learn.png'
        },
        {
          action: 'snooze',
          title: 'Später erinnern',
          icon: '/icons/clock.png'
        }
      ],
      requireInteraction: true,
      tag: 'learning-reminder'
    };

    if (userId) {
      // Sende an spezifischen User
      const userSubscriptions = Array.from(subscriptions.values()).filter(
        sub => sub.userId === userId
      );
      
      let successCount = 0;
      for (const subscription of userSubscriptions) {
        const success = await this.sendNotification(subscription, payload);
        if (success) successCount++;
      }
      
      return successCount > 0;
    } else {
      // Sende an alle
      const successCount = await this.sendToAll(payload);
      return successCount > 0;
    }
  }

  // Geplante Erinnerungen (würde in Produktion mit einem Cron-Job implementiert)
  static startScheduledReminders(): void {
    console.log('Geplante Push-Erinnerungen gestartet');
    
    // Beispiel: Alle 30 Minuten eine Erinnerung senden (nur für Demo)
    setInterval(async () => {
      if (subscriptions.size > 0) {
        await this.sendLearningReminder();
      }
    }, 30 * 60 * 1000); // 30 Minuten
  }

  // Utility: Alle Subscriptions abrufen
  static getAllSubscriptions(): PushSubscription[] {
    return Array.from(subscriptions.values());
  }

  // Utility: Subscription-Count
  static getSubscriptionCount(): number {
    return subscriptions.size;
  }
}

export { vapidKeys };