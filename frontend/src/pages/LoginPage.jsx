import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, UtensilsCrossed, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      // Toast notification is fired by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-theme-canvas">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden bg-[#131A2B] border border-theme-lavender/15 text-white shadow-xl">
        
        {/* Left Side: Photo & Brand Testimonial */}
        <div className="relative hidden md:block bg-[#0B0F19]">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
            alt="BIIT Food Hub"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#131A2B]/60 to-transparent p-8 flex flex-col justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-theme-violet flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-black">BIIT Food Hub</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-theme-lavender/15">
                <p className="text-xs italic text-theme-white-muted leading-relaxed font-normal">
                  "The hottest burgers and biryani on Murree Road. Fast 15-min delivery to all BIIT hostels & departments."
                </p>
                <p className="text-[11px] font-bold text-amber-300 mt-2">
                  — BIIT Campus Student Council
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-theme-lavender font-medium">
                <ShieldCheck className="w-4 h-4 text-theme-lavender" />
                <span>Secure account sign-in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form with High-Contrast Typography */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-[#131A2B]">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-theme-lavender mt-1 font-normal">
                Sign in to track orders, manage your cart, and reorder favorites.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@biit.edu.pk"
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.password}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full shadow-none font-bold"
                  isLoading={isSubmitting}
                >
                  Sign In
                </Button>
              </div>
            </form>
          </div>

          {/* Footer Signup Link */}
          <div className="mt-8 pt-4 border-t border-theme-lavender/10 text-center text-xs text-theme-lavender font-medium">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="font-bold text-white hover:text-theme-lavender underline underline-offset-2 ml-1"
            >
              Create Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
