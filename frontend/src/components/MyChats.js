import { Badge, Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscallaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setLoggedUser(userInfo);
      fetchChats();
    }
  }, [fetchAgain, user]);

  return (
    <Box
      display="flex"
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w="100%"
      h="100%"
      borderRadius="lg"
      boxShadow="lg"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "24px", md: "28px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="gray.700"
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Text fontWeight="bold">My Chats</Text>
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "14px", md: "10px", lg: "14px" }}
            rightIcon={<AddIcon />}
            colorScheme="teal"
            size="sm"
            _hover={{
              bg: "teal.500",
              transform: "scale(1.03)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        flex="1"
        w="100%"
        bg="gray.50"
        borderRadius="lg"
        overflowY="auto"
        p={3}
        mt={2}
      >
        {chats && loggedUser ? (
          <Stack spacing={3}>
            {chats.map((chat) => {
              const unreadCount = notification.filter(
                (n) => n.chat._id === chat._id
              ).length;

              return (
                <Box
                  onClick={() => {
                    setSelectedChat(chat);
                    setNotification(
                      notification.filter((n) => n.chat._id !== chat._id)
                    );
                  }}
                  cursor="pointer"
                  bg={selectedChat === chat ? "teal.100" : "white"}
                  color={selectedChat === chat ? "teal.800" : "gray.800"}
                  px={4}
                  py={3}
                  borderRadius="lg"
                  key={chat._id}
                  borderWidth="1px"
                  borderColor={selectedChat === chat ? "teal.300" : "gray.200"}
                  _hover={{
                    bg: selectedChat === chat ? "teal.100" : "gray.50",
                    transform: "translateY(-1px)",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: "sm",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Text fontWeight="semibold" fontSize="md">
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                    {unreadCount > 0 && (
                      <Badge
                        colorScheme="red"
                        variant="solid"
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Box>
                  {chat.latestMessage && chat.latestMessage.sender && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      <b>{chat.latestMessage.sender.name} : </b>
                      {chat.latestMessage.content &&
                      chat.latestMessage.content.length > 40
                        ? chat.latestMessage.content.substring(0, 41) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;