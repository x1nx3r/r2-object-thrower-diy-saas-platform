"use client";

import { useState } from "react";

export default function CORSTestButton({ credential }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testCORS = async () => {
    if (!credential || !credential.s3Endpoint) {
      setResult({ success: false, message: "No S3 endpoint configured" });
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      // Create a simple test request to check CORS
      const testUrl =
        credential.s3Endpoint.replace("https://", "") + "/" + credential.bucket;

      const response = await fetch(`https://${testUrl}`, {
        method: "HEAD",
        mode: "cors",
      });

      setResult({
        success: true,
        message: "CORS is properly configured!",
        details: `Response status: ${response.status}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "CORS test failed",
        details: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={testCORS}
        disabled={testing || !credential?.s3Endpoint}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {testing ? "Testing..." : "Test CORS"}
      </button>

      {result && (
        <div
          className={`mt-2 p-2 rounded text-xs ${
            result.success
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          <div className="font-medium">{result.message}</div>
          {result.details && (
            <div className="text-xs opacity-75 mt-1">{result.details}</div>
          )}
        </div>
      )}
    </div>
  );
}
