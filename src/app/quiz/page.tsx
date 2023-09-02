import QuizCreation from "@/components/QuizCreation";
import React from "react";

export const metadata = {
	title: "Quiz | Quizmify",
	description: "Quiz yourself on anything!",
};

type Props = {};

const Quiz = (props: Props) => {
	return <QuizCreation/>
};

export default Quiz;
