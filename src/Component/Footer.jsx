import { motion } from "framer-motion";
import React from "react"; // استيراد React ضروري في بعض البيئات

export default function Footer() {
  // الروابط المأخوذة من الصورة الأصلية
  const footerLinks = [
    { name: "Accessibility statement", href: "/accessibility-statement" },
    { name: "Terms of use", href: "/terms-of-use" },
    { name: "End user licence agreement", href: "/end-user-licence-agreement" },
    { name: "Privacy policy", href: "/privacy-policy" },
    { name: "Contact us", href: "/support" }, // استخدمت '/support' كما كان في الكود الأصلي
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        backgroundColor: "#12262d", // اللون الداكن المطلوب
        color: "#ffffff",
        padding: "20px 0",
        fontSize: "14px",
        minHeight: "100px", // لضمان ظهور محتوى مناسب
      }}
    >
      <div 
        className="container-fluid" 
        style={{ 
            maxWidth: '1370px', 
            margin: '0 auto', 
            padding: '0 20px' // إضافة padding أفقي لضمان التجاوب
        }}
      >
        {/* ======================================================= */}
        {/* الجزء العلوي: الروابط وزر Cookie settings - تنسيق أفقي على الشاشات الكبيرة */}
        {/* ======================================================= */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            paddingBottom: "15px", // مسافة تفصل عن حقوق النشر
            // **خاصية التجاوب:** السماح للعناصر بالنزول إلى سطر جديد
            flexWrap: "wrap", 
            gap: "15px 25px", // تباعد رأسي وأفقي بين المجموعات عند الالتفاف
          }}
        >
          {/* الروابط على اليسار - يجب أن تكون متجاوبة داخليًا أيضًا */}
          <div 
            style={{ 
              display: "flex", 
              gap: "25px",
              flexWrap: "wrap", // السماح للروابط بالنزول إلى سطر جديد عند ضيق المساحة
              // يمكن استخدام flex-grow: 1 لملء المساحة المتاحة، أو تحديد عرض
            }}
          >
            {footerLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                style={{ 
                  color: "#ffffff", 
                  textDecoration: "none", 
                  // whiteSpace: "nowrap", // حافظت عليها لتقليد تصميم الصورة
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          
         
        </div>
      </div>
    </motion.footer>
  );
}