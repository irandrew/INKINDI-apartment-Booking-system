import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (lazy and safe)
let adminDb: admin.firestore.Firestore | null = null;
const getAdminDb = () => {
  if (!adminDb) {
    if (admin.apps.length === 0) {
      let config = { projectId: "" };
      try {
        const configFile = fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8");
        config = JSON.parse(configFile);
      } catch (err) {
        console.warn("Could not read firebase-applet-config.json for server-side admin init.");
      }

      try {
        admin.initializeApp({
          projectId: config.projectId || process.env.GOOGLE_CLOUD_PROJECT,
        });
      } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        throw new Error("Firebase Admin failed to initialize. Check service account or project ID.");
      }
    }
    adminDb = admin.firestore();
  }
  return adminDb;
};

// Initialize Stripe
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined. Please configure it in the Secrets panel.");
  }
  return new Stripe(secretKey);
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API placeholders
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    const { bookingId, apartmentName, totalPrice, currency = "usd" } = req.body;

    if (!bookingId || !apartmentName || !totalPrice) {
      return res.status(400).json({ error: "Missing required booking details" });
    }

    try {
      const stripe = getStripe();
      const host = process.env.APP_URL || `http://localhost:${PORT}`;
      const db = getAdminDb();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Booking for ${apartmentName}`,
                description: `Booking Reference: ${bookingId}`,
              },
              unit_amount: Math.round(totalPrice * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${host}/payment-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
        cancel_url: `${host}/payment-cancel?booking_id=${bookingId}`,
        metadata: {
          bookingId: bookingId,
        },
      });

      // Update booking with session ID
      await db.collection("bookings").doc(bookingId).update({
        stripeSessionId: session.id,
      });

      res.json({ id: session.id, url: session.url });
    } catch (err) {
      console.error("Stripe error:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
    }
  });

  // Verify Stripe Session and update Firestore
  app.post("/api/verify-payment", async (req, res) => {
    const { sessionId, bookingId } = req.body;

    if (!sessionId || !bookingId) {
      return res.status(400).json({ error: "Missing session or booking ID" });
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const db = getAdminDb();

      if (session.payment_status === "paid") {
        await db.collection("bookings").doc(bookingId).update({
          paymentStatus: "paid",
          status: "confirmed",
        });
        return res.json({ status: "paid" });
      } else {
        return res.json({ status: session.payment_status });
      }
    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
    }
  });

  app.post("/api/send-confirmation", async (req, res) => {
    const { email, guestName, apartmentName, startDate, endDate, totalPrice } = req.body;

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not configured. Email not sent.");
      return res.status(200).json({ message: "Resend API key not configured, but booking succeeded." });
    }

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: "Inkindi Residences <noreply@resend.dev>",
        to: [email],
        subject: `Your Booking Confirmation: ${apartmentName}`,
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #171717;">
            <div style="padding: 40px; border: 1px solid #e5e5e5; border-radius: 20px;">
              <h1 style="font-size: 24px; font-weight: 300; font-style: italic; margin-bottom: 24px;">Inkindi Residences</h1>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">Dear ${guestName},</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Your booking at <strong>${apartmentName}</strong> has been successfully confirmed.</p>
              
              <div style="background-color: #f9f9f9; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #737373; margin-top: 0;">Reservation Details</h2>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <p style="margin: 4px 0;"><strong>Check-in:</strong> ${startDate}</p>
                  <p style="margin: 4px 0;"><strong>Check-out:</strong> ${endDate}</p>
                  <p style="margin: 4px 0;"><strong>Total Price:</strong> $${totalPrice}</p>
                </div>
              </div>

              <p style="font-size: 14px; color: #737373;">If you have any questions, please reply to this email or contact our support team.</p>
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #a3a3a3; text-align: center;">
                &copy; ${new Date().getFullYear()} Inkindi Residences. All rights reserved.
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ message: "Confirmation email sent", data });
    } catch (err) {
      console.error("Server error sending email:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
