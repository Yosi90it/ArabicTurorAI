import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const features = [
  "AI-powered Arabic conversation practice",
  "Interactive flashcards with spaced repetition",
  "Arabic book reader with clickable translations",
  "Video lessons with interactive transcripts",
  "Alphabet trainer with writing practice",
  "Grammar analysis and word breakdown",
  "Progress tracking and level assessment",
  "Tashkeel toggle for reading practice",
  "Unlimited vocabulary collection",
  "Contextual sentence examples"
];

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  isPopular?: boolean;
  onSubscribe: () => void;
}

function PlanCard({ title, price, period, isPopular = false, onSubscribe }: PlanCardProps) {
  return (
    <Card className={`bg-white shadow-lg rounded-2xl p-6 m-4 relative ${isPopular ? 'border-2 border-primary-purple' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-purple text-white px-4 py-1 rounded-full text-sm font-medium">
            Best Value
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold text-primary-purple">{price}</span>
          <span className="text-gray-600 ml-1">/ {period}</span>
        </div>
        {isPopular && (
          <p className="text-sm text-green-600 font-medium mt-1">Save 20%</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onSubscribe}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl p-3 mt-6 font-medium transition-colors duration-200"
        >
          Subscribe Now
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Subscription() {
  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    console.log("Subscribed to", plan);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Unlock the full potential of Arabic learning with AI</p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-4">
          <PlanCard
            title="Monthly Plan"
            price="€14.99"
            period="month"
            onSubscribe={() => handleSubscribe('monthly')}
          />
          
          <PlanCard
            title="Annual Plan"
            price="€143.90"
            period="year"
            isPopular={true}
            onSubscribe={() => handleSubscribe('annual')}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <div className="bg-soft-gray rounded-2xl p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Why Choose ArabicAI Premium?</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Get unlimited access to our AI-powered Arabic learning platform. Practice conversation, 
            read authentic texts, and master the Arabic alphabet with personalized feedback and 
            progress tracking. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}