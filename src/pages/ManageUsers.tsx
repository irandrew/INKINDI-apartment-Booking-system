import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Mail, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ManageUsers() {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      navigate('/admin');
    }
  }, [isSuperAdmin, authLoading, navigate]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const data = querySnapshot.docs.map(doc => ({ ...doc.data() })) as UserProfile[];
      setUsers(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) fetchUsers();
  }, [isSuperAdmin]);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setUpdatingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) return (
    <div className="flex min-h-screen items-center justify-center pt-24">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-7xl px-4 pt-12 pb-12 sm:px-6 lg:px-8"
    >
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-900 flex items-center gap-3">
          <Shield className="h-8 w-8 text-neutral-900" />
          Access Control
        </h1>
        <p className="text-neutral-500 mt-2">Manage user roles and platform permissions.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm font-sans">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Email</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Current Role</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {users.map((u) => (
              <tr key={u.uid} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-neutral-400" />
                    </div>
                    <span className="font-bold text-neutral-900">{u.displayName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="h-4 w-4" />
                    {u.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'property_manager' ? 'bg-blue-100 text-blue-700' :
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    {u.role === 'super_admin' && <ShieldCheck className="h-3 w-3" />}
                    {u.role === 'property_manager' && <ShieldAlert className="h-3 w-3" />}
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <select
                      disabled={updatingId === u.uid || u.uid === user?.uid}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="guest">Guest</option>
                      <option value="property_manager">Property Manager</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
