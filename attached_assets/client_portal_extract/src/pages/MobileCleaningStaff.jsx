import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin } from "lucide-react";
import MobileJobViewer from "../components/mobile/MobileJobViewer";
import MobileTimeTracker from "../components/mobile/MobileTimeTracker";

export default function MobileCleaningStaff() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <p className="text-slate-600">Please log in</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Mobile Workspace</h1>
          <p className="text-slate-600">{currentUser.full_name}</p>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4">
            <MobileJobViewer currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="timer" className="mt-4">
            <MobileTimeTracker currentUser={currentUser} jobId={selectedJobId} />
          </TabsContent>

          <TabsContent value="location" className="mt-4">
            <div className="text-center py-12 text-slate-600">
              Location tracking active in background
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}