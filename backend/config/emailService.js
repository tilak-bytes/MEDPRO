import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── helper: format "6_4_2026" → "6 April 2026" ──────────────────
const formatDate = (slotDate) => {
  const [day, month, year] = slotDate.split("_");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
};

// ── helper: shared email sender ──────────────────────────────────
const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"MEDPRO Healthcare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ── shared wrapper styles ────────────────────────────────────────
const emailWrapper = (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #0E5A4F; padding: 24px 32px;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">🏥 MEDPRO Healthcare</h2>
    </div>
    <div style="padding: 32px; background: #ffffff;">
      ${content}
    </div>
    <div style="background: #F9FAFB; padding: 16px 32px; border-top: 1px solid #e0e0e0;">
      <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
        This is an automated message from MEDPRO Healthcare. Please do not reply.
      </p>
    </div>
  </div>
`;

const detailCard = (rows) => `
  <div style="background: #F0FAF7; border-left: 4px solid #0E5A4F; border-radius: 6px; padding: 20px 24px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #1A2B4C;">
      ${rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 6px 0; color: #475467; width: 160px;">${label}</td>
          <td style="padding: 6px 0; font-weight: bold;">${value}</td>
        </tr>
      `,
    )
    .join("")}
    </table>
  </div>
`;


// 1. SIGNUP EMAIL

export const sendSignupEmail = async ({ userName, userEmail }) => {
  const html = emailWrapper(`
    <p style="font-size: 22px; font-weight: bold; color: #0E5A4F; margin: 0 0 8px;">
      Welcome to MEDPRO! 🎉
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px;">
      Hi <strong>${userName}</strong>, your account has been created successfully.
      You can now book appointments with our top-rated doctors anytime.
    </p>
    <div style="background: #F0FAF7; border-left: 4px solid #0E5A4F; border-radius: 6px; padding: 16px 24px; margin-bottom: 20px;">
      <p style="font-size: 14px; color: #1A2B4C; margin: 0;">
        ✅ &nbsp; Browse verified doctors<br/><br/>
        ✅ &nbsp; Book appointments instantly<br/><br/>
        ✅ &nbsp; Manage your health records
      </p>
    </div>
    <p style="font-size: 13px; color: #475467; margin: 0;">
      If you did not create this account, please ignore this email.
    </p>
  `);
  await sendEmail(userEmail, "Welcome to MEDPRO Healthcare! 🏥", html);
};


// 2. LOGIN EMAIL

export const sendLoginEmail = async ({ userName, userEmail }) => {
  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const html = emailWrapper(`
    <p style="font-size: 20px; font-weight: bold; color: #1A2B4C; margin: 0 0 8px;">
      Welcome back, ${userName}! 👋
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px;">
      A new login to your MEDPRO account was detected.
    </p>
    ${detailCard([
    ["Login Time", now],
    ["Account", userEmail],
  ])}
    <p style="font-size: 13px; color: #475467; margin: 0;">
      If this was not you, please change your password immediately.
    </p>
  `);
  await sendEmail(userEmail, "New Login Detected – MEDPRO", html);
};


// 3. APPOINTMENT BOOKED EMAIL

export const sendAppointmentEmail = async ({
  userName,
  userEmail,
  docName,
  speciality,
  slotDate,
  slotTime,
  fees,
}) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 4px;">
      Your appointment has been successfully booked. Here are your details:
    </p>
    ${detailCard([
    ["Doctor", `Dr. ${docName}`],
    ["Speciality", speciality],
    ["Date", formatDate(slotDate)],
    ["Time", slotTime],
    ["Consultation Fee", `₹${fees}`],
  ])}
    <p style="font-size: 13px; color: #475467; margin: 0;">
      Please arrive 10 minutes before your scheduled time.
    </p>
  `);
  await sendEmail(userEmail, `✅ Appointment Confirmed – Dr. ${docName}`, html);
};


// 4. APPOINTMENT CANCELLED EMAIL

export const sendCancellationEmail = async ({
  userName,
  userEmail,
  docName,
  speciality,
  slotDate,
  slotTime,
  fees,
  paymentDone,
}) => {
  const refundNote = paymentDone
    ? `<div style="background: #FFF8E1; border-left: 4px solid #F59E0B; border-radius: 6px; padding: 14px 20px; margin: 20px 0; font-size: 14px; color: #92400E;">
        💳 &nbsp; <strong>Refund Notice:</strong> Since you had already paid for this appointment,
        your refund of <strong>₹${fees}</strong> will be processed and credited back
        to your original payment method within <strong>5–7 business days</strong>.
       </div>`
    : `<p style="font-size: 13px; color: #475467; margin: 16px 0 0;">
        No payment was made for this appointment, so no refund is required.
       </p>`;

  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0;">
      Your appointment has been <strong style="color: #DC2626;">cancelled</strong>. Here are the details:
    </p>
    ${detailCard([
    ["Doctor", `Dr. ${docName}`],
    ["Speciality", speciality],
    ["Date", formatDate(slotDate)],
    ["Time", slotTime],
  ])}
    ${refundNote}
    <p style="font-size: 13px; color: #475467; margin: 16px 0 0;">
      You can book a new appointment anytime from our website.
    </p>
  `);
  await sendEmail(userEmail, `❌ Appointment Cancelled – Dr. ${docName}`, html);
};


// 5. PAYMENT RECEIVED EMAIL

export const sendPaymentEmail = async ({
  userName,
  userEmail,
  docName,
  speciality,
  slotDate,
  slotTime,
  fees,
}) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 4px;">
      We have received your payment successfully. Here is your receipt:
    </p>
    ${detailCard([
    ["Doctor", `Dr. ${docName}`],
    ["Speciality", speciality],
    ["Date", formatDate(slotDate)],
    ["Time", slotTime],
    ["Amount Paid", `₹${fees}`],
    ["Status", "✅ Paid"],
  ])}
    <p style="font-size: 13px; color: #475467; margin: 0;">
      Please keep this email as your payment receipt.
    </p>
  `);
  await sendEmail(userEmail, "💳 Payment Received – MEDPRO Healthcare", html);
};


// 6. APPOINTMENT COMPLETED EMAIL

export const sendAppointmentCompletedEmail = async ({
  userName,
  userEmail,
  docName,
  speciality,
  slotDate,
  slotTime,
}) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 4px;">
      Your appointment has been marked as <strong style="color: #0E5A4F;">completed</strong>. 
      We hope you had a great experience!
    </p>
    ${detailCard([
    ["Doctor", `Dr. ${docName}`],
    ["Speciality", speciality],
    ["Date", formatDate(slotDate)],
    ["Time", slotTime],
    ["Status", "✅ Completed"],
  ])}
    <p style="font-size: 14px; color: #475467; margin: 16px 0 8px;">
      🙏 &nbsp; We value your feedback! If you'd like to share your experience,
      please visit your appointments page.
    </p>
    <p style="font-size: 13px; color: #475467; margin: 0;">
      Thank you for choosing MEDPRO Healthcare. We wish you good health!
    </p>
  `);
  await sendEmail(userEmail, `✅ Appointment Completed – Dr. ${docName}`, html);
};


// 7. SIGNUP OTP EMAIL (for email verification)

export const sendSignupOtpEmail = async ({ userName, userEmail, otp }) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px;">
      Welcome to MEDPRO! To complete your registration, please verify your email address.
      Use the OTP below. It is valid for <strong>5 minutes</strong>.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #0E5A4F;">
        ${otp}
      </span>
    </div>
    <p style="font-size: 13px; color: #475467; margin: 0;">
      If you did not attempt to sign up for MEDPRO, please ignore this email.
    </p>
  `);
  await sendEmail(userEmail, "🔐 Your Verification Code – MEDPRO", html);
};


// 7. OTP EMAIL (forgot password)

export const sendOtpEmail = async ({ userName, userEmail, otp }) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px;">
      We received a request to reset your password.
      Use the OTP below. It is valid for <strong>10 minutes</strong> only.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #0E5A4F;">
        ${otp}
      </span>
    </div>
    <p style="font-size: 13px; color: #475467; margin: 0;">
      If you did not request a password reset, please ignore this email.
    </p>
  `);
  await sendEmail(userEmail, "🔐 Your OTP for Password Reset – MEDPRO", html);
};


// 8. UPDATE IDENTIFIER OTP EMAIL (for new email)

export const sendIdentifierUpdateOtpEmail = async ({ userName, userEmail, otp }) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px;">
      We received a request to update your MEDPRO account details to this email address.
      Use the OTP below to verify this change. It is valid for <strong>5 minutes</strong>.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #0E5A4F;">
        ${otp}
      </span>
    </div>
    <p style="font-size: 13px; color: #475467; margin: 0;">
      If you did not make this request, please ignore this email. Your current details will remain unchanged.
    </p>
  `);
  await sendEmail(userEmail, "🔐 Verify your new Email – MEDPRO", html);
};


// 9. DOCTOR PROFILE UPDATE REQUEST EMAIL

export const sendDoctorProfileUpdateRequestEmail = async ({
  userName,
  userEmail,
  comparisonData, // Array of { field, old, new }
  reason,
}) => {
  const rows = comparisonData.map(({ field, old, new: newValue }) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #475467; font-size: 13px;">${field}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #1A2B4C; font-size: 13px; text-decoration: line-through; opacity: 0.6;">${old || "N/A"}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #0E5A4F; font-size: 13px; font-weight: bold;">${newValue || "N/A"}</td>
    </tr>
  `).join("");

  const reasonSection = reason
    ? `<div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="font-size: 12px; font-weight: bold; color: #1A2B4C; text-transform: uppercase; margin: 0 0 8px;">Reason for Update:</p>
        <p style="font-size: 14px; color: #475467; margin: 0; font-style: italic;">"${reason}"</p>
       </div>`
    : "";

  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>Dr. ${userName}</strong>,
    </p>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px;">
      We have received your request to update your professional profile. 
      The changes have been queued for <strong>Admin Approval</strong> and will reflect once verified.
    </p>
    ${reasonSection}
    <div style="background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #F9FAFB;">
            <th style="padding: 10px; color: #1A2B4C; font-size: 12px; text-transform: uppercase;">Field</th>
            <th style="padding: 10px; color: #1A2B4C; font-size: 12px; text-transform: uppercase;">Current</th>
            <th style="padding: 10px; color: #1A2B4C; font-size: 12px; text-transform: uppercase;">Requested</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    <p style="font-size: 13px; color: #475467; margin: 0;">
      You will receive another email once the administrator processes this request.
    </p>
  `);
  await sendEmail(userEmail, "📝 Profile Update Request Received – MEDPRO", html);
};


// 10. DOCTOR PROFILE UPDATE APPROVED EMAIL

export const sendDoctorProfileUpdateApprovedEmail = async ({ userName, userEmail }) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>Dr. ${userName}</strong>,
    </p>
    <div style="text-align: center; padding: 20px 0;">
      <div style="background: #D1FAE5; color: #065F46; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 14px;">
        ✅ Request Approved
      </div>
    </div>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px; text-align: center;">
      Your profile update request has been <strong>approved</strong> by the administrator. 
      Your public profile has been updated successfully.
    </p>
    <p style="font-size: 13px; color: #475467; margin: 0; text-align: center;">
      Thank you for keeping your information up to date!
    </p>
  `);
  await sendEmail(userEmail, "✅ Profile Update Approved – MEDPRO", html);
};


// 11. DOCTOR PROFILE UPDATE REJECTED EMAIL

export const sendDoctorProfileUpdateRejectedEmail = async ({ userName, userEmail }) => {
  const html = emailWrapper(`
    <p style="font-size: 16px; color: #1A2B4C; margin: 0 0 8px;">
      Hi <strong>Dr. ${userName}</strong>,
    </p>
    <div style="text-align: center; padding: 20px 0;">
      <div style="background: #FEE2E2; color: #991B1B; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 14px;">
        ❌ Request Declined
      </div>
    </div>
    <p style="font-size: 14px; color: #475467; margin: 0 0 20px; text-align: center;">
      Your profile update request has been <strong>declined</strong> by the administrator. 
      Your current profile information will remain unchanged.
    </p>
    <p style="font-size: 13px; color: #475467; margin: 0; text-align: center;">
      If you have any questions regarding this decision, please contact the administrative office.
    </p>
  `);
  await sendEmail(userEmail, "❌ Profile Update Request Declined – MEDPRO", html);
};


