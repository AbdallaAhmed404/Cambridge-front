import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "../../Component/Footer";
import MainNav from "../../Component/MainNav";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import "../../Style/btn.css" // للحفاظ على نفس تنسيق الزر


const BACKEND_URL = "https://api.icfls.com";
// const BACKEND_URL = "http://localhost:4000";


export default function ResetPassword() {
  // استخدام useParams لقراءة الـ token من الرابط (المسار المتوقع: /reset-password/:token)
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // 1. التحقق من التوكن
    if (!token) {
      toast.error("Error: The password reset link is incomplete.");
      return;
    }

    // 2. التحقق من تطابق كلمات المرور
    if (newPassword !== confirmPassword) {
      toast.error("The new password and its confirmation do not match.");
      return;
    }

    // 3. التحقق من الحد الأدنى لطول كلمة المرور (لزيادة الأمان)
    if (newPassword.length < 6) {
      toast.error("The password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    // 4. إرسال البيانات (كلمة المرور الجديدة) والتوكن إلى الـ Backend
    try {
      const response = await fetch(
        `${BACKEND_URL}/user/resetPassword/${token}`, // ✅ تمرير التوكن في المسار
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message || "Password updated successfully. You will be redirected to the login page.",
          { duration: 5000 }
        );
        // التوجيه لصفحة الدخول بعد النجاح
        setTimeout(() => {
          navigate("/accounts/login/");
        }, 5000); 
      } else {
        // رسائل الخطأ من السيرفر (مثل: "التوكن غير صالح" أو "انتهت صلاحيته")
        toast.error(data?.message || "Password update failed.");
      }
    } catch (error) {
      toast.error("A server connection error occurred. Please try again later.");
      console.error("Reset Password error:", error);
    } finally {
      setLoading(false);
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
          className="reset-password-card-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            width: "100%",
            maxWidth: "630px", // عرض مناسب للتصميم
            padding: "0px 20px 20px 20px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e0e0e0",
          }}
        >
          {/* عنوان الصفحة: Reset Password */}
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
            Reset Password
          </h3>

          <form
            className="reset-password-form"
            onSubmit={handleResetPassword}
          >
            {/* حقل 1: New Password */}
            <div className="form-group mb-3">
              <label htmlFor="newPasswordInput" style={{ fontWeight: 'normal', fontSize: '14px', marginBottom: '3px', display: 'block' }}>New password:</label>
              <input
                id="newPasswordInput"
                type="password"
                className="form-control"
                style={{ height: "40px", padding: "8px 10px", border: '1px solid #ccc' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* حقل 2: Confirm Password */}
            <div className="form-group mb-4">
              <label htmlFor="confirmPasswordInput" style={{ fontWeight: 'normal', fontSize: '14px', marginBottom: '3px', display: 'block' }}>Confirm password:</label>
              <input
                id="confirmPasswordInput"
                type="password"
                className="form-control"
                style={{ height: "40px", padding: "8px 10px", border: '1px solid #ccc' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* زر Reset Password */}
            <div className="text-center mb-4">
              <motion.button
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
                class="btn" // استخدام الكلاس الخارجي لـ btn
                style={{
                  width: "100%",
                  height: "45px",
                  borderRadius: "4px",
                  textDecoration:"none",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
                type="submit"
                aria-label="Reset Password"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
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