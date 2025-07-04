import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SelectLanguage() {
  const [, setLocation] = useLocation();
  const { setLanguage, strings } = useLanguage();

  const handleLanguageSelect = (lang: 'en' | 'de') => {
    setLanguage(lang);
    setLocation('/learn');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {strings.selectLanguage}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {strings.chooseLanguage}
            </p>
          </CardHeader>
          
          <CardContent className="pb-8">
            <div className="space-y-4">
              <Button
                onClick={() => handleLanguageSelect('en')}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-purple-300 py-6 rounded-xl font-medium transition-all"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🇺🇸</span>
                    <span className="text-lg">English</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Button>

              <Button
                onClick={() => handleLanguageSelect('de')}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-purple-300 py-6 rounded-xl font-medium transition-all"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🇩🇪</span>
                    <span className="text-lg">Deutsch</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-700 text-center">
                You can change your language preference anytime in the settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}