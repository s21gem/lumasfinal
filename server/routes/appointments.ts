import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { sendWhatsAppNotification } from "../utils/whatsapp";
// Assume you have sendEmail from earlier
// import { sendEmail } from "../utils/email"; 

const router = Router();

// Public: Submit a new booking
router.post("/", async (req, res) => {
  try {
    const { clientName, clientEmail, clientPhone, serviceType, date, timeSlot, notes } = req.body;

    if (!clientName || !clientEmail || !clientPhone || !date || !timeSlot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Double-booking check
    const existing = await prisma.appointment.findFirst({
      where: {
        date: targetDate,
        timeSlot,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    if (existing) {
      return res.status(409).json({ error: "Time slot is already booked. Please choose another." });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        serviceType,
        date: targetDate,
        timeSlot,
        notes,
      }
    });

    // Fetch settings for WhatsApp notification
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    
    if (settings?.whatsappNotifyNumber && settings?.whatsappApiKey) {
      const message = `🔔 *New Appointment Request*\n\n*Name:* ${clientName}\n*Service:* ${serviceType}\n*Date:* ${targetDate.toISOString().split('T')[0]}\n*Time:* ${timeSlot}\n*Phone:* ${clientPhone}`;
      await sendWhatsAppNotification(settings.whatsappNotifyNumber, settings.whatsappApiKey, message);
    }

    res.status(201).json({ message: "Booking submitted successfully", appointment });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Failed to submit booking" });
  }
});

// Admin: Get all bookings
router.get("/", requireAuth, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: [
        { date: 'desc' },
        { timeSlot: 'asc' }
      ]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Admin: Update Status
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status }
    });

    // TODO: Send Email Notification to client about status update (using Nodemailer)
    // if (status === 'APPROVED') { sendEmail(appointment.clientEmail, ...) }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Admin: Delete appointment
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;
