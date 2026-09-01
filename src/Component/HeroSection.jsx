// import { motion } from "framer-motion";
// import proOne from "../Assets/p1.png";
// import proTwo from "../Assets/p2.png";
// import proThree from "../Assets/p3.png";
// import proFour from "../Assets/p4.png";
// import "../Style/btn.css";
// import { useNavigate } from "react-router-dom";

// export default function HeroSection() {
//   const navigate = useNavigate();

//   return (
//     <>
//       <section
//         className="d-flex align-items-center" // لتوسيط المحتوى عمودياً
//         style={{ backgroundColor: "#fff" }} // خلفية بيضاء وارتفاع لا يقل عن الشاشة
//       >
//         <div className="container" style={{ paddingTop: "10px", paddingBottom: "40px" }}>
//           {/* Row لتقسيم المحتوى إلى صورة على اليسار ونصوص على اليمين */}
//           <div className="row align-items-center">

//             {/* العمود الأول: الصورة التوضيحية على اليسار */}
//             <div className="col-lg-6 col-md-12 text-center mb-4 mb-lg-0">
//               <img
//                 src={proOne}
//                 alt="Illustration of two people learning"
//                 className="img-fluid" // لتكون مستجيبة
//                 style={{ maxWidth: "80%" }}
//               />
//             </div>

//             {/* العمود الثاني: النصوص والأزرار على اليمين */}
//             <div className="col-lg-6 col-md-12">
//               <h1
//                 className="mb-1"
//                 style={{
//                   fontSize: "2.2rem", // خط أكبر قليلاً للعنوان الرئيسي
//                   color: "#343a40", // لون غامق للنص
//                   fontWeight: "600"
//                 }}
//               >
//                 Teach, learn and achieve with Cambridge GO
//               </h1>

//               <p
//                 className="mb-4"
//                 style={{ color: "#343a40", fontSize: "1.5rem", fontWeight: 100, lineHeight: 1.2, marginTop: "25px" }}
//               >
//                 Create an account to access your digital resources.
//               </p>

//               {/* مجموعة الأزرار */}
//               <div className="d-flex flex-column flex-sm-row gap-5">
//                 <button
//                   className="btn teacher-btn"
//                   style={{ textDecoration: "none", padding: "15px 55px" }}
//                   onClick={() => navigate("/accounts/select-role")}
//                 >
//                   Create an account
//                 </button>
//               </div>
//             </div>

//           </div>
//         </div>
//       </section>
//       <section
//         className="d-flex align-items-center" // لتوسيط المحتوى عمودياً
//         style={{ backgroundColor: "#f8f9fa" }} // خلفية بيضاء وارتفاع لا يقل عن الشاشة
//       >
//         <div className="container" style={{ paddingTop: "10px", paddingBottom: "40px" }}>
//           {/* Row لتقسيم المحتوى إلى صورة على اليسار ونصوص على اليمين */}
//           <div className="row align-items-center">

//             {/* العمود الأول: الصورة التوضيحية على اليسار */}
//             <div className="col-lg-6 col-md-12 text-center mb-4 mb-lg-0">
//               <img
//                 src={proTwo}
//                 alt="Illustration of two people learning"
//                 className="img-fluid" // لتكون مستجيبة
//                 style={{ maxWidth: "80%" }}
//               />
//             </div>

//             {/* العمود الثاني: النصوص والأزرار على اليمين */}
//             <div className="col-lg-6 col-md-12 ">
//               <h1
//                 className="mb-4"
//                 style={{
//                   fontSize: "1.5rem", // خط أكبر قليلاً للعنوان الرئيسي
//                   color: "#343a40", // لون غامق للنص
//                   fontWeight: "600",
//                 }}
//               >
//                 Discover our catalogues
//               </h1>


//               <ul style={{ listStyleType: "disc", paddingLeft: "20px", lineHeight: "1.5", fontSize: "1.1rem" }}>
//                 <li>Explore hundreds of titles and trial more than once.</li>
//                 <li>Find supporting resources such as video/audio files, solutions and suggested responses (when available).</li>
//               </ul>

//             </div>

//           </div>
//         </div>
//       </section>

//       <section
//         className="d-flex align-items-center" // لتوسيط المحتوى عمودياً
//         style={{ backgroundColor: "#fff" }} // خلفية بيضاء وارتفاع لا يقل عن الشاشة
//       >
//         <div className="container" >
//           {/* Row لتقسيم المحتوى إلى صورة على اليسار ونصوص على اليمين */}
//           <div className="row align-items-center">

//             {/* العمود الأول: الصورة التوضيحية على اليسار */}
//             <div className="col-lg-6 col-md-12 text-center mb-4 mb-lg-0">
//               <img
//                 src={proThree}
//                 alt="Illustration of two people learning"
//                 className="img-fluid" // لتكون مستجيبة
//                 style={{ maxWidth: "80%" }}
//                 width={700}
//               />
//             </div>

//             {/* العمود الثاني: النصوص والأزرار على اليمين */}
//             <div className="col-lg-6 col-md-12">
//               <h1
//                 className="mb-1"
//                 style={{
//                   fontSize: "1.5rem", // خط أكبر قليلاً للعنوان الرئيسي
//                   color: "#000000ff", // لون غامق للنص
//                   fontWeight: 600
//                 }}
//               >
//                 Made for teachers and students
//               </h1>

//               <p
//                 className="pt-4 pb-1"
//                 style={{ color: "#000000ff", fontSize: "1.1rem", lineHeight: 1.2 }}
//               >
//                 Teachers can:
//               </p>

//               <ul style={{ listStyleType: "disc", paddingLeft: "20px", lineHeight: "1.5" }}>
//                 <li> Access and trial digital versions of print books and courses.</li>
//                 <li>Create classes and groups for teaching and learning.</li>
//                 <li>Join or create a school in Cambridge GO to become an admin and manage users and classes.</li>
//               </ul>

//               <p
//                 className="pt-1 pb-1"
//                 style={{ color: "#000000ff", fontSize: "1.1rem", lineHeight: 1.2 }}
//               >
//                 Students can:
//               </p>

//               <ul style={{ listStyleType: "disc", paddingLeft: "20px", lineHeight: "1.5" }}>
//                 <li>Activate digital resources on computer, tablet, or smartphone.</li>
//                 <li>Be added by a teacher to an existing class or school in GO.</li>
//               </ul>


//               {/* مجموعة الأزرار */}

//             </div>

//           </div>
//         </div>
//       </section>

//       <section
//         className="d-flex align-items-center" // لتوسيط المحتوى عمودياً
//         style={{ backgroundColor: "#f8f9fa" }} // خلفية بيضاء وارتفاع لا يقل عن الشاشة
//       >
//         <div className="container" style={{ paddingTop: "10px", paddingBottom: "40px" }}>
//           {/* Row لتقسيم المحتوى إلى صورة على اليسار ونصوص على اليمين */}
//           <div className="row align-items-center">

//             {/* العمود الأول: الصورة التوضيحية على اليسار */}
//             <div className="col-lg-6 col-md-12 text-center mb-4 mb-lg-0">
//               <img
//                 src={proFour}
//                 alt="Illustration of two people learning"
//                 className="img-fluid" // لتكون مستجيبة
//                 style={{ maxWidth: "80%" }}
//               />
//             </div>

//             {/* العمود الثاني: النصوص والأزرار على اليمين */}
//             <div className="col-lg-6 col-md-12">
//               <h1
//                 className="mb-1"
//                 style={{
//                   fontSize: "1.5rem", // خط أكبر قليلاً للعنوان الرئيسي
//                   color: "#343a40", // لون غامق للنص
//                   fontWeight: 600
//                 }}
//               >
//                 Get in touch
//               </h1>

//               <p
//                 className="pt-4 pb-2"
//                 style={{ color: "#000000ff", fontSize: "1.1rem", lineHeight: 1.2 }}
//               >
//                 Learn more about GO, get support and share your feedback with us. We're here to help you get the most out of your teaching and learning experience.
//               </p>


//               {/* مجموعة الأزرار */}
//               <div className="d-flex flex-column flex-sm-row gap-2">



//                 {/* زر Create a teacher account - اللون الثانوي / الحدود فقط */}
//                 <button
//                   className="btn " // استخدام btn-outline-dark
//                   style={{textDecoration:"none"}}
//                   onClick={() => navigate("/support")}
//                 >
//                   Contact us
//                 </button>
//               </div>
//             </div>

//           </div>
//         </div>
//       </section>
//     </>
//   );
// }


import { motion } from "framer-motion";
import proOne from "../Assets/hero-illustration.jpg";
import "../Style/btn.css";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="d-flex align-items-center justify-content-center text-center"
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${proOne})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        width: "100%",
        margin: 0,
        padding: 0
      }}
    >
      {/* طبقة شفافة فوق الخلفية لضمان وضوح النصوص وقراءتها بسهولة */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.7)", // يمكنك التحكم بدرجة البياض أو الشفافية هنا
          zIndex: 1
        }}
      />

      {/* محتوى الهيرو في المنتصف */}
      <div className="container" style={{ position: "relative", zIndex: 2, padding: "40px 20px" }}>
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-12">
            <h1
              className="mb-3"
              style={{
                fontSize: "3rem",
                color: "#343a40",
                fontWeight: "700"
              }}
            >
              Teach, learn and achieve success
            </h1>

            <p
              className="mb-4"
              style={{ color: "#343a40", fontSize: "1.5rem", fontWeight: 300, lineHeight: 1.4 }}
            >
              Create an account to access your digital resources.
            </p>

            {/* زر إنشاء الحساب */}
            <div className="d-flex justify-content-center">
              <button
                className="btn teacher-btn"
                style={{ textDecoration: "none", padding: "15px 55px" }}
                onClick={() => navigate("/accounts/select-role")}
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}