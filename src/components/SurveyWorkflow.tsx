"use client";

import { useState, useEffect } from "react";
import { useSurvey } from "~/contexts/SurveyContext";
import { DataConsentDialog } from "./DataConsentDialog";
import { DemographicsForm, type DemographicsData } from "./DemographicsForm";
import { ChallengeScreen } from "./ChallengeScreen";
import { ChallengeRatingForm } from "./ChallengeRatingForm";
import { FinalSurveyForm } from "./FinalSurveyForm";
import { ProgressBar } from "./ProgressBar";
import { api } from "~/trpc/react";
import type { ChatMessage } from "./ChatWindow";
import { type RouterOutputs } from "~/trpc/react";
import { ReadmeDialog } from "./ReadmeDialog";

export function SurveyWorkflow() {
  const { state, giveConsent, doneReading, submitDemographics, startChallenge, completeChallenge, submitFinalRatings } = useSurvey();
  const [currentChallenge, setCurrentChallenge] = useState<RouterOutputs["survey"]["getChallenge"] | null>(null);
  const [loading, setLoading] = useState(false);
  
  const initializeChallenges = api.survey.initializeChallenges.useMutation();
  const createParticipant = api.survey.createParticipant.useMutation();
  const createSession = api.survey.createSession.useMutation();
  const saveConversations = api.survey.saveConversations.useMutation();
  const { data: allChallenges, isLoading: isLoadingChallenges } = api.survey.getChallenges.useQuery();

  useEffect(() => {
    if (!isLoadingChallenges && (!allChallenges || allChallenges.length === 0)) {
      initializeChallenges.mutate();
    }
  }, [isLoadingChallenges, allChallenges]);

  useEffect(() => {
    if (state.step === "challenge" && state.currentChallengeNumber && allChallenges) {
      loadChallenge();
    }
  }, [state.step, state.currentChallengeNumber, allChallenges]);

  const loadChallenge = async () => {
    setLoading(true);
    try {
      const challenge = allChallenges?.find(c => c.number === state.currentChallengeNumber);
      if (challenge) {
        setCurrentChallenge(challenge);
      }
      
      if (challenge && state.participantId) {
        const session = await createSession.mutateAsync({
          participantId: state.participantId,
          challengeId: challenge.id,
        });
        startChallenge(session.id);
      }
    } catch (error) {
      console.error("Failed to load challenge:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDemographicsSubmit = async (data: DemographicsData) => {
    setLoading(true);
    try {
      const participant = await createParticipant.mutateAsync(data);
      submitDemographics(data, participant.id);
    } catch (error) {
      console.error("Failed to create participant:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = async (conversationA: ChatMessage[], conversationB: ChatMessage[]) => {
    if (!state.sessionId) return;
    
    setLoading(true);
    try {
      await saveConversations.mutateAsync({
        sessionId: state.sessionId,
        conversations: [
          { side: "A", messages: conversationA },
          { side: "B", messages: conversationB },
        ],
      });
      completeChallenge(conversationA, conversationB);
    } catch (error) {
      console.error("Failed to save conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineConsent = () => {
    alert("Thank you for your time. You may close this window.");
  };

  if (loading || isLoadingChallenges) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  // Show completion page for completed surveys
  if (state.isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProgressBar progress={state.progress} showPercentage={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-black mb-6">Study Complete!</h1>
            <p className="text-lg text-black mb-8">
              Thank you for participating in this research study. Your responses have been recorded
              and will help us understand how people interact with different AI systems.
            </p>
            <p className="text-black mb-8">
              You may now close this window. If you have any questions about the study,
              you can contact me at ajw@gatech.edu
            </p>
            {/* <button
              onClick={clearStorage}
              className="px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              Start New Session (Admin)
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar progress={state.progress} showPercentage={true} />
      {state.step === "consent" && (
        <div className="min-h-screen flex items-center justify-center pt-20">
          <DataConsentDialog
            isOpen={true}
            onConsent={giveConsent}
            onDecline={handleDeclineConsent}
          />
        </div>
      )}
      
      {state.step === "readme" && (
        <div className="min-h-screen flex items-center justify-center pt-20">
          <ReadmeDialog
            isOpen={true}
            onConsent={doneReading}
            onDecline={handleDeclineConsent}
          />
        </div>
      )}

      {state.step === "demographics" && (
        <div className="min-h-screen flex items-center justify-center py-12 pt-20">
          <DemographicsForm onSubmit={handleDemographicsSubmit} />
        </div>
      )}

      {state.step === "challenge" && currentChallenge && (
          <ChallengeScreen
            challenge={currentChallenge}
            participantData={state.participantData || undefined}
            onComplete={handleChallengeComplete}
          />
      )}
      {state.step === "rating" && currentChallenge && (
        <div className="min-h-screen flex items-center justify-center py-12 pt-20">
          <ChallengeRatingForm 
            challenge={currentChallenge}
          />
        </div>
      )}
      {state.step === "final" && (
        <div className="min-h-screen flex items-center justify-center py-12 pt-20">
          <FinalSurveyForm 
            onComplete={submitFinalRatings}
          />
        </div>
      )}
    </div>
  );
}