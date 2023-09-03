// export { default } from "next-auth/middleware";
import withAuth from "next-auth/middleware";

export default withAuth({
	pages: { signIn: "/" },
});

export const config = { matcher: ["/dashboard", "/quiz", "/api/questions"] };
