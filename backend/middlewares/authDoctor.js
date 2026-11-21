import { verifyToken } from "../utils/authUtils.js";

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.status(401).json({
        success: false,
        message: "Token is missing.",
      });
    }

    const token_decode = verifyToken(dtoken);
    req.user = { docId: token_decode.id };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default authDoctor;
