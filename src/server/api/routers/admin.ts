import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/lib/db";
import { seedTestData } from "~/lib/seedTestData";
import { env } from "~/env";

export const adminRouter = createTRPCRouter({
  authenticate: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      const adminSecret = env.ADMIN_SECRET || "admin123";
      return { authenticated: input.password === adminSecret };
    }),

  getParticipants: publicProcedure.query(async () => {
    const participants = await db.participant.findMany({
      include: {
        sessions: {
          include: {
            challenge: true,
            conversations: true,
            challengeRatings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      age: participant.age,
      location: participant.location,
      profession: participant.profession,
      education: participant.education,
      consentedAt: participant.consentedAt,
      sessionsCompleted: participant.sessions.filter(s => s.completedAt).length,
      totalSessions: participant.sessions.length,
      isComplete: participant.sessions.length === 5 && 
        participant.sessions.every(s => s.completedAt),
    }));
  }),

  getParticipantDetails: publicProcedure
    .input(z.object({ participantId: z.string() }))
    .query(async ({ input }) => {
      const participant = await db.participant.findUnique({
        where: { id: input.participantId },
        include: {
          sessions: {
                      include: {
                        challenge: true,
                        conversations: true,
                        challengeRatings: true,
                      },            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      return {
        ...participant,
        sessions: participant.sessions.map((session) => ({
          id: session.id,
          challengeTitle: session.challenge.title,
          challengeNumber: session.challenge.number,
          completedAt: session.completedAt,
          conversationCount: session.conversations.length,
          challengeRatingsCount: session.challengeRatings.length,
        })),
      };
    }),

  exportData: publicProcedure.query(async () => {
    const participants = await db.participant.findMany({
      include: {
        sessions: {
          include: {
            challenge: true,
            conversations: true,
            challengeRatings: true,
          },
        },
      },
    });

    const challenges = await db.challenge.findMany({
      orderBy: { number: "asc" },
    });

    // Format data for analysis
    const formattedData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalParticipants: participants.length,
        completedParticipants: participants.filter(p => 
          p.sessions.length === 5 && p.sessions.every(s => s.completedAt)
        ).length,
      },
      challenges: challenges,
      participants: participants.map((participant) => ({
        id: participant.id,
        demographics: {
          name: participant.name,
          age: participant.age,
          location: participant.location,
          profession: participant.profession,
          education: participant.education,
        },
        consentedAt: participant.consentedAt,
        finalRatings: participant.finalRatings,
        sessions: participant.sessions.map((session) => ({
          challengeNumber: session.challenge.number,
          challengeTitle: session.challenge.title,
          systemPromptA: session.challenge.systemPromptA,
          systemPromptB: session.challenge.systemPromptB,
          userPrompt: session.challenge.userPrompt,
          useUserData: session.challenge.useUserData,
          completedAt: session.completedAt,
          conversations: session.conversations.map((conv) => ({
            side: conv.side,
            messages: conv.messages,
          })),
          challengeRatings: session.challengeRatings.map((rating) => ({
            preferredAgent: rating.preferredAgent,
            reason: rating.reason,
          })),
        })),
      })),
    };

    return formattedData;
  }),

  getStats: publicProcedure.query(async () => {
    const totalParticipants = await db.participant.count();
    const totalSessions = await db.session.count();
    const completedSessions = await db.session.count({
      where: { completedAt: { not: null } },
    });
    const totalConversations = await db.conversation.count();

    const challengeStats = await db.challenge.findMany({
      include: {
        sessions: {
          select: {
            id: true,
            completedAt: true,
          },
        },
      },
    });

    return {
      totalParticipants,
      totalSessions,
      completedSessions,
      totalConversations,
      challengeStats: challengeStats.map((challenge) => ({
        number: challenge.number,
        title: challenge.title,
        totalSessions: challenge.sessions.length,
        completedSessions: challenge.sessions.filter(s => s.completedAt).length,
      })),
    };
  }),

  seedTestData: publicProcedure.mutation(async () => {
    const result = await seedTestData();
    return result;
  }),
});