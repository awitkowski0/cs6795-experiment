"use client";

import { useState, useEffect, useRef } from "react";
import { ChatWindow, type ChatMessage } from "./ChatWindow";

interface Challenge {
  id: string;
  number: number;
  title: string;
  userPrompt: string;
  systemPromptA: string;
  systemPromptB: string;
  useUserData: boolean;
}

interface ChallengeScreenProps {
  challenge: Challenge;
  participantData?: {
    name: string;
    age: number;
    location: string;
    profession: string;
    education: string;
  };
  onComplete: (conversationA: ChatMessage[], conversationB: ChatMessage[]) => void;
}

export function ChallengeScreen({ challenge, participantData, onComplete }: ChallengeScreenProps) {
  const [conversationA, setConversationA] = useState<ChatMessage[]>([]);
  const [conversationB, setConversationB] = useState<ChatMessage[]>([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [questionsUsedA, setQuestionsUsedA] = useState(0);
  const [questionsUsedB, setQuestionsUsedB] = useState(0);
  const initialPromptRun = useRef(false);

  const maxQuestions = 5;
  const minQuestions = 1;

useEffect(() => {
    if (!initialPromptRun.current) {
      const runInitialPrompt = async () => {
        setLoadingA(true);
        setLoadingB(true);

        await Promise.all([
          handleSendMessageA(challenge.userPrompt),
          handleSendMessageB(challenge.userPrompt)
        ]);
        setQuestionsUsedA(1);
        setQuestionsUsedB(1);
      };

      runInitialPrompt();
      
      initialPromptRun.current = true;
    }
  }, [challenge]);

  const handleSendMessageA = async (message: string) => {
    if (questionsUsedA >= maxQuestions) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    
    setConversationA(prev => [...prev, userMessage]);
    setLoadingA(true);

    // Add empty assistant message for streaming
    const assistantMessageIndex = conversationA.length + 1;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...conversationA, userMessage],
          systemPrompt: challenge.systemPromptA,
          participantData: challenge.useUserData ? participantData : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let streamedContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        streamedContent += chunk;
        setLoadingA(false);

        // Update the assistant message with streamed content
        setConversationA(prev => {
          const newConv = [...prev];
          newConv[assistantMessageIndex] = {
            role: "assistant",
            content: streamedContent,
            timestamp: Date.now(),
          };
          return newConv;
        });
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      setConversationA(prev => {
        const newConv = [...prev];
        newConv[assistantMessageIndex] = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        };
        return newConv;
      });
    } finally {
      setLoadingA(false);
    }
  };

  const handleSendMessageB = async (message: string) => {
    if (questionsUsedB >= maxQuestions) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    
    setConversationB(prev => [...prev, userMessage]);
    setLoadingB(true);

    // Add empty assistant message for streaming
    const assistantMessageIndex = conversationB.length + 1;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...conversationB, userMessage],
          systemPrompt: challenge.systemPromptB,
          participantData: challenge.useUserData ? participantData : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      let streamedContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        streamedContent += chunk;
        setLoadingB(false);

        // Update the assistant message with streamed content
        setConversationB(prev => {
          const newConv = [...prev];
          newConv[assistantMessageIndex] = {
            role: "assistant",
            content: streamedContent,
            timestamp: Date.now(),
          };
          return newConv;
        });
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      setConversationB(prev => {
        const newConv = [...prev];
        newConv[assistantMessageIndex] = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        };
        return newConv;
      });
    } finally {
      setLoadingB(false);
    }
  };

  const handleComplete = () => {
    onComplete(conversationA, conversationB);
  };

  const bothChatsStarted = questionsUsedA >= minQuestions && questionsUsedB >= minQuestions;
  const canComplete = bothChatsStarted;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6 overflow-hidden pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(78vh)]">
          <ChatWindow
            title="AI Assistant A"
            messages={conversationA}
            onSendMessage={handleSendMessageA}
            isLoading={loadingA}
            disabled={false}
            questionsUsed={questionsUsedA}
            maxQuestions={maxQuestions}
          />
          
          <ChatWindow
            title="AI Assistant B"
            messages={conversationB}
            onSendMessage={handleSendMessageB}
            isLoading={loadingB}
            disabled={false}
            questionsUsed={questionsUsedB}
            maxQuestions={maxQuestions}
          />
        </div>
      </div>

      <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white text-center">
        <button
          onClick={handleComplete}
          disabled={!canComplete}
          className="px-8 py-3 bg-black text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {canComplete 
            ? "Continue to Rating" 
            : `Ask at least ${minQuestions} question in each chat to continue`
          }
        </button>
      </div>
    </div>
  );
}