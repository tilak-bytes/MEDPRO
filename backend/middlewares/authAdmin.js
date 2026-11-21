import { verifyToken } from "../utils/authUtils.js";

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      return res
        .status(401)
        .json({ success: false, message: "Token is Missing!" });
    }

    const tokenDecode = verifyToken(atoken);

    if (tokenDecode.id !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized, Try Again!" });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
  }
};

export default authAdmin;