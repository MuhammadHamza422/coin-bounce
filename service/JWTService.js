const jwt = require("jsonwebtoken");
const RefreshToken = require('../models/refreshToken');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../config");

class JWTService {
  // 5 methods will be make in JWTService class

  // First method -> Sign/Create Access token

  static SignAccessToken(payload, expiryTime) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime }); // This will create access token
  }

  // Second method -> Sign/Create Refresh Token

  static SignRefreshToken(payload, expiryTime) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime }); // This will create refresh token
  }

  // Third method -> verify signed Access Token

  static VerifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET); // This will verify access token
  }

  // Fourt method -> verify signed Refresh Token

  static VerifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET); // This will verify refresh token
  }

  // Fift method is to store refresh token in database

  static async StoreRefreshToken(refreshToken, userId){
    try {
        const tokenToStore = new RefreshToken({
            refreshToken,
            userId
        });

        await tokenToStore.save();
    } catch (error) {
        console.log(error);
    }
  }
}

module.exports = JWTService;
