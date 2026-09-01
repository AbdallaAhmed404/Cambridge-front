import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Footer from "./Footer";
import MainNav from "./MainNav";
import { toast, Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import ActivateResourceModal from './ActivateResourceModal';
import '../Style/btn.css'

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faCircleQuestion, faBars, faChalkboardTeacher, faUserGraduate } from '@fortawesome/free-solid-svg-icons';

const BACKEND_URL = "https://cambridge-production.up.railway.app";
// const BACKEND_URL = "http://localhost:4000";

const SIDEBAR_WIDTH = '70px';
const SLIDE_OUT_WIDTH = '280px';
const DEFAULT_EXPIRY_DAYS = 302;

// ResourceCard Component (بدون تغيير)
const ResourceCard = ({ resource }) => {
    // ... (الكود لم يتغير)
    const bookTitle = resource.title;
    const targetRole = resource.targetRole;

    const isTeacherResource = targetRole === 'Teacher';
    const resourcePath = isTeacherResource
        ? `/view-teacher-resource/${resource._id}`
        : `/view-book/${resource._id}`;

    const getRoleStyle = (role) => {
        if (role === 'Teacher') {
            return { color: '#1c4e60ff', fontWeight: 'bold' };
        } else if (role === 'Student') {
            return { color: '#1c4e60ff', fontWeight: 'bold' };
        }
        return { color: '#6c757d' };
    };

    const roleStyle = getRoleStyle(targetRole);

    const calculateDaysLeft = () => {
        const activationDate = resource.activation_date;
        const explicitExpiryDate = resource.expiry_date;

        if (!activationDate) {
            return 'N/A';
        }

        const activated = new Date(activationDate);
        let finalExpiryDate;

        if (explicitExpiryDate) {
            finalExpiryDate = new Date(explicitExpiryDate);
        } else {
            finalExpiryDate = new Date(activated);
            finalExpiryDate.setDate(activated.getDate() + DEFAULT_EXPIRY_DAYS);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        finalExpiryDate.setHours(0, 0, 0, 0);

        const timeDifference = finalExpiryDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) {
            return 'Expired';
        }

        return `${daysLeft} days left`;
    };

    const daysLeftText = calculateDaysLeft();

    return ( 
        <div className="col-md-3 col-sm-6 col-12 d-flex" key={resource._id}style={{margin:"0 0 20px 0 "}}>
            <Link
                to={resourcePath}
                target="_blank"
                style={{ textDecoration: 'none', color: 'inherit', width: "100%" }}
            >
                <div className="card h-100 shadow-sm " style={{ width: "100%", borderRadius: "8px", cursor: "pointer", position: 'relative'  }}>
                    <img
                        src={resource.photo}
                        alt={bookTitle}
                        style={{
                            width: "100%",
                            height: "350px",
                            objectFit: 'cover',
                            borderTopRightRadius: "8px",
                            borderTopLeftRadius: "8px"
                        }}
                    />
                    <div style={{ padding: '10px 10px 0px 10px', textAlign: 'left', marginBottom: "-11px" }}>
                        <h6 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{bookTitle}</h6>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <p style={{
                                fontSize: '0.9rem',
                                ...roleStyle,
                                marginBottom: '5px'
                            }}>
                                {targetRole}
                            </p>

                            <p style={{
                                fontSize: '0.9rem',
                                color: daysLeftText === 'Expired' ? 'red' : '#1c4e60ff',
                                fontWeight: '600'
                            }}>
                                {daysLeftText}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};


// -----------------------------------------------------------------
// 2. Sidebar Component (تم التعديل ليكون ضمن التدفق العادي للصفحة)
// -----------------------------------------------------------------
const Sidebar = ({ isMenuOpen, setIsMenuOpen, resources }) => {
    // ❌ تم إزالة كل المنطق الخاص بالتثبيت والتمرير (showSidebar, lastScrollY, useEffect)

    const mainItems = [
        { name: 'Cambridge GO', isHeader: true, order: 0 },
        { name: 'Resources', path: '/go/resources', icon: faBookOpen, active: true, order: 1 },
        { name: 'Support', path: '/support', icon: faCircleQuestion, order: 2 },
    ];

    const getResourceInfo = (resource) => {
        const isTeacher = resource.targetRole === 'Teacher';
        return {
            path: isTeacher ? `/view-teacher-resource/${resource._id}` : `/view-book/${resource._id}`,
            icon: isTeacher ? faChalkboardTeacher : faUserGraduate,
            title: resource.title,
            isResource: true,
        };
    };

    const resourceItems = resources.map(getResourceInfo);

    return (
        // ✅ نمط الحاوية: يجب أن تكون ضمن الـ Flexbox الأب
        <div style={{
            flexShrink: 0, // يمنع الشريط الجانبي من الانكماش
            display: 'flex',
            zIndex: 999,
            transition: "all 0.3s ease",
            overflow: 'hidden',
            // تحديد العرض الكامل (الضيق + المنزلق إذا كان مفتوحاً)
            width: isMenuOpen ? `calc(${SIDEBAR_WIDTH} + ${SLIDE_OUT_WIDTH})` : SIDEBAR_WIDTH,
        }}>

            {/* العمود الضيق */}
            <div style={{
                width: SIDEBAR_WIDTH,
                backgroundColor: '#12262d',
                paddingTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                minHeight: '100%', // يملأ ارتفاع المحتوى الأب
                height: 'auto' // لإلغاء الارتفاع الثابت 100vh
            }}>
                {/* زر القائمة */}
                <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: '1.5rem',
                        paddingTop: '5px',
                        borderRadius: '4px',
                        marginTop: "10px"
                    }}
                >
                    <FontAwesomeIcon icon={faBars} />
                </div>

                {/* أيقونات التنقل الثابتة (في العمود الضيق) */}
                {mainItems.filter(item => item.icon).map((item) => (
                    <Link key={item.name} to={item.path || '#'} title={item.name} style={{
                        color: item.active ? '#ADD8E6' : 'white',
                        fontSize: '1.5rem',
                        marginTop: '0'
                    }}>
                        {item.icon && <FontAwesomeIcon icon={item.icon} />}
                    </Link>
                ))}
            </div>

            {/* السلايد */}
            <div style={{
                width: isMenuOpen ? SLIDE_OUT_WIDTH : '0',
                backgroundColor: '#12262d',
                overflowY: 'auto',
                overflowX: 'hidden',
                transition: 'width 0.3s',
                height: 'auto', // لإلغاء الارتفاع الثابت 100vh
                paddingTop: '10px'
            }}>
                {/* ⭐️ 1. العنوان الرئيسي الثابت: Cambridge GO */}
                <h6 style={{
                    color: 'white',
                    padding: '15px 20px',
                    fontWeight: 'bold',
                    marginTop: "10px",
                    marginBottom: "10px"
                }}>
                    {mainItems[0].name}
                </h6>

                {/* ⭐️ 2. قائمة الموارد المُفعَّلة */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                    {resourceItems.map((item) => (
                        <Link
                            key={item.title}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px 20px',
                                backgroundColor: 'transparent',
                                gap: "15px",
                                fontSize: "14px",
                                fontWeight: 'normal',
                                borderLeft: 'none',
                                // إضافة تأثير عند المرور بالماوس
                                ':hover': {
                                    backgroundColor: '#254EAA'
                                }
                            }}
                        >
                            {/* عرض أيقونة المعلم/الطالب */}
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.title}</span>
                        </Link>
                    ))}

                    {/* رسالة في حال عدم وجود موارد */}
                    {resourceItems.length === 0 && isMenuOpen && (
                        <p style={{ color: '#aaa', padding: '10px 20px', fontSize: '13px' }}>
                            No resources activated.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// AllProducts Component (تم التعديل لاستخدام Flexbox للتدفق العادي)
export default function AllProducts() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const mainNavRef = useRef(null);
    const footerRef = useRef(null);
    // ❌ لم نعد نستخدم الارتفاعات للتثبيت
    const [navbarHeight, setNavbarHeight] = useState('0px');
    const [footerHeight, setFooterHeight] = useState('0px');

    const fetchResources = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError("User ID not found. Cannot fetch activated resources.");
            setLoading(false);
            toast.error("Please log in to view your resources.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentication error. Please log in.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${BACKEND_URL}/user/activated-resources`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResources(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch activated resources.");
            setLoading(false);
            toast.error("Error fetching activated resources");
        }
    };

    useEffect(() => {
        if (mainNavRef.current) setNavbarHeight(`${mainNavRef.current.offsetHeight}px`);
        if (footerRef.current) setFooterHeight(`${footerRef.current.offsetHeight}px`);
        fetchResources();
    }, []);

    const handleResourceAdded = () => {
        fetchResources();
    };

    // حساب العرض المخصص لـ Main بناءً على حالة الشريط الجانبي
    const totalSidebarWidth = isMenuOpen ? `calc(${SIDEBAR_WIDTH} + ${SLIDE_OUT_WIDTH})` : SIDEBAR_WIDTH;
    const mainWidthStyle = `calc(100% - ${totalSidebarWidth})`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Toaster position="top-center" />

            {/* 1. MainNav (يجب أن يكون ضمن التدفق الطبيعي) */}
            <div ref={mainNavRef} style={{ width: '100%', zIndex: 1001 }}>
                <MainNav />
            </div>

            {/* 2. حاوية Flex للمحتوى والشريط الجانبي (جنباً إلى جنب) */}
            <div style={{ display: 'flex', flexGrow: 1 }}>

                <Sidebar
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    resources={resources}
                />

                {/* 3. المحتوى الرئيسي (Main) */}
                <main style={{
                    transition: 'width 0.3s ease',
                    flexGrow: 1,
                    width: mainWidthStyle, // يضمن أن المحتوى يملأ المساحة المتبقية
                    minHeight: '100vh',
                    padding: '0 20px', // إضافة padding للمحتوى
                }}>
                    <div className="container mt-4">
                        <h6 className="text-muted">Resources</h6>
                        <h2 className="fw-bold">Resources</h2>
                        <div className="container mt-1 mb-4 d-flex justify-content-between align-items-center">
                            <div></div>
                            <button
                                className="btn"
                                style={{ textDecoration: "none", color: 'white', border: 'none' }}
                                onClick={() => setShowModal(true)}
                            >
                                + Add new resources
                            </button>
                        </div>
                    </div>

                    <section className="container my-5">
                        <div className="row">
                            {loading ? <p>Loading...</p> :
                                error ? <p className="text-danger">{error}</p> :
                                    resources.length > 0 ? resources.map(r => <ResourceCard key={r._id} resource={r} />)
                                        : <p>No activated resources found for your account. Click "+ Add new resources" to activate a resource.</p>
                            }
                        </div>
                    </section>
                </main>
            </div>

            <div ref={footerRef}><Footer /></div>

            {showModal && <ActivateResourceModal onClose={() => setShowModal(false)} onResourceAdded={handleResourceAdded} />}
        </div>
    );
}