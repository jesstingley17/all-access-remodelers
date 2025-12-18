import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import session from "express-session";
import { storage } from "./storage";
import { insertContactSchema, insertTestimonialSchema, insertGalleryItemSchema, insertMaintenanceRequestSchema } from "@shared/schema";
import { getChatCompletion, generateQuoteEstimate, generateContent, enhanceImageDescription, type ChatMessage } from "./openai";
import { Resend } from "resend";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "allaccessremodelers-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  // Serve uploaded files with proper static middleware
  app.use("/uploads", express.static(uploadsDir));
  
  // Serve static assets from attached_assets/photos
  // Also check client/public/assets as fallback
  const attachedAssetsDir = path.join(process.cwd(), "attached_assets", "photos");
  const clientAssetsDir = path.join(process.cwd(), "client", "public", "assets");
  const distAssetsDir = path.join(process.cwd(), "dist", "public", "assets");
  
  // Priority: attached_assets/photos > client/public/assets > dist/public/assets
  let assetsDir: string | null = null;
  if (fs.existsSync(attachedAssetsDir)) {
    assetsDir = attachedAssetsDir;
  } else if (fs.existsSync(clientAssetsDir)) {
    assetsDir = clientAssetsDir;
  } else if (process.env.NODE_ENV === "production" && fs.existsSync(distAssetsDir)) {
    assetsDir = distAssetsDir;
  }
  
  if (assetsDir) {
    app.use("/assets", express.static(assetsDir, {
      maxAge: process.env.NODE_ENV === "production" ? "1y" : "0",
      etag: true,
      lastModified: true,
    }));
    console.log(`✓ Serving assets from: ${assetsDir}`);
  } else {
    console.warn(`⚠ Assets directory not found. Checked: ${attachedAssetsDir}, ${clientAssetsDir}, ${distAssetsDir}`);
  }

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin ?? false;

      res.json({ success: true, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/session", async (req, res) => {
    if (req.session.userId && req.session.isAdmin) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        return res.json({ isAuthenticated: true, user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
      }
    }
    res.json({ isAuthenticated: false });
  });

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Contact form submission
  app.post("/api/contacts", async (req, res) => {
    try {
      const result = insertContactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid form data", details: result.error.errors });
      }
      
      const contact = await storage.createContact(result.data);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Get all contacts (for admin)
  app.get("/api/contacts", requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // Mark contact as read
  app.patch("/api/contacts/:id/read", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid contact ID" });
      }
      
      const contact = await storage.markContactAsRead(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  // Get approved testimonials (public)
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  // Get all testimonials (for admin)
  app.get("/api/testimonials/all", requireAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  // Submit a testimonial
  app.post("/api/testimonials", async (req, res) => {
    try {
      const result = insertTestimonialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid testimonial data", details: result.error.errors });
      }
      
      const testimonial = await storage.createTestimonial(result.data);
      res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ error: "Failed to submit testimonial" });
    }
  });

  // Approve a testimonial
  app.patch("/api/testimonials/:id/approve", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid testimonial ID" });
      }
      
      const testimonial = await storage.approveTestimonial(id);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error("Error approving testimonial:", error);
      res.status(500).json({ error: "Failed to approve testimonial" });
    }
  });

  // Get all gallery items
  app.get("/api/gallery", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const items = category
        ? await storage.getGalleryItemsByCategory(category)
        : await storage.getGalleryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ error: "Failed to fetch gallery items" });
    }
  });

  // Upload gallery item with image
  app.post("/api/gallery", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      const file = req.file;
      
      // Require image file for gallery uploads
      if (!file) {
        return res.status(400).json({ error: "Image file is required" });
      }
      
      const imageUrl = `/uploads/${file.filename}`;
      
      const itemData = {
        title: req.body.title,
        description: req.body.description || undefined,
        category: req.body.category,
        imageUrl,
      };

      const result = insertGalleryItemSchema.safeParse(itemData);
      if (!result.success) {
        // Remove uploaded file if validation fails
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: "Invalid gallery item data", details: result.error.errors });
      }

      const item = await storage.createGalleryItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating gallery item:", error);
      res.status(500).json({ error: "Failed to create gallery item" });
    }
  });

  // Delete gallery item
  app.delete("/api/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid gallery item ID" });
      }

      const deleted = await storage.deleteGalleryItem(id);
      if (!deleted) {
        return res.status(404).json({ error: "Gallery item not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      res.status(500).json({ error: "Failed to delete gallery item" });
    }
  });

  // AI Chatbot endpoint (public)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      
      const response = await getChatCompletion(messages as ChatMessage[]);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // AI Quote Estimator endpoint (public)
  app.post("/api/quote-estimate", async (req, res) => {
    try {
      const { serviceType, projectDescription, squareFootage, timeline, location } = req.body;
      if (!serviceType || !projectDescription) {
        return res.status(400).json({ error: "Service type and project description are required" });
      }
      
      const estimate = await generateQuoteEstimate({
        serviceType,
        projectDescription,
        squareFootage,
        timeline,
        location,
      });
      res.json({ estimate });
    } catch (error) {
      console.error("Quote estimate error:", error);
      res.status(500).json({ error: "Failed to generate estimate" });
    }
  });

  // AI Content Generator (admin only)
  app.post("/api/generate-content", requireAdmin, async (req, res) => {
    try {
      const { contentType, context } = req.body;
      if (!contentType || !context) {
        return res.status(400).json({ error: "Content type and context are required" });
      }
      
      const content = await generateContent(contentType, context);
      res.json({ content });
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // AI Image Description Enhancer (admin only)
  app.post("/api/enhance-description", requireAdmin, async (req, res) => {
    try {
      const { title, category, existingDescription } = req.body;
      if (!title || !category) {
        return res.status(400).json({ error: "Title and category are required" });
      }
      
      const description = await enhanceImageDescription(title, category, existingDescription);
      res.json({ description });
    } catch (error) {
      console.error("Description enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance description" });
    }
  });

  // Maintenance Request submission with email via Resend
  app.post("/api/maintenance-requests", upload.single("image"), async (req, res) => {
    try {
      const formData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        propertyAddress: req.body.propertyAddress,
        issueType: req.body.issueType,
        description: req.body.description,
        urgency: req.body.urgency,
        preferredContactTime: req.body.preferredContactTime,
      };

      const result = insertMaintenanceRequestSchema.safeParse(formData);
      if (!result.success) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: "Invalid form data", details: result.error.errors });
      }

      const requestData = result.data;
      const imageFile = req.file;
      const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        console.error("RESEND_API_KEY is not configured");
        // Still return success to user, but log the error
        return res.status(201).json({ 
          success: true, 
          message: "Maintenance request received. Email notification failed to send." 
        });
      }

      const resend = new Resend(resendApiKey);
      
      // Get base URL for image links (use environment variable or construct from request)
      const baseUrl = process.env.SITE_URL || (req.protocol + "://" + req.get("host"));
      const fullImageUrl = imageUrl ? `${baseUrl}${imageUrl}` : null;
      
      // Email to admin/company
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111418;">New Maintenance Request</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${requestData.name}</p>
            <p><strong>Email:</strong> ${requestData.email}</p>
            <p><strong>Phone:</strong> ${requestData.phone}</p>
            <p><strong>Property Address:</strong> ${requestData.propertyAddress}</p>
            <p><strong>Issue Type:</strong> ${requestData.issueType}</p>
            <p><strong>Urgency:</strong> ${requestData.urgency}</p>
            <p><strong>Preferred Contact Time:</strong> ${requestData.preferredContactTime}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #C89B3C; margin: 20px 0;">
            <h3 style="color: #111418; margin-top: 0;">Description:</h3>
            <p style="white-space: pre-wrap;">${requestData.description}</p>
          </div>
          ${fullImageUrl ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #111418; margin-top: 0;">Attached Image:</h3>
            <p><a href="${fullImageUrl}" style="color: #C89B3C; text-decoration: none;">View Image</a></p>
            <img src="${fullImageUrl}" alt="Maintenance issue" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;" />
          </div>
          ` : ''}
        </div>
      `;

      // Email confirmation to customer
      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111418;">Maintenance Request Received</h2>
          <p>Thank you, ${requestData.name}, for submitting your maintenance request.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Request Details:</strong></p>
            <p><strong>Property Address:</strong> ${requestData.propertyAddress}</p>
            <p><strong>Issue Type:</strong> ${requestData.issueType}</p>
            <p><strong>Urgency:</strong> ${requestData.urgency}</p>
            <p><strong>Description:</strong> ${requestData.description}</p>
          </div>
          <p>We have received your request and will contact you soon to schedule the maintenance work.</p>
          <p>If you have any questions, please contact us at admin@allaccessremodelers.com</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br/>All Access Remodelers</p>
        </div>
      `;

      // Send email to admin (you can change this to your desired admin email)
      const adminEmail = process.env.ADMIN_EMAIL || "admin@allaccessremodelers.com";
      
      const emailOptions: any = {
        from: "All Access Remodelers <onboarding@resend.dev>", // Update this with your verified domain
        to: adminEmail,
        subject: `New Maintenance Request - ${requestData.issueType} (${requestData.urgency})`,
        html: adminEmailHtml,
      };

      // Attach image if available
      if (imageFile) {
        const imageBuffer = fs.readFileSync(imageFile.path);
        emailOptions.attachments = [
          {
            filename: imageFile.originalname || `maintenance-image${path.extname(imageFile.filename)}`,
            content: imageBuffer,
          },
        ];
      }
      
      await resend.emails.send(emailOptions);

      // Send confirmation email to customer
      await resend.emails.send({
        from: "All Access Remodelers <onboarding@resend.dev>", // Update this with your verified domain
        to: requestData.email,
        subject: "Maintenance Request Received - All Access Remodelers",
        html: customerEmailHtml,
      });

      res.status(201).json({ 
        success: true, 
        message: "Maintenance request submitted successfully. You will receive a confirmation email shortly." 
      });
    } catch (error) {
      console.error("Maintenance request error:", error);
      res.status(500).json({ error: "Failed to submit maintenance request. Please try again." });
    }
  });

  return httpServer;
}
