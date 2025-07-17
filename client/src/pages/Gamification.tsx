import React from 'react';
import GamificationPanel from '@/components/GamificationPanel';

export default function Gamification() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎮 Gamification Dashboard
        </h1>
        <p className="text-gray-600">
          Verfolge deinen Lernfortschritt, sammle Punkte und schalte Erfolge frei!
        </p>
      </div>
      
      <GamificationPanel />
    </div>
  );
}