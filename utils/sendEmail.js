import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "b16f7e2acd6307",
      pass: "cb32d964996d73"
    }
  });

  await transporter.sendMail({
    to,
    subject,
    text,
  });
};
