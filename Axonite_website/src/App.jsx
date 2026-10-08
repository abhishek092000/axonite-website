import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Services from "./pages/Services";
import Career from "./pages/Career";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Chatbot from "./components/chatbot";

import AdminLogin from "./admin/pages/Login";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminBlog from "./admin/pages/BlogManager";
import AdminCareers from "./admin/pages/CareerManager";
import ProtectedRoute from "./admin/ProtectedRoute";
import AdminApplications from "./admin/pages/ApplicationsManager";
import KnowledgeBase from "./admin/pages/KnowledgeBase";
import { trackPageView } from "./lib/store";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Records a page view for the admin dashboard, skipping the admin
// section itself so staff visiting /admin don't inflate the count.
function VisitorTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith("/admin")) {
      trackPageView(pathname);
    }
  }, [pathname]);
  return null;
}

// Unchanged from before — same Navbar / Chatbot / main / Footer wrapper
// that every public page already rendered inside, just moved into its
// own component so the admin routes below can render without it.
function PublicLayout() {
  return (
    <div className="font-body">
      <Navbar />
      <Chatbot />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <VisitorTracker />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />
          <Route path="/career" element={<Career />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="careers" element={<AdminCareers />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
        </Route>
      </Routes>
    </>
  );
}
