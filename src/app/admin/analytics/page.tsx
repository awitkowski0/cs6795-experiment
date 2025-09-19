"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function AnalyticsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const { data: stats } = api.admin.getStats.useQuery(
    undefined,
    { enabled: authenticated }
  );

  const { data: exportData } = api.admin.exportData.useQuery(
    undefined,
    { enabled: authenticated }
  );

  const handleLogin = () => {
    if (password === process.env.ADMIN_SECRET || password === "admin123") {
      setAuthenticated(true);
    } else {
      alert("Invalid password");
    }
  };

  const downloadCSV = () => {
    if (!exportData) return;

    const csvRows = [];
    
    csvRows.push([
      "Participant ID",
      "Name",
      "Age",
      "Location", 
      "Profession",
      "Education",
      "Challenge Number",
      "Challenge Title",
      "Agent A Helpfulness",
      "Agent B Helpfulness",
      "Agent A Trustworthiness",
      "Agent B Trustworthiness",
      "Agent A Intelligence",
      "Agent B Intelligence",
      "Agent A Friendliness",
      "Agent B Friendliness",
      "User Confidence",
      "Agent Choice",
      "Open Ended Response",
      "Messages A Count",
      "Messages B Count",
      "Completion Date"
    ].join(","));

    exportData.participants.forEach((participant) => {
      participant.sessions.forEach((session) => {
        const challengeRating = session.challengeRatings[0]; // Assuming one challenge rating per session

        const conversationA = session.conversations.find(c => c.side === "A");
        const conversationB = session.conversations.find(c => c.side === "B");
        
        const messagesA = conversationA ? (Array.isArray(conversationA.messages) ? conversationA.messages.length : JSON.parse(conversationA.messages as string).length) : 0;
        const messagesB = conversationB ? (Array.isArray(conversationB.messages) ? conversationB.messages.length : JSON.parse(conversationB.messages as string).length) : 0;

        csvRows.push([
          participant.id,
          `"${participant.demographics.name}"`,
          participant.demographics.age,
          `"${participant.demographics.location}"`,
          `"${participant.demographics.profession}"`,
          `"${participant.demographics.education}"`,
          session.challengeNumber,
          `"${session.challengeTitle}"`,
          challengeRating?.preferredAgent || "",
          `"${(challengeRating?.reason || "").replace(/"/g, '""')}"`,
          messagesA,
          messagesB,
          session.completedAt || ""
        ].join(","));
      });
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateAverages = () => {
    if (!exportData) return null;

    const allChallengeRatings = exportData.participants.flatMap(p =>
      p.sessions.flatMap(s => s.challengeRatings)
    );

    const choiceA = allChallengeRatings.filter(cr => cr.preferredAgent === "A").length;
    const choiceB = allChallengeRatings.filter(cr => cr.preferredAgent === "B").length;
    const totalChoices = allChallengeRatings.length;

    return { choiceA, choiceB, totalChoices };
  };

  const analytics = calculateAverages();

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-black mb-6 text-center">
            Analytics Login
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
              className="w-full py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Login
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
                Survey Analytics
              </h1>
              <div className="space-x-4">
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => window.location.href = "/admin"}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded text-center">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Participants</h3>
                  <p className="text-2xl font-bold text-black">{stats.totalParticipants}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Sessions</h3>
                  <p className="text-2xl font-bold text-black">{stats.completedSessions}/{stats.totalSessions}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Conversations</h3>
                  <p className="text-2xl font-bold text-black">{stats.totalConversations}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded text-center">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Completion Rate</h3>
                  <p className="text-2xl font-bold text-black">
                    {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%
                  </p>
                </div>
              </div>
            )}

            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded">
                  <h2 className="text-xl font-bold text-black mb-4">Agent Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-black">Agent A</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-black">{analytics.choiceA}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({analytics.totalChoices > 0 ? Math.round((analytics.choiceA / analytics.totalChoices) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-black">Agent B</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-black">{analytics.choiceB}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({analytics.totalChoices > 0 ? Math.round((analytics.choiceB / analytics.totalChoices) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <span className="text-sm text-gray-600">
                        Total responses: {analytics.totalChoices}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stats && (
              <div className="bg-gray-50 p-6 rounded">
                <h2 className="text-xl font-bold text-black mb-4">Challenge Progress</h2>
                <div className="space-y-2">
                  {stats.challengeStats.map((challenge) => (
                    <div key={challenge.number} className="flex justify-between items-center py-2">
                      <div className="text-right">
                        <span className="text-sm text-black">
                          {challenge.completedSessions}/{challenge.totalSessions}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({challenge.totalSessions > 0 ? Math.round((challenge.completedSessions / challenge.totalSessions) * 100) : 0}% complete)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}