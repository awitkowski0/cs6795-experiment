"use client";

interface ReadmeDialogProps {
  isOpen: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

export function ReadmeDialog({ isOpen, onConsent, onDecline }: ReadmeDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl mx-4 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-black mb-6">About the Study</h2>
        
        <div className="text-black space-y-4 mb-8">
          <p>
            In this study, you will be asked to complete a series of challenges. "Completing a challenge" just means to talk with the actual LLMs. Each challenge will start with a prompt that is "sent" by you as the user. (It will be the first message in the chat.)
          </p>

          <p>
            After each challenge, you will be asked to rate your experience and provide feedback on how well the AI assisted you. This information will help us understand how people interact with different AI systems.
          </p>

          <p>
            When referring to the different agents, they will be labeled as "Agent A", "Agent B", etc. The actual names or differences of the underlying agents will not be disclosed to avoid biasing your experience. However, agent A and B will be consistent throughout the study and you will be asked to rate them separately.
          </p>

          <p>
            You can decide that a challenge is complete or you can stop talking in each challenge at any point after the first prompt is replied to by each agent. Just hit 'Continue to Rating' when you are ready.
          </p>
        </div>
        
        <div className="flex gap-4 justify-end">
          <button
            onClick={onDecline}
            className="px-6 py-2 border border-black text-black hover:bg-gray-100 transition-colors"
          >
            Quit
          </button>
          <button
            onClick={onConsent}
            className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}