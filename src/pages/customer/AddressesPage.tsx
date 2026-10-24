import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Address } from '../../types';
import { addressService } from '../../services';
import { TADIKONDA_LOCALITIES, APP_CONFIG } from '../../config/constants';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react';

export const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doorNo, setDoorNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [villageArea, setVillageArea] = useState(TADIKONDA_LOCALITIES[0]);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  const loadAddresses = async () => {
    if (!user) return;
    const list = await addressService.getUserAddresses(user.id);
    setAddresses(list);
  };

  useEffect(() => {
    loadAddresses();
  }, [user?.id]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doorNo || !street) return;

    await addressService.addAddress({
      userId: user?.id ?? '',
      label,
      doorNo,
      street,
      landmark,
      villageArea,
      pincode: APP_CONFIG.pincode,
      isDefault: addresses.length === 0,
    });

    showToast('New address added', 'success');
    setIsModalOpen(false);
    setDoorNo('');
    setStreet('');
    setLandmark('');
    loadAddresses();
  };

  const handleDelete = async (id: string) => {
    await addressService.deleteAddress(id);
    showToast('Address deleted', 'info');
    loadAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await addressService.setDefaultAddress(user?.id ?? '', id);
    showToast('Default delivery address updated', 'success');
    loadAddresses();
  };

  return (
    <div className="max-w-xl mx-auto pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-950 tracking-tight">Saved Addresses</h1>
            <p className="text-xs text-gray-500">Tadikonda delivery points</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Address
        </Button>
      </div>

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white p-4 sm:p-5 rounded-3xl border shadow-sm transition-all flex items-start justify-between gap-3 ${
              addr.isDefault ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  addr.isDefault ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-gray-900">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  {addr.doorNo}, {addr.street}
                </p>
                {addr.landmark && (
                  <p className="text-[11px] text-gray-500">Landmark: {addr.landmark}</p>
                )}
                <p className="text-[11px] text-gray-500">
                  {addr.villageArea}, Tadikonda - {addr.pincode}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => handleDelete(addr.id)}
                className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-[11px] font-bold text-orange-600 hover:underline"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Tadikonda Address"
        maxWidth="md"
      >
        <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
          <div className="flex gap-2 mb-2">
            {(['Home', 'Work', 'Other'] as const).map((lbl) => (
              <button
                type="button"
                key={lbl}
                onClick={() => setLabel(lbl)}
                className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
                  label === lbl ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Door Number</label>
            <input
              type="text"
              placeholder="e.g. D.No 4-82"
              required
              value={doorNo}
              onChange={(e) => setDoorNo(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Street / Colony</label>
            <input
              type="text"
              placeholder="e.g. Ramalayam Temple Street"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Landmark (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Opp. Panchayat Water Tank"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Village Locality</label>
            <select
              value={villageArea}
              onChange={(e) => setVillageArea(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
            >
              {TADIKONDA_LOCALITIES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
