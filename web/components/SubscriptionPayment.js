import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';

const SubscriptionPayment = ({ studentId, courseModule }) => {
  const router = useRouter();

  const config = {
    reference: (new Date()).getTime().toString(),
    email: "user@example.com", // This should be the user's email, perhaps from context or props
    amount: 250000, // ₦2,500 in kobo
    currency: 'NGN',
    metadata: {
      student_id: studentId,
      course_module: courseModule,
    },
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference) => {
    toast.success('Payment successful! Redirecting to dashboard...');
    // Redirect to gamified quiz dashboard
    router.push('/dashboard');
  };

  const onClose = () => {
    toast.error('Payment cancelled');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
          Monthly Mastery Subscription
        </div>
        <p className="block mt-1 text-lg leading-tight font-medium text-black">
          ₦2,500
        </p>
        <p className="mt-2 text-gray-500">
          Unlock full access to NurseQuest: NMCN Mastery for one month.
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