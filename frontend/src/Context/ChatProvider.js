import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";

const ENDPOINT =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : (typeof window !== "undefined" ? window.location.origin : "");

const ChatContext = createContext();

let globalSocket;

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const history = useHistory();

  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      setUser(userInfo);

      if (!userInfo) {
        history.push("/");
      }
    } catch (error) {
      console.error("Error loading user info:", error);
      history.push("/");
    }
  }, [history]);

  useEffect(() => {
    if (user) {
      if (!globalSocket || !globalSocket.connected) {
        globalSocket = io(ENDPOINT);
      }
      setSocket(globalSocket);

      globalSocket.emit("setup", user);
      globalSocket.on("connected", () => setSocketConnected(true));

      return () => {
        // preserve global socket connection across views
      };
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        socket,
        socketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("ChatState must be used within a ChatProvider");
  }
  return context;
};

export default ChatProvider;
