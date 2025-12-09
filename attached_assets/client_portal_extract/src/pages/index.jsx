import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import ClientList from "./ClientList";

import ClientOnboarding from "./ClientOnboarding";

import ClientProfile from "./ClientProfile";

import ProjectWizard from "./ProjectWizard";

import Projects from "./Projects";

import Tasks from "./Tasks";

import TimeTracking from "./TimeTracking";

import Analytics from "./Analytics";

import Invoices from "./Invoices";

import FinancialDashboard from "./FinancialDashboard";

import Calendar from "./Calendar";

import FileManager from "./FileManager";

import CommunicationHub from "./CommunicationHub";

import Reports from "./Reports";

import ProjectDetail from "./ProjectDetail";

import SummaryDashboard from "./SummaryDashboard";

import MockupGenerator from "./MockupGenerator";

import ClientIntake from "./ClientIntake";

import IntakeSubmissions from "./IntakeSubmissions";

import ClientPortal from "./ClientPortal";

import ResourceAllocation from "./ResourceAllocation";

import ConstructionDashboard from "./ConstructionDashboard";

import ProjectsList from "./ProjectsList";

import CleaningDashboard from "./CleaningDashboard";

import CleaningClients from "./CleaningClients";

import CleaningJobs from "./CleaningJobs";

import CleaningAI from "./CleaningAI";

import ConstructionAI from "./ConstructionAI";

import CleaningStaff from "./CleaningStaff";

import MobileCleaningStaff from "./MobileCleaningStaff";

import MobileConstructionSupervisor from "./MobileConstructionSupervisor";

import CustomerSupport from "./CustomerSupport";

import ClientPayment from "./ClientPayment";

import TemplateLibrary from "./TemplateLibrary";

import Home from "./Home";

import Landing from "./Landing";

import Booking from "./Booking";

import PaymentSuccess from "./PaymentSuccess";

import InviteManagement from "./InviteManagement";

import Notifications from "./Notifications";

import NotificationSettings from "./NotificationSettings";

import AIProjectAssistant from "./AIProjectAssistant";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    ClientList: ClientList,
    
    ClientOnboarding: ClientOnboarding,
    
    ClientProfile: ClientProfile,
    
    ProjectWizard: ProjectWizard,
    
    Projects: Projects,
    
    Tasks: Tasks,
    
    TimeTracking: TimeTracking,
    
    Analytics: Analytics,
    
    Invoices: Invoices,
    
    FinancialDashboard: FinancialDashboard,
    
    Calendar: Calendar,
    
    FileManager: FileManager,
    
    CommunicationHub: CommunicationHub,
    
    Reports: Reports,
    
    ProjectDetail: ProjectDetail,
    
    SummaryDashboard: SummaryDashboard,
    
    MockupGenerator: MockupGenerator,
    
    ClientIntake: ClientIntake,
    
    IntakeSubmissions: IntakeSubmissions,
    
    ClientPortal: ClientPortal,
    
    ResourceAllocation: ResourceAllocation,
    
    ConstructionDashboard: ConstructionDashboard,
    
    ProjectsList: ProjectsList,
    
    CleaningDashboard: CleaningDashboard,
    
    CleaningClients: CleaningClients,
    
    CleaningJobs: CleaningJobs,
    
    CleaningAI: CleaningAI,
    
    ConstructionAI: ConstructionAI,
    
    CleaningStaff: CleaningStaff,
    
    MobileCleaningStaff: MobileCleaningStaff,
    
    MobileConstructionSupervisor: MobileConstructionSupervisor,
    
    CustomerSupport: CustomerSupport,
    
    ClientPayment: ClientPayment,
    
    TemplateLibrary: TemplateLibrary,
    
    Home: Home,
    
    Landing: Landing,
    
    Booking: Booking,
    
    PaymentSuccess: PaymentSuccess,
    
    InviteManagement: InviteManagement,
    
    Notifications: Notifications,
    
    NotificationSettings: NotificationSettings,
    
    AIProjectAssistant: AIProjectAssistant,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ClientList" element={<ClientList />} />
                
                <Route path="/ClientOnboarding" element={<ClientOnboarding />} />
                
                <Route path="/ClientProfile" element={<ClientProfile />} />
                
                <Route path="/ProjectWizard" element={<ProjectWizard />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/TimeTracking" element={<TimeTracking />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/FinancialDashboard" element={<FinancialDashboard />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/FileManager" element={<FileManager />} />
                
                <Route path="/CommunicationHub" element={<CommunicationHub />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/ProjectDetail" element={<ProjectDetail />} />
                
                <Route path="/SummaryDashboard" element={<SummaryDashboard />} />
                
                <Route path="/MockupGenerator" element={<MockupGenerator />} />
                
                <Route path="/ClientIntake" element={<ClientIntake />} />
                
                <Route path="/IntakeSubmissions" element={<IntakeSubmissions />} />
                
                <Route path="/ClientPortal" element={<ClientPortal />} />
                
                <Route path="/ResourceAllocation" element={<ResourceAllocation />} />
                
                <Route path="/ConstructionDashboard" element={<ConstructionDashboard />} />
                
                <Route path="/ProjectsList" element={<ProjectsList />} />
                
                <Route path="/CleaningDashboard" element={<CleaningDashboard />} />
                
                <Route path="/CleaningClients" element={<CleaningClients />} />
                
                <Route path="/CleaningJobs" element={<CleaningJobs />} />
                
                <Route path="/CleaningAI" element={<CleaningAI />} />
                
                <Route path="/ConstructionAI" element={<ConstructionAI />} />
                
                <Route path="/CleaningStaff" element={<CleaningStaff />} />
                
                <Route path="/MobileCleaningStaff" element={<MobileCleaningStaff />} />
                
                <Route path="/MobileConstructionSupervisor" element={<MobileConstructionSupervisor />} />
                
                <Route path="/CustomerSupport" element={<CustomerSupport />} />
                
                <Route path="/ClientPayment" element={<ClientPayment />} />
                
                <Route path="/TemplateLibrary" element={<TemplateLibrary />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Booking" element={<Booking />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/InviteManagement" element={<InviteManagement />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/NotificationSettings" element={<NotificationSettings />} />
                
                <Route path="/AIProjectAssistant" element={<AIProjectAssistant />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}