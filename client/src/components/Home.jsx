import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify"; 

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both fields are required");
      return;
    }

    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("Room is created");
  };

  // When enter is pressed, join the room
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-500">
      <div className="w-full md:w-1/2">
        <div className="shadow-sm p-4 mb-5 bg-gray-700 rounded">
          <div className="text-center bg-gray-800 p-4 rounded">
            <h4 className="text-2xl text-white mb-4">Enter the ROOM ID</h4>

            <div className="mb-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-2 mb-2 rounded border border-gray-600"
                placeholder="ROOM ID"
                onKeyUp={handleInputEnter}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 mb-2 rounded border border-gray-600"
                placeholder="USERNAME"
                onKeyUp={handleInputEnter}
              />
            </div>
            <button
              onClick={joinRoom}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              JOIN
            </button>
            <p className="mt-3 text-white">
              Don't have a room ID? create{" "}
              <span
                onClick={generateRoomId}
                className="text-green-500 p-2 cursor-pointer hover:underline"
              >
                New Room
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
