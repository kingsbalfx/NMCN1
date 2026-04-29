import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function UsersAdmin() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await api.get('/supabase-admin-users');
      setStudents(res.data.students || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load student profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const togglePremium = async (profileId, currentState) => {
    try {
      await api.post('/supabase-admin-users', { profile_id: profileId, activate: !currentState });
      fetchStudents();
    } catch (err) {
      alert(err?.response?.data?.error || 'Unable to update subscription status');
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="mb-8 rounded-[32px] bg-white/95 p-8 shadow-xl ring-1 ring-slate-200/60">
          <h1 className="text-3xl font-semibold text-slate-900">Super Admin User Management</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Monitor all students, their nursing school, year of study, and activate Paystack subscriptions manually.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[32px] bg-slate-950/90 p-10 text-center text-slate-200 shadow-xl">
            Loading student roster...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-slate-200/70 bg-white shadow-xl">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Full Name</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Email</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Nursing School</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Current NMCN Year</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Payment Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Manual Upgrade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.full_name}</td>
                    <td className="px-6 py-4 text-slate-600">{student.email}</td>
                    <td className="px-6 py-4 text-slate-600">{student.school_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{student.year_of_study || '1'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${student.is_premium ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {student.is_premium ? 'Premium Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePremium(student.id, student.is_premium)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${student.is_premium ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}>
                        {student.is_premium ? 'Revoke' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
