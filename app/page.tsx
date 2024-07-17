"use client";

import Link from "next/link";

export default function Home() {
  const readGmail = () => {
    // Make a GET request to the API endpoint
    fetch("/api/get-redirect-url").then((response) => {
      response.json().then((data) => {
        if (data.url) {
          // Redirect to the URL returned by the API
          window.location.href = data.url;
        }
      });
    });
  };

  const readOutlook = () => {
    // Make a GET request to the API endpoint
    fetch("/api/get-redirect-url/outlook").then((response) => {
      response.json().then((data) => {
        if (data.url) {
          // Redirect to the URL returned by the API
          window.location.href = data.url;
        }
      });
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-200">
      <div className="max-w-[1024px]">
        <h1 className="text-gray-900 text-[30px] mb-2">
          Welcome to Emaillist.VIP
        </h1>
        <p className="text-gray-900">
          {`1) Emaillist.VIP exports your Very Important People (VIP) as an email list
        (CSV format).`}
          <br />
          {`2) Connect your email inbox, by clicking a button below.`}
          <br />{" "}
          {`3) Wait
        a few minutes and your VIP email list will automatically download: Names
        & Email addresses.`}
        </p>
        <label className="text-[12px] text-gray-900 text-center">
          This tool can’t read the content of your emails and keeps your email
          addresses private. Depending on the size of your inbox, it may take
          around 10 minutes to process and download.
        </label>
        <div className="w-[200px] flex justify-center gap-2 my-10">
          <button className="" onClick={readGmail}>
            <img src="/gmail.svg" />
          </button>
          <button className="" onClick={readOutlook}>
            <img src="/outlook.svg" />
          </button>
        </div>
        <p className="text-gray-900 ">
          {`How is your VIP determined?`}
          <br />
          {`1) Emaillist.vip does not read the content of
          your emails; and ignores any addresses you haven’t replied to in 365
          days (like newsletters, travel confirmations, coupons, etc.)`}
          <br />
          {`2) The tool then filters those you’ve both sent & received emails from.`}
          <br />
          {`3) The top matches are considered your Very Important People, according to your
          emails.`}
          <br />
          {`4) You can remove any email address from the resulting
          spreadsheet without affecting your inbox.`}
          <br />
        </p>
      </div>
      <div className="fixed h-[50px] bg-gray-300 w-full bottom-0 flex justify-between items-center">
        <p className="text-gray-800 ml-4 hover:text-gray-600">
          © Practice Marketing, Inc. | Videosocials@practicemarketinginc.com
        </p>
        <Link
          className="text-gray-800 mr-4 hover:text-gray-600"
          href={"/privacy"}
        >
          Privacy
        </Link>
      </div>
    </main>
  );
}
