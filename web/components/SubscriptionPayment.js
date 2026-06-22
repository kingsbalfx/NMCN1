import React from "react";
import { usePaystackPayment } from "react-paystack";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";

const SubscriptionPayment = ({ studentId, courseModule, email = "user@example.com" }) => {
  const router = useRouter();

  const config = {
    reference: new Date().getTime().toString(),
    email,
    amount: 45000,
    currency: "NGN",
    metadata: {
      student_id: studentId,
      course_module: courseModule,
      access_type: "permanent"
    },
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = () => {
    toast.success("Payment successful! Redirecting to dashboard...");
    router.push("/dashboard");
  };

  const onClose = () => {
    toast.error("Payment cancelled");
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
          Lifetime Learning Access
        </div>
        <p className="block mt-1 text-lg leading-tight font-medium text-black">
          NGN 450
        </p>
        <p className="mt-2 text-gray-500">
          Unlock permanent access to NurseQuest: NMCN Mastery.
        </p>
        <button
          onClick={() => initializePayment(onSuccess, onClose)}
          className="mt-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Pay Now
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default SubscriptionPayment;
