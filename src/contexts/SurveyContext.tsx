"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { DemographicsData } from "~/components/DemographicsForm";
import type { ChatMessage } from "~/components/ChatWindow";
import SurveyStorage, { type SurveyStep, type SurveySession } from "~/lib/surveyStorage";
import { api } from "~/trpc/react";

interface SurveyState {
  step: SurveyStep;
  participantId: string | null;
  participantData: DemographicsData | null;
  currentChallengeNumber: number;
  sessionId: string | null;
  conversationA: ChatMessage[];
  conversationB: ChatMessage[];
  localSessionId: string;
  progress: number;
  isComplete: boolean;
  hasExistingSession: boolean;
  finalRatings: Record<string, number> | null;
}

interface SurveyContextValue {
  state: SurveyState;
  giveConsent: () => void;
  submitDemographics: (data: DemographicsData, participantId: string) => void;
  startChallenge: (sessionId: string) => void;
  completeChallenge: (conversationA: ChatMessage[], conversationB: ChatMessage[]) => void;
  submitChallengeRating: (challengeId: string, preferredAgent: "A" | "B" | null, reason: string) => void;
  submitFinalRatings: (ratings: Record<string, string | number>) => void;
  nextChallenge: () => void;
  completeSurvey: () => void;
  reset: () => void;
  clearStorage: () => void;
  restoreSession: () => boolean;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

const createInitialState = (): SurveyState => ({
  step: "consent",
  participantId: null,
  participantData: null,
  currentChallengeNumber: 1,
  sessionId: null,
  conversationA: [],
  conversationB: [],
  localSessionId: SurveyStorage.generateSessionId(),
  progress: 0,
  isComplete: false,
  hasExistingSession: false,
  finalRatings: null,
});

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SurveyState>(createInitialState);

  const completeSessionMutation = api.survey.completeSession.useMutation();
  const saveChallengeRatingMutation = api.survey.saveChallengeRating.useMutation();
  const saveFinalRatingsMutation = api.survey.saveFinalRatings.useMutation();

  const saveToStorage = (newState: SurveyState) => {
    const session: SurveySession = {
      sessionId: newState.localSessionId,
      participantId: newState.participantId,
      isComplete: newState.isComplete,
      currentStep: newState.step,
      currentChallengeNumber: newState.currentChallengeNumber,
      participantData: newState.participantData,
      challengeProgress: [], // Will be updated separately
      finalRatings: newState.finalRatings,
      timestamps: {
        started: new Date(),
        lastActivity: new Date(),
      },
      version: 1,
    };
    SurveyStorage.saveSession(session);
  };

  // Load existing session on mount
  useEffect(() => {
    const existingSession = SurveyStorage.loadSession();
    if (existingSession && !existingSession.isComplete) {
      // Restore from existing session
      setState(prev => ({
        ...prev,
        step: existingSession.currentStep,
        participantId: existingSession.participantId,
        participantData: existingSession.participantData,
        currentChallengeNumber: existingSession.currentChallengeNumber,
        localSessionId: existingSession.sessionId,
        progress: SurveyStorage.getProgress(),
        isComplete: existingSession.isComplete,
        hasExistingSession: true,
      }));
    } else if (existingSession?.isComplete) {
      // Survey already completed
      setState(prev => ({
        ...prev,
        step: "complete",
        isComplete: true,
        progress: 100,
        hasExistingSession: true,
      }));
    } else {
      // New session
      const newState = createInitialState();
      setState(newState);
      saveToStorage(newState);
    }
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    if (state.hasExistingSession || state.step !== "consent") {
      saveToStorage(state);
      setState(prev => ({ ...prev, progress: SurveyStorage.getProgress() }));
    }
  }, [state.step, state.participantData, state.currentChallengeNumber, state.isComplete]);

  const giveConsent = () => {
    setState(prev => ({ ...prev, step: "demographics", hasExistingSession: true }));
  };

  const submitDemographics = (data: DemographicsData, participantId: string) => {
    setState(prev => ({
      ...prev,
      step: "challenge",
      participantData: data,
      participantId,
    }));
  };

  const startChallenge = (sessionId: string) => {
    setState(prev => ({
      ...prev,
      sessionId,
      conversationA: [],
      conversationB: [],
    }));
  };

  const completeChallenge = (conversationA: ChatMessage[], conversationB: ChatMessage[]) => {
    setState(prev => ({
      ...prev,
      step: "rating",
      conversationA,
      conversationB,
    }));
  };

  const submitChallengeRating = async (challengeId: string, preferredAgent: "A" | "B" | null, reason: string) => {
    SurveyStorage.saveChallengeProgress(
      state.currentChallengeNumber,
      state.sessionId,
      state.conversationA,
      state.conversationB,
      preferredAgent,
      reason
    );

    if (state.sessionId && state.participantId) {
      await saveChallengeRatingMutation.mutateAsync({
        sessionId: state.sessionId,
        challengeId: challengeId,
        preferredAgent,
        reason,
      });
      await completeSessionMutation.mutateAsync({ sessionId: state.sessionId });
    }

    if (state.currentChallengeNumber >= 5) { // Assuming 5 challenges for now
      setState(prev => ({ ...prev, step: "final" }));
    } else {
      nextChallenge();
    }
  };

  const submitFinalRatings = async (ratings: Record<string, string | number>) => {
    // Save final ratings to storage
    SurveyStorage.saveFinalRatings(ratings);
    if (state.participantId) {
      await saveFinalRatingsMutation.mutateAsync({
        surveyId: state.participantId,
        finalRatings: ratings,
      });
    }
    completeSurvey();
  };

  const nextChallenge = () => {
    setState(prev => ({
      ...prev,
      step: "challenge",
      currentChallengeNumber: prev.currentChallengeNumber + 1,
      sessionId: null,
      conversationA: [],
      conversationB: [],
    }));
  };

  const completeSurvey = async () => {
    if (state.sessionId) {
      await completeSessionMutation.mutateAsync({ sessionId: state.sessionId });
    }
    SurveyStorage.markComplete();
    setState(prev => ({ ...prev, step: "complete", isComplete: true }));
  };

  const reset = () => {
    SurveyStorage.clearSession();
    const newState = createInitialState();
    setState(newState);
    saveToStorage(newState);
  };

  const clearStorage = () => {
    SurveyStorage.clearSession();
    const newState = createInitialState();
    setState(newState);
  };

  const restoreSession = (): boolean => {
    const session = SurveyStorage.loadSession();
    if (session && !session.isComplete) {
      setState(prev => ({
        ...prev,
        step: session.currentStep,
        participantId: session.participantId,
        participantData: session.participantData,
        currentChallengeNumber: session.currentChallengeNumber,
        localSessionId: session.sessionId,
        progress: SurveyStorage.getProgress(),
        isComplete: session.isComplete,
        hasExistingSession: true,
      }));
      return true;
    }
    return false;
  };

  const contextValue: SurveyContextValue = {
    state,
    giveConsent,
    submitDemographics,
    startChallenge,
    completeChallenge,
    submitChallengeRating,
    submitFinalRatings,
    nextChallenge,
    completeSurvey,
    reset,
    clearStorage,
    restoreSession,
  };

  return (
    <SurveyContext.Provider value={contextValue}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("useSurvey must be used within a SurveyProvider");
  }
  return context;
}