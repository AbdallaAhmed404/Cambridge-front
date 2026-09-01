import { Link, useNavigate } from "react-router-dom";
import Footer from "../../Component/Footer";
import MainNav from "../../Component/MainNav";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import "../../Style/btn.css"

// نقطة التوقف للموبايل
const MOBILE_BREAKPOINT = 768; 

const BACKEND_URL = "https://cambridge-production.up.railway.app";
// const BACKEND_URL = "http://localhost:4000";

const countries = [
    // ... (بيانات الدول)
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China",
    "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia",
    "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor (Timor-Leste)",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
    "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
    "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
    "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
    "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Korea", "North Macedonia (formerly Macedonia)", "Norway",
    "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
    "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
    "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
    "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
    "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// ==========================================================
// 1. مكون المراحل - RegistrationSteps (معدل ومتجاوب)
// ==========================================================

const RegistrationSteps = ({ currentStep, isMobile }) => {
    
    const stepStyle = (stepNumber) => ({
        
        display: 'flex',
        alignItems: 'center',
        marginBottom: isMobile ? '0' : '25px', 
        color: currentStep == stepNumber ? '#3e5a5c' : '#a0a0a0', 
        fontWeight: currentStep === stepNumber ? 'bold' : 'normal',
        fontSize: isMobile ? '0.8rem' : '1rem', 
        flexDirection: isMobile ? 'column' : 'row', 
        textAlign: isMobile ? 'center' : 'left',
    });

    const circleStyle = (stepNumber) => ({
      
        width: isMobile ? '25px' : '1px', 
        height: isMobile ? '25px' : '30px',
        minWidth: isMobile ? '25px' : '30px',
        borderRadius: '50%',
        backgroundColor: currentStep === stepNumber ? '#3e5a5c' : '#e0e0e0',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: isMobile ? '0' : '15px',
        marginBottom: isMobile ? '5px' : '0', 
        fontSize: isMobile ? '0.9rem' : '0.9rem',
    });

    const mainContainerStyle = {
        display: 'flex',
        overflowX: isMobile ? 'auto' : 'hidden', 
        whiteSpace: isMobile ? 'nowrap' : 'normal',
        padding: isMobile ? '15px 10px' : '40px 0',
        justifyContent: isMobile ? 'space-between' : 'initial',
        gap: isMobile ? '30px' : '0',
        flexDirection: isMobile ? 'row' : 'column',
    };

    return (
        <div style={mainContainerStyle}>
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
// 2. المكون الرئيسي SignUp
// ==========================================================

export default function SignUp() {
    const navigate = useNavigate();

    // منطق العرض المتجاوب
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => { setWindowWidth(window.innerWidth); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < MOBILE_BREAKPOINT;

    // ... (الـ States وبقية المنطق)
    const initialRole = localStorage.getItem("userRole") || "";
    const [role, setRole] = useState(initialRole);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [schoolLocation, setSchoolLocation] = useState("");

    useEffect(() => {
        if (!role) {
            toast.error("Please select a role first.");
            navigate("/accounts/select-role");
        }
    }, [role, navigate]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        const cleanedFirstName = firstName.trim();
        const cleanedLastName = lastName.trim();
        const cleanedEmail = email.trim();
        const cleanedConfirmEmail = confirmEmail.trim();
        const cleanedPassword = password.trim();
        const cleanedConfirmPassword = confirmPassword.trim();
        const cleanedSchoolName = schoolName.trim();
        
        if (
            !role ||
            !cleanedFirstName ||
            !cleanedLastName ||
            !cleanedEmail ||
            !cleanedConfirmEmail ||
            !cleanedPassword ||
            !cleanedConfirmPassword ||
            !cleanedSchoolName ||
            !schoolLocation
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (email !== confirmEmail) {
            toast.error("Email and Confirm Email do not match.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Password and Confirm Password do not match.");
            return;
        }

        const userData = {
            Role: role,
            FirstName: cleanedFirstName,
            LastName: cleanedLastName,
            email: cleanedEmail,
            confirmEmail: cleanedConfirmEmail,
            password: cleanedPassword,
            confirmPassword: cleanedConfirmPassword,
            SchoolName: cleanedSchoolName,
            SchoolLocation: schoolLocation,
        };


        try {
            const response = await fetch(`${BACKEND_URL}/user/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Account created successfully!");
                localStorage.removeItem("userRole");
                setTimeout(() => navigate("/accounts/login/"), 1500);
            } else {
                toast.error(data.message || "Registration failed");
            }
        } catch (error) {
            toast.error("An error occurred: " + error.message);
        }
    };

    return (
        <>
            <MainNav />
            <Toaster position="top-center" reverseOrder={false} />

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
                <section
                    style={{
                        
                        flex: 1, 
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start", 
                        padding: isMobile ? "30px 15px" : "50px 20px", 
                    }}
                >
                    <div
                        className="register-card"
                        style={{
                            width: "100%",
                            maxWidth: "640px",
                            padding: "0px 20px 20px 20px",
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            boxShadow: "none", 
                            border: "solid 1px rgba(207, 207, 207, 1)",
                        }}
                    >
                        <h3
                            style={{
                                textAlign: "start",
                                marginBottom: "30px",
                                fontWeight: "600",
                                margin: "0px -20px 15px -20px",
                                padding: "15px",
                                
                            }}
                        >
                            Create a {role} account
                        </h3>
                        
                        

                        <form className="register-form" onSubmit={handleSignUp}>
                             <div className="form-group mb-3">
                                <label htmlFor="firstName">First name:</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className="form-control"
                                    style={{ height: "40px", padding: "10px" }}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="lastName">Last name:</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className="form-control"
                                    style={{ height: "40px", padding: "10px" }}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="schoolName">School Name:</label>
                                <input
                                    id="schoolName"
                                    type="text"
                                    className="form-control"
                                    style={{ height: "40px", padding: "10px" }}
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="schoolLocation">School Location (Country):</label>
                                <select
                                    id="schoolLocation"
                                    className="form-control"
                                    style={{ height: "40px", padding: "8px 10px" }}
                                    value={schoolLocation}
                                    onChange={(e) => setSchoolLocation(e.target.value)}
                                    required
                                >
                                    <option value="">------</option>
                                    {countries.map((country) => (
                                        <option
                                            key={country}
                                            value={country}
                                        >
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="email">Email address:</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-control"
                                    style={{ height: "40px", padding: "10px" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3 required-field-container">
                                <label htmlFor="confirmEmail">Confirm email:</label>
                                <input
                                    id="confirmEmail"
                                    type="email"
                                    className="form-control"
                                    style={{ height: "40px", padding: "10px" }}
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="password">Password:</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-control"
                                    style={{ height: "40px", padding: "10px" }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="confirmPassword">Confirm password:</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="form-control"
                                    style={{ height: "40px", padding: "10px" }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="text-center">
                                <motion.button
                                    className="btn"
                                    whileHover={{ opacity: 0.9 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: "100%",
                                        height: "45px",
                                        borderRadius: "4px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        color: "white",
                                        border: "none",
                                        marginBottom: "16px",
                                        cursor: "pointer",
                                        textDecoration:"none"
                                    }}
                                    type="submit"
                                >
                                    Register
                                </motion.button>
                            </div>

                            <div style={{ textAlign: "center", fontSize: "14px" }}>
                                Already have an account?{" "}
                                <Link
                                    to="/accounts/login/"
                                    style={{ color: "blue", textDecoration: "none" }}
                                >
                                    Login here.
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>
                
                {/* ➡️ اللوحة اليمنى (المراحل) / ⬆️ الشريط العلوي في الموبايل */}
                <div 
                    style={{
                        width: isMobile ? '100%' : '350px', 
                        display: 'flex',
                        flexDirection: 'column', 
                        padding: isMobile ? '0' : '20px 40px',
                        backgroundColor: '#ffffffff', 
                        borderRight: isMobile ? 'none' : '1px solid #e0e0e0',
                        borderBottom: isMobile ? '1px solid #e0e0e0' : 'none',
                        flexShrink: 0,
                    }}
                >
                    <RegistrationSteps currentStep={2} isMobile={isMobile} /> 
                </div>
            </div>
            <Footer />
        </>
    );
}