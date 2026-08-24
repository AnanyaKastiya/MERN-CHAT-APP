import { Box, Flex } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscallaneous/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";
import { useState } from "react";

const ChatPage = () => {
  const { user, selectedChat } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <Box w="100vw" h="100vh" m={0} p={0} overflow="hidden" bg="gray.900">
      {/* Header bar (SideDrawer) always at the top */}
      {user && <SideDrawer />}
      <Flex w="100%" h="calc(100vh - 56px)" mt="0" direction="row" position="relative">
        {/* Sidebar: MyChats */}
        {user && (
          <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            bg="gray.800"
            w={{ base: "100%", md: "32%", lg: "28%" }}
            h="100%"
            borderRight="1px solid #222"
            overflowY="auto"
          >
            <MyChats fetchAgain={fetchAgain} />
          </Box>
        )}
        {/* Main Chat Area: ChatBox */}
        <Box
          display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
          flexDir="column"
          alignItems="center"
          bg="gray.900"
          w={{ base: "100%", md: "68%", lg: "72%" }}
          h="100%"
          overflowY="auto"
        >
          {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        </Box>
      </Flex>
    </Box>
  );
};

export default ChatPage;
