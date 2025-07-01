import { Box, FormControl, Input, Spinner, useToast, Text, Avatar, Tooltip, IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ScrollableFeed from "react-scrollable-feed";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { ViewIcon } from "@chakra-ui/icons";
import UpdateGroupChatModal from "./miscallaneous/UpdateGroupChatModal";

const ENDPOINT = "https://linkify-1q81.onrender.com";
let socket, selectedChatCompare;

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const isSameSender = (messages, m, i, userId) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  };

  const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

  const isSameSenderMargin = (messages, m, i, userId) => {
    if (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId
    )
      return 33;
    else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender._id !== m.sender._id &&
        messages[i].sender._id !== userId) ||
      (i === messages.length - 1 && messages[i].sender._id !== userId)
    )
      return 0;
    else return "auto";
  };

  const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <Box
      display="flex"
      flexDir="column"
      justifyContent="flex-start"
      p={3}
      bg="#2D3748"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflow="hidden"
      color="white"
    >
      {/* 1. Header at the top */}
      {selectedChat && (
        <Box
          w="100%"
          display="flex"
          alignItems="center"
          p={3}
          borderBottom="1px solid #444"
          mb={2}
          bg="transparent"
        >
          <Avatar
            size="md"
            name={
              selectedChat.isGroupChat
                ? selectedChat.chatName
                : getSender(user, selectedChat.users)
            }
            src={
              selectedChat.isGroupChat
                ? selectedChat.groupAvatar // if you have group avatar, else undefined
                : getSenderFull(user, selectedChat.users).pic
            }
            mr={3}
          />
          <Text fontSize="xl" fontWeight="bold">
            {selectedChat.isGroupChat
              ? selectedChat.chatName
              : getSender(user, selectedChat.users)}
          </Text>
          <Box ml="auto">
            {selectedChat.isGroupChat && (
              <IconButton
                icon={<ViewIcon />}
                variant="ghost"
                aria-label="Group Details"
                onClick={() => setIsGroupModalOpen(true)}
              />
            )}
          </Box>
        </Box>
      )}
      {/* UpdateGroupChatModal for group chats */}
      {selectedChat && selectedChat.isGroupChat && (
        <UpdateGroupChatModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
        />
      )}
      {/* 2. Messages area (scrollable, fills available space) */}
      <Box flex="1" w="100%" overflowY="auto" mb={2} display={loading ? "flex" : "block"} alignItems="center" justifyContent="center">
        {loading ? (
          <Spinner
            size="xl"
            w={20}
            h={20}
            alignSelf="center"
            margin="auto"
          />
        ) : (
          <div className="messages">
            <ScrollableFeed>
              {messages &&
                messages.map((m, i) => (
                  <div style={{ display: "flex" }} key={m._id}>
                    {(isSameSender(messages, m, i, user._id) ||
                      isLastMessage(messages, i, user._id)) && (
                      <Tooltip
                        label={m.sender.name}
                        placement="bottom-start"
                        hasArrow
                      >
                        <Avatar
                          mt="7px"
                          mr={1}
                          size="sm"
                          cursor="pointer"
                          name={m.sender.name}
                          src={m.sender.pic}
                        />
                      </Tooltip>
                    )}
                    <span
                      style={{
                        backgroundColor: `${
                          m.sender._id === user._id ? "#BEE3F8" : "#38B2AC"
                        }`,
                        color: "#1A202C",
                        marginLeft: isSameSenderMargin(messages, m, i, user._id),
                        marginTop: isSameUser(messages, m, i) ? 3 : 10,
                        borderRadius: "20px",
                        padding: "5px 15px",
                        maxWidth: "75%",
                      }}
                    >
                      {m.content}
                    </span>
                  </div>
                ))}
            </ScrollableFeed>
          </div>
        )}
        {istyping ? (
          <div>
            <Lottie
              options={defaultOptions}
              width={70}
              style={{ marginBottom: 15, marginLeft: 0 }}
            />
          </div>
        ) : null}
      </Box>
      {/* 3. Input panel at the bottom */}
      <FormControl
        onKeyDown={sendMessage}
        id="first-name"
        isRequired
        mt={3}
      >
        <Input
          variant="filled"
          bg="white"
          color="black"
          _focus={{ bg: "white", color: "black" }}
          _active={{ bg: "white", color: "black" }}
          placeholder="Enter a message.."
          value={newMessage}
          onChange={typingHandler}
        />
      </FormControl>
    </Box>
  );
};

export default ChatBox;