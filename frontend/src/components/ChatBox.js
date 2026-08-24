import {
  Box,
  FormControl,
  Input,
  Spinner,
  useToast,
  Text,
  Avatar,
  Tooltip,
  IconButton,
  Button,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ScrollableFeed from "react-scrollable-feed";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { ViewIcon, ArrowBackIcon } from "@chakra-ui/icons";
import UpdateGroupChatModal from "./miscallaneous/UpdateGroupChatModal";
import ProfileModal from "./miscallaneous/ProfileModal";
import ChatSummaryModal from "./miscallaneous/ChatSummaryModal";

const ENDPOINT =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : window.location.origin;
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
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage.trim()) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const textToSend = newMessage;
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: textToSend,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);

        // If an AI response was generated from @ai / @bot:
        if (data.aiReply) {
          socket.emit("new message", data.aiReply);
          setMessages((prev) => [...prev, data, data.aiReply]);
        } else {
          setMessages((prev) => [...prev, data]);
        }
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
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const handleMessageReceived = (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    };

    socket.on("message received", handleMessageReceived);
    socket.on("message recieved", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
      socket.off("message recieved", handleMessageReceived);
    };
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
      bg="gray.900"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflow="hidden"
      color="white"
    >
      {/* 1. Header */}
      {selectedChat ? (
        <Box
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={3}
          borderBottom="1px solid"
          borderColor="gray.700"
          mb={2}
          bg="gray.800"
          borderRadius="md"
        >
          <HStack spacing={3}>
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700" }}
              aria-label="Back to chat list"
              onClick={() => setSelectedChat(null)}
            />
            <Avatar
              size="md"
              name={
                selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : getSender(user, selectedChat.users)
              }
              src={
                selectedChat.isGroupChat
                  ? selectedChat.groupAvatar
                  : getSenderFull(user, selectedChat.users)?.pic
              }
            />
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                {selectedChat.isGroupChat
                  ? selectedChat.chatName
                  : getSender(user, selectedChat.users)}
              </Text>
              <Text fontSize="xs" color="gray.400">
                {selectedChat.isGroupChat
                  ? `${selectedChat.users?.length || 0} members`
                  : "Direct Message"}
              </Text>
            </Box>
          </HStack>

          {/* Action Buttons: AI Catch Up + Details Modal */}
          <HStack spacing={2}>
            <ChatSummaryModal>
              <Button
                size="sm"
                colorScheme="purple"
                variant="solid"
                bgGradient="linear(to-r, purple.500, teal.400)"
                _hover={{
                  bgGradient: "linear(to-r, purple.600, teal.500)",
                  transform: "scale(1.03)",
                }}
                transition="all 0.2s"
                leftIcon={<span>✨</span>}
              >
                Catch Up (AI)
              </Button>
            </ChatSummaryModal>

            {selectedChat.isGroupChat ? (
              <IconButton
                icon={<ViewIcon />}
                variant="ghost"
                color="white"
                _hover={{ bg: "gray.700" }}
                aria-label="Group Details"
                onClick={() => setIsGroupModalOpen(true)}
              />
            ) : (
              <ProfileModal user={getSenderFull(user, selectedChat.users)}>
                <IconButton
                  icon={<ViewIcon />}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "gray.700" }}
                  aria-label="User Details"
                />
              </ProfileModal>
            )}
          </HStack>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="2xl" color="gray.400" fontFamily="Work sans">
            Click on a conversation to start chatting
          </Text>
        </Box>
      )}

      {/* UpdateGroupChatModal for group chats */}
      {selectedChat && selectedChat.isGroupChat && (
        <UpdateGroupChatModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          fetchMessages={fetchMessages}
        />
      )}

      {/* 2. Messages Area */}
      {selectedChat && (
        <>
          <Box
            flex="1"
            w="100%"
            overflowY="auto"
            mb={2}
            p={2}
            display={loading ? "flex" : "block"}
            alignItems="center"
            justifyContent="center"
          >
            {loading ? (
              <Spinner size="xl" w={16} h={16} alignSelf="center" margin="auto" color="teal.300" />
            ) : (
              <div className="messages">
                <ScrollableFeed>
                  {messages &&
                    messages.map((m, i) => {
                      const isAi =
                        m.sender?.email === "ai@linkify.internal" ||
                        m.sender?.name?.includes("AI");

                      return (
                        <div style={{ display: "flex", flexDirection: "column" }} key={m._id || i}>
                          <div style={{ display: "flex", alignItems: "flex-end" }}>
                            {(isSameSender(messages, m, i, user._id) ||
                              isLastMessage(messages, i, user._id)) && (
                              <Tooltip
                                label={m.sender?.name}
                                placement="bottom-start"
                                hasArrow
                              >
                                <Avatar
                                  mt="7px"
                                  mr={1}
                                  size="sm"
                                  cursor="pointer"
                                  name={m.sender?.name}
                                  src={m.sender?.pic}
                                />
                              </Tooltip>
                            )}
                            <Box
                              style={{
                                background: isAi
                                  ? "linear-gradient(135deg, #4A154B 0%, #1A202C 100%)"
                                  : m.sender?._id === user._id
                                  ? "#319795"
                                  : "#2D3748",
                                color: "white",
                                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                                marginTop: isSameUser(messages, m, i) ? 3 : 10,
                                borderRadius: "16px",
                                padding: "8px 14px",
                                maxWidth: "75%",
                                border: isAi ? "1px solid #9F7AEA" : "none",
                                boxShadow: isAi ? "0 0 12px rgba(159, 122, 234, 0.3)" : "none",
                              }}
                            >
                              {isAi && (
                                <Badge colorScheme="purple" mb={1} fontSize="2xs">
                                  ✨ Linkify AI Assistant
                                </Badge>
                              )}
                              <Text fontSize="sm" whiteSpace="pre-wrap">
                                {m.content}
                              </Text>
                              {m.createdAt && (
                                <Text
                                  fontSize="2xs"
                                  color="gray.300"
                                  textAlign="right"
                                  mt={0.5}
                                >
                                  {new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Text>
                              )}
                            </Box>
                          </div>
                        </div>
                      );
                    })}
                </ScrollableFeed>
              </div>
            )}
            {istyping && (
              <div>
                <Lottie
                  options={defaultOptions}
                  width={70}
                  style={{ marginBottom: 15, marginLeft: 0 }}
                />
              </div>
            )}
          </Box>

          {/* 3. Input Panel */}
          <FormControl onKeyDown={sendMessage} id="chat-input" isRequired mt={1}>
            <Input
              variant="filled"
              bg="gray.800"
              color="white"
              _hover={{ bg: "gray.750" }}
              _focus={{ bg: "gray.800", borderColor: "teal.400" }}
              placeholder="Type a message, or try '@ai <your question>'..."
              value={newMessage}
              onChange={typingHandler}
              borderRadius="full"
              py={5}
              px={4}
            />
          </FormControl>
        </>
      )}
    </Box>
  );
};

export default ChatBox;