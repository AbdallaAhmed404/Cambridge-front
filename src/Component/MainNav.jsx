import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Style/MainNav.css";
import logo from "../Assets/logo.png";
// 🛑 1. استيراد المودال
import ActivateResourceModal from "./ActivateResourceModal"; 

export default function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 🛑 2. حالة للتحكم في المودال
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const location = useLocation(); 
  const navigate = useNavigate();

  const isHome = location.pathname !== "/";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
    setIsLoggedIn(false);
    navigate("/accounts/login/");
  };

  // 🛑 3. دالة لفتح المودال وإغلاق القائمة
  const handleOpenCodeChecker = (e) => {
      // e.preventDefault(); // ليس ضرورياً إذا كان مجرد زر أو عنصر
      setIsMenuOpen(false); // إغلاق قائمة الجوال
      setIsModalOpen(true); // فتح المودال
  };
  
  // دالة تُمرر للمودال لإغلاقه بعد الإضافة
  const handleResourceAdded = (newResource) => {
    // يمكنك هنا إضافة منطق للتعامل مع المورد الجديد إذا لزم الأمر
    console.log("New resource activated:", newResource);
  };


  return (
    <nav className={`cambridge-nav ${isMenuOpen ? "menu-open" : ""}`}>
      <div className="cambridge-container">
        
        <div className="cambridge-logo">
          {/* <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Cambridge <img src={logo} alt="logo" width={40} />
          </Link> */}
        </div>

        <button className="menu-toggle-btn" onClick={toggleMenu} aria-label="Toggle navigation">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>

        <ul className={`cambridge-links ${isMenuOpen ? "active" : ""}`}
        style={{fontWeight:"500" }}>

          <li>
            {isHome
              ? <Link to="/" onClick={toggleMenu}>Home</Link>
              // 🛑 4. تعديل رابط "Code-Checker" لاستدعاء الدالة
              : <a 
                    href="/go/codecheck" 
                    style={{ cursor: 'pointer' }} // لتأكيد أنه قابل للنقر
                >
                    Code-Checker
                </a>
            }
          </li>

          {/* Support دايمًا موجود */}
          <li><Link to="/support" onClick={toggleMenu}>Support</Link></li>

          {/* لو المستخدم عامل لوج إن */}
          {isLoggedIn && (
            <>
              <li>
                <Link to="/go/resources/" onClick={toggleMenu}>
                  Resources
                </Link>
              </li>

              {/* Logout بنفس ستايل اللينكات */}
              <li>
                <Link
                  to="/accounts/login/"
                  onClick={() => {
                    toggleMenu();
                    handleLogout();
                  }}
                >
                  Logout
                </Link>
              </li>
            </>
          )}

          {/* لو المستخدم مش عامل لوج إن */}
          {!isLoggedIn && (
            <>
              <li><Link to="/accounts/login/" onClick={toggleMenu}>Login</Link></li>
              <li><Link to="/accounts/select-role" onClick={toggleMenu}>Register</Link></li>
            </>
          )}

        </ul>

      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
      
      {/* 🛑 5. تضمين المودال وإظهاره بناءً على الحالة */}
      {isModalOpen && (
          <ActivateResourceModal 
              onClose={() => setIsModalOpen(false)}
              onResourceAdded={handleResourceAdded}
          />
      )}
    </nav>
  );
}

// 💡 ملاحظة: يجب تعديل استيراد ActivateResourceModal بناءً على مسار الملف الفعلي.
// مثلاً: `import ActivateResourceModal from "../Components/ActivateResourceModal";`