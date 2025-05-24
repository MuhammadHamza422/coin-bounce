const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user");
const JWTService = require("../service/JWTService");
const RefreshToken = require("../models/refreshToken");
const auth = require("../middleware/auth");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
  async register(req, res, next) {
    // First step is to validate the input which user is sending
    const registerSchema = Joi.object({
      name: Joi.string().max(30).required(),
      username: Joi.string().min(5).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    });

    // Below you are validating body against object schema of joi, if error comes then destructure it

    const { error } = registerSchema.validate(req.body);

    // if error came send it to middle ware function

    if (error) {
      return next(error);
    }

    // now if no error is present then destructure user fields from req body

    const { name, username, email, password } = req.body;

    // now check if username and email is new or already taken to overcome same email and username issue. always use try catch while interacting with db

    try {
      const usernameInUse = await User.exists({ username });
      const emailInUse = await User.exists({ email });

      if (usernameInUse) {
        const error = {
          status: 401,
          message: "Username is already taken, choose another name",
        };

        return next(error);
      }

      if (emailInUse) {
        const error = {
          status: 401,
          message: "Email is already taken, choose another email",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    // now hash the password, as we have to store hashed password in db for security reasons

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is for additional security, will add extra numbers

    let user;
    let accessToken;
    let refreshToken;

    try {
      // now create a document in collection
      const userToRegister = new User({
        username,
        name,
        email,
        password: hashedPassword,
      });

      // now save the user in db, you have to save user after creating a user document in collection

      user = await userToRegister.save();

      // Generate tokens, call methods make in class JWTService

      accessToken = JWTService.SignAccessToken({ _id: user._id }, "30m");
      refreshToken = JWTService.SignRefreshToken({ _id: user._id }, "60m");

      // Store refresh token in database

      await JWTService.StoreRefreshToken(refreshToken, user._id);
    } catch (error) {
      return next(error);
    }

    // now return the response

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24, // equals to one day
      httpOnly: true, //by this tokens will not be accessible in browser through js, which will reduce xss attack
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDto = new UserDto(user);
    return res.status(201).json({ user: userDto, auth: true });
  },

  async login(req, res, next) {
    const loginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });

    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { username, password } = req.body;

    let user;

    try {
      user = await User.findOne({ username: username });
      if (!user) {
        const error = {
          status: 401,
          message: "Invalid username!",
        };
        return next(error);
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "Invalid password!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = JWTService.SignAccessToken({ _id: user._id }, "30m");
    const refreshToken = JWTService.SignRefreshToken({ _id: user._id }, "60m");

    try {
      await RefreshToken.updateOne(
        {
          userId: user._id,
        },
        { refreshToken: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDto = new UserDto(user);
    return res.status(200).json({ user: userDto, auth: true });
  },

  async logout(req, res, next) {
    const { refreshToken } = req.cookies;
    console.log("req", req.user);

    try {
      await RefreshToken.deleteOne({
        refreshToken,
      });
    } catch (error) {
      return next(error);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ user: null, auth: false });
  },
  async refresh(req, res, next) {
    const originalRefreshToken = req.cookies.refreshToken;

    let id;

    try {
      id = JWTService.VerifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };

      return next(error);
    }
    try {
      const match = RefreshToken.findOne({ userId: id, refreshToken: originalRefreshToken });
      if (!match) {
        const error = {
          status: 401,
          message: "Unauthorized",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    try {
      const accessToken = JWTService.SignAccessToken({ _id: id }, "30m");
      const refreshToken = JWTService.SignRefreshToken({ _id: id }, "60m");

      await RefreshToken.updateOne(
        {
          userId: id,
        },
        { refreshToken: refreshToken }
      );

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (error) {
      return next(error);
    }

    const user = User.findOne({_id: id});

    const userDto = new UserDto({user});

    return res.status(200).json({user: userDto, auth: true});
  },
};

module.exports = authController;
