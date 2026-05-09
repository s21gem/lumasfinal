import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Helper to convert "HH:MM" to minutes from midnight
const timeToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

// Helper to format minutes to "HH:MM AM/PM"
const formatTime = (totalMinutes: number) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hours12 = h % 12 || 12;
  const minutesStr = m < 10 ? `0${m}` : m.toString();
  return `${hours12}:${minutesStr} ${ampm}`;
};

// Get available slots for a specific date
router.get("/available-slots", async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: "Date is required (YYYY-MM-DD)" });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    if (!settings) {
      return res.status(500).json({ error: "Settings not found" });
    }

    const startMinutes = timeToMinutes(settings.businessHoursStart);
    const endMinutes = timeToMinutes(settings.businessHoursEnd);
    const duration = settings.defaultMeetingDuration;

    // Fetch existing appointments on this date
    const appointments = await prisma.appointment.findMany({
      where: {
        date: targetDate,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    // Fetch blockouts on this date
    const blocks = await prisma.scheduleBlock.findMany({
      where: { date: targetDate }
    });

    // If there's a full-day block, return empty array
    const hasFullDayBlock = blocks.some(b => b.startTime === null && b.endTime === null);
    if (hasFullDayBlock) {
      return res.json({ availableSlots: [] });
    }

    const bookedSlots = appointments.map(a => a.timeSlot);
    
    // Generate all possible slots
    const availableSlots = [];
    for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
      const slotStr = formatTime(current);
      
      // Check if booked by appointment
      if (bookedSlots.includes(slotStr)) {
        continue;
      }

      // Check if overlapping with a block
      // Note: This simple logic assumes blocks align with slot boundaries for simplicity, 
      // but a proper check would compare minutes.
      const isBlocked = blocks.some(b => {
        if (!b.startTime || !b.endTime) return false;
        const blockStart = timeToMinutes(b.startTime);
        const blockEnd = timeToMinutes(b.endTime);
        return current >= blockStart && current < blockEnd;
      });

      if (!isBlocked) {
        availableSlots.push(slotStr);
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

// Create a schedule block (Admin only)
router.post("/blocks", requireAuth, async (req, res) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const block = await prisma.scheduleBlock.create({
      data: {
        date: targetDate,
        startTime,
        endTime,
        reason
      }
    });

    res.json(block);
  } catch (error) {
    console.error("Error creating block:", error);
    res.status(500).json({ error: "Failed to create block" });
  }
});

// Delete a schedule block
router.delete("/blocks/:id", requireAuth, async (req, res) => {
  try {
    await prisma.scheduleBlock.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete block" });
  }
});

// Get blocks for admin calendar
router.get("/blocks", requireAuth, async (req, res) => {
  try {
    const blocks = await prisma.scheduleBlock.findMany({
      orderBy: { date: 'asc' }
    });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blocks" });
  }
});

export default router;
