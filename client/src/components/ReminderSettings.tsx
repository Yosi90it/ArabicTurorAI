import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Clock, Target, Bell, Settings, Save, Smartphone, TestTube } from 'lucide-react';
import { useReminder } from '@/contexts/ReminderContext';
import { useToast } from '@/hooks/use-toast';

export default function ReminderSettings() {
  const { 
    settings, 
    updateSettings, 
    setupPushNotifications, 
    disablePushNotifications, 
    testPushNotification 
  } = useReminder();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);
  const [pushLoading, setPushLoading] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "Einstellungen gespeichert",
      description: "Deine Erinnerungseinstellungen wurden aktualisiert.",
    });
  };

  const handlePushToggle = async (enabled: boolean) => {
    setPushLoading(true);
    try {
      if (enabled) {
        const success = await setupPushNotifications();
        if (success) {
          setLocalSettings(prev => ({ ...prev, pushNotificationsEnabled: true }));
        }
      } else {
        const success = await disablePushNotifications();
        if (success) {
          setLocalSettings(prev => ({ ...prev, pushNotificationsEnabled: false }));
        }
      }
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestNotification = async () => {
    await testPushNotification();
  };

  const intervalOptions = [
    { value: 15, label: "15 Minuten" },
    { value: 30, label: "30 Minuten" },
    { value: 60, label: "1 Stunde" },
    { value: 120, label: "2 Stunden" },
    { value: 240, label: "4 Stunden" },
    { value: 480, label: "8 Stunden" }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Settings className="h-6 w-6" />
          Erinnerungseinstellungen
        </h1>
        <p className="text-gray-600 mt-2">
          Passe deine Lernerinnerungen an deine Bedürfnisse an
        </p>
      </div>

      {/* Main Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Erinnerungen aktivieren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-reminders" className="text-base font-medium">
                Lernerinnerungen einschalten
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Erhalte regelmäßige Erinnerungen zum Arabisch lernen
              </p>
            </div>
            <Switch
              id="enable-reminders"
              checked={localSettings.enabled}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Push-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="text-base font-medium">
                Push-Benachrichtigungen aktivieren
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Erhalte Erinnerungen auch wenn die App geschlossen ist (funktioniert auf dem Handy)
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={localSettings.pushNotificationsEnabled}
              onCheckedChange={handlePushToggle}
              disabled={pushLoading}
            />
          </div>

          {localSettings.pushNotificationsEnabled && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Push-Benachrichtigungen sind aktiv
                  </p>
                  <p className="text-xs text-green-600">
                    Du erhältst Erinnerungen auch wenn die App geschlossen ist
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Hinweis:</strong> Push-Benachrichtigungen funktionieren am besten wenn du die 
            Webapp zu deinem Homescreen hinzufügst. Tippe in deinem Browser auf "Teilen" → 
            "Zum Homescreen hinzufügen".
          </div>
        </CardContent>
      </Card>

      {/* Reminder Interval */}
      <Card className={!localSettings.enabled ? "opacity-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Erinnerungsintervall
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Erinnere mich alle:
            </Label>
            <Select
              disabled={!localSettings.enabled}
              value={localSettings.selectedInterval.toString()}
              onValueChange={(value) => 
                setLocalSettings(prev => ({ ...prev, selectedInterval: parseInt(value) }))
              }
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Tipp:</strong> Kürzere Intervalle helfen beim regelmäßigen Lernen, 
            längere Intervalle stören weniger im Alltag.
          </div>
        </CardContent>
      </Card>

      {/* Daily Goal */}
      <Card className={!localSettings.enabled ? "opacity-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tagesziel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-base font-medium">
                Tägliche Lernzeit (Minuten):
              </Label>
              <span className="text-lg font-bold text-blue-600">
                {localSettings.dailyGoal} min
              </span>
            </div>
            <Slider
              disabled={!localSettings.enabled}
              value={[localSettings.dailyGoal]}
              onValueChange={(value) => 
                setLocalSettings(prev => ({ ...prev, dailyGoal: value[0] }))
              }
              max={120}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              disabled={!localSettings.enabled}
              onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoal: 10 }))}
            >
              10 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!localSettings.enabled}
              onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoal: 20 }))}
            >
              20 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!localSettings.enabled}
              onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoal: 30 }))}
            >
              30 min
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Streak Target */}
      <Card className={!localSettings.enabled ? "opacity-50" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔥 Lernserie-Ziel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-base font-medium">
                Ziel für Lernserie (Tage):
              </Label>
              <span className="text-lg font-bold text-orange-600">
                {localSettings.streakTarget} Tage
              </span>
            </div>
            <Slider
              disabled={!localSettings.enabled}
              value={[localSettings.streakTarget]}
              onValueChange={(value) => 
                setLocalSettings(prev => ({ ...prev, streakTarget: value[0] }))
              }
              max={30}
              min={3}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 Tage</span>
              <span>30 Tage</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              disabled={!localSettings.enabled}
              onClick={() => setLocalSettings(prev => ({ ...prev, streakTarget: 7 }))}
            >
              1 Woche
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!localSettings.enabled}
              onClick={() => setLocalSettings(prev => ({ ...prev, streakTarget: 14 }))}
            >
              2 Wochen
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!localSettings.enabled}
              onClick={() => setLocalSettings(prev => ({ ...prev, streakTarget: 30 }))}
            >
              1 Monat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Vorschau deiner Einstellungen:</h3>
          <div className="text-sm space-y-1">
            <p>
              • {localSettings.enabled ? 
                `Erinnerungen alle ${intervalOptions.find(o => o.value === localSettings.selectedInterval)?.label.toLowerCase()}` :
                'Erinnerungen sind deaktiviert'
              }
            </p>
            <p>• Push-Benachrichtigungen: {localSettings.pushNotificationsEnabled ? 'Aktiviert' : 'Deaktiviert'}</p>
            <p>• Tagesziel: {localSettings.dailyGoal} Minuten</p>
            <p>• Lernserie-Ziel: {localSettings.streakTarget} Tage</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="text-center pt-4">
        <Button
          onClick={handleSave}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}