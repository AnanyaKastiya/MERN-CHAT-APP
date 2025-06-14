import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  Box,
  useToast,
  Spinner,
  Text,
  Avatar,
  HStack,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../userAvatar/UserListItem";
import UserBadgeItem from "../userAvatar/UserBadgeItem";

const UpdateGroupChatModal = ({ isOpen, onClose, fetchAgain, setFetchAgain, fetchMessages }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [removeSearch, setRemoveSearch] = useState("");
  const [removeResult, setRemoveResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeWarning, setRemoveWarning] = useState("");

  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

  // Rename group chat
  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenaming(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenaming(false);
      toast({ title: "Group renamed!", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({
        title: "Error renaming group",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setRenaming(false);
    }
    setGroupChatName("");
  };

  // Search users to add
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error searching users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Add user to group
  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast({ title: "User already in group", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({ title: "Only admins can add users", status: "error", duration: 3000, isClosable: true });
      return;
    }
    try {
      setAdding(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setAdding(false);
      toast({ title: "User added!", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({
        title: "Error adding user",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setAdding(false);
    }
  };

  // Remove user from group
  const handleRemoveUser = async (userToRemove) => {
    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      toast({ title: "Only admins can remove users", status: "error", duration: 3000, isClosable: true });
      return;
    }
    try {
      setRemoving(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config
      );
      // If the current user removed themselves, close the modal
      if (userToRemove._id === user._id) {
        setSelectedChat(null);
        onClose();
      } else {
        setSelectedChat(data);
      }
      setFetchAgain(!fetchAgain);
      setRemoving(false);
      toast({ title: "User removed!", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({
        title: "Error removing user",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setRemoving(false);
    }
  };

  // Search group members to remove
  const handleRemoveSearch = (query) => {
    setRemoveWarning("");
    setRemoveSearch(query);
    if (!query) {
      setRemoveResult(null);
      return;
    }
    setRemoveLoading(true);
    // Search in group members
    const found = selectedChat.users.find(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
    setTimeout(() => {
      setRemoveLoading(false);
      if (found) {
        setRemoveResult(found);
      } else {
        setRemoveResult(null);
        setRemoveWarning("User is not part of the group");
      }
    }, 400); // Simulate async search
  };

  if (!selectedChat) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent bg="white" color="black">
        <ModalHeader fontSize="2xl" fontFamily="Work sans" textAlign="center">
          {selectedChat.chatName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Rename group chat */}
            <FormControl>
              <Input
                placeholder="New Group Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                mb={2}
                color="black"
                bg="#f5f5f5"
              />
              <Button
                colorScheme="teal"
                size="sm"
                onClick={handleRename}
                isLoading={renaming}
                mt={2}
              >
                Update
              </Button>
            </FormControl>

            {/* Current group members */}
            <Box>
              <Text mb={1}>Members:</Text>
              <HStack wrap="wrap" spacing={2}>
                {selectedChat.users.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={
                      selectedChat.groupAdmin._id === user._id
                        ? () => handleRemoveUser(u)
                        : undefined
                    }
                  />
                ))}
              </HStack>
            </Box>

            {/* Add users (admin only) */}
            {selectedChat.groupAdmin._id === user._id && (
              <FormControl>
                <Input
                  placeholder="Add user to group"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  color="black"
                  bg="#f5f5f5"
                />
              </FormControl>
            )}
            {selectedChat.groupAdmin._id === user._id && loading ? (
              <Spinner size="sm" />
            ) : (
              selectedChat.groupAdmin._id === user._id &&
              searchResult.slice(0, 4).map((u) => (
                <UserListItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleAddUser(u)}
                />
              ))
            )}

            {/* Remove users (admin only) */}
            {selectedChat.groupAdmin._id === user._id && (
              <FormControl mt={2}>
                <Input
                  placeholder="Remove user from group"
                  value={removeSearch}
                  onChange={(e) => handleRemoveSearch(e.target.value)}
                  color="black"
                  bg="#f5f5f5"
                />
              </FormControl>
            )}
            {selectedChat.groupAdmin._id === user._id && removeLoading && <Spinner size="sm" />}
            {selectedChat.groupAdmin._id === user._id && removeWarning && (
              <Alert status="warning" mt={2}>
                <AlertIcon />
                {removeWarning}
              </Alert>
            )}
            {selectedChat.groupAdmin._id === user._id && removeResult && (
              <UserListItem
                user={removeResult}
                handleFunction={() => handleRemoveUser(removeResult)}
                removeMode={true}
              />
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={() => handleRemoveUser(user)} isLoading={removing}>
            Leave Group
          </Button>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateGroupChatModal;