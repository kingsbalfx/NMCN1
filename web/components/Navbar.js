import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ padding: 15, background: "#003366", color: "#fff" }}>
      <Link href="/dashboard">Dashboard</Link> |{" "}
      <Link href="/subjects">Subjects</Link> |{" "}
      <a
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        style={{ cursor: "pointer" }}
      >
        Logout
      </a>
    </nav>
  );
}
