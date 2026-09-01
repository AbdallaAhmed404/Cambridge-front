import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../../Component/Footer";
import MainNav from "../../Component/MainNav";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import "../../Style/btn.css"

const BACKEND_URL = "https://api.icfls.com";
// const BACKEND_URL = "http://localhost:4000";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // لإدارة حالة التحميل

  const handleSendResetLink = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true); 

    try {
      const response = await fetch(
        `${BACKEND_URL}/user/forgotPassword`, 
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
          "A password reset link has been sent to your email. Please check your inbox.",
          { duration: 6000 }
        );
        // يمكنك إفراغ حقل البريد بعد الإرسال
        setEmail(""); 
      } else {
        // رسالة خطأ من السيرفر (مثلاً: "المستخدم غير موجود")
        toast.error(data?.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please check your connection and try again later.");
      console.error("Forgot Password error:", error);
    } finally {
      setLoading(false); // إنهاء التحميل
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <MainNav />

      {/* هيكل وتنسيق الصفحة كما في كود اللوجن الذي أرسلته */}
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
          className="password-reset-card-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            width: "100%",
            maxWidth: "620px", // تم تضييق العرض ليتناسب مع تصميم الصورة
            padding: "0px 20px 20px 20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e0e0e0",
          }}
        >
          {/* عنوان الصفحة: Password Reset */}
          <h3
            style={{
              textAlign: "center",
              marginBottom: "30px",
              fontWeight: "normal",
              borderBottom: "solid 1px rgba(207, 207, 207, 1)",
              margin: "0px -20px 15px -20px",
              padding: "13px",
              fontSize: "28px", // حجم خط أكبر
              backgroundColor: "rgb(248, 248, 248)",
            }}
          >
            Password Reset
          </h3>

          <form
            className="password-reset-form"
            onSubmit={handleSendResetLink}
          >
            {/* حقل الإدخال: Email */}
            <div className="form-group mb-4">
              <label htmlFor="emailInput" style={{ fontWeight: 'normal', fontSize: '14px', marginBottom: '3px', display: 'block' }}>Email:</label>
              <input
                id="emailInput"
                type="email"
                className="form-control"
                style={{ height: "40px", padding: "8px 10px", border: '1px solid #ccc' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading} // تعطيل الحقل أثناء التحميل
              />
            </div>

            {/* زر Send Reset Link */}
            <div className="text-center mb-4">
              <motion.button
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
                class="btn"
                style={{
                  width: "100%",
                  height: "45px",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "500",
                  textDecoration:"none",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer", // تغيير شكل المؤشر أثناء التحميل
                  opacity: loading ? 0.7 : 1,
                }}
                type="submit"
                aria-label="Send Reset Link"
                disabled={loading} // تعطيل الزر أثناء التحميل
              >
                {loading ? "جاري الإرسال..." : "Send Reset Link"}
              </motion.button>
            </div>
          </form>

          {/* رابط Back to login */}
          <div style={{ textAlign: "center", fontSize: "14px", paddingTop: "15px" }}>
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