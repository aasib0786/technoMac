import { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/feature/AdminLayout';
import Card from '../../../../components/base/Card';
import Button from '../../../../components/base/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getData,
  postData,
} from '../../../../services/FetchNodeServices';

export default function ContactInfoManagement() {
  const [formData, setFormData] = useState({
    salesPhone: '+91-8448825572, +91-9268825571, +91-9599090411',
    servicePhone: '+91 9311125574',
    email: 'info@technomac.com',
    address:
      'Plot no.-88, Pocket- L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India',
    whatsappPhone: '+919311125574',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContactInfo = async () => {
    try {
      setIsLoading(true);
      const res = await getData('contact-info');
      if (res?.success && res?.data) {
        setFormData({
          salesPhone:
            res.data.salesPhone ||
            '+91-8448825572, +91-9268825571, +91-9599090411',
          servicePhone: res.data.servicePhone || '+91 9311125574',
          email: res.data.email || 'info@technomac.com',
          address:
            res.data.address ||
            'Plot no.-88, Pocket- L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India',
          whatsappPhone: res.data.whatsappPhone || '+919311125574',
        });
      }
    } catch (error) {
      console.error('fetchContactInfo error:', error);
      toast.error('Failed to load contact information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await postData('contact-info', formData);
      if (res?.success) {
        toast.success('Contact details updated successfully!');
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (error) {
      console.error('handleSubmit error:', error);
      toast.error('Failed to save contact details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Contact Details Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage phone numbers, email address, and office location displayed on the website contact page
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <i className="ri-loader-4-line animate-spin text-3xl text-blue-600"></i>
            <p className="text-gray-500 ml-3">Loading contact settings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Sales Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <i className="ri-phone-fill text-blue-600"></i> Sales Dept Phone Numbers
                    </label>
                    <input
                      type="text"
                      placeholder="+91-8448825572, +91-9268825571, +91-9599090411"
                      value={formData.salesPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, salesPhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Separate multiple numbers with commas.
                    </p>
                  </div>

                  {/* After-Sales Service Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <i className="ri-customer-service-2-fill text-emerald-600"></i> After-sales Service Dept Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 9311125574"
                      value={formData.servicePhone}
                      onChange={(e) =>
                        setFormData({ ...formData, servicePhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <i className="ri-mail-fill text-amber-600"></i> Official Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="info@technomac.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Office Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <i className="ri-map-pin-2-fill text-red-600"></i> Office Address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Plot no.-88, Pocket- L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* WhatsApp Support Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <i className="ri-whatsapp-fill text-emerald-500"></i> WhatsApp Support Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+919311125574"
                      value={formData.whatsappPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsappPhone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2.5 flex justify-center items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <i className="ri-loader-4-line animate-spin"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="ri-save-line"></i> Save Contact Details
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Live Preview Box */}
            <div>
              <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <i className="ri-eye-line"></i> Website Live Preview
                </h3>

                <div className="space-y-4 text-xs">
                  {/* Phone */}
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <i className="ri-phone-fill text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-200">Phone Number</h4>
                      <p className="text-gray-300 mt-0.5">
                        Sales Dept: {formData.salesPhone}
                      </p>
                      <p className="text-gray-300 mt-0.5">
                        After-sales Service Dept: {formData.servicePhone}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-3 items-start pt-2 border-t border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <i className="ri-mail-fill text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-200">Email Address</h4>
                      <p className="text-gray-300 mt-0.5">{formData.email}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex gap-3 items-start pt-2 border-t border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <i className="ri-map-pin-2-fill text-sm"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-200">Office Address</h4>
                      <p className="text-gray-300 mt-0.5 leading-relaxed">
                        {formData.address}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
