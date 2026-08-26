import React, { useRef, useState } from "react";
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
  Text,
  Avatar,
  Box,
  useToast,
  Spinner,
  HStack,
  Input,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { AttachmentIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ user: profileUser, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user: loggedInUser, setUser: setLoggedInUser } = ChatState();
  const [currentPic, setCurrentPic] = useState(profileUser?.pic);
  const [loading, setLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef();
  const toast = useToast();

  if (!profileUser) return null;

  const isOwnProfile = loggedInUser?._id === profileUser?._id;

  const updateProfilePicInDb = async (newPicUrl) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${loggedInUser.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/user/profile",
        { pic: newPicUrl },
        config
      );

      setCurrentPic(data.pic);
      setLoggedInUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      setShowUrlInput(false);

      toast({
        title: "Profile Picture Updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Failed to Update Picture",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/webp") {
      toast({
        title: "Please Select a Valid Image (JPEG, PNG, WEBP)",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "dkgrvhkxb");

    fetch("https://api.cloudinary.com/v1_1/dkgrvhkxb/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((uploadData) => {
        if (uploadData.url) {
          updateProfilePicInDb(uploadData.url.toString());
        } else {
          throw new Error("Upload failed");
        }
      })
      .catch((err) => {
        toast({
          title: "Image Upload Failed",
          description: "Could not upload image to cloud storage.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      });
  };

  const handleUrlSubmit = () => {
    if (!customUrl.trim()) {
      toast({
        title: "Please Enter a Valid URL",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    updateProfilePicInDb(customUrl.trim());
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <Avatar
          onClick={onOpen}
          cursor="pointer"
          name={profileUser.name}
          src={isOwnProfile ? (loggedInUser?.pic || currentPic) : profileUser.pic}
        />
      )}

      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent bg="gray.800" color="white" borderRadius="xl" borderWidth="1px" borderColor="gray.700">
          <ModalHeader
            fontSize={{ base: "24px", md: "32px" }}
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            pb={1}
          >
            {profileUser.name}
          </ModalHeader>
          <ModalCloseButton />
          <Divider borderColor="gray.700" mb={4} />

          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            py={2}
          >
            {/* Avatar Container with change button */}
            <Box position="relative" mb={4}>
              <Avatar
                size="2xl"
                name={profileUser.name}
                src={isOwnProfile ? (loggedInUser?.pic || currentPic) : profileUser.pic}
                border="3px solid"
                borderColor="teal.400"
                boxShadow="0 0 15px rgba(49, 151, 149, 0.4)"
              />
              {loading && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="100%"
                  borderRadius="full"
                  bg="blackAlpha.700"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="lg" color="teal.300" />
                </Box>
              )}
            </Box>

            {/* Email Info */}
            <Text
              fontSize={{ base: "18px", md: "20px" }}
              fontFamily="Work sans"
              color="gray.300"
              mb={4}
            >
              <b>Email:</b> {profileUser.email}
            </Text>

            {/* Change Profile Pic controls for own profile */}
            {isOwnProfile && (
              <VStack spacing={3} w="100%" maxW="sm" mt={2} p={4} bg="gray.900" borderRadius="lg" borderWidth="1px" borderColor="gray.700">
                <Text fontSize="sm" fontWeight="bold" color="teal.300">
                  📸 Change Profile Picture
                </Text>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />

                <HStack spacing={2} w="100%">
                  <Button
                    leftIcon={<AttachmentIcon />}
                    colorScheme="teal"
                    size="sm"
                    flex={1}
                    isLoading={loading}
                    loadingText="Uploading..."
                    onClick={() => fileInputRef.current.click()}
                  >
                    Upload Image
                  </Button>
                  <Button
                    leftIcon={<EditIcon />}
                    variant="outline"
                    colorScheme="teal"
                    size="sm"
                    flex={1}
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    {showUrlInput ? "Hide Link" : "Paste URL"}
                  </Button>
                </HStack>

                {showUrlInput && (
                  <HStack w="100%" mt={2}>
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      size="sm"
                      bg="gray.800"
                      borderColor="gray.600"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                    <Button
                      colorScheme="teal"
                      size="sm"
                      isLoading={loading}
                      onClick={handleUrlSubmit}
                    >
                      Save
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;