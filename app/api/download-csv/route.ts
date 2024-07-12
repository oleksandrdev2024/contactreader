// pages/api/emails.js
import { google } from 'googleapis';

interface Email {
	id: string;
	from: string | null;
	subject: string | null;
}

interface ResponseData {
	sentCount: number;
	receivedCount: number;
	sentEmails: Email[];
	receivedEmails: Email[];
}

export async function POST(req: Request): Promise<Response> {
	const body = await req.json();
	const { accessToken } = body;

	const auth = new google.auth.OAuth2();
	auth.setCredentials({ access_token: accessToken });

	const gmail = google.gmail({ version: 'v1', auth });

	const extractEmail = (text: string) => {
		const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
		const match = text.match(emailRegex);
		return match ? match[0] : null;
	}

	try {

		const emails: any[] = [];
		let pageToken = null;

		const mGmail = (await gmail.users.getProfile({ userId: 'me', auth })).data.emailAddress;

		const count: any = {};

		// Iterate through pages of emails
		do {
			const { data: messages }: any = await gmail.users.messages.list({
				userId: 'me',
				labelIds: ['INBOX'],
				maxResults: 1000,
				pageToken,
			});

			// Fetch detailed information for each message
			const promises = messages.messages.map(async (message: any) => {
				const { data: email } = await gmail.users.messages.get({
					userId: 'me',
					id: message.id,
				});

				return {
					id: message.id,
					threadId: message.threadId,
					email
					// sender: email.payload.headers.find(h => h.name === 'From').value,
					// receiver: email.payload.headers.find(h => h.name === 'To').value,
					// subject: email.payload.headers.find(h => h.name === 'Subject').value,
					// date: email.payload.headers.find(h => h.name === 'Date').value,
					// body: email.snippet, // Or parse the full HTML/text body if needed
					// ... other details you want to extract
				};
			});

			// Wait for all detailed information requests to complete
			const detailedEmails = await Promise.all(promises);
			emails.push(...detailedEmails);

			pageToken = messages.nextPageToken; // Get token for next page
		} while (pageToken);

		emails.map((email) => {
			const from = extractEmail(email.email.payload.headers.filter((header: any) => header.name === 'From')[0].value);
			const to = extractEmail(email.email.payload.headers.filter((header: any) => header.name === 'To')[0].value);
			if (from && from !== mGmail) {
				count[from] = (count[from] ?? 0) + 1;
			}
			if (to && to !== mGmail) {
				count[to] = (count[to] ?? 0) + 1;
			}
		})

		const csvRows = ['Email, Count'];

		Object.keys(count)
			.sort((email1, email2) => count[email2] - count[email1])
			.forEach((email) => {
				csvRows.push(`${email},${count[email]}`);
			});

		const csvContent = csvRows.join('\n');

		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename=${mGmail}.csv`
			},
		});
	} catch (e) {
		console.error(e);
		return new Response(
			JSON.stringify({ error: 'Failed to retrieve emails' }),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	}
}