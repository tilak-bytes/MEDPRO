// Wraps email calls so SMTP failures don't crash the server
export const sendEmailSafe = async (emailFn) => {
  try {
    if (process.env.EMAIL_ENABLED === "true") {
      await emailFn();
    }
  } catch (error) {
    console.error("Email failed (non-critical):", error.message);
  }
};
