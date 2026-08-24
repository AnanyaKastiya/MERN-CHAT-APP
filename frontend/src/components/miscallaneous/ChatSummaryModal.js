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
  Text,
  Badge,
  Spinner,
  VStack,
  HStack,
  Box,
  Divider,
  useToast,
  Tag,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const ChatSummaryModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const { selectedChat, user } = ChatState();

  const fetchSummary = async () => {
    if (!selectedChat) return;
    setLoading(true);
    setCopied(false);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/summary/${selectedChat._id}`,
        config
      );
      setSummary(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "AI Summarization Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Could not generate summary.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  const handleOpen = () => {
    onOpen();
    fetchSummary();
  };

  const copyToClipboard = () => {
    if (!summary) return;
    const text = `📋 Linkify AI Chat Summary: ${selectedChat?.chatName || "Conversation"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Overview:
${summary.overview || "N/A"}

🎯 Key Topics:
${summary.keyTopics?.length ? summary.keyTopics.map((t) => `• ${t}`).join("\n") : "• None listed"}

💡 Decisions Made:
${summary.decisions?.length ? summary.decisions.map((d) => `• ${d}`).join("\n") : "• None specified"}

✅ Action Items:
${summary.actionItems?.length ? summary.actionItems.map((a) => `[ ] ${a}`).join("\n") : "• None pending"}

Mood / Sentiment: ${summary.sentiment || "Neutral"}
(Analyzed ${summary.messageCount || 0} messages with Gemini 2.5 Flash)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to Clipboard!",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <span onClick={handleOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent bg="gray.900" color="white" borderRadius="xl" borderWidth="1px" borderColor="purple.500">
          <ModalHeader pb={1}>
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, purple.400, teal.300)" bgClip="text">
                  ✨ Linkify AI Intelligence
                </Text>
                <Badge colorScheme="purple" variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                  Gemini 2.5
                </Badge>
              </HStack>
            </HStack>
            <Text fontSize="xs" color="gray.400" mt={1}>
              Automated conversation breakdown & action items for {selectedChat?.chatName || "this chat"}
            </Text>
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <Divider borderColor="gray.700" />

          <ModalBody py={4}>
            {loading ? (
              <VStack py={10} spacing={4}>
                <Spinner size="xl" thickness="4px" speed="0.75s" color="purple.400" />
                <Text fontSize="md" color="purple.200" fontWeight="medium">
                  Analyzing conversation context & extracting key insights...
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Powered by Google Gemini Generative AI
                </Text>
              </VStack>
            ) : summary ? (
              <VStack spacing={4} align="stretch">
                {/* Meta Badges */}
                <HStack spacing={2} wrap="wrap">
                  <Tag size="sm" colorScheme="teal" variant="solid">
                    💬 {summary.messageCount || 0} Messages Analyzed
                  </Tag>
                  {summary.sentiment && (
                    <Tag size="sm" colorScheme="purple" variant="subtle">
                      🎭 Tone: {summary.sentiment}
                    </Tag>
                  )}
                </HStack>

                {/* 1. Overview */}
                <Box bg="gray.800" p={3.5} borderRadius="lg" borderLeft="4px solid" borderColor="purple.400">
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="purple.300" mb={1}>
                    📌 Executive Overview
                  </Text>
                  <Text fontSize="sm" color="gray.200" lineHeight="tall">
                    {summary.overview}
                  </Text>
                </Box>

                {/* 2. Key Topics */}
                {summary.keyTopics && summary.keyTopics.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="teal.300" mb={2}>
                      🎯 Key Topics Discussed
                    </Text>
                    <HStack spacing={2} wrap="wrap">
                      {summary.keyTopics.map((topic, i) => (
                        <Tag key={i} size="md" colorScheme="teal" variant="outline" mb={1}>
                          #{topic}
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                )}

                {/* 3. Decisions & Conclusions */}
                {summary.decisions && summary.decisions.length > 0 && (
                  <Box bg="gray.800" p={3} borderRadius="lg">
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="green.300" mb={2}>
                      💡 Key Decisions & Agreements
                    </Text>
                    <VStack align="stretch" spacing={1.5}>
                      {summary.decisions.map((dec, idx) => (
                        <HStack key={idx} align="flex-start" spacing={2}>
                          <Text color="green.400" fontSize="sm">✔</Text>
                          <Text fontSize="sm" color="gray.200">{dec}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* 4. Action Items */}
                {summary.actionItems && summary.actionItems.length > 0 && (
                  <Box bg="gray.800" p={3} borderRadius="lg">
                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="yellow.300" mb={2}>
                      ✅ Action Items & Pending Next Steps
                    </Text>
                    <VStack align="stretch" spacing={1.5}>
                      {summary.actionItems.map((item, idx) => (
                        <HStack key={idx} align="flex-start" spacing={2}>
                          <Text color="yellow.400" fontSize="sm">▫</Text>
                          <Text fontSize="sm" color="gray.200">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            ) : (
              <Text textAlign="center" color="gray.400" py={6}>
                Click Regenerate to fetch insights.
              </Text>
            )}
          </ModalBody>

          <Divider borderColor="gray.700" />
          <ModalFooter justify="space-between">
            <Button
              size="sm"
              variant="ghost"
              colorScheme="purple"
              onClick={fetchSummary}
              isLoading={loading}
            >
              🔄 Refresh Insights
            </Button>
            <HStack spacing={2}>
              {summary && (
                <Button
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  {copied ? "Copied! ✓" : "📋 Copy Summary"}
                </Button>
              )}
              <Button size="sm" colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ChatSummaryModal;
