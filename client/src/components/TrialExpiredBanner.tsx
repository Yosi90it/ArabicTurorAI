import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TrialExpiredBanner() {
  const { strings } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="bg-white rounded-2xl shadow-xl text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-10 h-10 text-orange-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              {strings.trialExpired}
            </CardTitle>
            <p className="text-xl text-gray-600">
              Your 72-hour free trial has ended. Continue learning with a subscription.
            </p>
          </CardHeader>
          
          <CardContent className="pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-100 rounded-xl opacity-50">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <span className="text-white text-xl">🧠</span>
                </div>
                <h3 className="font-semibold text-gray-500">{strings.aiChat}</h3>
                <p className="text-sm text-gray-400 mt-1">Practice with AI tutor</p>
                <div className="text-xs text-gray-400 mt-2">🔒 Requires subscription</div>
              </div>

              <div className="p-4 bg-gray-100 rounded-xl opacity-50">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <span className="text-white text-xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-500">{strings.bookReader}</h3>
                <p className="text-sm text-gray-400 mt-1">Interactive Arabic texts</p>
                <div className="text-xs text-gray-400 mt-2">🔒 Requires subscription</div>
              </div>
            </div>

            <Link href="/subscription">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold text-lg">
                {strings.subscription}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              Choose from flexible monthly or yearly plans
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}