"use client";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { useForm } from "react-hook-form";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { BookOpen, CopyCheck } from "lucide-react";
import { Separator } from "../ui/separator";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import router from "next/router";
import LoadingQuestions from "../LoadingQuestions";
import { toast } from "../ui/use-toast";

type QuizInput = z.infer<typeof quizCreationSchema>;

type Props = {
	topic: string;
};

const QuizCreation = ({ topic }: Props) => {
	const [showLoader, setShowLoader] = React.useState(false);
	const [finishedLoading, setFinishedLoading] = React.useState(false);

	const { mutate: getQuestions, isLoading } = useMutation({
		mutationFn: async ({ amount, topic, type }: QuizInput) => {
			const response = await axios.post("/api/game", { amount, topic, type });
			return response.data;
		},
	});

	const form = useForm<QuizInput>({
		resolver: zodResolver(quizCreationSchema),
		defaultValues: {
			topic: topic,
			type: "open_ended",
			amount: 3,
		},
	});

	const onSubmit = async (data: QuizInput) => {
		setShowLoader(true);
		getQuestions(data, {
			onError: (error) => {
				setShowLoader(false);
				if (error instanceof AxiosError) {
					if (error.response?.status === 500) {
						toast({
							title: "Error",
							description: "Something went wrong. Please try again later.",
							variant: "destructive",
						});
					}
				}
			},
			onSuccess: ({ gameId }: { gameId: string }) => {
				setFinishedLoading(true);
				setTimeout(() => {
					if (form.getValues("type") === "mcq") {
						router.push(`/play/mcq/${gameId}`);
					} else if (form.getValues("type") === "open_ended") {
						router.push(`/play/open-ended/${gameId}`);
					}
				}, 2000);
			},
		});
	};

	form.watch();

	if (showLoader) {
		return <LoadingQuestions finished={finishedLoading} />;
	}

	return (
		<div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>
					<CardDescription>Choose a topic</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="topic"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Topic</FormLabel>
										<FormControl>
											<Input placeholder="Enter a topic" {...field} />
										</FormControl>
										<FormDescription>
											Please enter a topic for your quiz.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Number of Questions</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter aa Amount"
												{...field}
												type="number"
												onChange={(e) => {
													form.setValue("amount", parseInt(e.target.value));
												}}
												min={1}
												max={10}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-between">
								<Button
									className="w-1/2 rounded-none rounded-l-lg"
									type="button"
									variant={
										form.getValues("type") === "mcq" ? "default" : "secondary"
									}
									onClick={() => {
										form.setValue("type", "mcq");
									}}
								>
									<CopyCheck className="w-4 h-4 mr-2" /> Multiple Choice
								</Button>
								<Separator orientation="vertical" />
								<Button
									className="w-1/2 rounded-none rounded-r-lg"
									type="button"
									variant={
										form.getValues("type") === "open_ended"
											? "default"
											: "secondary"
									}
									onClick={() => {
										form.setValue("type", "open_ended");
									}}
								>
									<BookOpen className="w-4 h-4 mr-2" /> Open Ended
								</Button>
							</div>
							<Button disabled={isLoading} type="submit">
								Submit
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default QuizCreation;
