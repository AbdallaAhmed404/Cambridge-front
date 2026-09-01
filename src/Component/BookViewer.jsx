import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// FontAwesome React
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faList, faBookmark, faUser, faHeadphones,
    faArrowsAlt, faPlus, faMinus, faSyncAlt, faExpandArrowsAlt,
    faCommentDots, faPencilAlt, faFont, faHighlighter, faTrash,
    faExpand, faChevronLeft, faChevronRight, faTh, faTimes, faSave, faBook,
    faVideo
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

const SERVER_URL = "https://api.icfls.com/";
// const SERVER_URL = "http://localhost:4000/";

// --- Dummy Data & Helper Components ---

const initialActivity = {};
const initialBookmarks = [];

// Helper component for the Left Sidebar items
const SidebarItem = ({ icon, name, isActive, onClick }) => (
    <div
        onClick={onClick}
        title={name}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '15px 0', cursor: 'pointer', width: '100%',
            backgroundColor: isActive ? '#f0f2f5' : 'transparent',
            color: isActive ? '#1f3e72' : '#333',
            borderRight: isActive ? '3px solid #1f3e72' : 'none'
        }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: '1.5rem', marginBottom: '5px' }} />
        <span style={{ fontSize: '0.7rem' }}>{name}</span>
    </div>
);

// --- Main Component ---

const BookViewer = () => {
    // 1. STATE & HOOKS (TOP LEVEL)
    const { id } = useParams();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(0.6);
    const [pageWidth, setPageWidth] = useState(null);
    const [pageHeight, setPageHeight] = useState(null);
    const glossaryRefs = useRef({});
    // Sidebar/Panel State: null | 'menu' | 'bookmarks' | 'activity' | 'audio' | 'video' | 'comments'
    const [activePanel, setActivePanel] = useState(null);

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
        canvas.width = rect.width;
        canvas.height = rect.height;
        setPageWidth(rect.width);
        setPageHeight(rect.height);
        const ctx = canvas.getContext('2d');
        canvasCtxRef.current = ctx;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        redrawAll(ctx, pageNumber, rect.width, rect.height);
    }, [pageNumber, annotations]);

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

        if (activeTool === 'highlight' || activeTool === 'pencil') {
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
        }
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

    // toggle fullscreen
    const toggleFullScreen = () => {
        const elem = document.getElementById('pdf-viewer-container');
        if (elem) {
            if (document.fullscreenElement) document.exitFullscreen();
            else elem.requestFullscreen();
        }
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
        const activityEntry = {
            id: id,
            type: 'comment',
            content: `تعليق جديد: "${newComment.substring(0, 50)}..."`,
            date: Date.now()
        };
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

    // --- Zoom controls ---

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.1, 1)); // Max zoom x2.5
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.1, 0.2)); // Min zoom x0.5
    };

    // --- Rotation Functionality ---
    const rotatePage = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    // 3. COMPUTED VALUES & EARLY RETURNS (AFTER ALL HOOKS)

    const pdfUrl = resource?.bookPath ? `${resource.bookPath}` : null;
    const isBookmarked = bookmarks.includes(pageNumber);

    // 🆕 منطق جلب الوسائط للصفحة الحالية
    const getCurrentPageMedia = (mediaArray) => {
        if (!mediaArray || !Array.isArray(mediaArray)) return [];
        // يتم التصفية بناءً على رقم الصفحة الحالي (pageNumber)
        return mediaArray.filter(media => media.pageNumber === pageNumber);
    };

    const currentPageAudios = getCurrentPageMedia(resource?.pageAudios);
    const currentPageVideos = getCurrentPageMedia(resource?.pageVideos);

    // 🆕 تحديد ما إذا كان الشريط الجانبي للصوت/الفيديو متاحًا
    const isAudioAvailable = currentPageAudios.length > 0;
    const isVideoAvailable = currentPageVideos.length > 0;

    if (loading) return <p style={{ padding: 30 }}>Loading...</p>;
    if (error) return <p style={{ padding: 30, color: 'red' }}>{error}</p>;
    if (!resource) return <p style={{ padding: 30 }}>Book not found.</p>;


    // --- Annotation Renderers ---

    const renderTextBoxes = () => {
        const pageAnn = annotations[pageNumber];
        if (!pageAnn || !pageAnn.texts) return null;
        return pageAnn.texts.map(text => (
            <div
                key={text.id}
                style={{
                    position: 'absolute',
                    left: text.x,
                    top: text.y,
                    minWidth: text.width,
                    minHeight: text.height,
                    cursor: 'text',
                    padding: '2px 6px',
                    background: editingTextId === text.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.0)',
                    color: '#000',
                    border: editingTextId === text.id ? '1px dashed #1f3e72' : 'none',
                    borderRadius: '3px',
                    zIndex: 2500,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: editingTextId === text.id ? '0 0 5px rgba(0,0,0,0.1)' : 'none'
                }}
                contentEditable={editingTextId === text.id}
                suppressContentEditableWarning={true}
                onDoubleClick={() => {
                    setActiveTool('text');
                    setEditingTextId(text.id);
                }}
                onBlur={(e) => {
                    if (editingTextId === text.id) {
                        const newContent = e.target.innerText;
                        setAnnotations(prev => {
                            const pageAnn = prev[pageNumber] || { drawings: [], highlights: [], texts: [] };
                            const texts = pageAnn.texts.map(t => t.id === text.id ? { ...t, content: newContent } : t);
                            return { ...prev, [pageNumber]: { ...pageAnn, texts } };
                        });
                        setMyActivity(prev => {
                            const pageActivities = prev[pageNumber] || [];
                            const updatedActivities = pageActivities.map(a => a.id === text.id ? { ...a, content: `ملاحظة نصية: "${newContent.substring(0, 30)}..."` } : a);
                            return { ...prev, [pageNumber]: updatedActivities };
                        });
                        setEditingTextId(null);
                    }
                }}
                onMouseDown={(ev) => {
                    ev.stopPropagation();

                    if (editingTextId !== text.id) {
                        const startX = ev.clientX;
                        const startY = ev.clientY;
                        const initX = text.x;
                        const initY = text.y;

                        const onMouseMove = (me) => {
                            const dx = me.clientX - startX;
                            const dy = me.clientY - startY;
                            setAnnotations(prev => {
                                const pageAnn = prev[pageNumber] || { drawings: [], highlights: [], texts: [] };
                                const texts = pageAnn.texts.map(t => t.id === text.id ? { ...t, x: initX + dx, y: initY + dy } : t);
                                return { ...prev, [pageNumber]: { ...pageAnn, texts } };
                            });
                        };
                        const onMouseUp = () => {
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                        };
                        window.addEventListener('mousemove', onMouseMove);
                        window.addEventListener('mouseup', onMouseUp);
                    }
                }}
            >
                {text.content}
            </div>
        ));
    };

    // --- Side Panel Components (المكونات الداخلية) ---

    const RenderSidePanel = () => {
        const baseStyle = {
            width: '500px',
            background: '#fff',
            borderRight: '1px solid #ddd',
            padding: '20px',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
            overflowY: 'auto',
            zIndex: 2800
        };

        const openVideoInNewTab = (videoPath) => {
            // بناء المسار الكامل باستخدام SERVER_URL
            const fullUrl = `${videoPath}`;

            // فتح نافذة جديدة مع هذا المسار
            window.open(fullUrl, '_blank');
        };

        const renderHeader = (title) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#1f3e72' }}>{title}</h3>
                <FontAwesomeIcon icon={faTimes} onClick={() => setActivePanel(null)} style={{ cursor: 'pointer', color: '#888' }} />
            </div>
        );

        if (activePanel === 'menu') {
            const thumbnails = Array.from({ length: numPages || 0 }, (_, i) => i + 1);
            // العرض المصغّر لصفحة واحدة لتبدو كقائمة عمودية
            const THUMBNAIL_WIDTH = 250;

            return (
                <div style={baseStyle}>
                    {renderHeader('Pages')}
                    {/* تعديل: لإظهار كل صفحة تحت الأخرى */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        {thumbnails.map(p => (
                            <div key={p}
                                onClick={() => { goToPage(p); setActivePanel(null); }}
                                style={{
                                    // عرض المصغرة
                                    width: `${THUMBNAIL_WIDTH}px`,
                                    border: `2px solid ${p === pageNumber ? '#1f3e72' : '#ddd'}`,
                                    cursor: 'pointer', backgroundColor: '#fff',
                                    borderRadius: '4px', overflow: 'hidden',
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
                                            <Page
                                                pageNumber={p}
                                                width={THUMBNAIL_WIDTH - 10} // نطرح 10 لتجنب تجاوز الحجم بسبب الـ Padding
                                                renderTextLayer={false} // لتقليل التعقيد وتحسين الأداء في العرض المصغّر
                                                renderAnnotationLayer={false} // لتقليل التعقيد وتحسين الأداء في العرض المصغّر
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
                        <p style={{ color: '#888' }}>No bookmarks saved yet.</p>
                    ) : (
                        bookmarks.map(p => (
                            <div key={p}
                                style={{
                                    padding: '10px', borderBottom: '1px solid #eee',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: p === pageNumber ? '#e6f0ff' : 'transparent',
                                }}>
                                <span onClick={() => { goToPage(p); setActivePanel(null); }} style={{ flexGrow: 1, cursor: 'pointer' }}>
                                    Page {p}
                                </span>
                                {/* زر الحذف المضاف */}
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    onClick={() => deleteBookmark(p)}
                                    style={{ color: '#dc3545', cursor: 'pointer', marginLeft: '10px' }}
                                    title={`Delete bookmark from Page ${p}`}
                                />
                            </div>
                        ))
                    )}
                </div>
            );
        }

        if (activePanel === 'activity') {
            const allActivities = Object.keys(myActivity).sort((a, b) => parseInt(a) - parseInt(b)).flatMap(page => (
                myActivity[page].map(activity => ({ ...activity, page: parseInt(page) }))
            ));

            return (
                <div style={baseStyle}>
                    {renderHeader('My Activity ')}
                    {allActivities.length === 0 ? (
                        <p style={{ color: '#888' }}>No activity recorded yet. Try adding notes, drawings, or highlights.</p>
                    ) : (
                        allActivities.map((act) => (
                            <div key={act.id}
                                style={{
                                    padding: '10px', borderBottom: '1px dashed #eee', marginBottom: '8px',
                                    backgroundColor: act.page === pageNumber ? '#e6f0ff' : 'transparent',
                                    borderRadius: '4px', fontSize: '0.9rem',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                <span onClick={() => { goToPage(act.page); setActivePanel(null); }} style={{ flexGrow: 1, cursor: 'pointer' }}>
                                    <strong>P.{act.page}:</strong> ({act.type}) {act.content}
                                    <small style={{ display: 'block', color: '#888', marginTop: '5px' }}>
                                        {new Date(act.date).toLocaleTimeString()}
                                    </small>
                                </span>
                                {/* زر الحذف المضاف */}
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    onClick={() => deleteActivity(act.page, act.id)}
                                    style={{ color: '#dc3545', cursor: 'pointer', marginLeft: '10px' }}
                                    title={`Delete this ${act.type}`}
                                />
                            </div>
                        ))
                    )}
                </div>
            );
        }

        if (activePanel === 'audio') {
            return (
                <div style={baseStyle}>
                    {renderHeader(`Audio Resources (Page ${pageNumber})`)}
                    {currentPageAudios.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>No audio files found for this page.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {currentPageAudios.map((audio, index) => (
                                <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#1f3e72' }}>Audio {index + 1}</p>
                                    <audio controls controlsList="nodownload" style={{ width: '100%' }}>
                                        {/* استخدام المسار الكامل لملف الصوت */}
                                        <source src={`${audio.path}`} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // ... (داخل دالة RenderSidePanel)

        if (activePanel === 'allAudios') {
            // يجب التأكد أن resource.pageAllAudios يحتوي على رقم الصفحة (pageNumber) ومسار الملف (path)
            const allAudios = resource?.pageAudios || [];
            return (
                <div style={baseStyle}>
                    {renderHeader('All Audio Resources')}
                    {allAudios.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>No audio files found for this book.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {allAudios.map((audio, index) => (
                                <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#1f3e72' }}>Audio {index + 1}</p>
                                        {/* زر التنقل للصفحة */}
                                        <button
                                            onClick={() => { goToPage(audio.pageNumber); setActivePanel(null); }}
                                            style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#1f3e72', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Page {audio.pageNumber}
                                        </button>
                                    </div>

                                    <audio controls controlsList="nodownload" style={{ width: '100%' }}>
                                        <source src={`${audio.path}`} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // ... (inside RenderSidePanel)

        if (activePanel === 'video') {
            return (
                <div style={baseStyle}>
                    {renderHeader(`Video Resources (Page ${pageNumber})`)}
                    {currentPageVideos.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>No video files found for this page.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {currentPageVideos.map((video, index) => (
                                <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9', position: 'relative' }}>

                                    <video
                                        style={{
                                            width: '100%',
                                            maxHeight: '180px',
                                            backgroundColor: '#000',
                                            borderRadius: '4px',
                                        }}
                                        controls
                                        controlsList="nodownload noremoteplayback"
                                        disablePictureInPicture
                                        onContextMenu={(e) => e.preventDefault()}

                                    >
                                        {/* استخدام المسار الكامل لملف الفيديو */}
                                        <source src={`${video.path}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }


        // ... (داخل دالة RenderSidePanel)

        if (activePanel === 'allVideos') {
            // يجب التأكد أن resource.pageAllVideos يحتوي على رقم الصفحة (pageNumber) ومسار الملف (path)
            const allVideos = resource?.pageVideos || [];
            return (
                <div style={baseStyle}>
                    {renderHeader('All Video Resources')}
                    {allVideos.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem', padding: '20px' }}>No video files found for this book.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {allVideos.map((video, index) => (
                                <div key={index} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#1f3e72' }}>Video {index + 1}</p>
                                        {/* زر التنقل للصفحة */}
                                        <button
                                            onClick={() => { goToPage(video.pageNumber); setActivePanel(null); }}
                                            style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#1f3e72', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Page {video.pageNumber}
                                        </button>
                                    </div>

                                    <video
                                        style={{ width: '100%', maxHeight: '180px', backgroundColor: '#000', borderRadius: '4px' }}
                                        controls
                                        controlsList="nodownload noremoteplayback"
                                        disablePictureInPicture
                                        onContextMenu={(e) => e.preventDefault()}
                                    >
                                        <source src={`${video.path}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        // ... (باقي الـ RenderSidePanel)

        if (activePanel === 'comments') {
            return (
                <div style={{ ...baseStyle, position: 'absolute', right: 0, top: 0, height: '100%', borderLeft: '1px solid #ddd', borderRight: 'none', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)' }}>
                    {renderHeader('Add New Note')}
                    <p style={{ marginBottom: '15px', fontSize: '0.9rem' }}>Create a standalone note for the current page ({pageNumber}).</p>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Type your comment or note here..."
                        rows="6"
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                    />
                    <button
                        onClick={() => handleCommentSave(commentText)}
                        disabled={commentText.trim().length === 0}
                        style={{
                            marginTop: '15px', padding: '10px 15px', width: '100%',
                            background: commentText.trim().length === 0 ? '#aaa' : '#1f3e72',
                            color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}>
                        <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                        Save Note
                    </button>
                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <h4 style={{ color: '#333', fontSize: '1rem' }}>Related Annotations on P.{pageNumber}</h4>
                        {(myActivity[pageNumber] || []).map((act, index) => (
                            <div key={index} style={{ padding: '8px 0', borderBottom: '1px dotted #eee', fontSize: '0.85rem' }}>
                                <strong>[{act.type}]</strong> {act.content}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activePanel === 'glossary') {
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");
            const sortedGlossary = [...(resource?.glossary || [])].sort((a, b) =>
                a.term.localeCompare(b.term)
            );

            // دالة التمرير للحرف المطلوب
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

            // استخراج الحروف المتاحة فعلياً في المصطلحات لتلوينها
            const availableLetters = new Set(
                sortedGlossary.map(item => item.term[0].toUpperCase())
            );

            return (
                <div style={{ ...baseStyle, padding: '20px 0', display: 'flex', position: 'relative' }}>
                    {/* 1. شريط الحروف الجانبي (Alphabet Sidebar) */}
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
                                        color: isAvailable ? '#007eb3' : '#ccc', // أزرق مثل الصورة أو رمادي
                                        marginBottom: '2px',
                                        userSelect: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => isAvailable && (e.target.style.color = '#005f86')}
                                    onMouseLeave={(e) => isAvailable && (e.target.style.color = '#007eb3')}
                                >
                                    {letter}
                                </span>
                            );
                        })}
                    </div>

                    {/* 2. محتوى القاموس */}
                    <div style={{ flexGrow: 1, padding: '0 15px', overflowY: 'auto' }}>
                        <div style={{ paddingBottom:"15px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' , borderBottom: '1px solid #e1e0e0ff',}}>
                            <h3 style={{ margin: 0 , color: '#1f3e72' }}>Glossary</h3>
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
                                    ref={el => glossaryRefs.current[item.term] = el} // ربط العنصر بـ ref
                                    style={{
                                        borderBottom: '1px solid #e1e0e0ff',
                                        paddingBottom: '15px',
                                        textAlign: "left"
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

        return null;
    };





    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* MAIN NAV ALWAYS FIXED */}
            <div style={{ position: 'sticky', top: 0, zIndex: 3500 }}>
                <MainNav />
            </div>

            <div style={{ flexGrow: 1, display: 'flex', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>

                {/* Sidebar (Left) */}
                <div style={{
                    width: '70px', background: '#fff', borderRight: '1px solid #ddd',
                    paddingTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    zIndex: 3000
                }}>

                    {/* استبدال جزء الخريطة (Map) بهذا الكود المعدل */}
                    {[
                        { name: 'Menu', icon: faList, panel: 'menu', show: true },
                        { name: 'Bookmarks', icon: faBookmark, panel: 'bookmarks', show: true },
                        { name: 'My Activity', icon: faUser, panel: 'activity', show: true },
                        {
                            name: 'Audio',
                            icon: faHeadphones,
                            panel: 'audio',
                            show: isAudioAvailable // يظهر فقط إذا كان هناك صوت للصفحة الحالية
                        },
                        {
                            name: 'All Audios',
                            icon: faHeadphones,
                            panel: 'allAudios',
                            show: resource?.pageAudios?.length > 0, // يظهر فقط إذا كان الكتاب يحتوي على أي صوتيات
                            color: '#1f3e72'
                        },
                        {
                            name: 'Glossary',
                            icon: faBook,
                            panel: 'glossary',
                            show: resource?.glossary && resource.glossary.length > 0,

                        },
                    ]
                        .filter(tool => tool.show) // فلترة الأدوات التي قيمتها show تساوي true فقط
                        .map((tool) => (
                            <SidebarItem
                                key={tool.name}
                                icon={tool.icon}
                                name={tool.name}
                                color={tool.color}
                                isActive={activePanel === tool.panel}
                                onClick={() => setActivePanel(prev => prev === tool.panel ? null : tool.panel)}
                            />
                        ))}
                </div>

                {/* Left Side Panel (Conditional Render) */}
                {['menu', 'bookmarks', 'activity', 'audio', 'video', 'allAudios', 'allVideos', 'glossary'].includes(activePanel) && (
                    <RenderSidePanel />
                )}

                {/* PDF VIEWER */}
                <div id="pdf-viewer-container"
                    style={{ flexGrow: 1, overflowY: 'auto', position: 'relative', background: '#f0f2f5' }}
                    onClick={handleViewerClick}
                >

                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px', paddingBottom: '120px' }} ref={viewerRef}>
                        {pdfUrl && (
                            <Document
                                file={pdfUrl}
                                options={options}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                loading={<p>Loading PDF...</p>}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    width={pageWidth}
                                    rotate={rotation} // تمرير قيمة التدوير
                                    onRenderSuccess={onPageRenderSuccess}
                                />
                            </Document>
                        )}

                        {/* overlay canvas for drawings */}
                        <canvas
                            ref={canvasRef}
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
                        />

                        {/* text boxes */}
                        {renderTextBoxes()}

                    </div>

                    {/* RIGHT TOOLS (fixed) */}
                    <div style={{
                        position: 'fixed', right: '20px', top: '120px',
                        background: '#fff', border: '1px solid #ddd', borderRadius: '4px',
                        display: 'flex', flexDirection: 'column', zIndex: 2000
                    }}>
                        {[
                            { icon: faArrowsAlt, action: () => setActiveTool(null), title: "Pan/Select", isActive: activeTool === null },
                            { icon: faPlus, action: zoomIn, title: "Zoom In" },
                            { icon: faMinus, action: zoomOut, title: "Zoom Out" },
                            // ربط الأيقونة بدالة rotatePage
                            { icon: faSyncAlt, action: rotatePage, title: `Rotate: ${rotation}°`, color: rotation !== 0 ? '#1f3e72' : '#333' },
                            { icon: faExpandArrowsAlt, action: toggleFullScreen, title: "Toggle Fullscreen" },
                            { icon: faCommentDots, action: () => setActivePanel(prev => prev === 'comments' ? null : 'comments'), title: "Add Note/Comment", isActive: activePanel === 'comments' },
                            { icon: faBookmark, action: toggleBookmark, title: isBookmarked ? "Remove Bookmark" : "Add Bookmark", color: isBookmarked ? '#ff0000' : '#333' }
                        ].map((tool, idx) => (
                            <div key={idx}
                                onClick={tool.action}
                                title={tool.title}
                                style={{
                                    padding: '12px 16px', borderBottom: '1px solid #eee', cursor: 'pointer', textAlign: 'center',
                                    color: tool.color || (tool.isActive ? '#1f3e72' : '#333'),
                                    backgroundColor: tool.isActive ? '#e6f0ff' : 'transparent'
                                }}>
                                <FontAwesomeIcon icon={tool.icon} />
                            </div>
                        ))}
                    </div>

                    {/* Right Side Panel (Conditional Render) */}
                    {activePanel === 'comments' && (
                        <RenderSidePanel />
                    )}


                    {/* BOTTOM FIXED BAR (tools + page nav + thumbnails) */}
                    <div style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100vw',
                        background: '#fff',
                        borderTop: '1px solid #ddd',
                        padding: '10px 20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                        zIndex: 3000
                    }}>

                        {/* Tools */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {/* Pan/Select */}
                            <div title="Pan"
                                onClick={() => setActiveTool(null)}
                                style={{ cursor: 'pointer', color: activeTool === null ? '#1f3e72' : '#333' }}>
                                <FontAwesomeIcon icon={faArrowsAlt} />
                            </div>

                            {/* Pencil */}
                            <div title="Pencil"
                                onClick={() => setActiveTool(prev => prev === 'pencil' ? null : 'pencil')}
                                style={{ cursor: 'pointer', color: activeTool === 'pencil' ? '#1f3e72' : '#333' }}>
                                <FontAwesomeIcon icon={faPencilAlt} />
                            </div>

                            {/* Text */}
                            <div title="Text"
                                onClick={() => setActiveTool(prev => prev === 'text' ? null : 'text')}
                                style={{ cursor: 'pointer', color: activeTool === 'text' ? '#1f3e72' : '#333' }}>
                                <FontAwesomeIcon icon={faFont} />
                            </div>

                            {/* Highlighter */}
                            <div title="Highlighter"
                                onClick={() => setActiveTool(prev => prev === 'highlight' ? null : 'highlight')}
                                style={{ cursor: 'pointer', color: activeTool === 'highlight' ? '#1f3e72' : '#333' }}>
                                <FontAwesomeIcon icon={faHighlighter} />
                            </div>

                            {/* Delete ALL annotations on page (تم إزالة التأكيد) */}
                            <div title="Delete all annotations on current page" onClick={handleDelete} style={{ cursor: 'pointer' }}>
                                <FontAwesomeIcon icon={faTrash} />
                            </div>

                            {/* Fullscreen */}
                            <div title="Fullscreen" onClick={toggleFullScreen} style={{ cursor: 'pointer' }}>
                                <FontAwesomeIcon icon={faExpand} />
                            </div>
                        </div>


                        <div style={{ borderLeft: '1px solid #ddd', height: '20px' }} />

                        {/* Page Navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faChevronLeft}
                                onClick={goToPrevPage}
                                style={{
                                    cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                                    color: pageNumber <= 1 ? '#aaa' : '#333'
                                }} />

                            <input type="text"
                                value={`${pageNumber}/${numPages || '...'}`}
                                onChange={(e) => {
                                    const val = e.target.value.split('/')[0];
                                    const n = parseInt(val, 10);
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

export default BookViewer;