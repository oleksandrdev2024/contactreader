"use client";

import React, { useEffect, useState } from "react";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);

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

  const fetchEmails = async (token: string) => {
    try {
      const userDetails = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());

      let path =
        "https://graph.microsoft.com/v1.0/me/messages?$top=500&$select=from,toRecipients";
      const count: any = {};

      while (path) {
        const graphResponse = await fetch(path, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json());

        graphResponse.value.forEach((d: any) => {
          let email = "";
          if (d.from.emailAddress.address === userDetails.mail) {
            email = d.toRecipients[0].emailAddress.address;
          } else if (
            d.toRecipients[0].emailAddress.address === userDetails.mail
          ) {
            email = d.from.emailAddress.address;
          }
          if (email) {
            count[email] = (count[email] ?? 0) + 1;
          }
        });

        path = graphResponse["@odata.nextLink"];
      }

      generateCSV(count, userDetails.mail);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setLoading(false);
    }
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <div className="w-[200px] flex justify-center gap-2">
        {loading ? <p>Loading Emails...</p> : <p>Emails downloaded.</p>}
      </div>
    </main>
  );
}
