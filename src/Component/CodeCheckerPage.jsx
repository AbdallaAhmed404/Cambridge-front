import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import check from "../Assets/check.png";

// يجب استيراد هذه المكونات، بناءً على المثال الذي قدمته
import MainNav from "../Component/MainNav";
import Footer from "../Component/Footer";

// قائمة خيارات طول الكود
const CODE_LENGTH_OPTIONS = [16, 12];
// نقطة التوقف للتصميم (breakpoint)
const MOBILE_BREAKPOINT = 768;

const BACKEND_URL = "https://api.icfls.com";
// const BACKEND_URL = "http://localhost:4000";

const CodeCheckerPage = ({ onGoBack, onCodeCheckSuccess }) => {
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedCodeLength, setSelectedCodeLength] = useState(16);
    // حالة جديدة لتتبع عرض النافذة
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // useEffect لتحديث عرض النافذة عند تغيير حجمها
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < MOBILE_BREAKPOINT;

    // القيم المحسوبة بناءً على الاختيار
    const codeLength = selectedCodeLength;
    const requiredLengthWithDashes = codeLength + Math.floor((codeLength - 1) / 4);

    // دالة لتنسيق الإدخال: إضافة شرطات (Dashes) كل 4 أحرف
    const formatCode = useCallback((input, currentLength) => {
        const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatted = '';
        const segment = 4;

        for (let i = 0; i < cleaned.length && i < currentLength; i += segment) {
            if (formatted.length > 0) {
                formatted += '-';
            }
            formatted += cleaned.substring(i, i + segment);
        }
        return formatted;
    }, []);

    // دالة لمعالجة تغيير خيار طول الكود
    const handleLengthChange = (newLength) => {
        const length = parseInt(newLength);
        setSelectedCodeLength(length);
        const inputWithoutDashes = accessCode.replace(/-/g, '');
        setAccessCode(formatCode(inputWithoutDashes, length));
    };

    // معالجة تغيير الإدخال
    const handleCodeChange = (e) => {
        const input = e.target.value.replace(/-/g, '');
        if (input.length <= codeLength) {
            setAccessCode(formatCode(input, codeLength));
        }
    };

    // معالجة التحقق من الكود (Check Code)
    const handleCheckCode = async () => {
        const codeToSend = accessCode;
        const actualCleanedLength = codeToSend.replace(/-/g, '').length;

        if (actualCleanedLength !== codeLength) {
            toast.error(`Access code must be ${codeLength} characters.`);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/user/check-code`, {
                code: codeToSend,
            });

            toast.success(response.data.message || "Code is valid. Resource details received.");
            if (onCodeCheckSuccess) {
                onCodeCheckSuccess(response.data);
            }

        } catch (error) {
            console.error("Code Check Error:", error);
            const errorMessage = error.response?.data?.message || "Invalid or already used code. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // حالة زر 'Check code'
    const isButtonDisabled = loading || accessCode.length !== requiredLengthWithDashes;

    // --- التنسيقات المستجيبة (Responsive Styles) ---

    const inputStyle = useMemo(() => ({
        fontSize: isMobile ? '1rem' : '1.2rem',
        letterSpacing: '3px',
        padding: '10px 15px',
        textTransform: 'uppercase',
        border: '1px solid #ccc',
        borderRadius: '4px',
        width: 'calc(100% - 30px)',
        boxSizing: 'border-box',
        marginBottom: '10px',
        textAlign: 'center',
    }), [isMobile]);

    const checkButtonStyle = useMemo(() => ({
        padding: '10px 25px',
        borderRadius: '4px',
        cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
        backgroundColor: '#1D3C47',
        color: 'white',
        border: 'none',
        opacity: isButtonDisabled ? 0.6 : 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '20px',
        width: isMobile ? '100%' : 'auto',
    }), [isButtonDisabled, isMobile]);

    // **التعديل رقم 1: إزالة التوسيط وجعلها تملأ الارتفاع المتبقي (باستثناء الـ MainNav والـ Footer)**
    const contentContainerStyle = {
        padding: isMobile ? '20px 10px' : '0', // إزالة الـ padding العمودي الكبير
        minHeight: 'calc(100vh - var(--nav-height, 60px) - var(--footer-height, 50px))', // يجب تحديد ارتفاع الناف بار والفوتير لتحديد ارتفاع القسم
        backgroundColor: '#f8f8f8',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        justifyContent: 'flex-start', // إزالة توسيط المحتوى الأفقي
        alignItems: 'stretch', // جعل العناصر تملأ الارتفاع
        flexGrow: 1, // السماح لها بالنمو
    };

    // **التعديل رقم 2: جعل البطاقة تملأ الحاوية بالكامل**
    const checkerCardStyle = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: isMobile ? 'auto' : '100%', // جعلها تملأ ارتفاع الـ contentContainer
        width: '100%', // جعلها تملأ عرض الـ contentContainer
        maxWidth: 'none', // إزالة الحد الأقصى للعرض
        margin: '0', // إزالة الـ margin auto
        borderRadius: '0', // إزالة الـ border-radius
        overflow: 'hidden',
        boxShadow: 'none', // إزالة الـ box-shadow
    }

    // تنسيق اللوحة اليسرى
    const leftPanelStyle = {
        flex: 1,
        // **التعديل رقم 3: زيادة الـ padding العمودي للوحة اليسرى لملء الارتفاع**
        padding: isMobile ? '40px 20px' : '80px 80px', 
        backgroundColor: 'white',
        maxWidth: isMobile ? '100%' : '800px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // توسيط المحتوى عموديًا داخل اللوحة اليسرى
    };

    // تنسيق اللوحة اليمنى
    const rightPanelStyle = {
        flex: 1,
        backgroundColor: '#1D3C47',
        backgroundImage: `url(${check})`, // استخدام الصورة المستوردة
        backgroundSize: 'cover',        // **لجعل الصورة تملأ المساحة بالكامل (مهم)**
        backgroundPosition: 'center',   // لتركيز الصورة في المنتصف
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        display: isMobile ? 'none' : 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: isMobile ? '150px' : 'auto',
    };

    return (
        // **ملاحظة: يجب أن تكون الحاوية الرئيسية (مثل <body> أو <div> التي تحتوي على كل شيء) على وضعية flex-direction: column** // **وأن يكون ارتفاعها 100% أو 100vh لكي يعمل minHeight في contentContainerStyle بشكل صحيح.**
        // بما أننا لا نرى الكود المحيط، لنفترض أن هذا تم تنفيذه في ملف CSS خارجي أو في جذر التطبيق.
        <>
            <Toaster position="top-center" />
            <MainNav />

            <section style={contentContainerStyle}>
                <div style={checkerCardStyle}>
                    {/* اللوحة اليسرى - المحتوى */}
                    <div style={leftPanelStyle}>


                        <h2 style={{ fontSize: isMobile ? '1.8rem' : '2rem', textAlign: isMobile ? 'center' : 'left' }}>Code Checker</h2>
                        <p style={{ marginTop: '8px', marginBottom: '20px', color: '#555', textAlign: isMobile ? 'center' : 'left' }}>
                            Enter the access code found in the front of your textbook, sealed pocket, or email to check your code. This will not activate your resource.
                        </p>

                        {/* **حقل اختيار طول الكود المضاف** */}
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ marginBottom: '10px', fontWeight: '600' }}>Select Code Length:</h4>
                            <div style={{ display: 'flex', gap: '20px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                {CODE_LENGTH_OPTIONS.map(len => (
                                    <label key={len} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name="codeLength"
                                            value={len}
                                            checked={selectedCodeLength === len}
                                            onChange={(e) => handleLengthChange(e.target.value)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {len} Characters
                                    </label>
                                ))}
                            </div>
                        </div>

                        <h4 style={{ marginBottom: '10px', fontWeight: '600' }}>{codeLength}-character access code</h4>

                        {/* حقل إدخال الكود */}
                        <input
                            type="text"
                            value={accessCode}
                            onChange={handleCodeChange}
                            placeholder={codeLength === 16 ? "XXXX-XXXX-XXXX-XXXX" : "XXXX-XXXX-XXXX"}
                            maxLength={requiredLengthWithDashes}
                            style={inputStyle}
                            disabled={loading}
                        />

                        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '40px', textAlign: isMobile ? 'center' : 'left' }}>
                            For example: {codeLength === 16 ? "AB12-CD34-EF56-GH78" : "AB12-CD34-EF56"}
                        </p>

                        {/* زر التحقق - تم توسيطه إذا كان العرض auto */}
                        <div style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                            <button
                                onClick={handleCheckCode}
                                style={checkButtonStyle}
                                disabled={isButtonDisabled}
                            >
                                {loading ? 'Checking...' : (
                                    <>
                                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>&#x2714;</span>
                                        Check code
                                    </>
                                )}
                            </button>
                        </div>

                    </div>

                    {/* اللوحة اليمنى - الخلفية والتصميم (تم إخفاؤها على الموبايل) */}
                    <div style={rightPanelStyle}>
                        {/* يمكنك إضافة مكون الصورة أو الرسم هنا ليظهر بنفس شكل الصورة المرفقة */}
                         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.6 }}>
                                                     </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default CodeCheckerPage;