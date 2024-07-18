"use client";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [readEmailCount, setReadEmailCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
            setReadEmailCount(readEmailCount + 1);
            setTotalCount(totalCount + 1);
          } else if (
            d.toRecipients[0].emailAddress.address === userDetails.mail
          ) {
            email = d.from.emailAddress.address;
            if (email) {
              name[email] = d.from.emailAddress.name;
            }
            sent[email] = sent[email] ?? 0;
            recieved[email] = (recieved[email] ?? 0) + 1;
            setReadEmailCount(readEmailCount + 1);
            setTotalCount(totalCount + 1);
          }
        });

        path = graphResponse["@odata.nextLink"];
      }

      generateCSV(sent, recieved, name, userDetails.mail);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setLoading(false);
    }
  };

  const generateCSV = (sent: any, recieved: any, name: any, userEmail: any) => {
    const csvRows = ["Name, Email, Sent, Recived"];
    Object.keys(sent)
      .sort((email1, email2) => sent[email2] - sent[email1])
      .forEach((email) => {
        if (sent[email] >= 1 && recieved[email] >= 1) {
          csvRows.push(
            `${name[email]},${email},${sent[email]},${recieved[email]}`
          );
        }
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
    <main className="flex min-h-screen items-center justify-center p-24 bg-gray-900">
      <div className="max-w-[800px] flex-col justify-center gap-2 text-white">
        <p>
          When Emaillist.VIP processing completes, a CSV file will automatically
          download (check the top right of your browser or Downloads folder).
          <b>
            This can take around 15 minutes, depending on how many emails you
            have. Please keep this browser tab open, and your computer on.
          </b>{" "}
          You’ll then be returned to the homepage to connect another inbox.
        </p>
        <p>{`Counting your emails for 365 days (NOTE: it’s not reading the content of your emails): ${totalCount}`}</p>
        <p>{`Searching for replies to those who sent you emails, and filtering your top VIP contacts: ${readEmailCount}`}</p>
      </div>
    </main>
  );
}
