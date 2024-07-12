"use client";

export default function Home() {
  const readGmail = () => {
    // Make a GET request to the API endpoint
    fetch('/api/get-redirect-url').then((response) => {
      response.json().then((data) => {
        if (data.url) {
          // Redirect to the URL returned by the API
          window.location.href = data.url;
        }
      })
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
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <div className="w-[200px] flex justify-center gap-2">
        <button
          className="btn bg-blue-500 btn-danger"
          onClick={readGmail}
        >
          Read Gmail
        </button>
        <button className="btn bg-green-500 btn-primary" onClick={readOutlook}>Read Outlook</button>
      </div>
    </main>
  );
}
