"use client";

import { useState } from "react";
import { useSurvey } from "~/contexts/SurveyContext";
import { api } from "~/trpc/react";

interface RatingQuestion {
  id: string;
  question: string;
}

const ratingQuestions = [
  { id: "helpfulness_a", question: "Agent A: How helpful were the responses?", type: "likert" },
  { id: "helpfulness_b", question: "Agent B: How helpful were the responses?", type: "likert" },
  { id: "trustworthiness_a", question: "Agent A: How trustworthy were the responses?", type: "likert" },
  { id: "trustworthiness_b", question: "Agent B: How trustworthy were the responses?", type: "likert" },
  { id: "intelligence_a", question: "Agent A: How intelligent were the responses?", type: "likert" },
  { id: "intelligence_b", question: "Agent B: How intelligent were the responses?", type: "likert" },
  { id: "friendliness_a", question: "Agent A: How friendly were the responses?", type: "likert" },
  { id: "friendliness_b", question: "Agent B: How friendly were the responses?", type: "likert" },
  { id: "overall_confidence", question: "How confident are you in the overall quality of the AI responses?", type: "likert" },
  { id: "overall_preference", question: "Overall, which AI would you prefer to use again?", type: "agent_choice" },
  { id: "open_ended_feedback", question: "Please provide any additional feedback or comments.", type: "textarea" },
];

interface FinalSurveyFormProps {
  onComplete: (ratings: Record<string, number | string>) => void;
}

export function FinalSurveyForm({ onComplete }: FinalSurveyFormProps) {
  const { } = useSurvey();
  const [ratings, setRatings] = useState<Record<string, number | string>>({});

  const handleRatingChange = (questionId: string, value: number | string) => {
    setRatings(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allQuestionsAnswered = ratingQuestions.every(q => {
      if (q.type === "textarea") {
        return typeof ratings[q.id] === "string";
      } else if (q.type === "agent_choice") {
        return typeof ratings[q.id] === "string";
      } else {
        return typeof ratings[q.id] === "number";
      }
    });

    if (allQuestionsAnswered) {
      onComplete(ratings);
    } else {
      // If not all questions are answered, still allow to proceed for now
      onComplete(ratings); 
    }
  };

  const isComplete = ratingQuestions.every(q => {
    if (q.type === "textarea") {
      return typeof ratings[q.id] === "string";
    } else if (q.type === "agent_choice") {
      return typeof ratings[q.id] === "string";
    } else {
      return typeof ratings[q.id] === "number";
    }
  });

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-6">Final Survey</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {ratingQuestions.map((question) => (
          <div key={question.id} className="space-y-3">
            <label className="block text-lg font-medium text-black">
              {question.question}
            </label>
            
            <div className="content-center">
            {question.type === "likert" && (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">1</span>
                  <div className="flex space-x-2 justify-center" role="radiogroup">
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={ratings[question.id] === value}
                        tabIndex={ratings[question.id] === value ? 0 : -1}
                        onClick={() => handleRatingChange(question.id, value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                            e.preventDefault();
                            const currentValue = ratings[question.id] as number || 0;
                            let newValue = currentValue;
                            if (e.key === "ArrowRight") {
                              newValue = Math.min(7, currentValue + 1);
                            } else if (e.key === "ArrowLeft") {
                              newValue = Math.max(1, currentValue - 1);
                            }
                            if (newValue !== currentValue) {
                              handleRatingChange(question.id, newValue);
                            }
                          } else if (e.key >= "1" && e.key <= "7") {
                            e.preventDefault();
                            handleRatingChange(question.id, Number(e.key));
                          }
                        }}
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
              </div>
            )}

            {question.type === "comparison" && (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Agent A Much Better</span>
                  <div className="flex space-x-2 justify-center" role="radiogroup">
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={ratings[question.id] === value}
                        tabIndex={ratings[question.id] === value ? 0 : -1}
                        onClick={() => handleRatingChange(question.id, value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                            e.preventDefault();
                            const currentValue = ratings[question.id] as number || 0;
                            let newValue = currentValue;
                            if (e.key === "ArrowRight") {
                              newValue = Math.min(7, currentValue + 1);
                            } else if (e.key === "ArrowLeft") {
                              newValue = Math.max(1, currentValue - 1);
                            }
                            if (newValue !== currentValue) {
                              handleRatingChange(question.id, newValue);
                            }
                          } else if (e.key >= "1" && e.key <= "7") {
                            e.preventDefault();
                            handleRatingChange(question.id, Number(e.key));
                          }
                        }}
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
                  <span className="text-sm text-gray-600">Agent B Much Better</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 w-full px-1">
                  <span>Agent A</span>
                  <span>Agent B</span>
                </div>
              </div>
            )}

            {question.type === "agent_choice" && (
              <div className="flex items-center space-x-8">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value="Agent A"
                    checked={ratings[question.id] === "Agent A"}
                    onChange={(e) => handleRatingChange(question.id, e.target.value)}
                    className="mr-3 accent-black"
                  />
                  <span className="text-black">Agent A</span>
                </label>
                <label className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value="Agent B"
                    checked={ratings[question.id] === "Agent B"}
                    onChange={(e) => handleRatingChange(question.id, e.target.value)}
                    className="mr-3 accent-black"
                  />
                  <span className="text-black">Agent B</span>
                </label>
              </div>
            )}

            {question.type === "textarea" && (
              <textarea
                id={question.id}
                rows={4}
                className="w-full p-4 border border-gray-300 text-black bg-white focus:border-black focus:outline-none text-lg"
                value={ratings[question.id] as string || ""}
                onChange={(e) => handleRatingChange(question.id, e.target.value)}
                placeholder="Enter your feedback here..."
              ></textarea>
            )}
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              {question.type === "likert" && (
                <>
                  <span>Strongly Disagree</span>
                  <span>Neutral</span>
                  <span>Strongly Agree</span>
                </>
              )}
              {question.type === "comparison" && (
                <>
                  <span>Agent A</span>
                  <span>Neutral</span>
                  <span>Agent B</span>
                </>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={!isComplete}
          className="w-full py-3 bg-black text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Submit Final Survey
        </button>
      </form>
    </div>
  );
}
