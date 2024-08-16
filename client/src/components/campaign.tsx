"use client";
import React, { useEffect, useState } from "react";
import { Input, Select, Option } from "@material-tailwind/react";

// Define the Campaign component
export function Campaign() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // State for sorting
  const [sortField, setSortField] = useState("time"); // Default sort by date
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order: ascending

  // State for filters
  const [nameFilter, setNameFilter] = useState("");
  const [uidFilter, setUidFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const endpoint = "a1b2c3"; // Change this to your actual endpoint

  useEffect(() => {
    // Function to fetch data from the server
    const fetchData = async () => {
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}`);

        if (!response.ok) {
          console.error('Network response was not ok:', response.status, response.statusText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Fetched data:', result);

        if (Array.isArray(result)) {
          setData(result);
        } else {
          console.error('Fetched data is not an array:', result);
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setData([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [endpoint]);

  // Function to sort data
const sortData = (data) => {
  return data.slice().sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'name':
        aValue = a.name || "";
        bValue = b.name || "";
        break;
      case 'uid':
        aValue = a.uid || "";
        bValue = b.uid || "";
        break;
      case 'time':
      default:
        aValue = Number(a.time) || 0; // Ensure time is a number
        bValue = Number(b.time) || 0; // Ensure time is a number
        break;
      case 'date':
        aValue = new Date(a.date).getDate();
        bValue = new Date(b.date).getDate();
        break;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
};

const filteredData = data.filter(item => {
  const matchesName = nameFilter === "" || (item.name && item.name.toLowerCase().includes(nameFilter.toLowerCase()));
  const matchesUid = uidFilter === "" || (item.uid && item.uid.toLowerCase().includes(uidFilter.toLowerCase()));

  // Convert item.date to a comparable date string
  const itemDate = new Date(item.date).toLocaleDateString('en-GB'); // Change to desired locale if needed
  const matchesDate = dateFilter === "" || itemDate === dateFilter;

  return matchesName && matchesUid && matchesDate;
});

  const sortedData = sortData(filteredData);

  return (
    <section className="container mx-auto py-20 px-8">
      {/* Filter Inputs */}
      <div className="mb-4">
        <Input
          label="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="mb-2"
        />
        <Input
          label="Filter by UID"
          value={uidFilter}
          onChange={(e) => setUidFilter(e.target.value)}
          className="mb-2"
        />
        <Input
          label="Filter by Date (dd-mm-yyyy)"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="mb-2"
        />
      </div>

      {/* Sort Options */}
      <div className="mb-4 flex items-center space-x-2">
        <Select
          label="Sort by"
          value={sortField}
          onChange={(value) => setSortField(value)}
          className="mr-2"
        >
          <Option value="name">Name</Option>
          <Option value="uid">UID</Option>
          <Option value="time">Time</Option>
          <Option value="date">Date</Option>
        </Select>
        <Select
          label="Sort order"
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
          className="mr-2"
        >
          <Option value="asc">Ascending</Option>
          <Option value="desc">Descending</Option>
        </Select>
      </div>

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
            { error ? (
              <tr>
                <td colSpan="4" className="py-2 px-4 text-center text-red-500">Error: {error}</td>
              </tr>
            ) : sortedData.length > 0 ? (
              sortedData.map((item) => (
                <tr key={item._id}>
                  <td className="py-2 px-4 border-b">{item.name || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{item.uid}</td>
                  <td className="py-2 px-4 border-b">{formatTime(item.time || "")}</td>
                  <td className="py-2 px-4 border-b">{new Date(item.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-2 px-4 text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatTime(ms) {
  ms = Number(ms); // Ensure ms is a number
  if (isNaN(ms)) return "N/A";

  if (ms < 1000) return `${ms} ms`;

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return [
    hours > 0 ? `${hours}h` : null,
    minutes > 0 ? `${minutes}m` : null,
    seconds > 0 ? `${seconds}s` : null,
    milliseconds > 0 ? `${milliseconds}ms` : null,
  ].filter(Boolean).join(' ');
}
