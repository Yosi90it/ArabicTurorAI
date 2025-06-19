import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Play, CheckCircle, Target, Lightbulb, Book } from "lucide-react";
import { sevenDayPlan, mnemonics, type WeeklyPlan } from "@/data/weeklyPlan";

export default function WeeklyPlan() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});
  const [showMnemonics, setShowMnemonics] = useState(false);

  const currentPlan = sevenDayPlan.find(plan => plan.day === selectedDay);
  const overallProgress = (Object.keys(completedTasks).length / (sevenDayPlan.length * 5)) * 100;

  const toggleTaskCompletion = (day: number, taskIndex: number) => {
    const key = `${day}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isTaskCompleted = (day: number, taskIndex: number) => {
    return completedTasks[`${day}-${taskIndex}`] || false;
  };

  const playLetterSequence = (letters: string[]) => {
    if ('speechSynthesis' in window && letters.length > 0) {
      letters.forEach((letter, index) => {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(letter);
          utterance.lang = 'ar-SA';
          utterance.rate = 0.6;
          speechSynthesis.speak(utterance);
        }, index * 1000);
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">7-Day Arabic Alphabet Mastery Plan</h2>
        <p className="text-gray-600 mb-4">A comprehensive program to master all 28 Arabic letters in one week</p>
        
        <div className="bg-soft-gray rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full h-3" />
        </div>
      </div>

      {/* Day Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sevenDayPlan.map((plan) => (
          <Button
            key={plan.day}
            onClick={() => setSelectedDay(plan.day)}
            variant={selectedDay === plan.day ? "default" : "outline"}
            className={`rounded-2xl ${
              selectedDay === plan.day 
                ? "bg-primary-purple text-white" 
                : "border-primary-purple text-primary-purple hover:bg-primary-purple/10"
            }`}
          >
            Day {plan.day}
          </Button>
        ))}
      </div>

      {currentPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Plan Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-primary-purple">{currentPlan.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{currentPlan.focus}</p>
                  </div>
                  <Badge className="bg-primary-purple/10 text-primary-purple">
                    Day {currentPlan.day}/7
                  </Badge>
                </div>
                
                {currentPlan.letters.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Today's Letters:</span>
                      <Button
                        onClick={() => playLetterSequence(currentPlan.letters)}
                        size="sm"
                        className="bg-primary-purple hover:bg-active-purple text-white rounded-xl"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentPlan.letters.map((letter, index) => (
                        <span 
                          key={index}
                          className="bg-soft-gray text-2xl px-3 py-2 rounded-xl font-bold"
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Daily Tasks */}
            <div className="space-y-4">
              {currentPlan.tasks.map((task, index) => (
                <Card key={index} className="border-l-4 border-l-primary-purple">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-primary-purple" />
                          <span className="font-medium text-primary-purple">{task.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {task.duration}
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{task.activity}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <Button
                        onClick={() => toggleTaskCompletion(currentPlan.day, index)}
                        variant={isTaskCompleted(currentPlan.day, index) ? "default" : "outline"}
                        size="sm"
                        className={`ml-4 rounded-full ${
                          isTaskCompleted(currentPlan.day, index)
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "border-green-500 text-green-500 hover:bg-green-50"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Content */}
          <div>
            {/* Quick Stats */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Daily Goals
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Time:</span>
                    <span className="font-medium">35-60 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions:</span>
                    <span className="font-medium">5 per day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Focus:</span>
                    <span className="font-medium">Multisensory</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Techniques */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Memory Techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Button
                  onClick={() => setShowMnemonics(!showMnemonics)}
                  variant="outline"
                  className="w-full mb-3 rounded-xl"
                >
                  {showMnemonics ? "Hide" : "Show"} Mnemonics
                </Button>
                
                {showMnemonics && currentPlan.letters.length > 0 && (
                  <div className="space-y-3">
                    {currentPlan.letters.slice(0, 3).map((letter) => {
                      const mnemonic = mnemonics[letter as keyof typeof mnemonics];
                      return (
                        <div key={letter} className="bg-soft-gray rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xl font-bold">{letter}</span>
                            <span className="text-sm font-medium">{mnemonic?.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{mnemonic?.mnemonic}</p>
                          <p className="text-xs text-primary-purple">{mnemonic?.context}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Book className="h-4 w-4 mr-2" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Use headphones for better audio quality</li>
                  <li>• Practice during commute time</li>
                  <li>• Write with your finger in the air</li>
                  <li>• Create your own visual associations</li>
                  <li>• Review before sleeping for better retention</li>
                  <li>• Don't skip days - consistency is key</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}