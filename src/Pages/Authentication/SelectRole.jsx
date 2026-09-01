import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Footer from "../../Component/Footer";
import MainNav from "../../Component/MainNav";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faUserGraduate, faGlobe } from '@fortawesome/free-solid-svg-icons';

// نقطة التوقف للموبايل
const MOBILE_BREAKPOINT = 768; 

// ==========================================================
// 1. مكون المراحل - RegistrationSteps (محدث)
// ==========================================================

// التعديل الرئيسي هنا: على اللاب توب سيعرض عمودياً
const RegistrationSteps = ({ currentStep, isMobile }) => { 
    // التنسيق للخطوة الواحدة
    const stepStyle = (stepNumber) => ({
        
        display: 'flex',
        alignItems: 'center',
        marginBottom: isMobile ? '0' : '25px', 
        color: currentStep >= stepNumber ? '#3e5a5c' : '#a0a0a0', 
        fontWeight: currentStep === stepNumber ? 'bold' : 'normal',
        fontSize: isMobile ? '0.8rem' : '1rem', 
        // ✅ التعديل: عند العرض العمودي (على اللاب) تكون صفاً عادياً
        flexDirection: isMobile ? 'column' : 'row', 
        textAlign: isMobile ? 'center' : 'left',
    });

    // تنسيق الدائرة
    const circleStyle = (stepNumber) => ({
        width: isMobile ? '25px' : '1px', 
        height: isMobile ? '25px' : '30px',
        minWidth: isMobile ? '25px' : '30px',
        borderRadius: '50%',
        backgroundColor: currentStep === stepNumber ? '#3e5a5c' : currentStep > stepNumber ? '#3e5a5c' : '#e0e0e0',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: isMobile ? '0' : '15px',
        marginBottom: isMobile ? '5px' : '0', 
        fontSize: isMobile ? '0.9rem' : '0.9rem',
    });

    // ✅ التعديل: تنسيق الحاوية الرئيسية للمراحل
    const mainContainerStyle = {
        // إذا كان موبايل، عرض أفقي مع تمرير
        display: 'flex',
        overflowX: isMobile ? 'auto' : 'hidden', 
        whiteSpace: isMobile ? 'nowrap' : 'normal',
        padding: isMobile ? '15px 10px' : '40px 0',
        justifyContent: isMobile ? 'space-between' : 'initial',
        gap: isMobile ? '30px' : '0',
        // ✅ التعديل للديسكتوب: عرض عمودي (كأنه قائمة)
        flexDirection: isMobile ? 'row' : 'column', 
        
    };

    return (
        <div style={mainContainerStyle}>
            {/* إخفاء العنوان على الموبايل */}
            {!isMobile && (
                <h3 style={{ margin: '0 0 50px 0', fontSize: '1.1rem', color: '#3e5a5c' }}>Get started with Cambridge GO</h3>
            )}
            
            <div style={{ ...stepStyle(1), flexShrink: 0 }}> 
                <div style={circleStyle(1)}>1</div>
                Select your role
            </div>
            
            <div style={{ ...stepStyle(2), flexShrink: 0 }}>
                <div style={circleStyle(2)}>2</div>
                Create account
            </div>
            
            <div style={{ ...stepStyle(3), flexShrink: 0 }}>
                <div style={circleStyle(3)}>3</div>
                Verify your email
            </div>
        </div>
    );
};

// ==========================================================
// 2. بيانات الأدوار ومكون RoleCard
// ... (مكون RoleCard يبقى كما هو)
// ==========================================================

const roles = [
    {
        id: "Teacher",
        icon: faChalkboardTeacher, 
        title: "Teacher",
        description:
            "Create classes, access learning and supporting resources, and join or create a school in Cambridge GO to become an admin and manage your users.",
    },
    {
        id: "Student",
        icon: faUserGraduate, 
        title: "Student",
        description:
            "Activate resources and join existing schools or classes in Cambridge GO.",
    },
];

const RoleCard = ({ role, onSelect, selectedRole }) => (
    <motion.div
        className="role-card"
        onClick={() => onSelect(role.id)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: `2px solid ${
                selectedRole === role.id ? "#3e5a5c" : "#e0e0e0"
            }`,
            cursor: "pointer",
            transition: "border 0.3s, background-color 0.3s",
            backgroundColor: selectedRole === role.id ? "#f6fbfb" : "white",
            
        }}
    >
        <div style={{ display: "flex", alignItems: "flex-start"}}>
            <FontAwesomeIcon
                icon={role.icon}
                style={{
                    width: "32px",
                    height: "32px",
                    minWidth: "32px",
                    marginRight: "15px",
                    color: "#063d52ff", 
                }}
            />
            <div>
                <h4 style={{ margin: "0 0 5px 0", color: "#3e5a5c" }}>{role.title}</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                    {role.description}
                </p>
            </div>
        </div>
    </motion.div>
);

// ==========================================================
// 3. المكون الرئيسي SelectRole
// ==========================================================

export default function SelectRole() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    
    // منطق العرض المتجاوب
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => { setWindowWidth(window.innerWidth); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < MOBILE_BREAKPOINT;
    
    const handleContinue = () => {
        if (selectedRole) {
            localStorage.setItem("userRole", selectedRole);
            navigate("/accounts/register");
        } else {
            alert("Please select your role to continue.");
        }
    };

    return (
        <>
            <MainNav />
            
            <div
                style={{
                    display: "flex",
                    minHeight: "calc(100vh - 120px)", 
                    backgroundColor: "#ffffffff",
                    padding: "0", 
                    alignItems: "stretch",
                    // ✅ التعديل: عكس الاتجاه بحيث يظهر المحتوى على اليسار في الديسكتوب
                    flexDirection: isMobile ? 'column' : 'row-reverse', 
                    
                }}
            >
                {/* ⬅️ اللوحة اليسرى (المحتوى) / ⬇️ المحتوى الرئيسي في الموبايل */}
                <div
                    style={{
                        flex: 1, 
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: isMobile ? "30px 20px" : "50px 20px",
                        
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "450px", 
                            padding: "30px",
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            boxShadow: "none", 
                            border:"solid 1px #d2d2d2ff"
                        }}
                    >
                        <h2 style={{ textAlign: "left", marginBottom: "10px", fontSize: isMobile ? "1.5rem" : "2rem" }}>
                            Select your role
                        </h2>
                        <p style={{ textAlign: "left", marginBottom: "30px", color: "#666" }}>
                            Make sure you choose the right role for you.
                        </p>

                        {roles.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                onSelect={setSelectedRole}
                                selectedRole={selectedRole}
                            />
                        ))}

                        <motion.button
                            onClick={handleContinue}
                            disabled={!selectedRole}
                            whileHover={{ opacity: 0.9 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: "100%",
                                height: "45px",
                                borderRadius: "4px",
                                backgroundColor: selectedRole ? "rgb(29, 60, 71)" : "#a0a0a0",
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "white",
                                border: "none",
                                marginTop: "15px",
                                cursor: selectedRole ? "pointer" : "not-allowed",
                            }}
                        >
                            Continue
                        </motion.button>
                    </div>
                </div>
                
                {/* ➡️ اللوحة اليمنى (المراحل) / ⬆️ الشريط العلوي في الموبايل */}
                <div 
                    style={{
                        // ✅ التعديل: العرض يكون 100% في الموبايل و 350px في اللاب
                        width: isMobile ? '100%' : '350px', 
                        // ✅ التعديل: على اللاب، المراحل تظهر فوق بعضها (column)
                        display: 'flex',
                        flexDirection: 'column', 
                        padding: isMobile ? '0' : '20px 40px',
                        backgroundColor: '#ffffffff', 
                        borderRight: isMobile ? 'none' : '1px solid #e0e0e0', // حد على اليسار
                        borderBottom: isMobile ? '1px solid #e0e0e0' : 'none',
                        flexShrink: 0,
                    }}
                >
                    <RegistrationSteps currentStep={1} isMobile={isMobile} /> 
                </div>
            </div>
            <Footer />
        </>
    );
}