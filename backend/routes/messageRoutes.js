const express = require("express");
const {
  allMessages,
  sendMessage,
  summarizeChat,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

router.route("/summary/:chatId").get(protect, summarizeChat);
router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

module.exports = router;
