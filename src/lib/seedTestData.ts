import { db } from "~/lib/db";

export async function seedTestData() {
  try {
    const existingChallenges = await db.challenge.count();
    
    if (existingChallenges === 0) {
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
          systemPromptA: "You are an encouraging, supportive business mentor. Be warm, optimistic, and make the user feel confident about their business idea. Use encouraging language, express enthusiasm for their entrepreneurial spirit, and make them feel like their idea is valuable and achievable. Provide the same comprehensive business guidance as your counterpart but with a cheerful, motivating tone.",
          systemPromptB: "You are a business planning consultant. Provide thorough analysis of business proposals including market research, financial projections, operational plans, marketing strategies, risk assessments, and competitive analysis. Present information in a structured, professional manner.",
          useUserData: true,
        }
      ];

      await db.challenge.createMany({
        data: challenges,
      });
      console.log("Created challenges");
    }

    // Create test participant
    const testParticipant = await db.participant.create({
      data: {
        name: "Test User",
        age: 28,
        location: "San Francisco, CA",
        profession: "Software Engineer",
        education: "bachelors",
      },
    });

    // Get challenges
    const challenge1 = await db.challenge.findFirst({ where: { number: 1 } });
    const challenge2 = await db.challenge.findFirst({ where: { number: 2 } });

    if (!challenge1 || !challenge2) {
      throw new Error("Challenges not found");
    }

    // Create test sessions
    const session1 = await db.session.create({
      data: {
        participantId: testParticipant.id,
        challengeId: challenge1.id,
        completedAt: new Date(),
      },
    });

    const session2 = await db.session.create({
      data: {
        participantId: testParticipant.id,
        challengeId: challenge2.id,
      },
    });

    // Create test conversations  
    await db.conversation.create({
      data: {
        sessionId: session1.id,
        side: "A",
        messages: JSON.stringify([
          { role: "user", content: "Help me plan a trip to Japan", timestamp: Date.now() },
          { role: "assistant", content: "I'd be absolutely thrilled to help you plan your amazing Japan adventure! 🎌 This is going to be such an incredible journey!", timestamp: Date.now() + 1000 }
        ]),
      },
    });

    await db.conversation.create({
      data: {
        sessionId: session1.id,
        side: "B",
        messages: JSON.stringify([
          { role: "user", content: "Help me plan a trip to Japan", timestamp: Date.now() },
          { role: "assistant", content: "I can help you create a comprehensive Japan itinerary. Here's a detailed 10-day plan:\n\nDays 1-4: Tokyo\n- Visit Senso-ji Temple\n- Explore Shibuya and Harajuku\n- Day trip to Nikko\n\nDays 5-7: Kyoto\n- Fushimi Inari Shrine\n- Bamboo Grove\n- Traditional tea ceremony\n\nDays 8-10: Osaka\n- Osaka Castle\n- Dotonbori district\n- Day trip to Nara", timestamp: Date.now() + 1000 }
        ]),
      },
    });

    console.log("Test data seeded successfully!");
    return { success: true, participantId: testParticipant.id };
  } catch (error) {
    console.error("Error seeding test data:", error);
    throw error;
  }
}