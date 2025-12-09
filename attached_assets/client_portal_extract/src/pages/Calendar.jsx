import React, { useState, useEffect, useCallback } from "react";
import { Event } from "@/api/entities";
import { Project } from "@/api/entities";
import { Task } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  add,
} from "date-fns";

import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarView from "../components/calendar/CalendarView";
import EventModal from "../components/calendar/EventModal";
import CalendarConnections from "../components/calendar/CalendarConnections";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userFilter = { created_by: currentUser.email };
      const [eventData, projectData, taskData] = await Promise.all([
        Event.filter(userFilter, "-start_time"),
        Project.filter(userFilter, "-due_date"),
        Task.filter(userFilter, "-due_date")
      ]);
      setEvents(eventData || []);
      setProjects(projectData || []);
      setTasks(taskData || []);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      setEvents([]);
      setProjects([]);
      setTasks([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Error fetching user:", e);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData, currentDate, view]);
  
  const handleCreateEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  
  const handleSelectEvent = (event) => {
    setSelectedDate(null);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-full mx-auto">
          <p className="text-center text-lg text-slate-700">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-full mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to use the calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col">
      <div className="max-w-full mx-auto space-y-6 flex-1 flex flex-col w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Calendar
            </h1>
            <p className="text-slate-600 mt-1 font-medium">
              Manage your schedule, events, and deadlines in one place.
            </p>
          </div>
          <Button
            onClick={() => handleCreateEvent(new Date())}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        <CalendarConnections onSync={loadData} />

        <CalendarHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          view={view}
          setView={setView}
        />

        <div className="flex-1">
          <CalendarView
            view={view}
            currentDate={currentDate}
            events={events}
            projects={projects}
            tasks={tasks}
            isLoading={isLoading}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleCreateEvent}
          />
        </div>

        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            selectedDate={selectedDate}
            onClose={handleModalClose}
            projects={projects}
          />
        )}
      </div>
    </div>
  );
}