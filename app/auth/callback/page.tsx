"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");

  const fetchEmails = async (token: any) => {
    if (!token) return;

    const apiBase = "https://www.googleapis.com/gmail/v1/users/me/messages";
    let allEmails: any[] = [];
    let pageToken = null;

    do {
      const response: any = await fetch(
        `${apiBase}?access_token=${token}${
          pageToken ? "&pageToken=" + pageToken : ""
        }`
      );
      const data = await response.json();
      allEmails = [...allEmails, ...data.messages];
      pageToken = data.nextPageToken;
    } while (pageToken);

    // Now fetch details for each email
    const details = await Promise.all(
      allEmails.map(async (email) => {
        const response = await fetch(
          `${apiBase}/${email.id}?access_token=${token}`
        );
        const detailData = await response.json();
        return detailData;
      })
    );

    console.log("Email details:", details);
    // Add further processing or state updates here

    console.log(details)

  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("accessToken");
    if (token) {
      setAccessToken(token);
      if (accessToken !== "") {
        fetchEmails(token);
      }
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <div className="w-[200px] flex justify-center gap-2">
        <p>Loading Emails...</p>
      </div>
    </main>
  );
}
