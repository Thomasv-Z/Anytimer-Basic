"use client";
import React, { useEffect, useState } from "react";

export function Campaign() {
  const [data, setData] = useState([]);
  const endpoint = "a1b2c3"; // Change this to your actual endpoint

  useEffect(() => {
    // Function to fetch data from the server
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}`);
        const result = await response.json();
        // Ensure result is an array before setting state
        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error("Fetched data is not an array:", result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling every 5 seconds (5000 milliseconds)
    const interval = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [endpoint]);

  return (
    <section className="container mx-auto py-20 px-8">
      {/* Table */}
      <div className="overflow-x-auto mt-10">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">UID</th>
              <th className="py-2 px-4 border-b">Time</th>
              <th className="py-2 px-4 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((item) => (
                <tr key={item._id}>
                  <td className="py-2 px-4 border-b">{item.name || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{item.uid}</td>
                  <td className="py-2 px-4 border-b">{formatTime(item.time)}</td>
                  <td className="py-2 px-4 border-b">{new Date(item.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-2 px-4 border-b text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Function to format time from milliseconds
function formatTime(ms) {
  if (ms < 1000) return `${ms} ms`;
  const seconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return [
    hours > 0 ? `${hours}h` : null,
    minutes % 60 > 0 ? `${minutes % 60}m` : null,
    seconds % 60 > 0 ? `${seconds % 60}s` : null,
    milliseconds > 0 ? `${milliseconds}ms` : null,
  ].filter(Boolean).join(' ');
}
