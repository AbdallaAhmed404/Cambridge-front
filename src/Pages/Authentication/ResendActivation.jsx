import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../../Component/Footer";
import MainNav from "../../Component/MainNav";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import "../../Style/btn.css" // للحفاظ على نفس تنسيق الزر

const BACKEND_URL = "https://api.icfls.com";
// const BACKEND_URL = "http://localhost:4000";

export default function ResendActivation() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResendActivation = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      // ✅ المسار لإعادة إرسال التفعيل (سنقوم بإنشائه في الـ Backend)
      const response = await fetch(
        `${BACKEND_URL}/user/resend-activation-email`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message ||"activation link has been successfully sent to your email.",
          { duration: 5000 }
        );
        setEmail(""); 
      } else {
        // رسالة خطأ من السيرفر (مثل: "المستخدم غير موجود" أو "الحساب مفعّل بالفعل")
        toast.error(data?.message || "The sending operation failed. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please check your connection and try again later.");
      console.error("Resend Activation error:", error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <MainNav />

      {/* هيكل وتنسيق الصفحة */}
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
          className="resend-activation-card-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            width: "100%",
            maxWidth: "620px",
            padding: "0px 20px 20px 20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e0e0e0",
          }}
        >
          {/* عنوان الصفحة: Resend Activation Email */}
          <h3
            style={{
              textAlign: "center",
              fontWeight: "normal",
              borderBottom: "solid 1px rgba(207, 207, 207, 1)",
              margin: "0px -20px 15px -20px",
              padding: "13px",
              fontSize: "28px",
              backgroundColor: "rgb(248, 248, 248)",
            }}
          >
            Resend Activation Email
          </h3>

          <form
            className="resend-activation-form"
            onSubmit={handleResendActivation}
          >
            {/* حقل الإدخال: Email Address */}
            <div className="form-group mb-3">
              <label htmlFor="emailInput" style={{ fontWeight: 'normal', fontSize: '14px', marginBottom: '3px', display: 'block' }}>Email Address</label>
              <input
                id="emailInput"
                type="email"
                className="form-control"
                style={{ height: "40px", padding: "8px 10px", border: '1px solid #ccc' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <small className="form-text text-muted" style={{ display: 'block', marginTop: '5px', fontSize: '12px' }}>
                Enter the email you registered with to receive a new activation link.
              </small>
            </div>

            {/* زر Resend Activation */}
            <div className="text-center mt-4 mb-4">
              <motion.button
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
                class="btn" 
                style={{
                  width: "100%",
                  height: "45px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  textDecoration:"none",
                  fontWeight: "500",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
                type="submit"
                aria-label="Resend Activation"
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Activation"}
              </motion.button>
            </div>
          </form>

          {/* رابط Back to login */}
          <div style={{ textAlign: "center", fontSize: "14px", paddingTop: "5px" }}>
            <Link to="/accounts/login/" style={{ color: "blue", textDecoration: "none" }}>
              Back to login
            </Link>
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}