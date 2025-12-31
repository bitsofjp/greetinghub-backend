import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  const transporter = nodemailer.createTransport({
    auth: {
      pass: process.env.EMAIL_PASS,
      user: process.env.EMAIL_USER,
    },
    service: "gmail",
  });

  await transporter.sendMail({
    from: `"GreetingHub" <$process.env.EMAIL_USER>`,
    html,
    subject,
    text,
    to,
  });
};
