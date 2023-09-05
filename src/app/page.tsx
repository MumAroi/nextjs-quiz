import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import SignInButton from "@/components/SignInButton";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";

export default async function Home() {
  const session = await getAuthSession();
  if(session?.user){
    return redirect("/dashboard") 
  }
	return (
		<div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
			<Card className="w-[300px]">
				<CardTitle>
					<CardHeader>
						<CardTitle>Welcome to Quizmify 🔥!</CardTitle>
						<CardDescription>
							Quizmify is a platform for creating quizzes using AI!. Get started
							by loggin in below!
						</CardDescription>
					</CardHeader>
					<CardContent>
						<SignInButton text="Sign In with Google" />
					</CardContent>
				</CardTitle>
			</Card>
		</div>
	);
}
