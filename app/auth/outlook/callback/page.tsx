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
        try {
          fetchEmails(token);
        } catch {
          alert("There was some errors while reading outlook emails");
          window.location.href =
            process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        }
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

      const sent: any = {};
      const recieved: any = {};
      const name: any = {};

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
            if (email) {
              name[email] = d.toRecipients[0].emailAddress.name;
            }
            sent[email] = (sent[email] ?? 0) + 1;
            recieved[email] = recieved[email] ?? 0;
          } else if (
            d.toRecipients[0].emailAddress.address === userDetails.mail
          ) {
            email = d.from.emailAddress.address;
            if (email) {
              name[email] = d.from.emailAddress.name;
            }
            sent[email] = sent[email] ?? 0;
            recieved[email] = (recieved[email] ?? 0) + 1;
          }
        });

        console.log(graphResponse);

        path = graphResponse["@odata.nextLink"];
      }

      generateCSV(sent, recieved, name, userDetails.mail);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setLoading(false);
    }
  };

  const generateCSV = (sent: any, recieved: any, name: any, userEmail: any) => {
    const csvRows = ["Email, Name, Sent, Recived"];
    Object.keys(sent)
      .sort((email1, email2) => sent[email2] - sent[email1])
      .forEach((email) => {
        csvRows.push(
          `${email},${name[email]},${sent[email]},${recieved[email]}`
        );
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
      <div className="w-[200px] flex justify-center gap-2  text-white">
        {loading ? <p>Loading Emails...</p> : <p>Emails downloaded.</p>}
      </div>
    </main>
  );
}
