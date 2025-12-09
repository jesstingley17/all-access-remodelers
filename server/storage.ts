import { type User, type InsertUser, type Contact, type InsertContact, type Testimonial, type InsertTestimonial, type GalleryItem, type InsertGalleryItem } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  markContactAsRead(id: number): Promise<Contact | undefined>;
  
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  approveTestimonial(id: number): Promise<Testimonial | undefined>;
  
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  getGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItemsByCategory(category: string): Promise<GalleryItem[]>;
  deleteGalleryItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contacts: Map<number, Contact>;
  private testimonials: Map<number, Testimonial>;
  private galleryItems: Map<number, GalleryItem>;
  private userIdCounter: number;
  private contactIdCounter: number;
  private testimonialIdCounter: number;
  private galleryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.testimonials = new Map();
    this.galleryItems = new Map();
    this.userIdCounter = 1;
    this.contactIdCounter = 1;
    this.testimonialIdCounter = 1;
    this.galleryIdCounter = 1;
    
    this.seedAdminUser();
    this.seedTestimonials();
    this.seedGalleryItems();
  }

  private seedAdminUser() {
    const id = this.userIdCounter++;
    this.users.set(id, {
      id,
      username: "admin",
      password: "admin123",
      isAdmin: true,
    });
  }

  private seedTestimonials() {
    const sampleTestimonials: InsertTestimonial[] = [
      {
        name: "Michael Johnson",
        location: "Columbus, OH",
        rating: 5,
        text: "All Access Remodelers completely transformed our kitchen. The team was professional, punctual, and the quality of work exceeded our expectations. Highly recommend!",
        service: "Kitchen Renovation",
      },
      {
        name: "Sarah Williams",
        location: "Dublin, OH",
        rating: 5,
        text: "We've used their property management services for over a year now. They handle everything seamlessly - from maintenance calls to tenant turnovers. A real lifesaver!",
        service: "Property Management",
      },
      {
        name: "David Martinez",
        location: "Westerville, OH",
        rating: 5,
        text: "The deep cleaning service was outstanding. They paid attention to every detail and left our home spotless. Will definitely use again!",
        service: "Cleaning Services",
      },
    ];

    sampleTestimonials.forEach((t) => {
      const id = this.testimonialIdCounter++;
      this.testimonials.set(id, {
        ...t,
        id,
        location: t.location ?? null,
        service: t.service ?? null,
        isApproved: true,
        createdAt: new Date(),
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const contact: Contact = {
      ...insertContact,
      id,
      phone: insertContact.phone ?? null,
      createdAt: new Date(),
      isRead: false,
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async markContactAsRead(id: number): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (contact) {
      contact.isRead = true;
      this.contacts.set(id, contact);
    }
    return contact;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const testimonial: Testimonial = {
      ...insertTestimonial,
      id,
      location: insertTestimonial.location ?? null,
      service: insertTestimonial.service ?? null,
      isApproved: false,
      createdAt: new Date(),
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values())
      .filter((t) => t.isApproved)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (testimonial) {
      testimonial.isApproved = true;
      this.testimonials.set(id, testimonial);
    }
    return testimonial;
  }

  private seedGalleryItems() {
    const sampleGalleryItems: InsertGalleryItem[] = [
      { title: "Modern Kitchen Renovation", category: "Kitchen", imageUrl: "", description: "Complete kitchen remodel with custom cabinets" },
      { title: "Luxury Bathroom Remodel", category: "Bathroom", imageUrl: "", description: "Master bathroom transformation" },
      { title: "Open Concept Living Room", category: "Living Room", imageUrl: "", description: "Removed walls to create open floor plan" },
      { title: "Hardwood Floor Installation", category: "Flooring", imageUrl: "", description: "Premium hardwood flooring throughout" },
      { title: "Custom Kitchen Cabinets", category: "Kitchen", imageUrl: "", description: "Custom-built cabinetry" },
      { title: "Master Bath Renovation", category: "Bathroom", imageUrl: "", description: "Spa-like master bathroom" },
    ];

    sampleGalleryItems.forEach((item) => {
      const id = this.galleryIdCounter++;
      this.galleryItems.set(id, {
        ...item,
        id,
        description: item.description ?? null,
        createdAt: new Date(),
      });
    });
  }

  async createGalleryItem(insertItem: InsertGalleryItem): Promise<GalleryItem> {
    const id = this.galleryIdCounter++;
    const item: GalleryItem = {
      ...insertItem,
      id,
      description: insertItem.description ?? null,
      createdAt: new Date(),
    };
    this.galleryItems.set(id, item);
    return item;
  }

  async getGalleryItems(): Promise<GalleryItem[]> {
    return Array.from(this.galleryItems.values()).sort(
      (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async getGalleryItemsByCategory(category: string): Promise<GalleryItem[]> {
    return Array.from(this.galleryItems.values())
      .filter((item) => item.category === category)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    return this.galleryItems.delete(id);
  }
}

export const storage = new MemStorage();
