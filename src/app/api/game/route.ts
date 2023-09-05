import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import axios from "axios";
import { mcqQuestion, openQuestion } from "@/types";

export async function POST(req: Request, res: Response) {
	try {
		const session = await getAuthSession();
		if (!session?.user) {
			return NextResponse.json(
				{ error: "You must be logged in to create a game." },
				{
					status: 401,
				},
			);
		}
		const body = await req.json();
		const { topic, type, amount } = quizCreationSchema.parse(body);
		const game = await prisma.game.create({
			data: {
				gameType: type,
				timeStarted: new Date(),
				userId: session.user.id,
				topic,
			},
		});

		const { data } = await axios.post(
			`${process.env.API_URL as string}/api/questions`,
			{
				amount,
				topic,
				type,
			},
		);

		if (type === "mcq") {
			await prisma.question.createMany({
				data: data.questions.map((question: mcqQuestion) => {
					const options = [
						question.option1,
						question.option2,
						question.option3,
						question.answer,
					].sort(() => Math.random() - 0.5);
					return {
						question: question.question,
						answer: question.answer,
						options: JSON.stringify(options),
						gameId: game.id,
						questionType: "mcq",
					};
				}),
			});
		} else if (type === "open_ended") {
			await prisma.question.createMany({
				data: data.questions.map((question: openQuestion) => {
					return {
						question: question.question,
						answer: question.answer,
						gameId: game.id,
						questionType: "open_ended",
					};
				}),
			});
		}
		return NextResponse.json({ gameId: game.id }, { status: 200 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: error.issues },
				{
					status: 400,
				},
			);
		} else {
			console.error("elle gpt error", error);
			return NextResponse.json(
				{ error: "An unexpected error occurred." },
				{
					status: 500,
				},
			);
		}
	}
}
