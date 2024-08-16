import React, { useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";

interface PopupProps {
  uid: string;
  time: number;
  onSave: (name: string) => void;
  onDiscard: () => void;
}

const Popup: React.FC<PopupProps> = ({ uid, time, onSave, onDiscard }) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name); // Pass name to the parent component
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <Typography variant="h6" className="mb-4">New Entry</Typography>
        <div className="mb-4">
          <Typography variant="body1">UID: {uid}</Typography>
          <Typography variant="body1">Time: {formatTime(time)}</Typography>
        </div>
        <Input
          label="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button color="gray" onClick={onDiscard}>Discard</Button>
          <Button color="blue" onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
};

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

export default Popup;