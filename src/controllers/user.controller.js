import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // Implementation for user registration
    // get user details from frontend
    // validate user details
    // check if user already exists : username or email
    // check for images , check for avatar
    // upload images to cloudinary , avatar 
    // create user object - create entry in database
    // remove password from user object before sending response
    // check for user creation success
    // return response to frontend with user details and success message

    const { fullName , username , email , password } = req.body;
    console.log("email : " , email);

    if(
        [fullName , username , email , password].some((field) => 
            field?.trim() === "")
    ){
        throw new ApiError(400 , "All fields are required");
    }

    const existedUser = await User.findOne({
        $or : [
            { email : email } ,
            { username : username }
        ]
    })

    if(existedUser){
        throw new ApiError(409 , "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    console.log("req.files:", req.files);
    console.log("Avatar local path:", avatarLocalPath);
    console.log("Cover image local path:", coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500 , "Error in uploading avatar");
    }

    const user = await User.create({
        fullName ,
        avatar : avatar.url , 
        coverImage : coverImage?.url || "" ,
        email , 
        password ,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500 , "Error in creating user");
    }

    res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    )
})

export {registerUser} 