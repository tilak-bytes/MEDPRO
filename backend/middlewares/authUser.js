import { verifyToken } from "../utils/authUtils.js";

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token is Missing!" });
    }

    const tokenDecode = verifyToken(token);
    req.user = { userId: tokenDecode.id };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;
