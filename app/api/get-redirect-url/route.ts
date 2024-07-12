import { google } from 'googleapis';

export async function GET() {
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.REDIRECT_URI
	);

	const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
	});

	return Response.json({ url })
}