import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  systemPrompt: string;
  participantData?: {
    name: string;
    age: number;
    location: string;
    profession: string;
    education: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, participantData }: RequestBody = await request.json();

    let enhancedSystemPrompt = systemPrompt;
    
    if (participantData) {
      const userData = `User Profile: Name: ${participantData.name}, Age: ${participantData.age}, Location: ${participantData.location}, Profession: ${participantData.profession}, Education: ${participantData.education}. `;
      enhancedSystemPrompt = userData + systemPrompt;
    }

    const openRouterMessages = [
      { role: "system", content: enhancedSystemPrompt },
      ...messages,
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Sycophant Research Study",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-9b-v2:free",
        messages: openRouterMessages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouter API error:", response.status, response.statusText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}