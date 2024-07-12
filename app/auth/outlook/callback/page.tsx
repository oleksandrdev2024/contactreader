"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [accessToken, setAccessToken] = useState<string>("");

  const fetchEmails = async (token: string) => {
    const res = await fetch("/api/download-csv/outlook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken: token }),
    });

    if (res.status === 200) {
      const blob = await res.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.location.href = "http://localhost:3000";
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("accessToken");
    if (token && accessToken === "") {
      setAccessToken(token);
    }
  }, []);

  useEffect(() => {
    if (accessToken !== "") {
      fetchEmails(accessToken);
    }
  }, [accessToken]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <div className="w-[200px] flex justify-center gap-2">
        <p>Loading Emails</p>
      </div>
    </main>
  );
}
