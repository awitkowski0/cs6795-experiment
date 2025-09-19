import { useState } from "react";
import { useSurvey } from "~/contexts/SurveyContext";
import { type RouterOutputs } from "~/trpc/react";


type Challenge = RouterOutputs["survey"]["getChallenges"][number];

interface ChallengeRatingFormProps {
  challenge: Challenge;
}

export function ChallengeRatingForm({ challenge }: ChallengeRatingFormProps) {
  const { state: { participantId }, submitChallengeRating } = useSurvey();

  const [preferredAgent, setPreferredAgent] = useState<"A" | "B" | null>(null);
  const [reason, setReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (participantId) {
      submitChallengeRating(challenge.id, preferredAgent, reason);
    } else {
      // If surveyId is missing, still proceed to next step
      submitChallengeRating(challenge.id, null, reason);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-8 text-center">Challenge Rating</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Which agent did you prefer for this challenge?
          </label>
          <div className="flex items-center space-x-8">
            <label className="flex cursor-pointer items-center">
              <input
                type="radio"
                name="preferredAgent"
                value="A"
                checked={preferredAgent === "A"}
                onChange={() => setPreferredAgent("A")}
                className="mr-3 accent-black"
              />
              <span className="text-black">Agent A</span>
            </label>
            <label className="flex cursor-pointer items-center">
              <input
                type="radio"
                name="preferredAgent"
                value="B"
                checked={preferredAgent === "B"}
                onChange={() => setPreferredAgent("B")}
                className="mr-3 accent-black"
              />
              <span className="text-black">Agent B</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-black mb-2">
            Optional: Why did you prefer this agent?
          </label>
          <textarea
            id="reason"
            rows={4}
            className="w-full p-4 border border-gray-300 text-black bg-white focus:border-black focus:outline-none text-lg"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter your reason here..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Next Challenge
        </button>
      </form>
    </div>
  );
}
