import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  ShoppingBag, 
  ShieldCheck, 
  UtensilsCrossed, 
  Menu as MenuIcon, 
  X, 
  ClipboardList, 
  ChevronDown, 
  LogOut, 
  Sparkles, 
  MapPin, 
  Flame, 
  Percent, 
  Clock,
  UserCheck
} from 'lucide-react';
import Button from '../common/Button';
import BackendStatusPill from '../common/BackendStatusPill';
import { formatPrice, RAWALPINDI_LOCATIONS } from '../../utils/format';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  const { totalItems, total, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('BIIT Campus, Shamsabad');
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleQuickDemo = (role) => {
    setDemoDropdownOpen(false);
    if (role === 'customer') {
      login('customer@foodie.com', 'pass123');
    } else {
      login('admin@foodie.com', 'admin123');
    }
  };

  return (
    <>
      {/* Top Notification Announcement Bar - Clean & Non-Overflowing */}
      <div className="bg-[#070A12] border-b border-theme-lavender/10 py-1 px-3 sm:px-4 text-center text-[11px] sm:text-xs font-semibold text-white flex items-center justify-center gap-2 sm:gap-3 overflow-hidden">
        <span className="inline-flex items-center gap-1 text-theme-lavender shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-extrabold uppercase tracking-wider text-[10px] sm:text-[11px]">BIIT Campus:</span>
        </span>
        <span className="truncate text-theme-white-muted">
          Use code <strong className="text-white font-mono font-bold bg-theme-lavender/10 px-1 py-0.5 rounded border border-theme-lavender/20">BIIT20</strong> for 20% off meals!
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-theme-lavender bg-theme-lavender/10 border border-theme-lavender/20 px-2 py-0.5 rounded-full shrink-0">
          <Clock className="w-3 h-3 text-amber-300" /> 15-25 min delivery across Rawalpindi
        </span>
      </div>

      {/* Main Navbar - Strictly Scaled to Prevent Horizontal Scrolling on Laptops */}
      <header className="sticky top-0 z-40 w-full royal-nav transition-all duration-150">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            
            {/* Left Section: Brand Logo + Location Selector */}
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1 whitespace-nowrap">
                    BIIT <span className="text-theme-lavender">Food Hub</span>
                  </span>
                  <span className="text-[9px] font-bold text-theme-white-muted tracking-wider uppercase hidden sm:block whitespace-nowrap">
                    Rawalpindi Campus
                  </span>
                </div>
              </Link>

              {/* Delivery Location Pill (BIIT Rawalpindi & surroundings) */}
              <div className="hidden 2xl:flex items-center relative shrink-0">
                <button
                  type="button"
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#131A2B] hover:bg-[#1E2842] border border-theme-lavender/20 text-xs text-white transition shadow-sm whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5 text-theme-lavender shrink-0" />
                  <div className="text-left">
                    <p className="text-[8px] font-black text-theme-lavender leading-none uppercase">Location</p>
                    <p className="text-[11px] font-bold text-white truncate max-w-[130px] leading-tight mt-0.5">
                      {selectedLocation}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-theme-lavender ml-0.5" />
                </button>

                {locationDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setLocationDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-72 royal-modal rounded-2xl shadow-xl p-2 z-40 text-xs text-white">
                      <p className="px-3 py-1.5 text-[10px] font-black uppercase text-theme-lavender tracking-wider border-b border-theme-lavender/10 mb-1">
                        Select Rawalpindi Delivery Zone
                      </p>
                      {RAWALPINDI_LOCATIONS.map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => {
                            setSelectedLocation(loc.name);
                            setLocationDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl font-medium transition flex items-center justify-between ${
                            selectedLocation.includes(loc.name)
                              ? 'bg-theme-violet text-white font-bold'
                              : 'hover:bg-[#131A2B] text-theme-white-muted'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-white text-xs">{loc.name}</p>
                            <p className="text-[10px] text-theme-lavender">{loc.area} • {loc.estTime}</p>
                          </div>
                          {loc.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-theme-lavender/15 text-theme-lavender font-black uppercase">
                              {loc.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Center Section: Navigation Links - Horizontal, Strictly Single-Line */}
            <nav className="hidden md:flex items-center gap-1 bg-[#131A2B] px-2.5 py-1 rounded-full border border-theme-lavender/15 shrink-0">
              <Link
                to="/"
                className={`whitespace-nowrap inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive('/')
                    ? 'bg-theme-violet text-white shadow-sm'
                    : 'text-theme-white-muted hover:text-white hover:bg-[#1E2842]'
                }`}
              >
                Food Menu
              </Link>

              <button
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const el = document.getElementById('menu-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="whitespace-nowrap inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-theme-white-muted hover:text-white hover:bg-[#1E2842] transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Bestsellers</span>
              </button>

              {/* My Orders - Single-Line Fixed, Never Breaking Text Up/Down */}
              <Link
                to="/orders"
                className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive('/orders')
                    ? 'bg-theme-violet text-white shadow-sm'
                    : 'text-theme-white-muted hover:text-white hover:bg-[#1E2842]'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-theme-lavender" />
                <span>My Orders</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-theme-violet text-white shadow-sm'
                      : 'text-amber-400 hover:bg-[#1E2842]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Right Section: Compact Status, Cart, Demo & Profile */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
              {/* Backend status pill */}
              <BackendStatusPill compact />

              {/* Cart Button with Total Preview in PKR */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131A2B] border border-theme-lavender/20 hover:border-theme-lavender/50 text-white transition shadow-sm active:scale-95 group shrink-0"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-theme-lavender group-hover:scale-105 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-theme-violet text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-white block leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
              </button>

              {/* Compact Demo Dropdown for Judges (Saves 150px navbar space) */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                  className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#131A2B] border border-theme-lavender/25 text-xs font-bold text-theme-lavender hover:text-white hover:border-theme-lavender transition shadow-sm"
                  title="Quick Demo Accounts"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Demo</span>
                  <ChevronDown className="w-3 h-3 text-theme-lavender" />
                </button>

                {demoDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDemoDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 royal-modal rounded-xl shadow-xl py-1.5 z-40 text-xs text-white">
                      <p className="px-3 py-1 text-[10px] font-bold text-theme-lavender uppercase tracking-wider border-b border-theme-lavender/10">
                        1-Click Demo Login
                      </p>
                      <button
                        onClick={() => handleQuickDemo('customer')}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-[#1E2842] flex items-center gap-2 transition"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>Student Demo</span>
                      </button>
                      <button
                        onClick={() => handleQuickDemo('admin')}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-amber-300 hover:bg-[#1E2842] flex items-center gap-2 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Demo</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Auth Area: Profile OR Login/Signup */}
              {isAuthenticated ? (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-[#131A2B] border border-theme-lavender/20 hover:border-theme-lavender/40 transition"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover border border-theme-lavender/30"
                    />
                    <span className="text-xs font-bold text-white max-w-[90px] truncate hidden xl:inline">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-theme-lavender" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 royal-modal rounded-xl shadow-xl py-2 z-40 text-white">
                        <div className="px-3.5 py-2 border-b border-theme-lavender/10">
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-theme-lavender truncate">{user.email}</p>
                        </div>

                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1E2842] transition"
                        >
                          <ClipboardList className="w-3.5 h-3.5 text-theme-lavender" />
                          My Orders
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-[#1E2842] transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="border-t border-theme-lavender/10 my-1" />

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full text-left px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-400" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="text-xs py-1.5 px-3 font-bold border-theme-lavender/30 text-white hover:bg-[#1E2842] shadow-none whitespace-nowrap"
                  >
                    Log In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/signup')}
                    className="text-xs py-1.5 px-3 font-bold shadow-none whitespace-nowrap"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-[#131A2B] border border-theme-lavender/20 text-white"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-theme-lavender" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-theme-violet text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-[#131A2B] border border-theme-lavender/20 text-white hover:bg-[#1E2842]"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-theme-lavender/10 bg-[#0B0F19]/95 backdrop-blur-xl px-4 pt-3 pb-5 text-white">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                  isActive('/') ? 'bg-theme-violet text-white' : 'text-theme-white-muted hover:bg-[#131A2B]'
                }`}
              >
                Food Menu
              </Link>

              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                  isActive('/orders') ? 'bg-theme-violet text-white' : 'text-theme-white-muted hover:bg-[#131A2B]'
                }`}
              >
                My Orders & Live Tracker
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-[#131A2B] border border-amber-400/30 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Executive Dashboard
                </Link>
              )}

              <div className="pt-2.5 border-t border-theme-lavender/10 flex flex-col gap-2.5">
                <BackendStatusPill />

                {/* 1-click Demo buttons for mobile evaluation */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleQuickDemo('customer');
                    }}
                    className="p-2 rounded-xl bg-[#131A2B] border border-theme-lavender/30 text-xs font-bold text-theme-lavender flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Demo Student
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleQuickDemo('admin');
                    }}
                    className="p-2 rounded-xl bg-[#131A2B] border border-amber-400/30 text-xs font-bold text-amber-300 flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Demo Admin
                  </button>
                </div>

                {isAuthenticated ? (
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-theme-lavender/30"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-theme-lavender uppercase">{user.role}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-rose-400 font-bold text-xs"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      Log In
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/signup');
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
