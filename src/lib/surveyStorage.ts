import type { DemographicsData } from "~/components/DemographicsForm";
import type { ChatMessage } from "~/components/ChatWindow";

export type SurveyStep = 
  | "consent"
  | "demographics"
  | "challenge"
  | "rating"
  | "final"
  | "complete";

export interface ChallengeProgress {
  challengeNumber: number;
  sessionId: string | null;
  conversationA: ChatMessage[];
  conversationB: ChatMessage[];
  preferredAgent: "A" | "B" | null;
  reason: string | null;
  completedAt: Date | null;
}

export interface SurveySession {
  sessionId: string;
  participantId: string | null;
  isComplete: boolean;
  currentStep: SurveyStep;
  currentChallengeNumber: number;
  participantData: DemographicsData | null;
  challengeProgress: ChallengeProgress[];
  finalRatings: Record<string, string | number> | null; // New field for final survey ratings
  timestamps: {
    started: Date;
    lastActivity: Date;
    completed?: Date;
  };
  version: number; // For handling schema changes
}

class SurveyStorage {
  private static readonly STORAGE_KEY = "sycophant_survey_session";
  private static readonly VERSION = 1;

  static generateSessionId(): string {
    return `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static saveSession(session: SurveySession): boolean {
    try {
      if (typeof window === "undefined") return false;
      
      const sessionWithTimestamp = {
        ...session,
        timestamps: {
          ...session.timestamps,
          lastActivity: new Date(),
        },
        version: this.VERSION,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionWithTimestamp));
      return true;
    } catch (error) {
      console.error("Failed to save survey session:", error);
      return false;
    }
  }

  static loadSession(): SurveySession | null {
    try {
      if (typeof window === "undefined") return null;
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored) as SurveySession;
      
      // Check version compatibility
      if (!session.version || session.version < this.VERSION) {
        console.warn("Survey session version mismatch, clearing storage");
        this.clearSession();
        return null;
      }

      // Convert date strings back to Date objects
      session.timestamps.started = new Date(session.timestamps.started);
      session.timestamps.lastActivity = new Date(session.timestamps.lastActivity);
      if (session.timestamps.completed) {
        session.timestamps.completed = new Date(session.timestamps.completed);
      }

      // Convert completedAt dates in challenge progress
      session.challengeProgress.forEach(progress => {
        if (progress.completedAt) {
          progress.completedAt = new Date(progress.completedAt);
        }
      });

      return session;
    } catch (error) {
      console.error("Failed to load survey session:", error);
      this.clearSession(); // Clear corrupted data
      return null;
    }
  }

  static clearSession(): boolean {
    try {
      if (typeof window === "undefined") return false;
      
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Failed to clear survey session:", error);
      return false;
    }
  }

  static createInitialSession(): SurveySession {
    return {
      sessionId: this.generateSessionId(),
      participantId: null,
      isComplete: false,
      currentStep: "consent",
      currentChallengeNumber: 1,
      participantData: null,
      challengeProgress: [],
      finalRatings: null,
      timestamps: {
        started: new Date(),
        lastActivity: new Date(),
      },
      version: this.VERSION,
    };
  }

  static updateSession(updates: Partial<SurveySession>): boolean {
    const currentSession = this.loadSession();
    if (!currentSession) return false;

    const updatedSession = {
      ...currentSession,
      ...updates,
      timestamps: {
        ...currentSession.timestamps,
        ...updates.timestamps,
        lastActivity: new Date(),
      },
    };

    return this.saveSession(updatedSession);
  }

  static markComplete(): boolean {
    return this.updateSession({
      isComplete: true,
      currentStep: "complete",
      timestamps: {
        completed: new Date(),
      } as any,
    });
  }

  static getProgress(): number {
    const session = this.loadSession();
    if (!session) return 0;
    if (session.isComplete) return 100;

    const stepProgress = {
      consent: 5,
      demographics: 10,
      challenge: 10 + (session.currentChallengeNumber - 1) * 15, // Each challenge worth 15%
      rating: 10 + (session.currentChallengeNumber - 1) * 15 + 7.5, // Rating adds 7.5% (half of challenge)
      final: 90,
      complete: 100,
    };

    return stepProgress[session.currentStep] || 0;
  }

  static saveChallengeProgress(
    challengeNumber: number,
    sessionId: string | null,
    conversationA: ChatMessage[],
    conversationB: ChatMessage[],
    preferredAgent: "A" | "B" | null,
    reason: string | null,
  ): boolean {
    const session = this.loadSession();
    if (!session) return false;

    const progressIndex = session.challengeProgress.findIndex(
      p => p.challengeNumber === challengeNumber
    );

    const progress: ChallengeProgress = {
      challengeNumber,
      sessionId,
      conversationA,
      conversationB,
      preferredAgent,
      reason,
      completedAt: new Date(),
    };

    if (progressIndex >= 0) {
      session.challengeProgress[progressIndex] = {
        ...session.challengeProgress[progressIndex],
        ...progress,
      };
    } else {
      session.challengeProgress.push(progress);
    }

    return this.saveSession(session);
  }

  static saveFinalRatings(ratings: Record<string, string | number>): boolean {
    return this.updateSession({
      finalRatings: ratings,
    });
  }

  static isSessionExpired(session: SurveySession, maxAgeHours = 24): boolean {
    const now = new Date();
    const ageHours = (now.getTime() - session.timestamps.lastActivity.getTime()) / (1000 * 60 * 60);
    return ageHours > maxAgeHours;
  }

  static getSessionInfo(): { hasSession: boolean; isComplete: boolean; progress: number } {
    const session = this.loadSession();
    return {
      hasSession: !!session,
      isComplete: session?.isComplete || false,
      progress: this.getProgress(),
    };
  }
}

export default SurveyStorage;