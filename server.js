import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();

const resend = new Resend(process.env.RESEND_API_KEY);

// =============================
// MIDDLEWARE
// =============================

app.use(
  cors({
    origin: [
      "https://mywayhire.com",
      "https://www.mywayhire.com",
    ],
  })
);

app.use(express.json());

// =============================
// TEST ROUTE
// =============================

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// =============================
// CONTACT FORM ROUTE
// =============================

app.post("/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, number, message } = req.body;

    // Validation

    if (!firstName || !lastName || !email || !number || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // SEND EMAIL USING RESEND

    await resend.emails.send({
      from: "onboarding@resend.dev",

      to: process.env.EMAIL_USER,

      subject: `New Contact Form Inquiry from ${firstName}`,

      replyTo: email,

      html: `
        <div style="font-family: Arial; padding: 20px;">
          
          <h2>New Contact Inquiry</h2>

          <p>
            You received a new message from your website contact form.
          </p>

          <hr />

          <p>
            <strong>First name:</strong> ${firstName}
          </p>

          <p>
            <strong>Last name:</strong> ${lastName}
          </p>

          <p>
            <strong>Email:</strong> ${email}
          </p>

          <p>
            <strong>Number:</strong> ${number}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <p>
            ${message}
          </p>

        </div>
      `,
    });

    // SUCCESS RESPONSE

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {

    console.error("EMAIL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =============================
// START SERVER
// =============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});