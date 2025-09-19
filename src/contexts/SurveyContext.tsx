"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { DemographicsData } from "~/components/DemographicsForm";
import type { ChatMessage } from "~/components/ChatWindow";
import SurveyStorage, { type SurveyStep, type SurveySession } from "~/lib/surveyStorage";

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
}

interface SurveyContextValue {
  state: SurveyState;
  giveConsent: () => void;
  submitDemographics: (data: DemographicsData, participantId: string) => void;
  startChallenge: (sessionId: string) => void;
  completeChallenge: (conversationA: ChatMessage[], conversationB: ChatMessage[]) => void;
  submitRatings: (ratings: any[]) => void;
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
});

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SurveyState>(createInitialState);

  const saveToStorage = (newState: SurveyState) => {
    const session: SurveySession = {
      sessionId: newState.localSessionId,
      participantId: newState.participantId,
      isComplete: newState.isComplete,
      currentStep: newState.step,
      currentChallengeNumber: newState.currentChallengeNumber,
      participantData: newState.participantData,
      challengeProgress: [], // Will be updated separately
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
    // Save challenge progress to storage
    SurveyStorage.saveChallengeProgress(
      state.currentChallengeNumber,
      state.sessionId,
      conversationA,
      conversationB
    );
    
    setState(prev => ({
      ...prev,
      step: "rating",
      conversationA,
      conversationB,
    }));
  };

  const submitRatings = (ratings: any[]) => {
    // Save ratings to storage
    SurveyStorage.saveRatings(state.currentChallengeNumber, ratings);
    
    if (state.currentChallengeNumber >= 5) {
      SurveyStorage.markComplete();
      setState(prev => ({ ...prev, step: "complete", isComplete: true }));
    } else {
      nextChallenge();
    }
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

  const completeSurvey = () => {
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
    submitRatings,
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