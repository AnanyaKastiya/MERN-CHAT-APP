import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscallaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  const isValidUser = (user) => {
    return user && 
           user._id && 
           user.name && 
           typeof user._id === 'string' && 
           typeof user.name === 'string' &&
           user._id.trim() !== '' && 
           user.name.trim() !== '';
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      // Filter out invalid chats
      const validChats = data.filter(chat => {
        // Check if chat has valid users array
        if (!chat.users || !Array.isArray(chat.users) || chat.users.length === 0) return false;

        // For group chats
        if (chat.isGroupChat) {
          // Check if group has a valid name
          if (!chat.chatName || typeof chat.chatName !== 'string' || chat.chatName.trim() === '') return false;
          
          // Check if all users in group are valid
          const allUsersValid = chat.users.every(isValidUser);
          if (!allUsersValid) return false;

          // Additional check for group admin
          if (!chat.groupAdmin || !isValidUser(chat.groupAdmin)) return false;

          return true;
        }
        
        // For individual chats
        return chat.users.length === 2 && chat.users.every(isValidUser);
      });
      setChats(validChats);
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
  }, [fetchAgain]);

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
        fontSize={{ base: "28px", md: "30px" }}
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
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            colorScheme="teal"
            size="sm"
            _hover={{
              bg: "teal.500",
              transform: "scale(1.05)",
              transition: "all 0.2s ease-in-out"
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
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "teal.100" : "white"}
                color={selectedChat === chat ? "teal.700" : "gray.700"}
                px={4}
                py={3}
                borderRadius="lg"
                key={chat._id}
                borderWidth="1px"
                borderColor={selectedChat === chat ? "teal.200" : "gray.200"}
                _hover={{
                  bg: selectedChat === chat ? "teal.100" : "gray.50",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s ease-in-out",
                  boxShadow: "md"
                }}
              >
                <Text fontWeight="semibold" fontSize="md">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && chat.latestMessage.sender && (
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content && chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;