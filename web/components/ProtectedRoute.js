import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, []);

  return children;
}
