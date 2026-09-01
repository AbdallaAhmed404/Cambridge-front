import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "../Component/Footer";
import MainNav from "../Component/MainNav";
import { toast, Toaster } from "react-hot-toast";
import "../Style/support.css";


const BACKEND_URL = "https://cambridge-production.up.railway.app";
// const BACKEND_URL = "http://localhost:4000";


const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};

export default function Contact() {
  // 1. تحديث الحالات لتتطابق مع حقول النموذج الجديدة
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accountEmail, setAccountEmail] = useState(""); // حقل جديد
  const [helpTopic, setHelpTopic] = useState(""); // حقل جديد
  const [subject, setSubject] = useState(""); // حقل جديد
  const [description, setDescription] = useState(""); // كان message
  const [attachment, setAttachment] = useState(null); // حقل جديد للملف
  const [loading, setLoading] = useState(false);

  // تحديث دالة الإرسال
  const handleSend = async (e) => {
    e.preventDefault();

    // يمكنك تعديل شروط التحقق حسب الحقول المطلوبة
    if (!email || !name || !accountEmail || !subject || !description) {
      toast.error("Please fill in all required fields (*).");
      return;
    }

    setLoading(true);
    // 2. تحديث البيانات المرسلة لتشمل جميع الحقول الجديدة
    const formData = new FormData();
    formData.append('email', email);
    formData.append('name', name);
    formData.append('accountEmail', accountEmail);
    formData.append('helpTopic', helpTopic);
    formData.append('subject', subject);
    formData.append('description', description);
    if (attachment) {
        formData.append('attachment', attachment);
    }

    try {
      // إذا كنت تستخدم FormData للمرفقات، تأكد من تحديث الـ Headers
      const res = await fetch(`${BACKEND_URL}/user/contact`, {
        method: "POST",
        // يجب حذف 'Content-Type': 'application/json' عند استخدام FormData، المتصفح يضيفه تلقائياً
        body: formData, 
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Message sent successfully!");
        // مسح الحقول بعد الإرسال الناجح
        setEmail("");
        setName("");
        setAccountEmail("");
        setHelpTopic("");
        setSubject("");
        setDescription("");
        setAttachment(null);
        // إعادة تعيين قيمة إدخال الملف لتحديث النص المعروض
        document.getElementById('attachment').value = ''; 
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 3. تحديث الـ JSX ليتناسب مع تصميم الصورة
  return (
    <>
      <Toaster position="top-center" />
      <MainNav />

      <motion.section
        // دمج الكود لتركيز النموذج في المنتصف مع خلفية خفيفة
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: "calc(100vh - 100px)", // لتوسيطه عمودياً
          padding: "50px 10px",
        }}
        variants={fadeIn}
        initial="initial"
        animate="animate"
      >
        {/* حاوية النموذج الأبيض - مطابقة لتصميم الصورة */}
        <div 
            className="contact-card" // كلاس مخصص للتنسيق في ملف CSS خارجي
            style={{
                width: "100%",
                maxWidth: "850px", // عرض النموذج (يمكن تعديله)
                padding: "0px 30px 30px 30px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                border: "1px solid #e0e0e0",
            }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "30px", fontWeight: "normal",
            borderBottom:"solid 1px rgba(207, 207, 207, 1)", margin:"0px -30px 15px -30px",padding:"13px",backgroundColor:"rgb(248, 248, 248)"}}>
            Contact Us
          </h3>
          
          <form className="w-100" onSubmit={handleSend}>
            
            {/* الحقل 1: Email */}
            <div className="form-group mb-3">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                className="form-control"
                style={{ height: "40px" }} // تم تصغير الارتفاع ليتناسب مع النموذج
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            {/* الحقل 2: Name */}
            <div className="form-group mb-3">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                className="form-control"
                style={{ height: "40px" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            {/* الحقل 3: Account email (مع النجمة الحمراء) */}
            <div className="form-group mb-3 required-field-container">
              <label htmlFor="account-email">Account email:</label>
              <input
                type="email"
                id="account-email"
                className="form-control"
                style={{ height: "40px" }}
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                required 
              /> 
            </div>
            
            {/* الحقل 4: Help topic */}
            <div className="form-group mb-3">
              <label htmlFor="help-topic">Help topic:</label>
              <input
                type="text"
                id="help-topic"
                className="form-control"
                style={{ height: "40px" }}
                value={helpTopic}
                onChange={(e) => setHelpTopic(e.target.value)}
              />
            </div>
            
            {/* الحقل 5: Subject */}
            <div className="form-group mb-3">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                className="form-control"
                style={{ height: "40px" }}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* الحقل 6: Description */}
            <div className="form-group mb-3">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                className="form-control"
                style={{ height: "150px" }} // ارتفاع أكبر
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            
            {/* الحقل 7: Attachment (المرفق) */}
            <div className="form-group mb-4">
              <label htmlFor="attachment">Attachment:</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="attachment"
                  className="file-input-hidden"
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
                <label htmlFor="attachment" className="file-label">
                  Choose File
                </label>
                <span className="file-name">
                  {attachment ? attachment.name : "No file chosen"}
                </span>
              </div>
            </div>

            {/* زر الإرسال */}
            <div className="text-start"> {/* تم تغيير text-end إلى text-start ليكون الزر على اليسار كما في الصورة */}
              <button
                type="submit"
                disabled={loading}
                className="submit-button" // كلاس مخصص لتنسيق الزر
                style={{
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      <Footer />
    </>
  );
}