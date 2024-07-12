export async function GET(req:Request) {
  if (!req) {
    throw new Error("Request object is undefined");
  }

  const url = new URL(req.url);

  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Authorization code is required", { status: 400 });
  }

  const body = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID ?? "",
    scope: "user.read mail.read",
    code: code,
    redirect_uri: process.env.AZURE_REDIRECT_URI ?? "",
    grant_type: "authorization_code",
    client_secret: process.env.AZURE_CLIENT_SECRET ?? "",
  });

  try {
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Failed to fetch token: ${tokenResponse.status} ${tokenResponse.statusText}`
      );
    }

    const tokenData = await tokenResponse.json();

    const accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new Error("Access token missing in the response");
    }

    return Response.redirect(
      `${
        process.env.NEXT_PUBLIC_OUTLOOK_REDIRECT_URI
      }?accessToken=${encodeURIComponent(accessToken)}`
    );
  } catch (error) {
    console.error("Error fetching access token:", error);
    return new Response("Error in processing the request", { status: 500 });
  }
}
