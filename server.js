// server.js
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// =============================
// MIDDLEWARE
// =============================

app.use(cors({
     origin: "https://wayhire-frontend.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.use(express.json());


// =============================
// EMAIL TRANSPORTER
// =============================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


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

    // Send Email

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: process.env.EMAIL_USER,

      replyTo: email,

      subject: `New Contact Form Inquiry from ${firstName}`,

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
            <strong>Email:</strong> ${number}
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

    // Success Response

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {

    console.log(error);

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