import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HardHat,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Star,
  DollarSign,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    checkAuth();
    checkInviteCode();
  }, []);

  const checkAuth = async () => {
    try {
      await base44.auth.me();
      setIsAuthenticated(true);
      window.location.href = '/Home';
    } catch (e) {
      setIsAuthenticated(false);
    }
    setIsChecking(false);
  };

  const checkInviteCode = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    
    if (code) {
      try {
        const invites = await base44.entities.InviteCode.filter({ code });
        if (invites.length > 0) {
          const invite = invites[0];
          const now = new Date();
          const expiresAt = new Date(invite.expires_at);
          
          if (invite.status === 'used') {
            setInviteError('This invite has already been used');
          } else if (now > expiresAt) {
            setInviteError('This invite has expired');
          } else {
            setInviteCode(code);
            setInviteValid(true);
          }
        } else {
          setInviteError('Invalid invite code');
        }
      } catch (error) {
        console.error('Error validating invite:', error);
      }
    }
  };

  const handleSignIn = () => {
    if (inviteValid && inviteCode) {
      base44.auth.redirectToLogin(`/Home?invite=${inviteCode}`);
    } else {
      setInviteError('Valid invite code required to sign up');
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692298dd0bb845c13d256fec/93108b689_IMG_3209.JPG"
              alt="All Access Remodelers"
              className="w-10 h-10 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900">All Access Remodelers</h1>
              <p className="text-xs text-slate-500">Construction | Property | Cleaning</p>
            </div>
          </div>
          <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-6">
          {inviteValid && (
            <Badge className="bg-green-100 text-green-800 text-sm px-4 py-1">
              ✓ Valid Invitation Code
            </Badge>
          )}
          {inviteError && (
            <Badge className="bg-red-100 text-red-800 text-sm px-4 py-1">
              {inviteError}
            </Badge>
          )}
          {!inviteCode && !inviteError && (
            <Badge className="bg-amber-100 text-amber-800 text-sm px-4 py-1">
              Invitation Required to Sign Up
            </Badge>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Professional Business <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Streamline your construction and cleaning operations with AI-powered tools, 
            real-time tracking, and comprehensive project management.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={handleSignIn} 
              disabled={!inviteValid}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
            >
              {inviteValid ? 'Sign Up with Invite' : 'Invite Required'}
            </Button>
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need</h2>
          <p className="text-slate-600">Powerful features to manage your business efficiently</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Track projects, tasks, and timelines with ease. Stay organized and on schedule.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-900" />
              </div>
              <CardTitle className="text-lg">AI-Powered Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Optimize scheduling, predict risks, and automate routine tasks with AI assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Connect your team, clients, and subcontractors in one unified platform.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Financial Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Manage invoices, expenses, and payments. Get real-time financial insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-600">Choose the plan that fits your business needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <p className="text-3xl font-bold text-slate-900 mt-4">
                $49<span className="text-lg font-normal text-slate-600">/month</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Up to 10 projects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">5 team members</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Basic reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Email support</span>
              </div>
              <Button variant="outline" className="w-full mt-6">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card className="border-orange-600 border-2 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-600">
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle className="text-xl">Professional</CardTitle>
              <p className="text-3xl font-bold text-slate-900 mt-4">
                $99<span className="text-lg font-normal text-slate-600">/month</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Unlimited projects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">15 team members</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Advanced AI features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </div>
              <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-700">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <p className="text-3xl font-bold text-slate-900 mt-4">
                Custom
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Unlimited everything</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Custom integrations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Dedicated support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">On-site training</span>
              </div>
              <Button variant="outline" className="w-full mt-6">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <Card className="bg-gradient-to-r from-blue-900 to-orange-600 text-white">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
                <p className="text-blue-100 mb-6">
                  Have questions? Our team is here to help you succeed.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span>123 Business Ave, Suite 100, New York, NY 10001</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>hello@constructflow.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span>Monday - Friday, 9AM - 6PM EST</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-2xl font-bold mb-2">4.9/5.0</p>
                  <p className="text-blue-100">Average customer rating</p>
                  <p className="text-sm text-blue-200 mt-2">Based on 1,200+ reviews</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692298dd0bb845c13d256fec/93108b689_IMG_3209.JPG"
                alt="All Access Remodelers"
                className="w-8 h-8 rounded-lg object-contain bg-white p-1"
              />
              <span className="text-white font-semibold">All Access Remodelers</span>
            </div>
            <p className="text-sm">© 2025 All Access Remodelers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}