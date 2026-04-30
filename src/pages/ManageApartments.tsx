import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Apartment } from '../types';
import { Plus, Trash2, Edit2, X, Check, MapPin, DollarSign, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import React from 'react';
import { useApp } from '../context/AppContext';

export default function ManageApartments({ id }: { id?: string }) {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useApp();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    pricePerNight: '',
    capacity: '',
    description: '',
    images: [] as string[],
    amenities: ''
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/admin');
  }, [user, authLoading, navigate]);

  const fetchApartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'apartments'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Apartment[];
      setApartments(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'apartments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApartments(); }, []);

  const handleEdit = (apt: Apartment) => {
    setEditingId(apt.id);
    setFormData({
      name: apt.name,
      location: apt.location,
      pricePerNight: apt.pricePerNight.toString(),
      capacity: apt.capacity.toString(),
      description: apt.description,
      images: apt.images,
      amenities: apt.amenities.join(', ')
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', location: '', pricePerNight: '', capacity: '', description: '', images: [], amenities: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      pricePerNight: Number(formData.pricePerNight),
      capacity: Number(formData.capacity),
      images: formData.images,
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'apartments', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'apartments'), dataToSave);
      }
      closeModal();
      fetchApartments();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'apartments');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'apartments', deleteId));
      fetchApartments();
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `apartments/${deleteId}`);
    }
  };

  if (authLoading || loading) return null;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8"
    >
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900">{t('admin.manage_apartments')}</h1>
          <p className="text-neutral-500">{t('admin.add_apt_sub')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-100"
        >
          <Plus className="h-5 w-5" />
          {t('admin.add_apt_btn')}
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">{t('common.apartment')}</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">{t('common.location_label')}</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">{t('common.price')}</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">{t('details.capacity')}</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-neutral-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {apartments.map((apt) => (
              <tr key={apt.id} className="transition-colors hover:bg-neutral-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={apt.images[0]} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <span className="font-bold text-neutral-900">{apt.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{apt.location}</td>
                <td className="px-6 py-4 font-semibold text-neutral-900">${apt.pricePerNight}</td>
                <td className="px-6 py-4 text-sm text-neutral-600">{apt.capacity} {t('common.guests')}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(apt)} className="rounded-lg p-2 text-blue-500 hover:bg-blue-50">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    {isSuperAdmin && (
                      <button onClick={() => handleDelete(apt.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">{editingId ? t('admin.edit_apt') : t('admin.add_new_apt')}</h2>
              <button onClick={closeModal} className="rounded-full p-2 hover:bg-neutral-100">
                <X className="h-6 w-6 text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-neutral-500">{t('admin.apt_name')}</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-neutral-500">{t('common.location_label')}</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-neutral-500">{t('common.price')} / {t('common.night')} ($)</label>
                <input required type="number" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} className="rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-neutral-500">{t('details.capacity')} ({t('common.guests')})</label>
                <input required type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-neutral-500">{t('details.description')}</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-neutral-500">Apartment Images</label>
                <ImageUpload 
                  initialUrls={formData.images} 
                  onUploadComplete={(urls) => setFormData({ ...formData, images: urls })} 
                />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-neutral-500">{t('details.amenities')} (comma separated)</label>
                <input value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} className="rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 mt-4 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl bg-neutral-100 py-3 font-bold text-neutral-700 hover:bg-neutral-200">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500">
                  {editingId ? t('admin.update_apt') : t('admin.save_apt')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">{t('admin.confirm_delete')}</h2>
              <p className="mt-2 text-neutral-500">
                This action cannot be undone. This will permanently delete the apartment listing and all associated data.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 rounded-xl bg-neutral-100 py-3 font-bold text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
              >
                {t('common.delete')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
