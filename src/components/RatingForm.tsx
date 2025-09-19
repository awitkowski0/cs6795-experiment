"use client";

import { useState } from "react";

interface RatingQuestion {
  id: string;
  question: string;
}

const ratingQuestions: RatingQuestion[] = [
  { id: "helpfulness", question: "How helpful were the AI responses?" },
  { id: "accuracy", question: "How accurate were the AI responses?" },
  { id: "clarity", question: "How clear and understandable were the responses?" },
  { id: "personalization", question: "How well did the AI responses match your needs?" },
  { id: "preference", question: "Which AI would you prefer to use again?" },
];

interface RatingFormProps {
  onSubmit: (ratings: Record<string, number>) => void;
}

export function RatingForm({ onSubmit }: RatingFormProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRatingChange = (questionId: string, value: number) => {
    setRatings(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(ratings).length === ratingQuestions.length) {
      onSubmit(ratings);
    }
  };

  const isComplete = Object.keys(ratings).length === ratingQuestions.length;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-6">Rate Your Experience</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {ratingQuestions.map((question) => (
          <div key={question.id} className="space-y-3">
            <label className="block text-lg font-medium text-black">
              {question.question}
            </label>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">1</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRatingChange(question.id, value)}
                    className={`w-10 h-10 rounded-full border-2 transition-colors ${
                      ratings[question.id] === value
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-600">7</span>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={!isComplete}
          className="w-full py-3 bg-black text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Submit Ratings
        </button>
      </form>
    </div>
  );
}