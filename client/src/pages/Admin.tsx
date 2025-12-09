import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Mail, Star, Image, Check, Trash2, LogOut, Eye, Upload, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Contact, Testimonial, GalleryItem } from "@shared/schema";

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      onLogin();
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>All Access Remodelers Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              data-testid="button-login"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Website
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContactsTab() {
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/contacts/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
  });

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading contacts...</div>;
  }

  if (contacts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No contact submissions yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <Card key={contact.id} className={contact.isRead ? "opacity-60" : ""}>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold" data-testid={`text-contact-name-${contact.id}`}>{contact.name}</span>
                  {!contact.isRead && <Badge variant="default">New</Badge>}
                  <Badge variant="secondary">{contact.service}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1" data-testid={`text-contact-email-${contact.id}`}>{contact.email}</p>
                {contact.phone && <p className="text-sm text-muted-foreground mb-2">{contact.phone}</p>}
                <p className="text-sm mt-2" data-testid={`text-contact-message-${contact.id}`}>{contact.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {contact.createdAt ? new Date(contact.createdAt).toLocaleString() : ""}
                </p>
              </div>
              {!contact.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markReadMutation.mutate(contact.id)}
                  disabled={markReadMutation.isPending}
                  data-testid={`button-mark-read-${contact.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Mark Read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TestimonialsTab() {
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials/all"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/testimonials/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
    },
  });

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading testimonials...</div>;
  }

  if (testimonials.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No testimonials yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id}>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold" data-testid={`text-testimonial-name-${testimonial.id}`}>{testimonial.name}</span>
                  {testimonial.isApproved ? (
                    <Badge variant="default">Approved</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  {testimonial.service && <Badge variant="outline">{testimonial.service}</Badge>}
                </div>
                {testimonial.location && (
                  <p className="text-sm text-muted-foreground mb-1">{testimonial.location}</p>
                )}
                <div className="flex gap-0.5 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm" data-testid={`text-testimonial-text-${testimonial.id}`}>{testimonial.text}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleString() : ""}
                </p>
              </div>
              {!testimonial.isApproved && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => approveMutation.mutate(testimonial.id)}
                  disabled={approveMutation.isPending}
                  data-testid={`button-approve-${testimonial.id}`}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GalleryUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) {
      toast({ title: "Missing fields", description: "Please fill in title, category, and select an image.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      if (description) formData.append("description", description);
      formData.append("image", file);

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      toast({ title: "Success", description: "Photo added to gallery!" });
      setTitle("");
      setCategory("");
      setDescription("");
      setFile(null);
      onSuccess();
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Something went wrong", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Photo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gallery-title">Title</Label>
              <Input
                id="gallery-title"
                data-testid="input-gallery-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Kitchen Remodel"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-gallery-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="property-management">Property Management</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gallery-description">Description (optional)</Label>
            <Textarea
              id="gallery-description"
              data-testid="input-gallery-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              className="resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gallery-image">Image</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Input
                id="gallery-image"
                data-testid="input-gallery-image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="max-w-xs"
                required
              />
              {file && (
                <span className="text-sm text-muted-foreground">{file.name}</span>
              )}
            </div>
          </div>
          <Button type="submit" disabled={isUploading} data-testid="button-upload-gallery">
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function GalleryTab() {
  const { data: items = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/gallery/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
  };

  return (
    <div>
      <GalleryUploadForm onSuccess={handleUploadSuccess} />
      
      {isLoading ? (
        <div className="p-4 text-muted-foreground">Loading gallery...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No gallery items yet. Upload your first photo above!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="pt-4">
            {item.imageUrl && (
              <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm" data-testid={`text-gallery-title-${item.id}`}>{item.title}</h4>
                <Badge variant="outline" className="mt-1">{item.category}</Badge>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(item.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-gallery-${item.id}`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Logged out", description: "See you next time!" });
      onLogout();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">All Access Remodelers</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="link-view-site">
                <ArrowLeft className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="contacts" data-testid="tab-contacts">
              <Mail className="w-4 h-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="testimonials" data-testid="tab-testimonials">
              <Star className="w-4 h-4 mr-2" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="gallery" data-testid="tab-gallery">
              <Image className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <ContactsTab />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsTab />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: session, isLoading } = useQuery<{ isAuthenticated: boolean }>({
    queryKey: ["/api/auth/session"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const authenticated = isAuthenticated || session?.isAuthenticated;

  if (!authenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Dashboard
      onLogout={() => {
        setIsAuthenticated(false);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      }}
    />
  );
}
