import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// FontAwesome React
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faList, faBookmark, faUser, faHeadphones,
    faArrowsAlt, faPlus, faMinus, faSyncAlt, faExpandArrowsAlt,
    faCommentDots, faPencilAlt, faFont, faHighlighter, faTrash,
    faExpand, faChevronLeft, faChevronRight, faTh, faTimes, faSave,
    faVideo, faBookOpen, faBook// 🆕 أضفت faBookOpen لأيقونة الفصل الرقمي
} from '@fortawesome/free-solid-svg-icons';

// react-pdf
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Import your Main Navigation
import MainNav from "../Component/MainNav";

// PDF worker (عدل المسار لو احتجت)
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;
const options = {
    // مسار ملف الـ WASM لصور JPEG 2000
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/',
    // هنا نحدد للمكتبة أين تجد ملفات معالجة الصور JPX
    wasmUrl: window.location.origin + '/wasm/',
};

const SERVER_URL = "https://cambridge-production.up.railway.app/";
// const SERVER_URL = "http://localhost:4000/";

// --- Dummy Data & Helper Components ---

const initialActivity = {};
const initialBookmarks = [];

// Helper component for the Left Sidebar items
const SidebarItem = ({ icon, name, isActive, onClick, color, disabled, tooltip }) => ( // 🆕 أضفت color, disabled, tooltip
    <div
        onClick={onClick}
        title={tooltip || name}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '15px 0', cursor: disabled ? 'not-allowed' : 'pointer', width: '100%',
            backgroundColor: isActive ? '#f0f2f5' : 'transparent',
            color: color || (isActive ? '#1f3e72' : (disabled ? '#ddd' : '#333')), // 🆕 استخدام اللون المخصص أو اللون الرمادي للإيقاف
            borderRight: isActive ? '3px solid #1f3e72' : 'none',
            opacity: disabled ? 0.6 : 1,
        }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: '1.5rem', marginBottom: '5px' }} />
        <span style={{ fontSize: '0.7rem' }}>{name}</span>
    </div>
);

const getPreviewLink = (filePath) => {
    if (!filePath) return "#";

    // إذا كان الملف صفحة ويب أو PDF أو صورة، يفتح مباشرة
    if (filePath.match(/\.(html|htm|pdf|jpg|jpeg|png|gif)$/i)) {
        return filePath;
    }

    // إذا كان ملف Word, PPT, Excel نستخدم عارض جوجل لفتحه في المتصفح
    if (filePath.match(/\.(doc|docx|ppt|pptx|xls|xlsx|ppsx|pptm|potx|potm)$/i)) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(filePath)}&wdAr=1.7777777777777777`;
    }

    // لأي ملفات أخرى
    return filePath;
};

// --- Main Component ---

// 🆕 تم تغيير اسم المكون إلى DigitalBookViewer
const DigitalBookViewer = () => {
    // 1. STATE & HOOKS (TOP LEVEL)
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const glossaryRefs = useRef({});
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(0.6);
    const [pageWidth, setPageWidth] = useState(null);
    const [pageHeight, setPageHeight] = useState(null);
    const [isTwoPageView, setIsTwoPageView] = useState(false); // 🆕 حالة العرض صفحتين

    // Sidebar/Panel State: null | 'menu' | 'bookmarks' | 'activity' | 'dcPageMedia' | 'dcAllMedia' | 'comments'
    // 🆕 تم تعديل الأسماء لتناسب الفصل الرقمي
    const [activePanel, setActivePanel] = useState(null); // 'dcPageMedia' | 'dcAllMedia'

    // Annotations State (Drawing, Text, Highlight)
    const [annotations, setAnnotations] = useState({});

    // Activity and Bookmarks state
    const [myActivity, setMyActivity] = useState(initialActivity);
    const [bookmarks, setBookmarks] = useState(initialBookmarks);

    // active tool: 'pan' | 'pencil' | 'text' | 'highlight' | null
    const [activeTool, setActiveTool] = useState(null);

    // حالة التعليقات المنقولة (لحل خطأ Hooks)
    const [commentText, setCommentText] = useState('');

    // حالة التدوير
    const [rotation, setRotation] = useState(0);



    // refs
    const viewerRef = useRef(null);
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef([]);
    const canvasCtxRef = useRef(null);

    // text editing
    const [editingTextId, setEditingTextId] = useState(null);

    // 2. EFFECTS & LOGIC

    // Fetch book info
    useEffect(() => {
        const fetchBookData = async () => {


            try {
                setLoading(true);
                const response = await axios.get(`${SERVER_URL}user/resource/${id}`);
                setResource(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load book.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookData();
    }, [id]);

    // when pageNumber changes, ensure annotation bucket exists
    useEffect(() => {
        setAnnotations(prev => {
            if (!prev[pageNumber]) {
                return { ...prev, [pageNumber]: { drawings: [], highlights: [], texts: [] } };
            }
            return prev;
        });
    }, [pageNumber]);

    // redraw helper
    const redrawAll = (ctx, page, width, height) => {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        const pageAnn = annotations[page];
        if (!pageAnn) return;

        pageAnn.drawings.forEach(path => {
            drawPath(ctx, path.points, path.color || '#000', path.lineWidth || 2, 1.0);
        });

        pageAnn.highlights.forEach(path => {
            drawPath(ctx, path.points, path.color || 'rgba(255,255,0,0.35)', path.lineWidth || 18, 1.0);
        });
    };

    // drawPath helper
    const drawPath = (ctx, points, color = '#000', lineWidth = 2, globalAlpha = 1.0) => {
        if (!ctx || !points || points.length === 0) return;
        ctx.save();
        ctx.globalAlpha = globalAlpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    };


    // handle resizing of canvas to match page DOM size
    const resizeCanvasToViewer = useCallback(() => {
        const canvas = canvasRef.current;
        const container = viewerRef.current;
        if (!canvas || !container) return;
        const rect = container.getBoundingClientRect();

        // 🆕 حساب العرض المناسب لصفحة واحدة أو صفحتين
        // نطرح قيمة بسيطة (20px) كـ padding/gap بين الصفحات
        let effectiveWidth = rect.width;
        if (isTwoPageView) {
            effectiveWidth = (rect.width - 20) / 2;
        }

        canvas.width = rect.width;
        canvas.height = rect.height;
        // 🆕 نستخدم effectiveWidth
        setPageWidth(effectiveWidth);
        setPageHeight(rect.height);

        const ctx = canvas.getContext('2d');
        canvasCtxRef.current = ctx;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        redrawAll(ctx, pageNumber, rect.width, rect.height);
    }, [pageNumber, annotations, isTwoPageView]); // 🆕 أضف isTwoPageView للتبعية

    useEffect(() => {
        window.addEventListener('resize', resizeCanvasToViewer);
        return () => window.removeEventListener('resize', resizeCanvasToViewer);
    }, [resizeCanvasToViewer]);

    // when annotations change, redraw
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvasCtxRef.current || (canvas ? canvas.getContext('2d') : null);
        if (!canvas || !ctx) return;
        canvasCtxRef.current = ctx;
        redrawAll(ctx, pageNumber, canvas.width, canvas.height);
    }, [annotations, pageNumber]);

    // keyboard: finish editing text on ESC or Enter
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setActiveTool(null);
                setEditingTextId(null);
            }
            if (e.key === 'Enter' && editingTextId) {
                setEditingTextId(null);
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [editingTextId]);


    // --- Core Functions: Annotations, Navigation, etc. ---

    // pointer events for drawing on canvas
    const handlePointerDown = (e) => {
        if (activeTool !== 'pencil' && activeTool !== 'highlight') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isDrawingRef.current = true;
        currentPathRef.current = [{ x, y }];
        const ctx = canvasCtxRef.current || canvas.getContext('2d');
        canvasCtxRef.current = ctx;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handlePointerMove = (e) => {
        if (!isDrawingRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        currentPathRef.current.push({ x, y });
        const ctx = canvasCtxRef.current;
        if (!ctx) return;
        ctx.lineTo(x, y);
        if (activeTool === 'pencil') {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 1.0;
        } else if (activeTool === 'highlight') {
            ctx.strokeStyle = 'rgba(255,204,0,0.35)';
            ctx.lineWidth = 18;
            ctx.globalAlpha = 1.0;
        }
        ctx.stroke();
    };

    const handlePointerUp = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        const pts = currentPathRef.current;
        if (!pts || pts.length < 2) {
            currentPathRef.current = [];
            return;
        }
        const newAnnotation = {
            points: pts,
            color: activeTool === 'highlight' ? 'rgba(255,204,0,0.35)' : '#000',
            lineWidth: activeTool === 'highlight' ? 18 : 2,
            id: `d-${Date.now()}`
        };

        setAnnotations(prev => {
            const pageAnn = prev[pageNumber] || { drawings: [], highlights: [], texts: [] };
            const updated = { ...prev, [pageNumber]: { ...pageAnn } };
            if (activeTool === 'highlight') {
                updated[pageNumber].highlights = [...pageAnn.highlights, newAnnotation];
            } else {
                updated[pageNumber].drawings = [...pageAnn.drawings, newAnnotation];
            }
            return updated;
        });

        setMyActivity(prev => {
            const pageActivities = prev[pageNumber] || [];
            return {
                ...prev,
                [pageNumber]: [...pageActivities, {
                    id: newAnnotation.id,
                    type: activeTool,
                    content: `${activeTool === 'highlight' ? 'تظليل' : 'رسم'} على الصفحة ${pageNumber}.`,
                    date: Date.now()
                }]
            };
        });

        currentPathRef.current = [];
    };

    // TEXT TOOL: on click inside viewer, add a text box at that position
    const handleViewerClick = (e) => {
        if (activeTool !== 'text') return;
        const container = viewerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const id = `t-${Date.now()}`;
        const newText = { id, x, y, content: 'أدخل نص', width: 150, height: 30 };

        setAnnotations(prev => {
            const pageAnn = prev[pageNumber] || { drawings: [], highlights: [], texts: [] };
            const updated = { ...prev, [pageNumber]: { ...pageAnn, texts: [...pageAnn.texts, newText] } };
            return updated;
        });

        setMyActivity(prev => {
            const pageActivities = prev[pageNumber] || [];
            return {
                ...prev,
                [pageNumber]: [...pageActivities, { id, type: 'text', content: 'تم إضافة ملاحظة نصية جديدة.', date: Date.now() }]
            };
        });

        setTimeout(() => setEditingTextId(id), 50);
    };

    // delete ALL annotations for current page (تم إزالة نافذة التأكيد)
    const handleDelete = () => {
        // if (!window.confirm("هل أنت متأكد من حذف جميع التعليقات (رسومات، تظليل، نصوص) من الصفحة الحالية؟")) return;

        setAnnotations(prev => {
            const updated = { ...prev };
            updated[pageNumber] = { drawings: [], highlights: [], texts: [] };
            return updated;
        });

        setMyActivity(prev => ({
            ...prev,
            [pageNumber]: (prev[pageNumber] || []).filter(item => item.type !== 'text' && item.type !== 'pencil' && item.type !== 'highlight')
        }));

        const canvas = canvasRef.current;
        if (canvas && canvasCtxRef.current) {
            canvasCtxRef.current.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // PDF Page Render Callback
    const onPageRenderSuccess = () => {
        resizeCanvasToViewer();
    };

    // page navigation controls
    const goToPage = (p) => setPageNumber(Math.max(1, Math.min(p, numPages || 1)));
    const goToPrevPage = () => goToPage(pageNumber - 1);
    const goToNextPage = () => goToPage(pageNumber + 1);

    // zoom controls
    const zoomIn = () => { setScale(prev => Math.min(prev + 0.1, 2.5)); }; // Max zoom x2.5
    const zoomOut = () => { setScale(prev => Math.max(prev - 0.1, 0.5)); }; // Min zoom x0.5

    // rotation control
    const rotatePage = () => { setRotation(prev => (prev + 90) % 360); };

    // toggle fullscreen
    const toggleFullScreen = () => {
        const elem = document.getElementById('pdf-viewer-container');
        if (elem) {
            if (document.fullscreenElement) document.exitFullscreen();
            else elem.requestFullscreen();
        }
    };

    // 🆕 دالة تبديل وضع عرض صفحتين (Toggle Two-Page View)
    const toggleTwoPageView = () => {
        setIsTwoPageView(prev => !prev);
        // تأخير إعادة الحساب لضمان تحديث DOM
        setTimeout(resizeCanvasToViewer, 50);
    };

    // --- New Functionality: Bookmarks, Activity, Comments ---

    const toggleBookmark = () => {
        setBookmarks(prev => {
            if (prev.includes(pageNumber)) {
                return prev.filter(p => p !== pageNumber);
            } else {
                return [...prev, pageNumber].sort((a, b) => a - b);
            }
        });
    };

    // حذف إشارة مرجعية
    const deleteBookmark = (pageToDelete) => {
        setBookmarks(prev => prev.filter(p => p !== pageToDelete));
    };

    // حذف عنصر نشاط
    const deleteActivity = (page, activityId) => {
        setMyActivity(prev => {
            const updatedPageActivities = (prev[page] || []).filter(act => act.id !== activityId);
            return { ...prev, [page]: updatedPageActivities };
        });

        // إذا كان نوع النشاط هو رسم أو تظليل أو نص، نحتاج لحذفه من Annotations
        setAnnotations(prev => {
            const pageAnn = prev[page] || { drawings: [], highlights: [], texts: [] };
            const updatedAnn = { ...pageAnn };
            updatedAnn.drawings = pageAnn.drawings.filter(a => a.id !== activityId);
            updatedAnn.highlights = pageAnn.highlights.filter(a => a.id !== activityId);
            updatedAnn.texts = pageAnn.texts.filter(a => a.id !== activityId);

            // إعادة رسم الكانفاس إذا كنا في نفس الصفحة
            if (page === pageNumber) {
                const canvas = canvasRef.current;
                const ctx = canvasCtxRef.current || (canvas ? canvas.getContext('2d') : null);
                if (canvas && ctx) {
                    redrawAll(ctx, page, canvas.width, canvas.height);
                }
            }
            return { ...prev, [page]: updatedAnn };
        });
    };

    const handleCommentSave = (newComment) => {
        const id = `c-${Date.now()}`;
        const activityEntry = { id: id, type: 'comment', content: `تعليق جديد: "${newComment.substring(0, 50)}..."`, date: Date.now(), page: pageNumber };

        setMyActivity(prev => {
            const pageActivities = prev[pageNumber] || [];
            return {
                ...prev,
                [pageNumber]: [...pageActivities, activityEntry]
            };
        });
        setCommentText(''); // مسح النص بعد الحفظ
        setActivePanel(null); // إغلاق اللوحة
    };

    // 3. RENDER HELPERS

    // Render Side Panel Logic
    const renderHeader = (title) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#1f3e72' }}>{title}</h3>
            <FontAwesomeIcon icon={faTimes} onClick={() => setActivePanel(null)} style={{ cursor: 'pointer', color: '#888' }} />
        </div>
    );

    const renderSidePanel = () => {
        const baseStyle = {
            width: '500px', background: '#fff', borderLeft: '1px solid #ddd',
            padding: '20px', overflowY: 'auto', zIndex: 3000
        };

        const pdfUrl = resource?.digitalClassroom?.pdfPath || resource?.bookPath;
        const pageMedia = resource?.digitalClassroom?.mediaFiles || [];
        const currentPageDigitalMedia = pageMedia.filter(m => m.pageNumber === pageNumber);

        if (activePanel === 'menu') {
            const thumbnails = Array.from({ length: numPages || 0 }, (_, i) => i + 1); // العرض المصغّر لصفحة واحدة لتبدو كقائمة عمودية
            const THUMBNAIL_WIDTH = 250;
            return (
                <div style={baseStyle}>
                    {renderHeader('Pages')}
                    {/* تعديل: لإظهار كل صفحة تحت الأخرى */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        {thumbnails.map(p => (
                            <div key={p} onClick={() => { goToPage(p); setActivePanel(null); }} style={{ // عرض المصغرة
                                width: `${THUMBNAIL_WIDTH}px`, border: `2px solid ${p === pageNumber ? '#1f3e72' : '#ddd'}`,
                                cursor: 'pointer', backgroundColor: '#fff', borderRadius: '4px', overflow: 'hidden',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ textAlign: 'center', padding: '5px 0', borderBottom: '1px solid #eee', color: '#555', fontSize: '0.8rem' }}>
                                    {/* ترقيم الصفحات */}
                                    {p}
                                </div>
                                {/* عرض الصفحة المصغرة */}
                                <div style={{ padding: '5px' }}>
                                    {/* التأكد من وجود ملف PDF ليتمكن مكون Document من قراءة المستند */}
                                    {pdfUrl && (
                                        <Document file={pdfUrl} loading="Loading...">
                                            <Page pageNumber={p} width={THUMBNAIL_WIDTH - 10} // نطرح 10 لتجنب تجاوز الحجم بسبب الـ Padding
                                                renderTextLayer={false} // لتقليل التعقيد
                                                renderAnnotationLayer={false} // لتقليل التعقيد
                                            />
                                        </Document>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activePanel === 'bookmarks') {
            return (
                <div style={baseStyle}>
                    {renderHeader('Bookmarks')}
                    {bookmarks.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>No bookmarks yet. Click the bookmark icon to add one.</p>
                    ) : (
                        bookmarks.map(p => (
                            <div key={p} style={{ padding: '10px', borderBottom: '1px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span onClick={() => { goToPage(p); setActivePanel(null); }} style={{ cursor: 'pointer', color: p === pageNumber ? '#1f3e72' : '#333' }}>
                                    Page {p}
                                </span>
                                <FontAwesomeIcon icon={faTrash} onClick={() => deleteBookmark(p)} style={{ color: '#dc3545', cursor: 'pointer', marginLeft: '10px' }} title="Remove Bookmark" />
                            </div>
                        ))
                    )}
                </div>
            );
        }

        if (activePanel === 'activity') {
            // تجميع كل الأنشطة من كل الصفحات
            const allActivities = Object.keys(myActivity).flatMap(page => (
                myActivity[page].map(act => ({ ...act, page: parseInt(page) }))
            )).sort((a, b) => b.date - a.date); // أحدث نشاط أولاً

            return (
                <div style={baseStyle}>
                    {renderHeader('My Activity')}
                    {allActivities.length === 0 ? (
                        <p style={{ color: '#888' }}>No activity recorded yet. Try adding notes, drawings, or highlights.</p>
                    ) : (
                        allActivities.map((act) => (
                            <div key={act.id} style={{ padding: '10px', borderBottom: '1px dashed #eee', marginBottom: '8px', backgroundColor: act.page === pageNumber ? '#e6f0ff' : 'transparent', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span onClick={() => { goToPage(act.page); setActivePanel(null); }} style={{ flexGrow: 1, cursor: 'pointer' }}>
                                    <strong>P.{act.page}:</strong> ({act.type}) {act.content}
                                    <small style={{ display: 'block', color: '#888', marginTop: '5px' }}>
                                        {new Date(act.date).toLocaleTimeString()}
                                    </small>
                                </span>
                                {/* زر الحذف المضاف */}
                                <FontAwesomeIcon icon={faTrash} onClick={() => deleteActivity(act.page, act.id)} style={{ color: '#dc3545', cursor: 'pointer', marginLeft: '10px' }} title={`Delete this ${act.type}`} />
                            </div>
                        ))
                    )}
                </div>
            );
        }

        if (activePanel === 'glossary') {
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");
            // ترتيب العناصر بناءً على حقل digitalGlossary
            const sortedGlossary = [...(resource?.digitalGlossary || [])].sort((a, b) =>
                a.term.localeCompare(b.term)
            );

            const scrollToLetter = (letter) => {
                const firstItem = sortedGlossary.find(item =>
                    item.term.toUpperCase().startsWith(letter)
                );
                if (firstItem && glossaryRefs.current[firstItem.term]) {
                    glossaryRefs.current[firstItem.term].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            };

            const availableLetters = new Set(
                sortedGlossary.map(item => item.term[0].toUpperCase())
            );

            return (
                <div style={{ ...baseStyle, padding: '20px 0', display: 'flex', position: 'relative' }}>
                    {/* شريط الحروف الجانبي */}
                    <div style={{
                        width: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRight: '1px solid #eee',
                        padding: '10px 0',
                        height: '100%',
                        backgroundColor: '#fdfdfd'
                    }}>
                        {alphabet.map(letter => {
                            const isAvailable = availableLetters.has(letter);
                            return (
                                <span
                                    key={letter}
                                    onClick={() => isAvailable && scrollToLetter(letter)}
                                    style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        cursor: isAvailable ? 'pointer' : 'default',
                                        color: isAvailable ? '#007eb3' : '#ccc',
                                        marginBottom: '2px',
                                        userSelect: 'none'
                                    }}
                                >
                                    {letter}
                                </span>
                            );
                        })}
                    </div>

                    {/* محتوى الجلوساري */}
                    <div style={{ flexGrow: 1, padding: '0 15px', overflowY: 'auto' }}>
                        <div style={{ paddingBottom: "15px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #e1e0e0ff' }}>
                            <h3 style={{ margin: 0, color: '#1f3e72' }}>Glossary</h3>
                            <FontAwesomeIcon
                                icon={faTimes}
                                onClick={() => setActivePanel(null)}
                                style={{ cursor: 'pointer', color: '#888' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {sortedGlossary.map((item, index) => (
                                <div
                                    key={index}
                                    ref={el => glossaryRefs.current[item.term] = el}
                                    style={{
                                        borderBottom: '1px solid #e1e0e0ff',
                                        paddingBottom: '15px',
                                        textAlign: 'left'
                                    }}
                                >
                                    <h4 style={{
                                        color: '#1f3e72',
                                        fontSize: '1.2rem',
                                        fontWeight: '600',
                                        width: '100%',
                                        textTransform: 'capitalize'
                                    }}>
                                        {item.term}
                                    </h4>

                                    {item.image && (
                                        <div style={{ marginBottom: '15px', width: '100%' }}>
                                            <img
                                                src={item.image}
                                                alt={item.term}
                                                style={{
                                                    maxWidth: '100%',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        fontWeight:"500",
                                        color: '#444',
                                        lineHeight: '1.6',
                                        direction: 'rtl'
                                    }}>
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // 🆕 لوحة الميديا الخاصة بالصفحة الحالية للفصل الرقمي (dcPageMedia)
        if (activePanel === 'dcPageMedia') {
            return (
                <div style={baseStyle}>
                    {renderHeader(`Media (Page ${pageNumber})`)}
                    {currentPageDigitalMedia.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem', padding: '10px' }}>No media files found for this page.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {currentPageDigitalMedia.map((media, index) => (
                                <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#1f3e72' }}>Media {index + 1}</p>
                                    </div>

                                    {/* التمييز بين أنواع الوسائط */}
                                    {media.path.match(/\.(mp3|wav|ogg)$/i) ? (
                                        <audio controls controlsList="nodownload" style={{ width: '100%' }}>
                                            <source src={`${media.path}`} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : media.path.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                        <video
                                            style={{ width: '100%', maxHeight: '180px', backgroundColor: '#000', borderRadius: '4px' }}
                                            controls
                                            controlsList="nodownload noremoteplayback"
                                            disablePictureInPicture
                                            onContextMenu={(e) => e.preventDefault()}
                                        >
                                            <source src={`${media.path}`} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        /* 🎯 تعديل الاكتيفيتي: فتح ملفات الـ Office و الـ HTML في صفحة جديدة */
                                        <a
                                            href={getPreviewLink(media.path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'block', padding: '15px', background: '#e6f0ff', color: '#1f3e72',
                                                textAlign: 'center', borderRadius: '4px', textDecoration: 'none',
                                                fontWeight: 'bold', border: '1px solid #1f3e72'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '8px' }} />
                                            Open Activity
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // -----------------------------------------------------------
        // 2. لوحة الميديا الخاصة بكل الفصول الرقمية (dcAllMedia)
        // -----------------------------------------------------------
        if (activePanel === 'dcAllMedia') {
            const allDigitalMedia = resource?.digitalClassroom?.mediaFiles || [];

            return (
                <div style={baseStyle}>
                    {renderHeader('All Media')}
                    {allDigitalMedia.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem', padding: '20px' }}>No media files found for this digital classroom.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {allDigitalMedia.map((media, index) => (
                                <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#1f3e72' }}>Media {index + 1}</p>
                                        <button
                                            onClick={() => { goToPage(media.pageNumber); setActivePanel(null); }}
                                            style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#1f3e72', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Go to Page {media.pageNumber}
                                        </button>
                                    </div>

                                    {media.path.match(/\.(mp3|wav|ogg)$/i) ? (
                                        <audio controls controlsList="nodownload" style={{ width: '100%' }}>
                                            <source src={`${media.path}`} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : media.path.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                        <video
                                            style={{ width: '100%', maxHeight: '180px', backgroundColor: '#000', borderRadius: '4px' }}
                                            controls
                                            controlsList="nodownload noremoteplayback"
                                            disablePictureInPicture
                                            onContextMenu={(e) => e.preventDefault()}
                                        >
                                            <source src={`${media.path}`} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        /* 🎯 تعديل الاكتيفيتي في قائمة الكل */
                                        <a
                                            href={getPreviewLink(media.path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'block', padding: '15px', background: '#e6f0ff', color: '#1f3e72',
                                                textAlign: 'center', borderRadius: '4px', textDecoration: 'none',
                                                fontWeight: 'bold', border: '1px solid #1f3e72'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '8px' }} />
                                            Open Activity
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // ... (existing panels: comments)
        if (activePanel === 'comments') {
            // ... (rest of comments logic)
        }

        return null;
    };

    // --- RENDER MAIN COMPONENT ---

    const pdfUrl = resource?.digitalClassroom?.pdfPath || resource?.bookPath;
    const isBookmarked = bookmarks.includes(pageNumber);

    const digitalMedia = resource?.digitalClassroom?.mediaFiles || [];
    const currentPageDigitalMedia = digitalMedia.filter(m => m.pageNumber === pageNumber);
    const isDigitalMediaAvailable = currentPageDigitalMedia.length > 0;
    const isAllDigitalMediaAvailable = digitalMedia.length > 0;

    if (loading) return <p style={{ padding: 30 }}>Loading book data...</p>;
    if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>;
    if (!resource) return <p style={{ padding: 30 }}>Book not found.</p>;

    // --- Annotation Renderers ---
    const renderTextBoxes = () => {
        const pageAnn = annotations[pageNumber];
        if (!pageAnn || !pageAnn.texts) return null;
        // ... (rest of renderTextBoxes logic)
    };


    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* MAIN NAV ALWAYS FIXED */}
            <div style={{ position: 'sticky', top: 0, zIndex: 3500 }}>
                <MainNav />
            </div>
            <div style={{ flexGrow: 1, display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
                {/* Sidebar (Left) */}
                <div style={{ width: '70px', background: '#fff', borderRight: '1px solid #ddd', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: "15px", alignItems: 'center', zIndex: 3000 }}>
                    {/* 🆕 إضافة أيقونات Digital Classroom Media بدلاً من Audio و Video */}
                    {[
                        { name: 'Menu', icon: faList, panel: 'menu' },
                        { name: 'Bookmarks', icon: faBookmark, panel: 'bookmarks' },
                        { name: 'My Activity', icon: faUser, panel: 'activity' },
                        {
                            name: 'Glossary',
                            icon: faBook,
                            panel: 'glossary',
                            // يظهر فقط إذا كان هناك بيانات في الـ digitalGlossary
                            show: resource?.digitalGlossary && resource.digitalGlossary.length > 0,
                        },
                        {
                            name: 'Media', // 🆕 DC Media for Current Page
                            icon: faBookOpen, // 🆕 أيقونة الفصل الرقمي
                            panel: 'dcPageMedia', // 🆕 اسم اللوحة الجديد
                            disabled: !isDigitalMediaAvailable,
                            tooltip: isDigitalMediaAvailable ? `View Media for Page ${pageNumber}` : 'No Media for this page',
                            color: activePanel === 'dcPageMedia' ? '#1f3e72' : undefined
                        },
                        {
                            name: 'All Media', // 🆕 All DC Media
                            icon: faBookOpen, // 🆕 أيقونة الفصل الرقمي
                            panel: 'dcAllMedia', // 🆕 اسم اللوحة الجديد
                            disabled: !isAllDigitalMediaAvailable,
                            // 🚀 تم إصلاح هذه الدالة
                            onClick: () => {
                                if (isAllDigitalMediaAvailable) {
                                    // تم استخدام اسم اللوحة مباشرة
                                    setActivePanel(prev => prev === 'dcAllMedia' ? null : 'dcAllMedia');
                                }
                            },
                            color: activePanel === 'dcAllMedia' ? '#1f3e72' : '#333' // لتمييزها عن أيقونة الصفحة الواحدة
                        }
                    ].map(tool => (
                        <SidebarItem
                            key={tool.name}
                            icon={tool.icon}
                            name={tool.name}
                            isActive={activePanel === tool.panel}
                            onClick={tool.onClick || (() => setActivePanel(prev => prev === tool.panel ? null : tool.panel))}
                            color={tool.color}
                            disabled={tool.disabled}
                            tooltip={tool.tooltip}
                        />
                    ))}
                </div>

                {/* Side Panel (Right) */}
                {['menu', 'bookmarks', 'activity', 'comments', 'dcPageMedia', 'dcAllMedia', 'glossary'].includes(activePanel) && (
                    renderSidePanel() // ✅ تم إصلاح الخطأ: تم استدعاء الدالة كدالة (function call) بدلاً من مكون (Component)
                )}

                {/* PDF VIEWER */}
                <div id="pdf-viewer-container" style={{ flexGrow: 1, overflowY: 'auto', position: 'relative', background: '#f0f2f5' }} onClick={handleViewerClick} >

                    {/* Tools Bar (Right side of PDF) */}
                    {/* 🚀 تم تعديل هذا التنسيق لجعله يمتد بطول الشاشة */}
                    <div style={{
                        position: 'fixed',
                        top: '65px', // يبدأ بعد شريط الملاحة العلوي
                        right: '0',
                        bottom: '60px', // ينتهي قبل شريط التنقل السفلي
                        width: '60px',
                        padding: '10px 0',
                        background: '#fff',
                        borderLeft: '1px solid #ddd',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: "center",
                        zIndex: 2000,
                        overflowY: 'auto'
                    }}>
                        {[
                            { icon: faArrowsAlt, action: () => setActiveTool(null), title: "Pan/Select", isActive: activeTool === null },
                            { icon: faPlus, action: zoomIn, title: "Zoom In" },
                            { icon: faMinus, action: zoomOut, title: "Zoom Out" },
                            // 🆕 زر تبديل عرض صفحتين/صفحة واحدة
                            {
                                icon: faBookOpen,
                                action: toggleTwoPageView,
                                title: isTwoPageView ? "صفحة واحدة" : "صفحتين",
                                color: isTwoPageView ? '#1f3e72' : '#333'
                            },
                            // ربط الأيقونة بدالة rotatePage
                            { icon: faExpandArrowsAlt, action: toggleFullScreen, title: "Toggle Fullscreen" },
                            { icon: faBookmark, action: toggleBookmark, title: isBookmarked ? "Remove Bookmark" : "Add Bookmark", color: isBookmarked ? '#f0ad4e' : '#333' }
                        ].map((tool, index) => (
                            <div
                                key={index}
                                onClick={tool.action}
                                title={tool.title}
                                style={{
                                    padding: '12px 0', textAlign: 'center', cursor: 'pointer',
                                    color: tool.isActive || tool.color ? tool.color : '#333'
                                }}>
                                <FontAwesomeIcon icon={tool.icon} />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px', paddingBottom: '120px' }} ref={viewerRef}>
                        {pdfUrl && (
                            <Document file={pdfUrl} options={options} onLoadSuccess={({ numPages: n }) => { setNumPages(n); resizeCanvasToViewer(); }} loading={<p>Loading PDF...</p>} >
                                {/* 🆕 تعديل عرض الصفحة لدعم صفحتين */}
                                <div style={{ display: 'flex', flexDirection: 'row', gap: isTwoPageView ? '20px' : '0' }}>

                                    {/* الصفحة الحالية (دائماً تظهر) */}
                                    <Page
                                        pageNumber={pageNumber}
                                        scale={scale}
                                        width={pageWidth}
                                        rotate={rotation}
                                        onRenderSuccess={onPageRenderSuccess}
                                    />

                                    {/* الصفحة التالية (تظهر فقط في وضع الصفحتين ولا تكون الأخيرة) */}
                                    {isTwoPageView && (pageNumber + 1) <= (numPages || 1) && (
                                        <Page
                                            pageNumber={pageNumber + 1}
                                            scale={scale}
                                            width={pageWidth}
                                            rotate={rotation}
                                        />
                                    )}
                                </div>
                            </Document>
                        )}
                        {/* overlay canvas for drawings */}
                        <canvas ref={canvasRef}
                            style={{
                                position: 'absolute',
                                left: (viewerRef.current ? viewerRef.current.getBoundingClientRect().left : 0),
                                top: (viewerRef.current ? viewerRef.current.getBoundingClientRect().top : 0),
                                zIndex: 2000,
                                pointerEvents: activeTool === 'pencil' || activeTool === 'highlight' ? 'auto' : 'none',
                                cursor: (activeTool === 'pencil' || activeTool === 'highlight') ? 'crosshair' : 'default',
                            }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        />

                        {/* Textboxes overlay */}
                        {renderTextBoxes()}
                    </div>

                    {/* Footer Controls (Page Nav) */}
                    <div style={{
                        position: 'fixed', bottom: 0, left: '60px', right: '0', height: '60px',
                        background: '#fff', borderTop: '1px solid #ddd', zIndex: 3000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* Zoom controls */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {/* Pan/Select */}
                                <div title="Pan" onClick={() => setActiveTool(null)} style={{ cursor: 'pointer', color: activeTool === null ? '#1f3e72' : '#333' }}>
                                    <FontAwesomeIcon icon={faArrowsAlt} />
                                </div>
                                {/* Pencil */}
                                <div title="Pencil" onClick={() => setActiveTool(prev => prev === 'pencil' ? null : 'pencil')} style={{ cursor: 'pointer', color: activeTool === 'pencil' ? '#1f3e72' : '#333' }}>
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                </div>
                                {/* Text Note */}
                                <div title="Text Note" onClick={() => setActiveTool(prev => prev === 'text' ? null : 'text')} style={{ cursor: 'pointer', color: activeTool === 'text' ? '#1f3e72' : '#333' }}>
                                    <FontAwesomeIcon icon={faFont} />
                                </div>
                                {/* Highlight */}
                                <div title="Highlight" onClick={() => setActiveTool(prev => prev === 'highlight' ? null : 'highlight')} style={{ cursor: 'pointer', color: activeTool === 'highlight' ? '#1f3e72' : '#333' }}>
                                    <FontAwesomeIcon icon={faHighlighter} />
                                </div>
                                {/* Trash/Delete */}
                                <div title="Delete all annotations on current page" onClick={handleDelete} style={{ cursor: 'pointer' }}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </div>
                                {/* Fullscreen */}
                                <div title="Fullscreen" onClick={toggleFullScreen} style={{ cursor: 'pointer' }}>
                                    <FontAwesomeIcon icon={faExpand} />
                                </div>
                            </div>
                            <div style={{ borderLeft: '1px solid #eee', height: '30px' }}></div>
                            {/* Page Navigation */}
                            <FontAwesomeIcon icon={faChevronLeft}
                                onClick={goToPrevPage}
                                style={{
                                    cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                                    color: pageNumber <= 1 ? '#aaa' : '#333'
                                }} />

                            <input
                                type="number"
                                value={pageNumber}
                                onChange={(e) => {
                                    const n = parseInt(e.target.value);
                                    if (!isNaN(n) && n >= 1 && n <= (numPages || 9999)) goToPage(n);
                                }}
                                style={{ width: '70px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '3px' }} />

                            <FontAwesomeIcon icon={faChevronRight}
                                onClick={goToNextPage}
                                style={{
                                    cursor: pageNumber >= (numPages || 1) ? 'not-allowed' : 'pointer',
                                    color: pageNumber >= (numPages || 1) ? '#aaa' : '#333'
                                }} />

                            {/* Thumbnail button: Opens the 'menu' side panel */}
                            <div onClick={() => setActivePanel(prev => prev === 'menu' ? null : 'menu')} title="Open Page Thumbnails" style={{
                                marginLeft: '10px', width: '30px', height: '30px',
                                background: activePanel === 'menu' ? '#1f3e72' : '#333', borderRadius: '4px', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer'
                            }}>
                                <FontAwesomeIcon icon={faTh} />
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

// 🆕 تم تغيير اسم التصدير
export default DigitalBookViewer;