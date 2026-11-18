import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, User, UtensilsCrossed } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
    } else if ([...formData.password].length < 8 || new TextEncoder().encode(formData.password).length > 72) {
      errs.password = 'Use at least 8 characters and at most 72 UTF-8 bytes';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      navigate('/');
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
            Join BIIT Food Hub for campus food ordering and order tracking.
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
              label="Password (min 8 characters)"
              name="password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
            />

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
