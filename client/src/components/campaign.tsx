import React, { useEffect, useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import Popup from "./popup"; // Import the popup component

export function Campaign() {
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newEntry, setNewEntry] = useState<{ uid: string; time: number } | null>(null);
  const endpoint = "a1b2c3"; // Change this to your actual endpoint

  useEffect(() => {
    // Function to fetch data from the server
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}`);
        const result = await response.json();
        setData(result);
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

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000'); // Connect to WebSocket server

    ws.onmessage = (event) => {
      const newScore = JSON.parse(event.data);
      setNewEntry({ uid: newScore.uid, time: newScore.time });
      setShowPopup(true); // Show the popup when new data arrives
    };

    return () => {
      ws.close(); // Close the WebSocket connection when component unmounts
    };
  }, []);

  const handleSaveName = async (name: string) => {
    if (newEntry) {
      try {
        const response = await fetch('http://localhost:3000/api/user/saveUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: newEntry.uid, name })
        });
        const result = await response.json();
        console.log('User saved successfully:', result);
        setShowPopup(false); // Hide the popup after saving the name
        // Optionally, refresh the data
        const updatedData = await fetchData();
        setData(updatedData);
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }
  };

  const handleDiscard = () => {
    setShowPopup(false); // Hide the popup if discarded
  };

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
            {data.map((item) => (
              <tr key={item._id}>
                <td className="py-2 px-4 border-b">{item.name || "N/A"}</td>
                <td className="py-2 px-4 border-b">{item.uid}</td>
                <td className="py-2 px-4 border-b">{formatTime(item.time)}</td>
                <td className="py-2 px-4 border-b">{new Date(item.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Render popup if needed */}
      {showPopup && newEntry && (
        <Popup
          uid={newEntry.uid}
          time={newEntry.time}
          onSave={handleSaveName}
          onDiscard={handleDiscard}
        />
      )}
    </section>
  );
}

// Function to format time from milliseconds
function formatTime(ms: number) {
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
