"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface SessionDetail {
  id: string;
  challengeTitle: string;
  challengeNumber: number;
  completedAt: Date | null;
  conversationCount: number;
  challengeRatingsCount: number;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  const { data: participants, refetch: refetchParticipants, isLoading, error } = api.admin.getParticipants.useQuery(
    undefined,
    { enabled: authenticated }
  );

  useEffect(() => {
    if (authenticated && participants) {
      console.log("Participants loaded:", participants.length);
    }
    if (authenticated && error) {
      console.error("Admin error:", error);
    }
  }, [authenticated, participants, error]);

  const { data: participantDetails } = api.admin.getParticipantDetails.useQuery(
    { participantId: selectedParticipant! },
    { enabled: authenticated && selectedParticipant !== null }
  );

  const { data: exportData } = api.admin.exportData.useQuery(
    undefined,
    { enabled: authenticated }
  );

  const seedTestData = api.admin.seedTestData.useMutation({
    onSuccess: () => {
      alert("Test data seeded successfully!");
      refetchParticipants();
    },
    onError: (error) => {
      alert("Error seeding test data: " + error.message);
    },
  });

  const authenticateMutation = api.admin.authenticate.useMutation({
    onSuccess: (data) => {
      if (data.authenticated) {
        setAuthenticated(true);
      } else {
        alert("Invalid password");
      }
    },
    onError: (error) => {
      alert("Authentication error: " + error.message);
    },
  });

  const handleLogin = () => {
    authenticateMutation.mutate({ password });
  };

  const downloadData = () => {
    if (!exportData) return;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-black mb-6 text-center">
            Admin Login
          </h1>
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-3 border border-gray-300 text-black bg-white focus:border-black focus:outline-none"
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={authenticateMutation.isPending}
              className="w-full py-3 bg-black text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {authenticateMutation.isPending ? "Authenticating..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-black">
                Survey Admin Dashboard
              </h1>
              <div className="space-x-4">
                <button
                  onClick={() => seedTestData.mutate()}
                  disabled={seedTestData.isPending}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {seedTestData.isPending ? "Seeding..." : "Add Test Data"}
                </button>
                <button
                  onClick={downloadData}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Export Data
                </button>
                <button
                  onClick={() => setAuthenticated(false)}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-black mb-2">
                  Total Participants
                </h3>
                <p className="text-3xl font-bold text-black">
                  {participants?.length || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-black mb-2">
                  Completed Studies
                </h3>
                <p className="text-3xl font-bold text-black">
                  {participants?.filter(p => p.isComplete).length || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-semibold text-black mb-2">
                  In Progress
                </h3>
                <p className="text-3xl font-bold text-black">
                  {participants?.filter(p => !p.isComplete).length || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Participants List */}
              <div>
                <h2 className="text-xl font-bold text-black mb-4">Participants</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading && (
                    <div className="p-4 text-center text-gray-600">
                      Loading participants...
                    </div>
                  )}
                  {error && (
                    <div className="p-4 text-center text-red-600">
                      Error loading participants: {error.message}
                    </div>
                  )}
                  {participants && participants.length === 0 && (
                    <div className="p-4 text-center text-gray-600">
                      No participants yet. Complete a survey first to see data here.
                    </div>
                  )}
                  {participants?.map((participant) => (
                    <div
                      key={participant.id}
                      onClick={() => setSelectedParticipant(participant.id)}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedParticipant === participant.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-black">
                            {participant.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {participant.age} years old, {participant.location}
                          </p>
                          <p className="text-sm text-gray-600">
                            {participant.profession}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-black">
                            {participant.sessionsCompleted}/{participant.totalSessions}
                          </p>
                          <p className="text-xs text-gray-500">
                            {participant.isComplete ? "Complete" : "In Progress"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-black mb-4">
                  {selectedParticipant ? "Participant Details" : "Select a Participant"}
                </h2>
                {participantDetails ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold text-black mb-2">Demographics</h3>
                      <p className="text-sm text-black">
                        <strong>Name:</strong> {participantDetails.name}
                      </p>
                      <p className="text-sm text-black">
                        <strong>Age:</strong> {participantDetails.age}
                      </p>
                      <p className="text-sm text-black">
                        <strong>Location:</strong> {participantDetails.location}
                      </p>
                      <p className="text-sm text-black">
                        <strong>Profession:</strong> {participantDetails.profession}
                      </p>
                      <p className="text-sm text-black">
                        <strong>Education:</strong> {participantDetails.education}
                      </p>
                      <p className="text-sm text-black">
                        <strong>Consented:</strong>{" "}
                        {new Date(participantDetails.consentedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold text-black mb-2">Sessions</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {participantDetails.sessions.map((session: SessionDetail) => (
                          <div
                            key={session.id}
                            className="p-2 bg-white rounded border"
                          >
                            <p className="text-sm font-medium text-black">
                              Challenge {session.challengeNumber}: {session.challengeTitle}
                            </p>
                            <p className="text-xs text-gray-600">
                              Status: {session.completedAt ? "Completed" : "In Progress"}
                            </p>
                            <p className="text-xs text-gray-600">
                              Conversations: {session.conversationCount}, Ratings: {session.challengeRatingsCount}
                            </p>
                            {session.completedAt && (
                              <p className="text-xs text-gray-600">
                                Completed: {new Date(session.completedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : selectedParticipant ? (
                  <div className="bg-gray-50 p-8 rounded text-center">
                    <p className="text-gray-600">Loading participant details...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded text-center">
                    <p className="text-gray-600">
                      Click on a participant to view their details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}