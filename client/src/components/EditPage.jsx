import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../socket";
import { ACTIONS } from "../Action";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";

export default function EditPage() {
  const [clients, setClients] = useState([]);
  const codeRef = useRef(null);
  const socketRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const handleErrors = (err) => {
    console.log("Error", err);
    toast.error("Socket connection failed, Try again later");
    navigate("/");
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          if (codeRef.current) {
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, [roomId, location.state?.username, navigate]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID is copied");
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
        {/* Client panel */}
        <div className="w-1/5 bg-gray-900 text-white flex flex-col shadow-md p-4">
          <img
            src="/images/codecast.png"
            alt="Logo"
            className="mx-auto"
            style={{ maxWidth: "150px", marginTop: "-43px" }}
          />
          <hr className="my-4 border-gray-700" />

          {/* Client list container */}
          <div className="flex-grow overflow-auto">
            <span className="mb-2">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr className="my-4 border-gray-700" />
          {/* Buttons */}
          <div className="mt-auto">
            <button
              className="bg-green-500 text-white w-full py-2 rounded"
              onClick={copyRoomId}
            >
              Copy Room ID
            </button>
            <button
              className="bg-red-500 text-white w-full py-2 rounded mt-2 mb-2"
              onClick={leaveRoom}
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="w-4/5 bg-gray-800 text-white flex flex-col p-4">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>
    </div>
  );
}
