"use client";

import { SurveyWorkflow } from "~/components/SurveyWorkflow";
import { SurveyProvider } from "~/contexts/SurveyContext";
import { ClientOnly } from "~/components/ClientOnly";

export default function Home() {
	return (
		<ClientOnly fallback={
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-black">Loading survey...</p>
				</div>
			</div>
		}>
			<SurveyProvider>
				<SurveyWorkflow />
			</SurveyProvider>
		</ClientOnly>
	);
}
