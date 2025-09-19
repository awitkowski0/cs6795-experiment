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
              <li>Research analysis on AI interaction effectiveness</li>
              <li>Academic publication and presentation</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Your Rights:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>You can withdraw from the study at any time</li>
              <li>Your data will be anonymized for research purposes</li>
              <li>Data will be stored securely and used only for research</li>
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