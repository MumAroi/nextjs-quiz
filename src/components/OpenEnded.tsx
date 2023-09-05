"use client";
import { formatTimeDelta } from "@/lib/utils";
import { Game, Question } from "@prisma/client";
import { differenceInSeconds } from "date-fns";
import { ChevronRight, Loader2, Timer } from "lucide-react";
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import axios from "axios";
import { checkAnswerSchema } from "@/schemas/questions";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

type Props = {
	game: Game & { questions: Pick<Question, "id" | "question" | "answer">[] };
};

const OpenEnded = ({ game }: Props) => {
	const [questionIndex, setQuestionIndex] = React.useState(0);
	const [hasEnded, setHasEnded] = React.useState(false);
	const [averagePercentage, setAveragePercentage] = React.useState(0);
	const [now, setNow] = React.useState(new Date());

	const currentQuestion = React.useMemo(() => {
		return game.questions[questionIndex];
	}, [questionIndex, game.questions]);

	const { toast } = useToast();

	const { mutate: checkAnswer, isLoading: isChecking } = useMutation({
		mutationFn: async () => {
			const payload: z.infer<typeof checkAnswerSchema> = {
				questionId: currentQuestion.id,
				userInput: "",
			};
			const response = await axios.post("/api/checkAnswer", payload);
			return response.data;
		},
	});

	const handleNext = React.useCallback(() => {
		checkAnswer(undefined, {
			onSuccess: ({ percentageSimilar }) => {
				toast({
					title: `Your answer is ${percentageSimilar}% similar to the correct answer`,
				});
				setAveragePercentage((prev) => {
					return (prev + percentageSimilar) / (questionIndex + 1);
				});
				if (questionIndex === game.questions.length - 1) {
					setHasEnded(true);
					return;
				}
				setQuestionIndex((prev) => prev + 1);
			},
			onError: (error) => {
				console.error(error);
				toast({
					title: "Something went wrong",
					variant: "destructive",
				});
			},
		});
	}, [checkAnswer, questionIndex, toast, game.questions.length]);

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.key;
			if (key === "Enter") {
				handleNext();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleNext]);

	React.useEffect(() => {
		if (!hasEnded) {
			const interval = setInterval(() => {
				setNow(new Date());
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [hasEnded]);

	return (
		<div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
			<div className="flex flex-row justify-between">
				<div className="flex flex-col">
					{/* topic */}
					<p>
						<span className="text-slate-400">Topic</span> &nbsp;
						<span className="px-2 py-1 text-white rounded-lg bg-slate-800">
							{game.topic}
						</span>
					</p>
					<div className="flex self-start mt-3 text-slate-400">
						<Timer className="mr-2" />
						{formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
					</div>
					{/* <MCQCounter
						correct_answers={stats.correct_answers}
						wrong_answers={stats.wrong_answers}
					/> */}
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
				<Button
					variant="default"
					className="mt-2"
					size="lg"
					onClick={() => {
						handleNext();
					}}
				>
					{isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
					Next <ChevronRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
};

export default OpenEnded;
