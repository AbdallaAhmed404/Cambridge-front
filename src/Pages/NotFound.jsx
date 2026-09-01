import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainNav from "../Component/MainNav";
import Footer from "../Component/Footer";

export default function NotFound() {
  const Nav = useNavigate();

  return (
    <>
      <MainNav />
      <section style={{ marginTop: "141px" }}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1
                  style={{
                    fontSize: "110px",
                    fontWeight: "500",
                    marginBottom: "40px",
                  }}
                >
                  404 Not Found
                </h1>
                <p
                  style={{
                    marginBottom: "80px",
                    fontSize: "16px",
                    fontWeight: "400",
                  }}
                >
                  Your visited page not found. You may go home page.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ marginBottom: "140px" }}
              >
                <motion.button
                whileHover={{scale:1.1}}
                whileTap={{scale:0.8}}
                  onClick={() => Nav("/home")}
                  style={{
                    borderRadius: "4px",
                    backgroundColor: "#201f4fff",
                    width: "254px",
                    height: "56px",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "white",
                  }}
                >
                  Back to home page
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
}
