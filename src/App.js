import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../src/componets/custom/style.css";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./componets/protected/ProtectedRoute";


import Home from "./componets/pages/Home";
import Footer from "./componets/footer/Footer";
import NavBar from "./componets/navbar/NavBar";
import AboutUs from "./componets/pages/AboutUs";


import DashBoardHeader from "./componets/event_panel/DashBoardHeader";
import DashBoard from "./componets/event_panel/DashBoard";
import Login from "./componets/login/Login";
import UserDashBoard from "./componets/user_dashboard/UserDashBoard";
import AddHeader from "./componets/event_panel/header/AddHeader";
import ManageHeader from "./componets/event_panel/header/ManageHeader";
import Registration from "./componets/pages/member_registration/Registration";
import AddWings from "./componets/event_panel/dashboard_pages/associative_wings/AddWings";
import ManageWings from "./componets/event_panel/dashboard_pages/associative_wings/ManageWings";
import MembersList from "./componets/pages/member_registration/MembersList";
import ManageRegistration from "./componets/event_panel/dashboard_pages/manage_registration/ManageRegistration";
import DonationSociety from "./componets/pages/donation/DonationSociety";
import AddActivity from "./componets/event_panel/dashboard_pages/activity_items/AddActivity";
import ManageActivity from "./componets/event_panel/dashboard_pages/activity_items/ManageActivity";
import AssociatedWings from "./componets/pages/associated_wings/AssociatedWings";
import Activity from "./componets/pages/activity_event/Activity";
import DistrictDashboard from "./componets/district_login/DistrictDashboard";
import DonateActivity from "./componets/pages/activity_event/DonateActivity";
import DistrictRegistration from "./componets/district_login/DistrictRegistration";
import DistrictRegistrations from "./componets/event_panel/dashboard_pages/DistrictRegistrations";
import DistrictManageRegistration from "./componets/event_panel/dashboard_pages/DistrictManageRegistration";
import DistrictMailMeeting from "./componets/district_login/DistrictMailMeeting";
import AddDistrictActivity from "./componets/district_login/district_activity/AddDistrictActivity";
import ManageDistrictActivity from "./componets/district_login/district_activity/ManageDistrictActivity";
import ManageAboutUs from "./componets/event_panel/dashboard_pages/ManageAboutUs";
import UserProfile from "./componets/user_dashboard/Profile/UserProfile";
import ManageCarousel from "./componets/event_panel/dashboard_pages/ManageCarousel";
import Organisation from "./componets/pages/Organisation";
import Events from "./componets/pages/Events";
import ContactUs from "./componets/pages/ContactUs";
import AddUpdates from "./componets/event_panel/dashboard_pages/latestupdates/AddUpdates";
import ManageUpdates from "./componets/event_panel/dashboard_pages/latestupdates/ManageUpdates";
import ManageFeedback from "./componets/event_panel/dashboard_pages/feedback/ManageFeedback";


function App() {

  const location = useLocation();

  const hiddenPaths = new Set([
    "/DashBoard",
    "/AddHeader",
    "/ManageHeader",
    "/UserDashBoard",
    "/AddWings",
    "/ManageWings",
    "/ManageRegistration",
    "/AddActivity",
    "/ManageActivity",
    "/DistrictDashboard",
    "/DistrictRegistration",
    "/DistrictRegistrations",
    "/DistrictManageRegistration",
    "/DistrictMailMeeting",
    "/AddDistrictActivity",
    "/ManageDistrictActivity",
    "/ManageAboutUs",
    "/UserProfile",
    "/ManageCarousel",
    "/AddUpdates",
    "/ManageUpdates",
    "/ManageFeedback"
  ]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  const shouldHideFooter1 = hiddenPaths.has(location.pathname);
  
  return (

    <div className="app-container">
      {!shouldHideNavbar && <NavBar />}

      <main className="main-content">
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/DashBoardHeader" element={<DashBoardHeader />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Registration" element={<Registration />} />
          <Route path="/MembersList" element={<MembersList />} />
          <Route path="/DonationSociety" element={<DonationSociety />} />
          <Route path="/AssociatedWings" element={<AssociatedWings />} />
          <Route path="/Activity" element={<Activity />} />
          <Route path="/DonateActivity" element={<DonateActivity/>} />
           <Route path="/Organisation" element={<Organisation />} />
              <Route path="/Events" element={<Events />} />
              <Route path="/ContactUs" element={<ContactUs />} />

          {/* Protected Routes */}
          <Route path="/DashBoard" element={
            <ProtectedRoute>
              <DashBoard />
            </ProtectedRoute>
          } />
          <Route path="/UserDashBoard" element={
            <ProtectedRoute>
              <UserDashBoard />
            </ProtectedRoute>
          } />
          <Route path="/AddHeader" element={
            <ProtectedRoute>
              <AddHeader />
            </ProtectedRoute>
          } />
          <Route path="/ManageHeader" element={
            <ProtectedRoute>
              <ManageHeader />
            </ProtectedRoute>
          } />
          <Route path="/AddWings" element={
            <ProtectedRoute>
              <AddWings />
            </ProtectedRoute>
          } />
          <Route path="/ManageWings" element={
            <ProtectedRoute>
              <ManageWings />
            </ProtectedRoute>
          } />
          <Route path="/ManageRegistration" element={
            <ProtectedRoute>
              <ManageRegistration />
            </ProtectedRoute>
          } />
          <Route path="/AddActivity" element={
            <ProtectedRoute>
              <AddActivity />
            </ProtectedRoute>
          } />
          <Route path="/ManageActivity" element={
            <ProtectedRoute>
              <ManageActivity />
            </ProtectedRoute>
          } />
          <Route path="/DistrictDashboard" element={
            <ProtectedRoute>
              <DistrictDashboard />
            </ProtectedRoute>
          } />
          <Route path="/DistrictRegistration" element={
            <ProtectedRoute>
              <DistrictRegistration />
            </ProtectedRoute>
          } />
          <Route path="/DistrictRegistrations" element={
            <ProtectedRoute>
              <DistrictRegistrations />
            </ProtectedRoute>
          } />
          <Route path="/DistrictManageRegistration" element={
            <ProtectedRoute>
              <DistrictManageRegistration />
            </ProtectedRoute>
          } />
          <Route path="/DistrictMailMeeting" element={
            <ProtectedRoute>
              <DistrictMailMeeting />
            </ProtectedRoute>
          } />
            
             <Route path="/AddDistrictActivity" element={
            <ProtectedRoute>
              <AddDistrictActivity />
            </ProtectedRoute>
          } />

            <Route path="/ManageDistrictActivity" element={
            <ProtectedRoute>
              <ManageDistrictActivity />
            </ProtectedRoute>
          } />
          <Route path="/ManageAboutUs" element={
            <ProtectedRoute>
              <ManageAboutUs />
            </ProtectedRoute>
          } />

             <Route path="/UserProfile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
           <Route path="/ManageCarousel" element={
            <ProtectedRoute>
              < ManageCarousel />
            </ProtectedRoute>
          } />
          <Route path="/AddUpdates" element={
            <ProtectedRoute>
              <AddUpdates />
            </ProtectedRoute>
          } />
          <Route path="/ManageUpdates" element={
            <ProtectedRoute>
              <ManageUpdates />
            </ProtectedRoute>
          } />
          <Route path="/ManageFeedback" element={
            <ProtectedRoute>
              <ManageFeedback />
            </ProtectedRoute>
          } />
         
        </Routes>
      </main>
      {!shouldHideFooter1 && <Footer />}

    </div>

  );
}


export default App;