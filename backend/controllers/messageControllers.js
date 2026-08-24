const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const aiService = require("../services/aiService");

const getAiUser = async () => {
  let aiUser = await User.findOne({ email: "ai@linkify.internal" });
  if (!aiUser) {
    aiUser = await User.create({
      name: "Linkify AI ✨",
      email: "ai@linkify.internal",
      password: "ai-system-secret-password-12345",
      pic: "https://api.dicebear.com/7.x/bottts/svg?seed=LinkifyAI",
    });
  }
  return aiUser;
};

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic email");
    message = await message.populate("chat");
    message = await message.populate({
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // Check if the user is asking the in-chat AI assistant (@ai or @bot)
    const isAiPrompt = /^@(ai|bot)\b/i.test(content.trim());
    if (isAiPrompt) {
      try {
        const promptText = content.trim().replace(/^@(ai|bot)\s*/i, "");
        const aiUser = await getAiUser();
        const recentMsgs = await Message.find({ chat: chatId })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("sender", "name");

        const aiReplyText = await aiService.generateAiReply(
          promptText,
          recentMsgs.reverse()
        );

        let aiMessage = await Message.create({
          sender: aiUser._id,
          content: aiReplyText,
          chat: chatId,
        });

        aiMessage = await aiMessage.populate("sender", "name pic email");
        aiMessage = await aiMessage.populate("chat");
        aiMessage = await aiMessage.populate({
          path: "chat.users",
          select: "name pic email",
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: aiMessage });

        const responseObj = message.toObject ? message.toObject() : message;
        responseObj.aiReply = aiMessage;
        return res.json(responseObj);
      } catch (aiErr) {
        console.error("AI In-Chat Reply error:", aiErr.message);
        return res.json(message);
      }
    }

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const summarizeChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name email");

    if (!messages || messages.length === 0) {
      return res.json({
        overview: "No messages to summarize yet. Start chatting to generate an AI summary!",
        keyTopics: [],
        decisions: [],
        actionItems: [],
        sentiment: "Neutral",
        messageCount: 0,
      });
    }

    const chronologicalMessages = messages.reverse();
    const summary = await aiService.summarizeConversation(chronologicalMessages);
    res.json(summary);
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Failed to generate AI chat summary");
  }
});

module.exports = { allMessages, sendMessage, summarizeChat };