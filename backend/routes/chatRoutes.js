const express=require("express");
const router=express.Router();
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const { protect }=require("../middleware/authmiddleware");
router.route("/").post(protect,accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/groupRemove").put(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupAdd").put(protect, addToGroup);
module.exports = router;