import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

import pkg from "pg";

const { Pool } = pkg

dotenv.config();

const app = express();

const resend = new Resend(process.env.RESEND_API_KEY);

export const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// =============================
// MIDDLEWARE
// =============================

app.use(
  cors({
    origin: [
          "http://localhost:5173",
      "https://mywayhire.com",
      "https://www.mywayhire.com",
      "wayhire-frontend-npop55sed-rajatsharmaw90-hashs-projects.vercel.app",
    ],
  })
);

app.use(express.json());

// =============================
// TEST ROUTE
// =============================

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

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

    await pool.query('INSERT INTO contact ( firstname, lastname, email, number, message) VALUES($1, $2, $3, $4, $5)',
      [firstName, lastName, email, number, message]
    );

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
  app.post("/job", async (req, res) => {
  const { firstname, lastname, email, number, city, workAuthorization, availableStartDate, preferredJobType, employmentType, shiftAvailability, previousExperience, transportation, safetyShoes, forkliftCertification,  message  } = req.body;

  // Basic validation
  if (!firstname || !lastname || !email || !number || !city || !workAuthorization || !availableStartDate || !preferredJobType || !employmentType || !shiftAvailability || !previousExperience || !transportation || !safetyShoes || !forkliftCertification || !message) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

    console.log(req.body)

  try {
    const result = await pool.query(
      `INSERT INTO applicants (first_name, last_name, email, number, city, legal_status, start_date, prefered_designation, employment_type, availability, prev_experience, transportation, safety_shoes, forklift_licence,  message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15 )
       RETURNING *`,
      [firstname, lastname, email, number, city, workAuthorization, availableStartDate, preferredJobType, employmentType, shiftAvailability, previousExperience, transportation, safetyShoes, forkliftCertification,   message]
    );

    res.status(200).json({
      message: "Application submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error while saving data",
    });
  }
});

  app.post("/hire", async (req, res) => {
  const { companyName, contactPersonName, email, number, jobLocation , message, industry, positionNeeded, shiftTiming, employmentType, workerNumber, requiredExperience, payRate, safetyRequirement } = req.body;

  // Basic validation
  if (!companyName || !contactPersonName || !email || !number ||!jobLocation  || !message || !industry || !positionNeeded || !shiftTiming || !employmentType || !workerNumber || !requiredExperience || !payRate || !safetyRequirement ) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  console.log(req.body)

  try {
    const result = await pool.query(
      `INSERT INTO hire (company_name, contact_person_name, email, number, job_location , message,  industry, position_needed, shift_timing, employment_type, worker_required, required_experience, pay_rate, safety_requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [companyName, contactPersonName, email, number, jobLocation , message, industry, positionNeeded, shiftTiming, employmentType, workerNumber, requiredExperience, payRate, safetyRequirement]
      
    );

    res.status(200).json({
      message: "Application submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error while saving data",
    });
  }
});


// BACKEND (Node.js + Express)

app.get("/apply", async (req, res) => {
  try {

    const { search, location, category, shift } = req.query;

    let query = `SELECT * FROM jobs WHERE 1=1`;
    let values = [];

    // Search Filter
    if (search) {
      values.push(`%${search}%`);
      query += ` AND title ILIKE $${values.length}`;
    }

    // Location Filter
    if (location) {
      values.push(location);
      query += ` AND location = $${values.length}`;
    }

    // Category Filter
    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    // Shift Filter
    if (shift) {
      values.push(shift);
      query += ` AND shift = $${values.length}`;
    }

    query += ` ORDER BY id DESC`;

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.get("/apply/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM jobs WHERE id = $1",
      [id]
    );

    // No Job Found
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.log(error);

    res.status(500).json({
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