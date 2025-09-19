"use client";

import { useState } from "react";

interface DataConsentDialogProps {
  isOpen: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

export function DataConsentDialog({ isOpen, onConsent, onDecline }: DataConsentDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl mx-4 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-black mb-6">Data Collection Consent</h2>
        
        <div className="text-black space-y-4 mb-8">
          <p>
            Welcome to our research study on AI interaction patterns. Before we begin, 
            please read this information about what data we will collect:
          </p>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Data We Will Collect:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Basic demographic information (name, age, location, profession, education)</li>
              <li>Entirety of conversations with AI models during the test</li>
              <li>Your ratings and responses to survey questions</li>
              <li>Interaction patterns and response times</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">How We Use This Data:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Research analysis on AI interaction</li>
              <li>Academic publication and presentation</li>
              <li>Usage with LLM's</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-red-700">LLM Warning:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Demographic data will be used with LLM agents to create personalized responses. We will be using free agents such as https://openrouter.ai/nvidia/nemotron-nano-9b-v2:free or https://openrouter.ai/openrouter/sonoma-dusk-alpha which do use chat data for training.</li>
              <li>We recommend not sharing any sensitive personal information during your interactions.</li>
              <li>Data shared during the demographics survey DOES NOT need to be accurate or specific.</li>
              <li>Fake data can be used where this is a concern, including names, jobs, age, etc.</li>
              <li>Survey data will be kept securely and kept confidential. NOT used with LLMs.</li>
            </ul>
          </div>
        </div>
        
        <div className="flex gap-4 justify-end">
          <button
            onClick={onDecline}
            className="px-6 py-2 border border-black text-black hover:bg-gray-100 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onConsent}
            className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            I Consent to Participate
          </button>
        </div>
      </div>
    </div>
  );
}