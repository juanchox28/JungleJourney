import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import multer from "multer";
import fetch from "node-fetch";
import { sendConfirmationEmail, sendPaymentFailureNotification } from "./emailService.js";
// import sharp from "sharp";

export async function registerRoutes(app: Express): Promise<Server> {

  // Wompi configuration
  const WOMPI_BASE = process.env.WOMPI_BASE || "https://sandbox.wompi.co/v1";
  const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
  const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";

  // Configure multer for image uploads
  const multerStorage = multer.memoryStorage();
  const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Image upload endpoint
  app.post("/api/upload/images", upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedUrls: string[] = [];
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadsDir = path.join(process.cwd(), isProduction ? 'dist/public/uploads' : 'client/public/uploads');

      for (const file of req.files as Express.Multer.File[]) {
        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        const filepath = path.join(uploadsDir, filename);

        // Ensure uploads directory exists
        await import('fs').then(fs => fs.promises.mkdir(uploadsDir, { recursive: true }));

        // For now, just save the file without processing
        // TODO: Re-enable Sharp when platform issues are resolved
        await import('fs').then(fs => fs.promises.writeFile(filepath, file.buffer));

        uploadedUrls.push(`/uploads/${filename}`);
      }

      res.json({ urls: uploadedUrls });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  });

  app.get("/api/tours", async (req, res) => {
    try {
      console.log("🔍 Server: Fetching tours with filters:", req.query);
      const { location, category } = req.query;
      const filters: { location?: string; category?: string } = {};

      if (location && typeof location === 'string') {
        filters.location = location;
      }

      if (category && typeof category === 'string') {
        filters.category = category;
      }

      const tours = await storage.getTours(filters);
      console.log("✅ Server: Returning", tours.length, "tours");
      console.log("📋 Server: First tour sample:", tours[0] ? { name: tours[0].name, location: tours[0].location, basePrice: tours[0].basePrice } : "No tours");
      res.json(tours);
    } catch (error) {
      console.error('❌ Server: Error fetching tours:', error);
      res.status(500).json({ error: 'Failed to fetch tours' });
    }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tour = await storage.getTour(id);

      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }

      res.json(tour);
    } catch (error) {
      console.error('Error fetching tour:', error);
      res.status(500).json({ error: 'Failed to fetch tour' });
    }
  });

  app.get("/api/version", (req, res) => {
    try {
      const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      let gitCommit = 'N/A';
      let gitBranch = 'N/A';

      try {
        gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
        gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
      } catch (gitError) {
        console.warn('Could not get git info:', gitError);
      }

      res.json({
        version: packageJson.version,
        commit: gitCommit,
        branch: gitBranch,
        buildTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      console.error('Error getting version info:', error);
      res.status(500).json({ error: 'Failed to get version info' });
    }
  });

  app.get("/api/accommodations", async (req, res) => {
    try {
      console.log("🔍 Server: Fetching accommodations with filters:", req.query);
      const { location, type } = req.query;
      const filters: { location?: string; type?: string } = {};

      if (location && typeof location === 'string') {
        filters.location = location;
      }

      if (type && typeof type === 'string') {
        filters.type = type;
      }

      const accommodations = await storage.getAccommodations(filters);
      console.log("✅ Server: Returning", accommodations.length, "accommodations");
      console.log("📋 Server: First accommodation sample:", accommodations[0] ? { name: accommodations[0].name, location: accommodations[0].location, pricePerNight: accommodations[0].pricePerNight } : "No accommodations");
      res.json(accommodations);
    } catch (error) {
      console.error('❌ Server: Error fetching accommodations:', error);
      res.status(500).json({ error: 'Failed to fetch accommodations' });
    }
  });

  app.get("/api/accommodations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const accommodation = await storage.getAccommodation(id);

      if (!accommodation) {
        return res.status(404).json({ error: 'Accommodation not found' });
      }

      res.json(accommodation);
    } catch (error) {
      console.error('Error fetching accommodation:', error);
      res.status(500).json({ error: 'Failed to fetch accommodation' });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = req.body;
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  // -------------------- TOUR BOOKING ENDPOINT --------------------
  app.post("/api/create-tour-booking", async (req, res) => {
    console.log(`🎯 Create tour booking request from ${req.ip} at ${new Date().toISOString()}`);
    console.log('Request body:', req.body);

    try {
      const { guestName, guestEmail, guestCount, tourDate, tourId, totalPrice, participants } = req.body;

      if (!WOMPI_PRIVATE_KEY) {
        console.error('❌ WOMPI_PRIVATE_KEY not configured');
        return res.status(500).json({
          ok: false,
          error: "Wompi private key not configured",
          message: "Please set WOMPI_PRIVATE_KEY in .env file"
        });
      }

      const reference = `BK-${Date.now()}`;

      // Create booking in storage
      const booking = await storage.createBooking({
        tourId,
        guestName,
        guestEmail,
        guestCount: parseInt(guestCount),
        tourDate,
        totalPrice: totalPrice.toString(),
        reference,
        status: "payment_pending",
        participants: participants ? JSON.stringify(participants) : null
      });

      console.log("💾 Tour booking created:", booking);

      // Get tour details for description
      const tour = await storage.getTour(tourId);

      // -------------------- WOMPI CALL --------------------
      const payload = {
        name: `JungleJourney Tour Booking - ${reference}`,
        amount_in_cents: Math.round(parseFloat(totalPrice) * 100),
        currency: "COP",
        single_use: true,
        description: `Tour booking for ${guestName} - ${tour?.name || 'Tour'} on ${tourDate} - ${guestCount} participant(s)`,
        redirect_url: `${FRONTEND_URL}/booking-success.html?reference=${reference}&type=tour&name=${encodeURIComponent(guestName)}&email=${encodeURIComponent(guestEmail)}&tourDate=${tourDate}&guests=${guestCount}&amount=${totalPrice}`,
        collect_shipping: false,
      };

      console.log("📡 Sending to Wompi:", payload);

      const wompiRes = await fetch(`${WOMPI_BASE}/payment_links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const wompiData = await wompiRes.json() as any;
      console.log("📡 Wompi response:", wompiData);

      if (wompiData.data && wompiData.data.id) {
        const updatedBooking = {
          ...booking,
          wompiPaymentId: wompiData.data.id,
          checkoutUrl: `https://checkout.wompi.co/l/${wompiData.data.id}`,
          status: "payment_pending"
        };

        res.json({
          ok: true,
          booking: updatedBooking,
          checkout_url: `https://checkout.wompi.co/l/${wompiData.data.id}`,
          wompi_response: wompiData
        });
      } else {
        console.error("❌ Error en respuesta de Wompi:", JSON.stringify(wompiData, null, 2));

        const updatedBooking = {
          ...booking,
          status: "payment_failed",
          paymentStatus: "ERROR"
        };

        // Send payment failure notification
        try {
          await sendPaymentFailureNotification({
            reference,
            customerName: guestName,
            customerEmail: guestEmail,
            amount: parseFloat(totalPrice),
            paymentData: wompiData,
            bookingType: 'tour',
            errorDetails: wompiData.error?.messages?.[0]?.message || wompiData.error || "Failed to create payment link"
          });
          console.log(`📧 Payment failure notification sent for tour booking: ${reference}`);
        } catch (emailError) {
          console.error(`⚠️ Failed to send payment failure notification for tour booking: ${reference}`, emailError);
        }

        res.status(400).json({
          ok: false,
          booking: updatedBooking,
          error: wompiData.error || "Failed to create payment link",
          wompi_response: wompiData
        });
      }
    } catch (err) {
      console.error("❌ Error en /api/create-tour-booking:", err);
      res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        details: "Internal server error"
      });
    }
  });

  // -------------------- WOMPI PAYMENT INTEGRATION --------------------
  app.post("/api/create-accommodation-booking", async (req, res) => {
    console.log(`💳 Create accommodation booking request from ${req.ip} at ${new Date().toISOString()}`);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
      const { guestName, guestEmail, guestCount, checkInDate, checkOutDate, accommodationId, totalPrice, paymentMethod, status } = req.body;

      // Validate required fields
      if (!guestName || !guestEmail || !guestCount || !checkInDate || !checkOutDate || !accommodationId || !totalPrice) {
        console.error('❌ Missing required fields:', { guestName, guestEmail, guestCount, checkInDate, checkOutDate, accommodationId, totalPrice });
        return res.status(400).json({
          ok: false,
          error: "Missing required fields",
          message: "All booking fields are required"
        });
      }

      const reference = `BK-${Date.now()}`;

      // Handle cash payment bookings
      if (paymentMethod === 'cash') {
        const booking = await storage.createBooking({
          accommodationId,
          guestName,
          guestEmail,
          guestCount: parseInt(guestCount),
          checkInDate,
          checkOutDate,
          totalPrice: totalPrice.toString(),
          reference,
          status: status || "confirmed", // Cash payments are immediately confirmed
          paymentMethod: 'cash'
        });

        console.log("💾 Cash accommodation booking created:", booking);

        // Send confirmation email for cash payment (don't fail if email fails)
        try {
          await sendConfirmationEmail({
            reference: booking.reference || '',
            name: booking.guestName,
            email: booking.guestEmail,
            checkIn: booking.checkInDate || undefined,
            checkOut: booking.checkOutDate || undefined,
            guests: booking.guestCount,
            room: 'Accommodation', // Generic for now
            amount: booking.totalPrice ? parseFloat(booking.totalPrice) : 0
          });
          console.log(`📧 Confirmation email sent for cash booking: ${reference}`);
        } catch (emailError) {
          console.error(`⚠️ Email sending failed for cash booking: ${reference}`, emailError);
          // Don't fail the booking for email errors
        }

        return res.json({
          ok: true,
          booking,
          success_url: `${FRONTEND_URL}/booking-success.html`
        });
      }

      // Handle card payment bookings (existing logic)
      if (!WOMPI_PRIVATE_KEY) {
        console.error('❌ WOMPI_PRIVATE_KEY not configured');
        return res.status(500).json({
          ok: false,
          error: "Wompi private key not configured",
          message: "Please set WOMPI_PRIVATE_KEY in .env file"
        });
      }

      // Create booking in storage
      const booking = await storage.createBooking({
        accommodationId,
        guestName,
        guestEmail,
        guestCount: parseInt(guestCount),
        checkInDate,
        checkOutDate,
        totalPrice: totalPrice.toString(),
        reference,
        status: "payment_pending"
      });

      console.log("💾 Accommodation booking created:", booking);

      // -------------------- ENHANCED WOMPI CALL --------------------
      const amountInCents = Math.round(parseFloat(totalPrice) * 100);

      // Validate amount is reasonable (prevent fraud)
      if (amountInCents < 100000 || amountInCents > 1000000000) { // Between 1,000 and 10,000,000 COP
        console.error(`❌ Invalid amount: ${amountInCents} cents`);
        return res.status(400).json({
          ok: false,
          error: "Invalid payment amount",
          message: "Amount must be between $1,000 and $10,000,000 COP"
        });
      }

      const payload = {
        name: `JungleJourney Accommodation Booking - ${reference}`,
        amount_in_cents: amountInCents,
        currency: "COP",
        single_use: true,
        description: `Accommodation booking for ${guestName} - ${checkInDate} to ${checkOutDate} - ${guestCount} guest(s)`,
        redirect_url: `${FRONTEND_URL}/booking-success.html?reference=${reference}&type=accommodation&name=${encodeURIComponent(guestName)}&email=${encodeURIComponent(guestEmail)}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guestCount}&amount=${totalPrice}`,
        collect_shipping: false,
        // Add webhook URL for automatic status updates
        webhook_url: `${process.env.BACKEND_URL || FRONTEND_URL.replace('http://', 'https://').replace('https://localhost:5000', 'https://your-fly-app.fly.dev')}/api/wompi/webhook`
      };

      console.log("📡 Sending to Wompi:", { ...payload, webhook_url: payload.webhook_url });

      const wompiRes = await fetch(`${WOMPI_BASE}/payment_links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const wompiData = await wompiRes.json() as any;
      console.log("📡 Wompi response:", wompiData);

      if (wompiData.data && wompiData.data.id) {
        const updatedBooking = {
          ...booking,
          wompiPaymentId: wompiData.data.id,
          checkoutUrl: `https://checkout.wompi.co/l/${wompiData.data.id}`,
          status: "payment_pending"
        };

        // Update booking with payment info
        // Note: In a real implementation, you'd update the database record here

        res.json({
          ok: true,
          booking: updatedBooking,
          checkout_url: `https://checkout.wompi.co/l/${wompiData.data.id}`,
          wompi_response: wompiData
        });
      } else {
        console.error("❌ Error en respuesta de Wompi:", JSON.stringify(wompiData, null, 2));

        // Update booking status to failed
        booking.status = "payment_failed";
        booking.paymentStatus = "ERROR";
        booking.paymentData = JSON.stringify(wompiData);

        // Send payment failure notification
        try {
          await sendPaymentFailureNotification({
            reference,
            customerName: guestName,
            customerEmail: guestEmail,
            amount: parseFloat(totalPrice),
            paymentData: wompiData,
            bookingType: 'accommodation',
            errorDetails: wompiData.error?.messages?.[0]?.message || wompiData.error || "Failed to create payment link"
          });
          console.log(`📧 Payment failure notification sent for accommodation booking: ${reference}`);
        } catch (emailError) {
          console.error(`⚠️ Failed to send payment failure notification for accommodation booking: ${reference}`, emailError);
        }

        res.status(400).json({
          ok: false,
          booking,
          error: wompiData.error?.messages?.[0]?.message || wompiData.error || "Failed to create payment link",
          wompi_response: wompiData
        });
      }
    } catch (err) {
      console.error("❌ Error en /api/create-accommodation-booking:", err);
      res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        details: "Internal server error"
      });
    }
  });

  // Payment status check
  app.get("/api/payment-status/:reference", async (req, res) => {
    try {
      const { reference } = req.params;

      // Find booking by reference
      const bookings = await storage.getBookings();
      const booking = bookings.find(b => b.reference === reference);

      if (!booking) {
        return res.status(404).json({ ok: false, error: "Booking not found" });
      }

      if (booking.wompiPaymentId && WOMPI_PUBLIC_KEY) {
        const paymentRes = await fetch(`${WOMPI_BASE}/transactions/${booking.wompiPaymentId}`, {
          headers: {
            Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
          },
        });

        const paymentData = await paymentRes.json() as any;

        if (paymentData.data) {
          const statusMap = {
            'APPROVED': 'confirmed',
            'DECLINED': 'cancelled',
            'VOIDED': 'cancelled',
            'ERROR': 'payment_failed',
            'PENDING': 'pending'
          };

          const newStatus = statusMap[paymentData.data.status as keyof typeof statusMap] || 'pending';

          // Update booking status
          booking.status = newStatus;
          booking.paymentStatus = paymentData.data.status;
          booking.paymentData = JSON.stringify(paymentData.data);

          // Send confirmation email if payment was approved
          if (newStatus === 'confirmed') {
            await sendConfirmationEmail({
              reference: booking.reference || '',
              name: booking.guestName,
              email: booking.guestEmail,
              checkIn: booking.checkInDate || undefined,
              checkOut: booking.checkOutDate || undefined,
              guests: booking.guestCount,
              room: 'Accommodation', // Generic for now
              amount: booking.totalPrice ? parseFloat(booking.totalPrice) : 0
            });
          }
        }
      }

      res.json({ ok: true, booking });
    } catch (err) {
      console.error("❌ Error checking payment status:", err);
      res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  });

  // -------------------- WOMPI WEBHOOK HANDLING --------------------
  app.post("/api/wompi/webhook", async (req, res) => {
    console.log(`🔗 Wompi webhook received from ${req.ip} at ${new Date().toISOString()}`);
    console.log('Webhook body:', JSON.stringify(req.body, null, 2));

    try {
      const { event, data, signature } = req.body;

      // Validate webhook signature (recommended for production)
      if (process.env.NODE_ENV === 'production' && signature) {
        // Wompi provides signature validation - implement if needed
        // This is optional but recommended for security
      }

      if (!data || !data.id) {
        console.warn('⚠️ Invalid webhook data - missing transaction ID');
        return res.status(400).json({ ok: false, error: 'Invalid webhook data' });
      }

      const transactionId = data.id;
      console.log(`💳 Processing webhook for transaction: ${transactionId}`);

      // Find booking by Wompi payment ID
      const bookings = await storage.getBookings();
      const booking = bookings.find(b => b.wompiPaymentId === transactionId);

      if (!booking) {
        console.warn(`⚠️ No booking found for transaction ID: ${transactionId}`);
        return res.status(404).json({ ok: false, error: 'Booking not found for transaction' });
      }

      console.log(`📋 Found booking: ${booking.reference} - Current status: ${booking.status}`);

      // Map Wompi status to booking status
      const statusMap = {
        'APPROVED': 'confirmed',
        'DECLINED': 'cancelled',
        'VOIDED': 'cancelled',
        'ERROR': 'payment_failed',
        'PENDING': 'pending'
      };

      const newStatus = statusMap[data.status as keyof typeof statusMap] || 'pending';
      const oldStatus = booking.status;

      // Update booking with webhook data
      booking.status = newStatus;
      booking.paymentStatus = data.status;
      booking.paymentData = JSON.stringify(data);

      console.log(`🔄 Status update: ${oldStatus} → ${newStatus}`);

      // Send confirmation email for approved payments
      if (newStatus === 'confirmed' && oldStatus !== 'confirmed') {
        console.log(`📧 Sending confirmation email for booking: ${booking.reference}`);

        try {
          await sendConfirmationEmail({
            reference: booking.reference || '',
            name: booking.guestName,
            email: booking.guestEmail,
            checkIn: booking.checkInDate || undefined,
            checkOut: booking.checkOutDate || undefined,
            guests: booking.guestCount,
            room: booking.accommodationId ? 'Accommodation' : 'Tour',
            amount: booking.totalPrice ? parseFloat(booking.totalPrice) : 0
          });
          console.log(`✅ Confirmation email sent for booking: ${booking.reference}`);
        } catch (emailError) {
          console.error(`❌ Failed to send confirmation email for booking: ${booking.reference}`, emailError);
          // Don't fail the webhook for email errors
        }
      }

      // Log successful webhook processing
      console.log(`✅ Webhook processed successfully for booking: ${booking.reference} (${newStatus})`);

      res.json({
        ok: true,
        message: 'Webhook processed successfully',
        booking: {
          reference: booking.reference,
          status: booking.status,
          paymentStatus: booking.paymentStatus
        }
      });

    } catch (err) {
      console.error("❌ Error processing Wompi webhook:", err);
      res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        message: 'Webhook processing failed'
      });
    }
  });

  // Webhook verification endpoint (optional)
  app.get("/api/wompi/webhook", (req, res) => {
    console.log(`🔍 Wompi webhook verification request from ${req.ip}`);
    res.json({
      ok: true,
      message: 'Wompi webhook endpoint is active',
      timestamp: new Date().toISOString()
    });
  });

  // -------------------- CART CHECKOUT ENDPOINT --------------------
  app.post("/api/create-cart-checkout", async (req, res) => {
    console.log(`🛒 Cart checkout request from ${req.ip} at ${new Date().toISOString()}`);
    console.log('Cart checkout body:', JSON.stringify(req.body, null, 2));

    try {
      const { guestName, guestEmail, specialRequests, items, totalPrice } = req.body;

      if (!guestName || !guestEmail || !items || items.length === 0) {
        console.error('❌ Missing required fields for cart checkout');
        return res.status(400).json({
          ok: false,
          error: "Missing required fields",
          message: "Name, email, and cart items are required"
        });
      }

      if (!WOMPI_PRIVATE_KEY) {
        console.error('❌ WOMPI_PRIVATE_KEY not configured');
        return res.status(500).json({
          ok: false,
          error: "Wompi private key not configured",
          message: "Please set WOMPI_PRIVATE_KEY in .env file"
        });
      }

      const reference = `CART-${Date.now()}`;

      // Create bookings for each cart item
      const bookingPromises = items.map(async (item: any) => {
        const bookingData: any = {
          guestName,
          guestEmail,
          guestCount: item.participants,
          totalPrice: item.totalPrice.toString(),
          reference: `${reference}-${item.id}`,
          status: "payment_pending"
        };

        // Set appropriate fields based on item type
        if (item.type === 'tour') {
          bookingData.tourId = item.details.tourId;
          bookingData.tourDate = item.date;
          bookingData.participants = JSON.stringify(item.details.participants);
        } else if (item.type === 'transfer') {
          bookingData.tourId = item.details.routeId;
          bookingData.tourDate = item.date;
        }

        return await storage.createBooking(bookingData);
      });

      const bookings = await Promise.all(bookingPromises);
      console.log("💾 Cart bookings created:", bookings.length, "bookings");

      // Create Wompi payment link for the entire cart
      const payload = {
        name: `JungleJourney Cart Checkout - ${reference}`,
        amount_in_cents: Math.round(parseFloat(totalPrice) * 100),
        currency: "COP",
        single_use: true,
        description: `Cart checkout for ${guestName} - ${items.length} item(s) - Total: ${totalPrice}`,
        redirect_url: `${FRONTEND_URL}/booking-success.html?reference=${reference}&type=cart&name=${encodeURIComponent(guestName)}&email=${encodeURIComponent(guestEmail)}&amount=${totalPrice}&items=${items.length}`,
        collect_shipping: false,
      };

      console.log("📡 Sending cart checkout to Wompi:", payload);

      const wompiRes = await fetch(`${WOMPI_BASE}/payment_links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const wompiData = await wompiRes.json() as any;
      console.log("📡 Wompi cart response:", wompiData);

      if (wompiData.data && wompiData.data.id) {
        // Update bookings with payment info
        for (const booking of bookings) {
          booking.wompiPaymentId = wompiData.data.id;
          booking.checkoutUrl = `https://checkout.wompi.co/l/${wompiData.data.id}`;
        }

        res.json({
          ok: true,
          bookings,
          checkout_url: `https://checkout.wompi.co/l/${wompiData.data.id}`,
          wompi_response: wompiData,
          reference
        });
      } else {
        console.error("❌ Error en respuesta de Wompi para carrito:", JSON.stringify(wompiData, null, 2));

        // Update booking statuses to failed
        for (const booking of bookings) {
          booking.status = "payment_failed";
          booking.paymentStatus = "ERROR";
        }

        // Send payment failure notification for cart
        try {
          await sendPaymentFailureNotification({
            reference,
            customerName: guestName,
            customerEmail: guestEmail,
            amount: parseFloat(totalPrice),
            paymentData: wompiData,
            bookingType: `cart (${items.length} items)`,
            errorDetails: wompiData.error?.messages?.[0]?.message || wompiData.error || "Failed to create payment link"
          });
          console.log(`📧 Payment failure notification sent for cart checkout: ${reference}`);
        } catch (emailError) {
          console.error(`⚠️ Failed to send payment failure notification for cart checkout: ${reference}`, emailError);
        }

        res.status(400).json({
          ok: false,
          bookings,
          error: wompiData.error || "Failed to create payment link",
          wompi_response: wompiData
        });
      }
    } catch (err) {
      console.error("❌ Error en /api/create-cart-checkout:", err);
      res.status(500).json({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        details: "Internal server error"
      });
    }
  });

  // Email confirmation endpoint
  app.post("/api/send-confirmation-email", async (req, res) => {
    try {
      const { reference, name, email, checkIn, checkOut, guests, room, amount } = req.body;

      const booking = {
        reference,
        name,
        email,
        checkIn,
        checkOut,
        guests,
        room,
        amount
      };

      const result = await sendConfirmationEmail(booking);

      if (result.success) {
        console.log(`✅ Email de confirmación enviado para reserva ${reference}`);
        res.json({
          ok: true,
          message: 'Email enviado exitosamente',
          messageId: result.messageId
        });
      } else {
        console.warn(`⚠️ No se pudo enviar email para reserva ${reference}:`, result.error);
        res.json({
          ok: false,
          error: result.error,
          message: 'Email no enviado (configuración requerida)'
        });
      }

    } catch (error) {
      console.error('❌ Error en /api/send-confirmation-email:', error);
      res.status(500).json({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        message: 'Error interno del servidor'
      });
    }
  });

  app.get('/api/auth/logout', function (req, res, next) {
    (req.session as any).isAdmin = false;
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/naane');
    });
  });

  // Admin routes - no authentication required
  app.post("/api/naane/login", (req, res) => {
    console.log("🔓 Server: Admin login bypassed - no authentication required");
    (req.session as any).isAdmin = true;
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ success: false, error: "Error saving session" });
      }
      res.json({ success: true });
    });
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    console.log("🔓 Server: Admin access - no authentication required");
    next();
  };


  // Tours CRUD
  app.get("/api/naane/tours", requireAdmin, async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      console.error('Error fetching admin tours:', error);
      res.status(500).json({ error: 'Failed to fetch tours' });
    }
  });

  app.post("/api/naane/tours", requireAdmin, async (req, res) => {
    try {
      const tour = await storage.createTour(req.body);
      res.status(201).json(tour);
    } catch (error) {
      console.error('Error creating tour:', error);
      res.status(500).json({ error: 'Failed to create tour' });
    }
  });

  app.put("/api/naane/tours/:id", requireAdmin, async (req, res) => {
    try {
      const tour = await storage.updateTour(req.params.id, req.body);
      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      res.json(tour);
    } catch (error) {
      console.error('Error updating tour:', error);
      res.status(500).json({ error: 'Failed to update tour' });
    }
  });

  app.delete("/api/naane/tours/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteTour(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting tour:', error);
      res.status(500).json({ error: 'Failed to delete tour' });
    }
  });

  // Accommodations CRUD
  app.get("/api/naane/accommodations", requireAdmin, async (req, res) => {
    try {
      const accommodations = await storage.getAccommodations();
      res.json(accommodations);
    } catch (error) {
      console.error('Error fetching admin accommodations:', error);
      res.status(500).json({ error: 'Failed to fetch accommodations' });
    }
  });

  app.post("/api/naane/accommodations", requireAdmin, async (req, res) => {
    try {
      const accommodation = await storage.createAccommodation(req.body);
      res.status(201).json(accommodation);
    } catch (error) {
      console.error('Error creating accommodation:', error);
      res.status(500).json({ error: 'Failed to create accommodation' });
    }
  });

  app.put("/api/naane/accommodations/:id", requireAdmin, async (req, res) => {
    try {
      const accommodation = await storage.updateAccommodation(req.params.id, req.body);
      if (!accommodation) {
        return res.status(404).json({ error: 'Accommodation not found' });
      }
      res.json(accommodation);
    } catch (error) {
      console.error('Error updating accommodation:', error);
      res.status(500).json({ error: 'Failed to update accommodation' });
    }
  });

  app.delete("/api/naane/accommodations/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteAccommodation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Accommodation not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting accommodation:', error);
      res.status(500).json({ error: 'Failed to delete accommodation' });
    }
  });

  // Bookings management
  app.get("/api/naane/bookings", requireAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.put("/api/naane/bookings/:id", requireAdmin, async (req, res) => {
    try {
      const updatedBooking = { ...req.body, id: req.params.id };
      res.json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: 'Failed to update booking' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
