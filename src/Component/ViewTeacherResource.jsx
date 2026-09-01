import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import "../Style/btn.css"

// Import UI components
import MainNav from "./MainNav";
import Footer from "./Footer";

// FontAwesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilePdf, 
    faVolumeUp, 
    faBookOpen, 
    faFileLines, 
    faChalkboardTeacher, 
    faBars,
    faCircleQuestion, 
    faUserGraduate 
} from '@fortawesome/free-solid-svg-icons';

// -----------------------------------------------------------
// 1. الثوابت
// -----------------------------------------------------------
const BASE_URL = 'https://api.icfls.com/';
const BACKEND_URL = "https://api.icfls.com"; 
const SIDEBAR_WIDTH = '70px'; 
const SLIDE_OUT_WIDTH = '280px'; 


// -----------------------------------------------------------
// 2. Sidebar Component
// -----------------------------------------------------------
const Sidebar = ({ isMenuOpen, setIsMenuOpen, resources }) => { 
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
        <div style={{
            flexShrink: 0, 
            display: 'flex',
            transition: "all 0.3s ease",
            overflow: 'hidden',
            width: isMenuOpen ? `calc(${SIDEBAR_WIDTH} + ${SLIDE_OUT_WIDTH})` : SIDEBAR_WIDTH,
        }}>
            <div style={{
                width: SIDEBAR_WIDTH,
                backgroundColor: '#12262d',
                paddingTop: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                minHeight: '100%', 
                height: 'auto' 
            }}>
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

                {mainItems.filter(item => item.icon).map((item) => (
                    <Link key={item.name} to={item.path || '#'} title={item.name} style={{
                        color: item.active ? '#ADD8E6' : 'white',
                        fontSize: '1.5rem',
                    }}>
                        {item.icon && <FontAwesomeIcon icon={item.icon} />}
                    </Link>
                ))}
            </div>

            <div style={{
                width: isMenuOpen ? SLIDE_OUT_WIDTH : '0',
                backgroundColor: '#12262d',
                overflowY: 'auto', 
                overflowX: 'hidden',
                transition: 'width 0.3s',
                height: 'auto',
                paddingTop: '10px'
            }}>
                <h6 style={{ 
                    color: 'white', 
                    padding: '15px 20px', 
                    fontWeight: 'bold',
                    marginTop: "10px",
                    marginBottom: "10px" 
                }}>
                    {mainItems[0].name}
                </h6>
                
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
                                gap: "15px",
                                fontSize: "14px",
                            }}
                        >
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};


// -----------------------------------------------------------
// 3. Resource Card Component (تعديل لدعم فتح في نافذة جديدة)
// -----------------------------------------------------------
const ResourceCard = ({ title, description, linkTo, icon, type, openInNewTab = false }) => {
    return (
        <Link 
            to={linkTo} 
            // ✅ إذا كان openInNewTab صحيحاً، سيفتح في نافذة جديدة
            target={openInNewTab ? "_blank" : "_self"} 
            rel={openInNewTab ? "noopener noreferrer" : ""}
            className="col-lg-3 col-md-6 mb-4 text-decoration-none"
            style={{ color: 'inherit' }}
        >
            <div className="card h-100 shadow-sm border-0 resource-card-hover" style={{ minHeight: '220px', transition: 'all 0.3s' }}>
                <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                        <div className="p-3 me-3 rounded-circle bg-light d-flex justify-content-center align-items-center" style={{ width: '50px', height: '50px' }}>
                            <FontAwesomeIcon 
                                icon={icon} 
                                className="fa-2x" 
                                style={{ 
                                    color: type === 'digital' ? '#20c997' : 
                                           type === 'audio' ? '#0d6efd' : 
                                           type === 'answers' ? '#dc3545' : 
                                           '#ffc107' 
                                }}
                            />
                        </div>
                        <h5 className="card-title mb-0">{title}</h5>
                    </div>
                    <p className="card-text text-muted small flex-grow-1">{description}</p>
                    <div className="mt-auto pt-2 border-top">
                        <span className="badge bg-primary">View</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};


// -----------------------------------------------------------
// 4. ViewTeacherResource
// -----------------------------------------------------------
export default function ViewTeacherResource() {
    const { resourceId } = useParams();
    const [resource, setResource] = useState(null);
    const [allResources, setAllResources] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); 

    const fetchAllResources = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get(`${BACKEND_URL}/user/activated-resources`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllResources(response.data);
        } catch (err) { console.error(err); }
    };

    const fetchResourceDetails = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}user/resource/${resourceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResource(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to load resource details.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllResources(); 
        fetchResourceDetails();
    }, [resourceId]);

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

    if (error || !resource) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <MainNav />
                <div className="container my-5" style={{ flexGrow: 1 }}>
                    <h2 className="text-danger">Error</h2>
                    <p>{error || "Resource not found."}</p>
                    <Link to="/go/resources/" className="btn btn-primary">Go back</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const audioVideosLink = (resource.pageAudios?.length > 0 || resource.pageVideos?.length > 0) 
        ? `/resource/${resourceId}/audio-videos` : null;
        
    const answersLink = resource.answers?.length > 0
        ? `/resource/${resourceId}/answers` : null;
        
    const downloadableLink = resource.downloadableResources?.length > 0
        ? `/resource/${resourceId}/downloadable-files` : null;

    const hasDigitalClassroom = resource.digitalClassroom && resource.digitalClassroom.pdfPath;
    const fullBookPath = resource.bookPath; 

    const totalSidebarWidth = isMenuOpen ? `calc(${SIDEBAR_WIDTH} + ${SLIDE_OUT_WIDTH})` : SIDEBAR_WIDTH;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Toaster position="top-center" />
            <MainNav />

            <div style={{ display: 'flex', flexGrow: 1 }}>
                <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} resources={allResources} />

                <main className="container my-5" style={{ 
                    transition: 'all 0.3s ease', 
                    flexGrow: 1, 
                    width: `calc(100% - ${totalSidebarWidth})`,
                    paddingLeft: '20px'
                }}>
                    <h2 className="mb-5">{resource.title}</h2>

                    {/* القسم 1: Supporting Resources */}
                    {(audioVideosLink || answersLink) && (
                        <>
                            <h5 className="mb-3">Supporting Resources</h5>
                            <div className="row g-4 mb-5">
                                {audioVideosLink && (
                                    <ResourceCard
                                        title="Media"
                                        description="Download all page audio and video files linked to the resource."
                                        icon={faVolumeUp}
                                        type="audio"
                                        linkTo={audioVideosLink}
                                    />
                                )}
                                {answersLink && (
                                    <ResourceCard
                                        title="Answers"
                                        description="Coursebook and workbook answer keys."
                                        icon={faFilePdf}
                                        type="answers"
                                        linkTo={answersLink}
                                    />
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* القسم 2: Teacher Resources */}
                    {(downloadableLink || hasDigitalClassroom || fullBookPath) && (
                        <>
                            <h5 className="mb-3">Teacher Resources</h5>
                            <div className="row g-4">
                                {downloadableLink && (
                                    <ResourceCard
                                        title="Downloadable Resources"
                                        description="Access files, worksheets, and extra material."
                                        icon={faFileLines}
                                        type="downloadable"
                                        linkTo={downloadableLink}
                                    />
                                )}

                                {/* ✅ تم إضافة openInNewTab هنا */}
                                {hasDigitalClassroom && (
                                    <ResourceCard
                                        title="Digital Classroom"
                                        description="Projectable version optimized for interactive whiteboards."
                                        icon={faChalkboardTeacher}
                                        type="digital"
                                        linkTo={`/view-digital-book/${resourceId}`}
                                        openInNewTab={true} 
                                    />
                                )}

                                {/* ✅ تم إضافة openInNewTab هنا */}
                                {fullBookPath && (
                                    <ResourceCard
                                        title="View Teacher Resource Book"
                                        description="Direct reading of the main resource book."
                                        icon={faBookOpen}
                                        type="pdf"
                                        linkTo={`/TeacherBookViewer/${resourceId}`}
                                        openInNewTab={true}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}