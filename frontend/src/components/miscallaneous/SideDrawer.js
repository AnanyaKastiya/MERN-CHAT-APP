import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text, Badge, chakra, VStack, HStack, Flex, Spacer, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Avatar, Tooltip } from "@chakra-ui/react";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, DrawerCloseButton } from "@chakra-ui/modal";
import { BellIcon, ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom";
import { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { motion } from "framer-motion";

const MotionBox = chakra(motion.div);

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleNotificationClick = useCallback((notif) => {
    setSelectedChat(notif.chat);
    setNotification(notification.filter((n) => n !== notif));
  }, [notification, setNotification, setSelectedChat]);

  return (
    <>
      {/* Persistent Header Bar */}
      <Flex
        align="center"
        justify="space-between"
        bg="gray.900"
        w="100%"
        px={4}
        py={2}
        borderBottom="1px"
        borderColor="gray.700"
        boxShadow="md"
        zIndex={10}
      >
        {/* Search Button */}
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-start">
          <Button variant="ghost" color="white" onClick={onOpen} leftIcon={<SearchIcon />}>
            <Text display={{ base: "none", md: "flex" }}>Search User</Text>
          </Button>
        </Tooltip>

        {/* App Name Centered */}
        <Text fontSize="2xl" fontFamily="Work sans" color="white" fontWeight="bold" textAlign="center" flex={1}>
          Linkify
        </Text>

        {/* Notification Bell and Profile Menu */}
        <HStack spacing={4}>
          {/* Notification Bell */}
          <Menu>
            <MenuButton p={1} position="relative">
              <BellIcon fontSize="2xl" color="white" />
              {notification.length > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="0.8em"
                  padding="0 4px"
                >
                  {notification.length}
                </Badge>
              )}
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Profile Menu */}
          <Menu>
            <MenuButton as={Button} bg="gray.700" rightIcon={<ChevronDownIcon />} color="white">
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Drawer for Searching Users */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <VStack spacing="24px" align="stretch">
              <HStack>
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
              </HStack>

              {loading ? (
                <div>Loading...</div>
              ) : (
                searchResult?.map((user) => (
                  <HStack
                    key={user._id}
                    onClick={() => accessChat(user._id)}
                    cursor="pointer"
                    bg="#E8E8E8"
                    _hover={{ background: "#38B2AC", color: "white" }}
                    w="100%"
                    alignItems="center"
                    color="black"
                    px={3}
                    py={2}
                    borderRadius="lg"
                  >
                    <Avatar
                      mr={2}
                      size="sm"
                      cursor="pointer"
                      name={user.name}
                      src={user.pic}
                    />
                    <Box>
                      <Text>{user.name}</Text>
                      <Text fontSize="xs">
                        <b>Email : </b>
                        {user.email}
                      </Text>
                    </Box>
                  </HStack>
                ))
              )}

              {loadingChat && <div>Loading...</div>}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
