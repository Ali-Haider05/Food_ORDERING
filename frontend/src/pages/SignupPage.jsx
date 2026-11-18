import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, User, Phone, MapPin, UtensilsCrossed } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!formData.address.trim()) {
      errs.address = 'Delivery address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await signup(formData);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      // Toast handles error display
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-theme-canvas">
      <div className="max-w-2xl w-full rounded-3xl overflow-hidden bg-[#131A2B] border border-theme-lavender/15 p-8 sm:p-10 text-white shadow-xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-theme-violet text-white flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-theme-lavender mt-1 max-w-sm mx-auto font-normal">
            Join BIIT Food Hub for campus discounts, express delivery, and real-time tracking.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Hamza Abbasi"
              error={errors.name}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              placeholder="student@biit.edu.pk"
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password (min 6 characters)"
              name="password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
            />

            <Input
              label="Phone Number"
              name="phone"
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+92 301 5551234"
              error={errors.phone}
            />
          </div>

          <Input
            label="Default Delivery Location (BIIT Campus or Rawalpindi)"
            name="address"
            icon={MapPin}
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. Hostel #4, BIIT Campus, Shamsabad, Murree Road, Rawalpindi"
            error={errors.address}
          />

          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-bold text-theme-lavender uppercase tracking-wider mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'customer', title: 'Student / Customer', desc: 'Order food, track delivery' },
                { role: 'admin', title: 'Kitchen Admin', desc: 'Manage menu & process orders' },
              ].map((opt) => (
                <div
                  key={opt.role}
                  onClick={() => setFormData((p) => ({ ...p, role: opt.role }))}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    formData.role === opt.role
                      ? 'border-theme-lavender bg-theme-violet/20 text-white font-bold'
                      : 'border-theme-lavender/15 bg-theme-purple-dark text-theme-white-muted hover:border-theme-lavender/30'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{opt.title}</p>
                  <p className="text-[10px] text-theme-lavender">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold shadow-none"
              isLoading={isSubmitting}
            >
              Register & Start Ordering
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-theme-lavender/10 text-center text-xs text-theme-lavender font-medium">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-white hover:text-theme-lavender underline underline-offset-2 ml-1"
          >
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
