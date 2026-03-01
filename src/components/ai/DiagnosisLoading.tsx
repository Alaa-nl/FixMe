"use client";

import { useEffect, useState } from "react";

export default function DiagnosisLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "🔍 Analyzing your item...",
    "Looking at the damage...",
    "Estimating repair cost...",
    "Almost done...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-white rounded-xl border-2 border-orange-200 p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Circle Animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
          <div className="relative flex items-center justify-center w-20 h-20 bg-primary rounded-full">
            <span className="text-3xl">🤖</span>
          </div>
        </div>

        {/* Cycling Messages */}
        <div className="min-h-[2rem]">
          <p className="text-lg font-medium text-gray-700 transition-opacity duration-300">
            {messages[messageIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
