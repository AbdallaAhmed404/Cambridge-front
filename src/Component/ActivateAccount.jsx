// ملف /Component/ActivateAccount.jsx (المعدّل)

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // لاستخدام الـ Toaster الموجود في App.jsx

const BACKEND_URL = "https://cambridge-production.up.railway.app/user";
// const BACKEND_URL = "http://localhost:4000/user";

export default function ActivateAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending'); // pending, success, error
  

  const hasFetched = useRef(false);

  useEffect(() => {

    if (hasFetched.current) {
      return; // ✅ الخروج إذا تم إرسال الطلب مرة سابقة
    }

    if (!token) {
      setStatus('error');
      toast.error("Activation token not found in the URL.");
      return;
    }

    const activateUser = async () => {
      hasFetched.current = true;
      setStatus('pending');

      try {
        // ✅ الخطوة الحاسمة: إرسال طلب GET إلى مسار الكنترولر في الـ Backend
        // لاحظ أن هذا المسار هو المسار المعرّف في الـ Routes الخاص بالـ Node.js 
        // وليس المسار الذي يعرضه React
        const response = await fetch(`${BACKEND_URL}/activate-account/${token}`, {
          method: 'GET', // الطلب هو GET كما في الكنترولر
        });

        // بما أن الكنترولر يستخدم res.redirect() للنجاح،
        // فالمتصفح سيتبع إعادة التوجيه تلقائيًا إلى صفحة Login.
        // إذا كان هناك خطأ (400, 401, 500)، سيتم التقاطه هنا.

        if (!response.ok) {
          // إذا لم يحدث res.redirect()، نعالج رسالة الخطأ
          const errorText = await response.text(); // الكنترولر يرسل نص وليس JSON

          setStatus('error');
          toast.error(errorText || "Activation failed. The link might be expired or invalid.");

          // توجيه المستخدم لطلب رابط جديد بعد فشل التفعيل
          setTimeout(() => {
            navigate("/Forget-Password");
          }, 3000);

        } else {
          // حالة النجاح: لا يجب أن نصل إلى هنا غالباً لأن المتصفح
          // يعالج res.redirect() تلقائياً، ولكن للتأكد:
          setStatus('success');
          toast.success("Account activated successfully! Redirecting to login...", { duration: 4000 });
          setTimeout(() => {
            navigate("/accounts/login/?activated=true");
          }, 3000);
        }

      } catch (error) {
        console.error("Activation request error:", error);
        setStatus('error');
        toast.error("Failed to connect to the server. Please try again later.");
      }
    };

    activateUser();
  }, [token, navigate]);


  // عرض حالة العملية للمستخدم
  return (
    <div style={{ padding: '50px', textAlign: 'center', minHeight: 'calc(100vh - 100px)' }}>
      {status === 'pending' && (
        <>
          <h1 style={{ color: '#007bff' }}>... Activating Account</h1>
          <p>Please wait while we finalize your account activation. This may take a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 style={{ color: 'green' }}>Activation Successful!</h1>
          <p>Your account is now active. Redirecting you to the login page.</p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 style={{ color: 'red' }}>Activation Failed</h1>
          <p>Please check the link validity or <Link to="/Forget-Password">request a new activation link</Link>.</p>
        </>
      )}
    </div>
  );
}