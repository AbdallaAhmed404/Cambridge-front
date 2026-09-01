// ***********************************************
// 📁 ملف: src/Component/ResourceFilesPage.js (النسخة المعدلة - غير ثابتة)
// ***********************************************

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import MainNav from "./MainNav";
import Footer from "./Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFilePdf, faVolumeUp, faPlayCircle, faBookOpen, faCircleQuestion, faBars, faChalkboardTeacher, faUserGraduate } from '@fortawesome/free-solid-svg-icons';

// const BASE_URL = 'http://localhost:4000'; 
const BASE_URL = 'https://cambridge-production.up.railway.app';


// -----------------------------------------------------------
// ثوابت ومنطق الـ Sidebar
// -----------------------------------------------------------
const SIDEBAR_WIDTH = '70px';
const SLIDE_OUT_WIDTH = '280px';

// دالة مساعدة لتحديد معلومات المورد لعرضه في Sidebar
const getResourceInfo = (resource) => {
    const isTeacher = resource.targetRole === 'Teacher';
    return {
        path: isTeacher ? `/view-teacher-resource/${resource._id}` : `/view-book/${resource._id}`,
        icon: isTeacher ? faChalkboardTeacher : faUserGraduate,
        title: resource.title,
        isResource: true,
    };
};

// 🆕 مكون Sidebar (تم تحويله إلى وضع التدفق العادي)
const Sidebar = ({ isMenuOpen, setIsMenuOpen, resources }) => {
    // ❌ تم حذف: const [showSidebar, setShowSidebar] = useState(true);
    // ❌ تم حذف: const lastScrollY = useRef(0);

    const mainItems = [
        { name: 'Cambridge GO', isHeader: true, order: 0 },
        { name: 'Resources', path: '/go/resources', icon: faBookOpen, active: true, order: 1 },
        { name: 'Support', path: '/support', icon: faCircleQuestion, order: 2 },
    ];

    // ❌ تم حذف دالة useEffect لمنع إخفاء الشريط عند التمرير.
    /*
    useEffect(() => {
        // ... (منطق إخفاء عند التمرير)
    }, []);
    */

    // قائمة الموارد الديناميكية
    const resourceItems = resources.map(getResourceInfo);

    return (
        // ✅ التعديل هنا: إزالة position: 'fixed', top, height, zIndex. استخدام flexShrink
        <div style={{
            flexShrink: 0,
            display: 'flex',
            transition: "all 0.3s ease",
            overflow: 'hidden',
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
                minHeight: '100%', // ✅ تعديل: ليتمدد مع المحتوى
                height: 'auto'
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
                        marginTop: "10px" // ❌ تعديل: تقليل الهامش العلوي
                    }}
                >
                    <FontAwesomeIcon icon={faBars} />
                </div>

                {/* أيقونات التنقل الثابتة (في العمود الضيق) */}
                {mainItems.filter(item => item.icon).map((item) => (
                    <Link key={item.name} to={item.path || '#'} title={item.name} style={{
                        color: item.active ? '#ADD8E6' : 'white',
                        fontSize: '1.5rem',
                        marginTop: item.name === 'Resources' ? '10px' : '0'
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
                height: 'auto', // ✅ تعديل: إزالة 100vh
                paddingTop: '10px',
                display: isMenuOpen ? 'block' : 'none'
            }}>
                {/* 1. العنوان الرئيسي الثابت: Cambridge GO */}
                <h6 style={{
                    color: 'white',
                    padding: '15px 20px',
                    fontWeight: 'bold',
                    marginTop: "10px", // ❌ تعديل: تقليل الهامش العلوي
                    marginBottom: "10px"
                }}>
                    {mainItems[0].name}
                </h6>

                {/* 2. قائمة الموارد المُفعَّلة */}
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
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#254EAA'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
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


// -----------------------------------------------------------
// مكونات الأزرار (بدون تغيير)
// -----------------------------------------------------------
const ExtraDownloadButton = ({ downloadUrl, fileName }) => {
    // ... (الكود بدون تغيير)
    const [isHovered, setIsHovered] = useState(false);
    const baseStyle = {
        backgroundColor: '#f0f0f0', color: 'black', borderColor: '#ccc',
        transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textDecoration: 'none'
    };
    const hoverStyle = { backgroundColor: '#e9ecef', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', transform: 'translateY(-1px)' };
    return (
        <a href={downloadUrl} download className="btn btn-sm d-inline-flex align-items-center me-2 mb-2"
            style={{ ...baseStyle, ...(isHovered ? hoverStyle : {}) }}
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            <span className="f" style={{fontSize:"20px"}}>
                    {fileName}
                </span>
        </a>
    );
};

const CoreDownloadButton = ({ downloadUrl, fileName, icon }) => {
    // ... (الكود بدون تغيير)
    const [isHovered, setIsHovered] = useState(false);
    const baseStyle = {
        backgroundColor: '#f0f0f0', color: 'black', transition: 'all 0.2s',
        textDecoration: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    const hoverStyle = { backgroundColor: '#e9ecef', opacity: 0.9, transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' };
    return (
        <a href={downloadUrl} download className="btn d-inline-flex align-items-center me-2 mb-2"
            style={{ ...baseStyle, ...(isHovered ? hoverStyle : {}) }}
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <FontAwesomeIcon icon={icon} className="me-2" />
            {fileName}
        </a>
    );
};

// مكون عرض المحتوى (Accordions) (بدون تغيير)
const FileAccordionContent = ({ data, accordionIdPrefix, type, resourceId }) => {
    // ... (الكود بدون تغيير)
    const isCoreDownload = type === 'audio-videos';
    const hasData = data.length > 0;

    const getGroupIcon = (title) => {
        if (title.includes('Audio')) return faVolumeUp;
        if (title.includes('Video')) return faPlayCircle;
        return faDownload;
    };

    const getDownloadUrl = (file) => {
        if (isCoreDownload) {
            return file.href;
        } else {
            return `${BASE_URL}/user/download/extra/${resourceId}?path=${encodeURIComponent(file.path)}&fileName=${encodeURIComponent(file.fileName)}`;
        }
    };

    return (
        <section className="p-4 border rounded shadow-sm bg-white ">
            <div className="accordion" id={`${accordionIdPrefix}Accordion`}>
                {hasData ? (
                    data.map((item, index) => (
                        <div className="accordion-item" key={item.title || index} >
                            <h2 className="accordion-header" id={`heading-${accordionIdPrefix}-${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse-${accordionIdPrefix}-${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapse-${accordionIdPrefix}-${index}`}
                                >
                                    {isCoreDownload && <FontAwesomeIcon icon={getGroupIcon(item.title)} className="me-2 text-primary fs-5 fw-bold" />}
                                    <span className="fs-5"style={{ fontWeight: 500}}>
                                        {item.title}
                                    </span>
                                    <span className="badge bg-secondary ms-2">{item.files.length} Files</span>
                                </button>
                            </h2>
                            <div
                                id={`collapse-${accordionIdPrefix}-${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading-${accordionIdPrefix}-${index}`}
                                data-bs-parent={`#${accordionIdPrefix}Accordion`}
                            >
                                <div className="accordion-body d-flex flex-wrap gap-2">
                                    {item.files.length > 0 ? (
                                        item.files.map(file => (
                                            isCoreDownload ? (
                                                <CoreDownloadButton
                                                    key={file.id}
                                                    downloadUrl={getDownloadUrl(file)}
                                                    fileName={file.fileName}
                                                    icon={getGroupIcon(item.title)}
                                                />
                                            ) : (
                                                <ExtraDownloadButton
                                                    key={file.id}
                                                    downloadUrl={getDownloadUrl(file)}
                                                    fileName={file.fileName}
                                                />
                                            )
                                        ))
                                    ) : (
                                        <p className="text-muted">No files linked to this title.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="alert alert-info mb-0">No files are available for this section.</div>
                )}
            </div>
        </section>
    );
};


// -----------------------------------------------------------
// المكون الرئيسي ResourceFilesPage (مع تعديلات Sidebar)
// -----------------------------------------------------------
export default function ResourceFilesPage() {
    const { resourceId, type } = useParams();
    const [resource, setResource] = useState(null);
    const [allResources, setAllResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const validTypes = ['audio-videos', 'answers', 'downloadable-files'];

    // ... (دالة fetchResourceDetails لا تحتاج لتغيير)
    const fetchResourceDetails = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentication error. Please log in.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // 1. جلب تفاصيل المورد الحالي
            const resourceResponse = await axios.get(`${BASE_URL}/user/resource/${resourceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResource(resourceResponse.data);

            // 2. جلب قائمة كل الموارد المُفعَّلة للـ Sidebar
            const allResourcesResponse = await axios.get(`${BASE_URL}/user/activated-resources`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllResources(allResourcesResponse.data);

            setLoading(false);
        } catch (err) {
            setError("Failed to load resource details or all resources.");
            setLoading(false);
            toast.error("Error loading resource data.");
        }
    };

    useEffect(() => {
        fetchResourceDetails();
    }, [resourceId]);

    // ... (منطق التحقق من الـ type يبقى كما هو)
    useEffect(() => {
        if (!loading && !error && resource && !validTypes.includes(type)) {
            toast.error("Invalid resource file type selected. Redirecting to resource main page...");
            setTimeout(() => {
                navigate(`/view-teacher-resource/${resourceId}`, { replace: true });
            }, 500);
        }
    }, [loading, error, resource, type, navigate, resourceId]);

    // ... (منطق تجهيز البيانات يبقى كما هو)
    let dataToDisplay = [];
    let pageTitle = '';

    if (resource) {
        if (type === 'audio-videos') {
            pageTitle = 'Core Audios & Videos';
            if (resource.pageAudios && resource.pageAudios.length > 0) {
                dataToDisplay.push({
                    title: 'Page Audios',
                    files: resource.pageAudios.map(item => ({
                        id: item._id,
                        fileName: `Audio Page ${item.pageNumber}`,
                        href: `${BASE_URL}/user/download/audio/${resourceId}/${item._id}`
                    }))
                });
            }
            if (resource.pageVideos && resource.pageVideos.length > 0) {
                dataToDisplay.push({
                    title: 'Page Videos',
                    files: resource.pageVideos.map(item => ({
                        id: item._id,
                        fileName: `Video Page ${item.pageNumber}`,
                        href: `${BASE_URL}/user/download/video/${resourceId}/${item._id}`
                    }))
                });
            }

        } else if (type === 'answers') {
            pageTitle = 'Answers Sheets';
            if (resource.answers && resource.answers.length > 0) {
                resource.answers.forEach((item) => {
                    dataToDisplay.push({
                        title: item.title,
                        files: item.path.map((filePath, index) => ({
                            path: filePath,
                            fileName: filePath.split('/').pop(),
                            id: `${item._id}-A-${index}`
                        }))
                    });
                });
            }

        } else if (type === 'downloadable-files') {
            pageTitle = 'Downloadable Resources';
            if (resource.downloadableResources && resource.downloadableResources.length > 0) {
                resource.downloadableResources.forEach((item) => {
                    dataToDisplay.push({
                        title: item.title,
                        files: item.path.map((filePath, index) => ({
                            path: filePath,
                            fileName: filePath.split('/').pop(),
                            id: `${item._id}-D-${index}`
                        }))
                    });
                });
            }
        }
    }


    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (error || !resource) {
        return (
            <div style={{ minHeight: '100vh', padding: '20px' }}>
                <Toaster />
                <MainNav />
                <div className="container my-5">
                    <h2 className="text-danger">Error</h2>
                    <p>{error || "Resource not found."}</p>
                    <Link to="/go/resources/" className="btn btn-primary">Go back to Resources</Link>
                </div>
                <Footer />
            </div>
        );
    }

    if (!validTypes.includes(type)) {
        return (
            <div className="container my-5" style={{ flexGrow: 1 }}>
                <h2 className="text-danger">Invalid Link Access</h2>
                <p>The selected resource type is invalid. Returning to the resource card page shortly.</p>
                <Link to={`/view-teacher-resource/${resourceId}`} className="btn btn-primary">Go back immediately</Link>
            </div>
        );
    }

    // ✅ حساب العرض الديناميكي للمحتوى الرئيسي
    const totalSidebarWidth = isMenuOpen ? `calc(${SIDEBAR_WIDTH} + ${SLIDE_OUT_WIDTH})` : SIDEBAR_WIDTH;
    const mainWidthStyle = `calc(100% - ${totalSidebarWidth})`; // العرض المتبقي

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Toaster position="top-center" />

            {/* 1. MainNav */}
            <MainNav />

            {/* 2. حاوية Flex للمحتوى والشريط الجانبي (جنباً إلى جنب) */}
            <div style={{ display: 'flex', flexGrow: 1 }}>

                {/* 2.1. الشريط الجانبي */}
                <Sidebar
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    resources={allResources}
                />

                {/* 2.2. المحتوى الرئيسي (Main) */}
                {/* ❌ تم استبدال marginLeftStyle بـ width و flexGrow */}
                <main className="container my-5" style={{
                    flexGrow: 1,
                    width: mainWidthStyle, // ✅ تحديد العرض ليتناسب مع الشريط الجانبي
                    transition: 'width 0.3s ease',
                }}>
                    <p className="breadcrumb-item">
                        <Link to={`/view-teacher-resource/${resourceId}`} style={{ textDecoration: "none", color: "black", fontWeight: "bold" }}>
                            Back to Resource Cards
                        </Link>
                    </p>

                    <h2 className="mb-4">{resource.title} - {pageTitle}</h2>

                    <FileAccordionContent
                        data={dataToDisplay}
                        accordionIdPrefix={type}
                        type={type}
                        resourceId={resourceId}
                    />
                </main>
            </div>

            <Footer />
        </div>
    );
}