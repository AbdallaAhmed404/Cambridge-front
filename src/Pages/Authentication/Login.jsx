// Login.js
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../../Component/Footer";
import MainNav from "../../Component/MainNav";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";


const BACKEND_URL = "https://cambridge-production.up.railway.app";
// const BACKEND_URL = "http://localhost:4000";


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (response.ok) {
        toast.success("Login successful!");
        console.log("Login successful:", data);
        
        if (typeof data === "object" && data.token) {
          // ✅ التعديل الحاسم: استقبال userRole
          const { token, userID, userRole } = data;
          
          localStorage.setItem("token", token);
          localStorage.setItem("userId", userID);
          // ✅ التعديل الحاسم: تخزين userRole
          localStorage.setItem("userRole", userRole); 
        }

        navigate("/go/resources/");
      } else {
        toast.error(data?.message || data || "Login failed.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <MainNav />
      
      <section 
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          minHeight: "calc(100vh - 100px)",
          padding: "90px 10px",
        }}
      >
        <motion.div
          className="login-card-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            width: "100%",
            maxWidth: "640px",
            padding: "0px 20px 0px 20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e0e0e0", 
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "30px", fontWeight: "normal",
            borderBottom: "solid 1px rgba(207, 207, 207, 1)", margin: "0px -20px 15px -20px", padding: "13px", backgroundColor: "rgb(248, 248, 248)" }}>
            Login
          </h3>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >
            {/* حقل 1: Email */}
            <div className="form-group mb-4">
              <label htmlFor="emailInput" style={{ fontWeight: 'normal', fontSize: '14px', marginBottom: '3px', display: 'block' }}>Email</label>
              <input
                id="emailInput"
                type="email"
                className="form-control"
                style={{ height: "40px", padding: "8px 10px", border: '1px solid #ccc' }}
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* حقل 2: Password */}
            <div className="form-group mb-4">
              <label htmlFor="passwordInput" style={{ fontWeight: 'normal', fontSize: '14px', marginBottom: '3px', display: 'block' }}>Password</label>
              <input
                id="passwordInput"
                type="password"
                className="form-control"
                style={{ height: "40px", padding: "8px 10px", border: '1px solid #ccc' }}
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* زر Login */}
            <div className="text-center mb-4">
              <motion.button
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  height: "45px",
                  borderRadius: "4px",
                  backgroundColor: "#3e5a5c",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                type="submit"
                aria-label="Log In"
              >
                Login
              </motion.button>
            </div>
          </form>

          {/* 2. الروابط الإضافية أسفل النموذج */}
          <div style={{ textAlign: "center", fontSize: "14px", lineHeight: '2.5',backgroundColor: "rgb(248, 248, 248)",
            margin: "0px -20px 0px -20px",paddingBottom:"15px",borderTop:"solid 1px rgba(207, 207, 207, 1)"
            }}>
            <p style={{ margin: 0 }}>
              Don't have an account? <Link to="/accounts/select-role" style={{ color: "blue", textDecoration: "none" }}>Register here.</Link>
            </p>
            <p style={{ margin: 0 }}>
              Didn't receive activation email? <Link to="/accounts/resend-activation/" style={{ color: "blue", textDecoration: "none" }}>Resend activation.</Link>
            </p>
            <p style={{ margin: 0 }}>
              Forgot your password? <Link to="/Forget-Password" style={{ color: "blue", textDecoration: "none" }}>Reset it here.</Link>
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}