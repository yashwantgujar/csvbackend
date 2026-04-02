import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../Utils/apiError.js";
import { STATUS_CODES, MESSAGES } from "../Utils/status.codes.messages.js";
import { redisClient } from "../Config/redis.js";
export const registerUser = async (req, res, next) => {
  try {

    const { name, email, password } = req.body;

           const existingUser = await User.findOne({ email });

        if (existingUser) {
                            throw new ApiError(
        STATUS_CODES.CONFLICT,
        MESSAGES.EMAIL_ALREADY_EXISTS
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

          const user = await User.create({
      name,
        email,
      password: hashedPassword
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
            message: MESSAGES.REGISTRATION_SUCCESS,
      data: {
        id: user._id,
        email: user.email
          }
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
       
        const loginAttempts = await redisClient.get(`login_attempts:${email}`);
        if (loginAttempts >= 5) {
            return res.status(429).json({ message: "Account locked for 1 hour due to too many failed attempts." });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
           
            await redisClient.incr(`login_attempts:${email}`);
            await redisClient.expire(`login_attempts:${email}`, 3600); 
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.INVALID_CREDENTIALS);
        }

        await redisClient.del(`login_attempts:${email}`);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) { next(error); }
};


export const logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(400).json({ message: "No token provided" });

        
        await redisClient.set(token, "blacklisted", "EX", 2 * 24 * 60 * 60); 

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) { next(error); }
};