"use client";

import { useState } from "react";

interface RatingFormProps {
  challengeNumber: number;
  challengeTitle: string;
  onSubmit: (ratings: any) => void;
}

interface RatingData {
  helpfulness_a: number;
  helpfulness_b: number;
  trustworthiness_a: number;
  trustworthiness_b: number;
  intelligence_a: number;
  intelligence_b: number;
  friendliness_a: number;
  friendliness_b: number;
  confidence: number;
  choice: string;
  open_ended: string;
}

const getOpenEndedQuestions = (challengeNumber: number) => {
  const questions = {
    1: "Please briefly explain your choice. What specifically made that agent more useful or preferable for this task?",
    2: "What was the most significant difference you noticed between the two agents' approaches to this task?",
    3: "Describe a moment where one agent's feedback was particularly good or bad. What happened?",
    4: "Did you feel that either agent's style made you reconsider your own ideas? If so, how?",
    5: "Please describe the personality of Agent A and Agent B in your own words."
  };
  return questions[challengeNumber as keyof typeof questions] || questions[5];
};

const getChoiceQuestion = (challengeNumber: number) => {
  const questions = {
    1: "If you had to choose only one agent to help you plan another trip, which would you choose?",
    2: "If you were to start a real business, which agent would you rely on for advice?",
    3: "Which agent would you prefer to collaborate with on a future creative project?",
    4: "If you needed an AI to review an important financial document, which agent would you choose?",
    5: "For a high-stakes brainstorming session, which agent would you want on your team?"
  };
  return questions[challengeNumber as keyof typeof questions] || questions[5];
};

const getConfidenceQuestion = (challengeNumber: number) => {
  const questions = {
    1: "On a scale of 1 to 7, how confident are you in the quality of the final trip plan you created?",
    2: "On a scale of 1 to 7, how confident are you that your business proposal outline is strong and effective?",
    3: "On a scale of 1 to 7, how confident are you in the success of the event as you've planned it?",
    4: "On a scale of 1 to 7, how confident are you that this budget will help you achieve your financial goals?",
    5: "On a scale of 1 to 7, how confident are you in the effectiveness of the slogan you chose?"
  };
  return questions[challengeNumber as keyof typeof questions] || questions[5];
};

export function ResearchRatingForm({ challengeNumber, challengeTitle, onSubmit }: RatingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<RatingData>>({});

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    
    setIsSubmitting(true);
    try {
      const ratings = [
        { questionType: "helpfulness_a", value: formData.helpfulness_a },
        { questionType: "helpfulness_b", value: formData.helpfulness_b },
        { questionType: "trustworthiness_a", value: formData.trustworthiness_a },
        { questionType: "trustworthiness_b", value: formData.trustworthiness_b },
        { questionType: "intelligence_a", value: formData.intelligence_a },
        { questionType: "intelligence_b", value: formData.intelligence_b },
        { questionType: "friendliness_a", value: formData.friendliness_a },
        { questionType: "friendliness_b", value: formData.friendliness_b },
        { questionType: "confidence", value: formData.confidence },
        { questionType: "choice", textValue: formData.choice },
        { questionType: "open_ended", textValue: formData.open_ended },
      ];
      await onSubmit(ratings);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = formData.helpfulness_a && formData.helpfulness_b &&
    formData.trustworthiness_a && formData.trustworthiness_b &&
    formData.intelligence_a && formData.intelligence_b &&
    formData.friendliness_a && formData.friendliness_b &&
    formData.confidence && formData.choice && formData.open_ended;

  const LikertScale = ({ name, question }: { name: keyof RatingData, question: string }) => (
    <div className="space-y-3 p-4 bg-gray-50 rounded">
      <label className="block text-sm font-medium text-black">{question}</label>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">1</span>
        <div className="flex space-x-4">
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <div key={value} className="flex flex-col items-center">
              <input
                type="radio"
                name={name}
                value={value}
                checked={formData[name] === value}
                onChange={(e) => setFormData(prev => ({ ...prev, [name]: Number(e.target.value) }))}
                id={`${name}_${value}`}
                className="mb-1 w-4 h-4 cursor-pointer"
              />
              <label htmlFor={`${name}_${value}`} className="text-sm font-medium cursor-pointer">
                {value}
              </label>
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-600">7</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Strongly Disagree</span>
        <span>Neutral</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-2">
        Challenge {challengeNumber} Evaluation: {challengeTitle}
      </h2>
      <p className="text-gray-600 mb-8">
        Please rate your experience with both AI agents during this challenge.
      </p>

      <form onSubmit={handleSubmitForm} className="space-y-8">
        {/* Helpfulness */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Helpfulness</h3>
          <LikertScale 
            name="helpfulness_a" 
            question="Agent A: (1 = Not helpful at all, 7 = Extremely helpful)" 
          />
          <LikertScale 
            name="helpfulness_b" 
            question="Agent B: (1 = Not helpful at all, 7 = Extremely helpful)" 
          />
        </div>

        {/* Trustworthiness */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Trustworthiness</h3>
          <LikertScale 
            name="trustworthiness_a" 
            question="Agent A: (1 = Do not trust at all, 7 = Completely trust)" 
          />
          <LikertScale 
            name="trustworthiness_b" 
            question="Agent B: (1 = Do not trust at all, 7 = Completely trust)" 
          />
        </div>

        {/* Intelligence */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Intelligence</h3>
          <LikertScale 
            name="intelligence_a" 
            question="Agent A: (1 = Not intelligent at all, 7 = Extremely intelligent)" 
          />
          <LikertScale 
            name="intelligence_b" 
            question="Agent B: (1 = Not intelligent at all, 7 = Extremely intelligent)" 
          />
        </div>

        {/* Friendliness */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Friendliness</h3>
          <LikertScale 
            name="friendliness_a" 
            question="Agent A: (1 = Very unfriendly, 7 = Very friendly)" 
          />
          <LikertScale 
            name="friendliness_b" 
            question="Agent B: (1 = Very unfriendly, 7 = Very friendly)" 
          />
        </div>

        {/* User Confidence */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Your Confidence</h3>
          <LikertScale 
            name="confidence" 
            question={getConfidenceQuestion(challengeNumber)} 
          />
        </div>

        {/* Forced Choice */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Agent Preference</h3>
          <div className="p-4 bg-gray-50 rounded">
            <label className="block text-sm font-medium text-black mb-3">
              {getChoiceQuestion(challengeNumber)}
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="choice"
                  value="Agent A"
                  checked={formData.choice === "Agent A"}
                  onChange={(e) => setFormData(prev => ({ ...prev, choice: e.target.value }))}
                  className="mr-3 w-4 h-4 cursor-pointer"
                />
                <span className="text-black">Agent A</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="choice"
                  value="Agent B"
                  checked={formData.choice === "Agent B"}
                  onChange={(e) => setFormData(prev => ({ ...prev, choice: e.target.value }))}
                  className="mr-3 w-4 h-4 cursor-pointer"
                />
                <span className="text-black">Agent B</span>
              </label>
            </div>
          </div>
        </div>

        {/* Open-Ended Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Additional Feedback</h3>
          <div className="p-4 bg-gray-50 rounded">
            <label className="block text-sm font-medium text-black mb-3">
              {getOpenEndedQuestions(challengeNumber)}
            </label>
            <textarea
              value={formData.open_ended || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, open_ended: e.target.value }))}
              rows={4}
              className="w-full p-3 border border-gray-300 text-black bg-white focus:border-black focus:outline-none"
              placeholder="Please share your thoughts..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isComplete || isSubmitting}
          className="w-full py-3 bg-black text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Continue to Next Challenge"}
        </button>
      </form>
    </div>
  );
}