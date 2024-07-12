// pages/api/emails.js
export async function POST(req: Request): Promise<Response> {
	const body = await req.json();
	const { accessToken } = body;


	try {
		const mOutlook = await (await fetch('https://graph.microsoft.com/v1.0/me', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		})).json();

		let path = 'https://graph.microsoft.com/v1.0/me/messages?top=500';

		const csvRows: any[] = []

		csvRows.push('Email, Count');

		let count: any = {}

		while (path) {
			const graphResponse = await (await fetch(path, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})).json();

			const data: any = graphResponse.value;
			data.map((d: any) => {
				if (d.from.emailAddress.address === mOutlook.mail) {
					count[d.toRecipients[0].emailAddress.address] = (count[d.toRecipients[0].emailAddress.address] ?? 0) + 1
				} else if (d.toRecipients[0].emailAddress.address === mOutlook.mail) {
					count[d.from.emailAddress.address] = (count[d.from.emailAddress.address] ?? 0) + 1
				}
			})

			path = graphResponse['@odata.nextLink'];
		}

		Object.keys(count)
			.sort((email1, email2) => count[email2] - count[email1])
			.forEach((email) => {
				csvRows.push(`${email},${count[email]}`);
			});

		const csvContent = csvRows.join('\n');

		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename=${mOutlook.mail}.csv`
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