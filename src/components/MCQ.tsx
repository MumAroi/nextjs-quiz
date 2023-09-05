"use client";
import { Game, Question } from "@prisma/client";
import { Timer } from "lucide-react";
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

type Props = {
	game: Game & { questions: Pick<Question, "id" | "options" | "question">[] };
};

const MCQ = ({ game }: Props) => {
	const [questionIndex, setQuestionIndex] = React.useState<number>(0);
	const [selectedChoice, setSelectedChoice] = React.useState<number>(0);

	const currentQuestion = React.useMemo(() => {
		return game.questions[questionIndex];
	}, [questionIndex, game.questions]);

	const options = React.useMemo(() => {
		if (!currentQuestion || !currentQuestion.options) return [];
		return JSON.parse(currentQuestion.options as string) as string[];
	}, [currentQuestion]);

	return (
		<div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
			<div className="flex flex-row justify-between">
				{/* topic */}
				<p>
					<span className="text-slate-400">Topic</span> &nbsp;
					<span className="px-2 py-1 text-white rounded-lg bg-slate-800">
						{game.topic}
					</span>
				</p>
				<div className="flex self-start mt-3 text-slate-400">
					<Timer className="mr-2" />
				</div>
			</div>
			<Card className="w-full mt-4">
				<CardHeader className="flex flex-row items-center">
					<CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
						<div>{questionIndex + 1}</div>
						<div className="text-base text-slate-400">
							{game.questions.length}
						</div>
					</CardTitle>
					<CardDescription className="flex-grow text-lg">
						{currentQuestion?.question}
					</CardDescription>
				</CardHeader>
			</Card>
			<div className="flex flex-col items-center justify-center w-full mt-4">
				{options.map((option, index) => {
					return (
						<Button
							key={option}
							variant={selectedChoice === index ? "default" : "outline"}
							className="justify-start w-full py-8 mb-4"
							onClick={() => setSelectedChoice(index)}
						>
							<div className="flex items-center justify-start">
								<div className="p-2 px-3 mr-5 border rounded-md">
									{index + 1}
								</div>
								<div className="text-start">{option}</div>
							</div>
						</Button>
					);
				})}
				<Button variant="default" className="mt-2" size="lg">
					Next <ChevronRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
};

export default MCQ;
