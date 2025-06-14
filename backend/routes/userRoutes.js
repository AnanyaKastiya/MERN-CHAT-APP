const express=require('express')
const{ registerUser,authUser,allUsers }=require("../controllers/userController");
const { protect } = require("../middleware/authmiddleware");
const router=express.Router()
router.route("/").post(registerUser);
router.route("/").get(protect, allUsers);
router.post('/login',authUser);
module.exports=router;
