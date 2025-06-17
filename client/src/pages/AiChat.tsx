import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  id: number;
  sender: "AI" | "ME";
  arabic: string;
  translation: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "AI",
      arabic: "مرحبا! كيف حالك؟",
      translation: "Hello! How are you?"
    },
    {
      id: 2,
      sender: "ME",
      arabic: "أنا بخير، شكرا",
      translation: "I'm fine, thank you"
    },
    {
      id: 3,
      sender: "AI",
      arabic: "ممتاز! هل تريد أن نتحدث عن الطعام؟",
      translation: "Excellent! Would you like to talk about food?"
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "ME",
        arabic: inputValue,
        translation: "Translation would be provided by AI"
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Chat Assistant</h2>
        <p className="text-gray-600">Practice Arabic conversation with our intelligent AI tutor</p>
      </div>

      {/* Chat Interface */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="h-96 bg-soft-gray rounded-2xl p-4 mb-4 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === "ME" ? "justify-end" : ""
                  }`}
                >
                  {message.sender === "AI" && (
                    <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl p-3 max-w-xs ${
                      message.sender === "AI"
                        ? "bg-white shadow-sm"
                        : "bg-primary-purple text-white"
                    }`}
                  >
                    <p className="text-sm">{message.arabic}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "AI" ? "text-gray-500" : "text-hover-lavender"
                      }`}
                    >
                      {message.translation}
                    </p>
                  </div>

                  {message.sender === "ME" && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
                      ME
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="Type your message in Arabic..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 border-gentle-shadow rounded-2xl focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-primary-purple text-white px-6 py-3 rounded-2xl hover:bg-active-purple transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-2xl mb-2">💬</div>
            <CardTitle className="text-base mb-1">Practice Phrases</CardTitle>
            <p className="text-sm text-gray-600">Common Arabic expressions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-2xl mb-2">🎯</div>
            <CardTitle className="text-base mb-1">Grammar Tips</CardTitle>
            <p className="text-sm text-gray-600">Learn Arabic grammar rules</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-2xl mb-2">🔊</div>
            <CardTitle className="text-base mb-1">Pronunciation</CardTitle>
            <p className="text-sm text-gray-600">Perfect your Arabic accent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
