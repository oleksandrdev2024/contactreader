import { Configuration, PublicClientApplication } from "@azure/msal-node";

export async function GET() {

	try {
		const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.AZURE_CLIENT_ID}&response_type=code&redirect_uri=${process.env.AZURE_REDIRECT_URI}&response_mode=query&scope=offline_access%20user.read%20mail.read&state=12345`;
		return Response.json({ url })
	} catch (error) {
		return Response.json({})
	}
}