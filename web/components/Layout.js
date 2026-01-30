import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: 20 }}>{children}</main>
    </>
  );
}
