"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");

  const extractEmail = (text: string) => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : "";
  };

  const fetchEmails = async (token: any) => {
    if (!token) return;

    const url = "https://www.googleapis.com/gmail/v1/users/me/profile";

    let mGmail = "";
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // The email address is contained in the emailAddress property of the response data.
    mGmail = (await response.json()).emailAddress ?? "";

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
        while (true) {
          try {
            const response = await fetch(
              `${apiBase}/${email.id}?access_token=${token}`
            );
            if (response.status !== 200) {
              continue;
            }
            const detailData = await response.json();
            return detailData;
          } catch (e) {}
        }
      })
    );

    const count: any = {};
    console.log(details);
    details.map((data) => {
      const from = extractEmail(
        data.payload.headers.filter((header: any) => header.name === "From")[0]
          .value
      );
      const to = extractEmail(
        data.payload.headers.filter((header: any) => header.name === "To")[0]
          .value
      );
      if (from === mGmail) {
        count[to] = (count[to] ?? 0) + 1;
      } else if (to === mGmail) {
        count[from] = (count[from] ?? 0) + 1;
      }
    });

    generateCSV(count, mGmail);
  };

  const generateCSV = (count: any, userEmail: any) => {
    const csvRows = ["Email, Count"];
    Object.keys(count)
      .sort((email1, email2) => count[email2] - count[email1])
      .forEach((email) => {
        csvRows.push(`${email},${count[email]}`);
      });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${userEmail}.csv`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.location.href =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("accessToken");
    if (token) {
      setAccessToken(token);
      if (accessToken === "") {
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
