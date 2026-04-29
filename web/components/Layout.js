import Navbar from "./Navbar";
import Watermark from "./Watermark";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <Watermark />
      <Navbar />
      <main style={{ padding: 20, minHeight: 'calc(100vh - 200px)', position: 'relative', zIndex: 1 }}>{children}</main>
      <Footer />
    </>
  );
}
