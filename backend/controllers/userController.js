const asyncHandler = require("express-async-handler");
const User=require('../Models/userModel')
const generateToken=require('../config/generateToken');

const registerUser=asyncHandler(async(req,res)=>{
    const{name,email,password,pic}=req.body;
    if(!name||!email||!password){
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const userExists=await User.findOne({ email });
    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }
    const user=await User.create({
        name,
        email,
        password,
        pic,
    });
    if(user){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token: generateToken(user._id),
        });
    }else{
        res.status(400);
        throw new Error("Failed to create the user");
    }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });

  // Auto-seed Guest User if not yet created in the database
  if (!user && email === "guest@example.com" && password === "123456") {
    user = await User.create({
      name: "Guest User",
      email: "guest@example.com",
      password: "123456",
      pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    });
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});
const allUsers=asyncHandler(async(req,res)=>{
   const keyword=req.query.search?{
    $or:[
        {name:{$regex: req.query.search,$options:"i"}},
        {email:{$regex: req.query.search,$options:"i"}},
    ],
   }:{};
   const users=await User.find(keyword).find({_id: {$ne: req.user._id}});
   res.send(users);
});
module.exports={ registerUser,authUser, allUsers };