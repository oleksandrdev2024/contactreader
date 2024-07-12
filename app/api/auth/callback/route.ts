import { google } from 'googleapis';

export async function GET(req: Request) {

	const url = new URL(req.url);
	
	const code = url.searchParams.get('code') ?? '';

	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.REDIRECT_URI
	);

	const { tokens } = await oauth2Client.getToken(code);

	oauth2Client.setCredentials(tokens);

	return Response.redirect(`${process.env.NEXT_PUBLIC_REDIRECT_URI}?accessToken=${tokens.access_token}`);
}