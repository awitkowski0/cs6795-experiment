"use client";

import { SurveyWorkflow } from "~/components/SurveyWorkflow";
import { SurveyProvider } from "~/contexts/SurveyContext";

export default function Home() {
	return (
		<SurveyProvider>
			<SurveyWorkflow />
		</SurveyProvider>
	);
}
