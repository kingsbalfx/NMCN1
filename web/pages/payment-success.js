import { useRouter } from "next/router";
import { useEffect } from "react";
import api from "../services/api";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const { reference } = router.query;
    if (reference) {
      api.get(`/payments/verify/${reference}`).then(() => {
        router.push("/dashboard");
      });
    }
  }, [router.query]);

  return <p>Verifying payment...</p>;
}
