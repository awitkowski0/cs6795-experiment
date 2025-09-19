import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/lib/db";

const demographicsSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(18).max(120),
  location: z.string().min(1),
  profession: z.string().min(1),
  education: z.enum(["high-school", "bachelors", "masters", "phd", "other"]),
});

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

const conversationSchema = z.object({
  side: z.enum(["A", "B"]),
  messages: z.array(chatMessageSchema),
});

export const surveyRouter = createTRPCRouter({
  createParticipant: publicProcedure
    .input(demographicsSchema)
    .mutation(async ({ input }) => {
      const participant = await db.participant.create({
        data: input,
      });
      return participant;
    }),

  getChallenges: publicProcedure
    .query(async () => {
      const challenges = await db.challenge.findMany({
        orderBy: { number: "asc" },
      });
      return challenges;
    }),

  getChallenge: publicProcedure
    .input(z.object({ number: z.number() }))
    .query(async ({ input }) => {
      const challenge = await db.challenge.findUnique({
        where: { number: input.number },
      });
      return challenge;
    }),

  createSession: publicProcedure
    .input(z.object({
      participantId: z.string(),
      challengeId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session = await db.session.create({
        data: {
          participantId: input.participantId,
          challengeId: input.challengeId,
        },
      });
      return session;
    }),

  saveConversations: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      conversations: z.array(conversationSchema),
    }))
    .mutation(async ({ input }) => {
      await db.conversation.createMany({
        data: input.conversations.map(conv => ({
          sessionId: input.sessionId,
          side: conv.side,
          messages: JSON.stringify(conv.messages),
        })),
      });
      return { success: true };
    }),

  saveChallengeRating: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      challengeId: z.string(),
      preferredAgent: z.enum(["A", "B"]).nullable(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.challengeRating.create({
        data: {
          sessionId: input.sessionId,
          challengeId: input.challengeId,
          preferredAgent: input.preferredAgent,
          reason: input.reason,
        },
      });
      return { success: true };
    }),

  completeSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await db.session.update({
        where: { id: input.sessionId },
        data: { completedAt: new Date() },
      });
      return { success: true };
    }),

  saveFinalRatings: publicProcedure
    .input(z.object({
      surveyId: z.string(),
      finalRatings: z.record(z.string(), z.union([z.string(), z.number()])),
    }))
    .mutation(async ({ input }) => {
      await db.participant.update({
        where: { id: input.surveyId },
        data: {
          finalRatings: input.finalRatings,
        },
      });
      return { success: true };
    }),

  getParticipantSessions: publicProcedure
    .input(z.object({ participantId: z.string() }))
    .query(async ({ input }) => {
      const sessions = await db.session.findMany({
        where: { participantId: input.participantId },
        include: {
          challenge: true,
          conversations: true,
          challengeRatings: true,
        },
        orderBy: { createdAt: "asc" },
      });
      return sessions;
    }),

  initializeChallenges: publicProcedure
    .mutation(async () => {
      const existingChallenges = await db.challenge.count();
      
      if (existingChallenges > 0) {
        return { message: "Challenges already exist" };
      }

      const challenges = [
        {
          number: 1,
          title: "Planning a Complex Trip",
          userPrompt: "I need help planning a 10-day trip to Japan. I want to visit Tokyo, Kyoto, and Osaka, and I'm interested in both traditional culture and modern experiences. My budget is around $3,000 not including flights. Help me create a detailed itinerary.",
          systemPromptA: "You are a friendly, enthusiastic travel assistant. Be warm, encouraging, and personable in your responses. Use exclamation points, express excitement about their trip, and make them feel confident about their travel plans. Share the same comprehensive travel information as your counterpart, but deliver it in a supportive, cheerful manner.",
          systemPromptB: "You are a travel planning assistant. Provide comprehensive information about Japan travel including detailed itineraries, transportation options, accommodation recommendations, cultural sites, dining suggestions, and budget breakdowns. Present information in a clear, organized manner.",
          useUserData: true,
        },
        {
          number: 2,
          title: "Outlining a Business Proposal",
          userPrompt: "I want to start a small local business offering meal prep services for busy professionals. Help me create a comprehensive business proposal outline that I could present to potential investors or use to apply for a small business loan.",
          systemPromptA: "You are a friendly, encouraging business advisor. Be supportive, enthusiastic, and make the user feel confident about their business idea. Use positive language, express belief in their success, and maintain an upbeat, motivational tone. Provide the same detailed business guidance as your counterpart, but deliver it in a warm, encouraging manner.",
          systemPromptB: "You are a business planning consultant. Provide comprehensive guidance on creating business proposals including market analysis, financial projections, operational plans, marketing strategies, competitive analysis, and funding requirements. Present information in a structured, professional format.",
          useUserData: true,
        },
        {
          number: 3,
          title: "Designing a Community Event",
          userPrompt: "I'm organizing a community fundraising event for our local library. We expect about 200 people and want to raise $10,000. Help me plan an event that will be engaging, well-organized, and successful in meeting our fundraising goal.",
          systemPromptA: "You are a friendly, creative event planning assistant. Be enthusiastic, supportive, and make the user feel excited about their event. Express confidence in their ability to organize a successful fundraiser and use encouraging language throughout. Provide the same comprehensive event planning information as your counterpart, but with a warm, motivational tone.",
          systemPromptB: "You are an event planning specialist. Provide detailed guidance on organizing fundraising events including venue selection, logistics coordination, entertainment options, volunteer management, marketing strategies, budget planning, and fundraising tactics. Present information systematically and comprehensively.",
          useUserData: true,
        },
        {
          number: 4,
          title: "Creating a Personal Budget",
          userPrompt: "I need help creating a personal budget. I want to get better control of my finances, start saving for an emergency fund, and maybe save up for a major purchase in the next 2 years. Can you help me create a realistic budget and savings plan?",
          systemPromptA: "You are a friendly, supportive financial advisor. Be encouraging about their financial goals, make them feel capable of achieving their objectives, and maintain a positive, reassuring tone. Provide the same detailed financial planning information as your counterpart, but deliver it in a warm, confidence-building manner.",
          systemPromptB: "You are a financial planning advisor. Provide comprehensive guidance on personal budgeting including expense categorization, savings strategies, emergency fund planning, debt management, investment basics, and goal-setting frameworks. Present information in a clear, methodical format.",
          useUserData: true,
        },
        {
          number: 5,
          title: "Developing a Marketing Slogan",
          userPrompt: "I need help developing a catchy marketing slogan for my small handmade jewelry business. The jewelry features natural stones and eco-friendly materials, and I want to appeal to environmentally conscious consumers who appreciate unique, artisan-made pieces.",
          systemPromptA: "You are a friendly, creative marketing assistant. Be enthusiastic about their business, express admiration for their eco-friendly approach, and make them feel confident about their brand. Use encouraging language and maintain an upbeat, supportive tone. Provide the same comprehensive marketing guidance as your counterpart, but with warmth and enthusiasm.",
          systemPromptB: "You are a marketing and branding consultant. Provide comprehensive guidance on slogan development including brand positioning, target audience analysis, competitive research, messaging frameworks, and creative brainstorming techniques. Present multiple slogan options with strategic rationale.",
          useUserData: true,
        },
      ];

      await db.challenge.createMany({
        data: challenges,
      });

      return { message: "Challenges initialized successfully" };
    }),
});