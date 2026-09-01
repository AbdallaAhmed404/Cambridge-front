import { useEffect, useState } from "react";
import Footer from "../Component/Footer";
import HeroSection from "../Component/HeroSection";
import MainNav from "../Component/MainNav";


export default function Home() {
  const [featuredProduct, setFeaturedProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    setFeaturedProduct([]); 
  }, []);

  return (
    <>
      <MainNav />
      <HeroSection />
      
      <Footer />
    </>
  );
}
