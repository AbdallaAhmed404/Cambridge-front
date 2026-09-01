// ActivateResourceModal.js
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const BACKEND_URL = "https://api.icfls.com";
// const BACKEND_URL = "http://localhost:4000";

const ActivateResourceModal = ({ onClose, onResourceAdded }) => {
    const [accessCode, setAccessCode] = useState('');
    const [codeType, setCodeType] = useState('16'); // '16' أو '12'
    const [isAgreed, setIsAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    // دالة لتنسيق الإدخال: إضافة شرطات (Dashes)
    const formatCode = (input) => {
        // إزالة أي أحرف غير الأرقام والحروف الإنجليزية
        const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatted = '';
        let length = codeType === '16' ? 16 : 12;
        let segment = codeType === '16' ? 4 : 4;

        for (let i = 0; i < cleaned.length && i < length; i += segment) {
            if (formatted.length > 0) {
                formatted += '-';
            }
            formatted += cleaned.substring(i, i + segment);
        }
        return formatted;
    };

    // معالجة تغيير الإدخال
    const handleCodeChange = (e) => {
        const input = e.target.value.replace(/-/g, '');
        const maxLength = codeType === '16' ? 16 : 12;
        if (input.length <= maxLength) {
            setAccessCode(formatCode(input));
        }
    };

    // معالجة تغيير نوع الكود
    const handleCodeTypeChange = (type) => {
        setCodeType(type);
        setAccessCode(''); // مسح الكود عند تغيير النوع
    };

    // ActivateResourceModal.js

    // ... (بقية الاستيرادات والكود)

    const handleActivate = async () => {
        if (!isAgreed) {
            toast.error('You must agree to the terms of use.');
            return;
        }

        // 1. 🛑 التغيير هنا: نستخدم accessCode مباشرة بدلاً من cleanedCode
        const codeToSend = accessCode;

        // نحتاج التحقق من الطول بما في ذلك الشرطات
        const requiredLengthWithDashes = codeType === '16' ? 19 : 14;

        if (codeToSend.length !== requiredLengthWithDashes) {
            // نتحقق من الطول بعد إزالة الشرطات لنظهر الرسالة الصحيحة للمستخدم
            const actualCleanedLength = codeToSend.replace(/-/g, '').length;
            const requiredCleanLength = codeType === '16' ? 16 : 12;

            if (actualCleanedLength !== requiredCleanLength) {
                toast.error(`Access code must be ${requiredCleanLength} characters.`);
                return;
            }
        }

        // 💡 استخراج ID المستخدم من Local Storage
        const userId = localStorage.getItem('userId');

        if (!userId) {
            toast.error('User ID not found. Please log in again.');
            return;
        }

        const token = localStorage.getItem('token'); // تأكد من أن المفتاح هو 'userToken' كما اتفقنا
        if (!token) {
            toast.error('Authentication error. Please log in.');
            return;
        }

        setLoading(true);

        try {
            // 2. 🛑 التغيير هنا: إرسال codeToSend
            const response = await axios.post(`${BACKEND_URL}/user/activate-resource`, {
                code: codeToSend, // 👈 سيتم إرساله مع الشرطات
            }, {
                // 2. إرسال هيدر المصادقة
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            toast.success(response.data.message);
            onResourceAdded(response.data.resource);
            onClose();

        } catch (error) {
            // ... (بقية معالجة الأخطاء)
            console.error("Activation Error:", error);
            const errorMessage = error.response?.data?.message || "Failed to activate resource. Please check the code.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ... (بقية الكود)

    // ملاحظة: يجب أيضاً تعديل خاصية disabled للزر ليأخذ الطول مع الشرطات
    /*
    <button 
        // ...
        disabled={loading || !isAgreed || accessCode.length !== (codeType === '16' ? 19 : 14)} 
    >
    */

    // التنسيق (Styling)
    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000 // أعلى من كل شيء
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '450px',
        maxWidth: '90%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        position: 'relative'
    };

    const inputStyle = {
        textAlign: 'center',
        fontSize: '1.2rem',
        letterSpacing: '5px',
        padding: '10px',
        textTransform: 'uppercase',
        border: '1px solid #ccc',
        borderRadius: '4px',
        width: '100%',
        marginBottom: '15px'
    };

    const btnStyle = {
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <h5 style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '20px', fontWeight: "bold" }}>
                    Activate resources with codes
                </h5>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    &times;
                </button>

                <p style={{ borderTop: "solid 1px black", paddingTop: "15px" }}>Enter a 12 or 16-character access code from your textbook, sealed pocket, or email.</p>

                {/* خيارات نوع الكود */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ marginRight: '20px' }}>
                        <input
                            type="radio"
                            name="codeType"
                            value="16"
                            checked={codeType === '16'}
                            onChange={() => handleCodeTypeChange('16')}
                        />
                        16-character access code
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="codeType"
                            value="12"
                            checked={codeType === '12'}
                            onChange={() => handleCodeTypeChange('12')}
                        />
                        12-character access code
                    </label>
                </div>

                {/* حقل إدخال الكود */}
                <input
                    type="text"
                    value={accessCode}
                    onChange={handleCodeChange}
                    placeholder={codeType === '16' ? "XXXX-XXXX-XXXX-XXXX" : "XXXX-XXXX-XXXX"}
                    maxLength={codeType === '16' ? 19 : 14} // 16 حرف + 3 شرطات = 19
                    style={inputStyle}
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px', marginBottom: '20px' }}>
                    For example: AB12-CD34-EF56-GH78
                </p>

                {/* مربع الموافقة */}
                <div style={{ marginBottom: '30px' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)}
                            style={{ marginRight: '10px' }}
                        />
                        I accept and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">terms of use (external)</a>
                    </label>
                </div>

                {/* الأزرار */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '15px' }}>
                    <button
                        onClick={() => { setAccessCode(''); setIsAgreed(false); }}
                        style={{ ...btnStyle, backgroundColor: '#ffffffff', border: '1px solid #ccc', color: '#333' }}
                        disabled={loading}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleActivate}
                        style={{ ...btnStyle, backgroundColor: 'rgb(29, 60, 71)', color: 'white', border: 'none' }}
                        disabled={loading || !isAgreed || accessCode.replace(/-/g, '').length !== (codeType === '16' ? 16 : 12)}
                    >
                        {loading ? 'Activating...' : '+ Activate resource'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ActivateResourceModal;   