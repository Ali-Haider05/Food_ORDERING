import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Award, Clock, MapPin, Phone } from 'lucide-react';
import BackendStatusPill from '../common/BackendStatusPill';

const Footer = () => {
  return (
    <footer className="bg-[#070A12] text-theme-white-muted pt-14 pb-10 border-t border-theme-lavender/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-theme-lavender/10">
          
          {/* Brand & Mission */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-theme-violet flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-black text-white tracking-tight">
                BIIT <span className="text-theme-lavender">Food Hub</span>
              </span>
            </div>
            <p className="text-xs text-theme-white-muted leading-relaxed font-normal">
              Serving BIIT Campus, PMAS Arid University, Shamsabad, and Rawalpindi. Hot, fresh, and hygienic meals delivered in 15-25 minutes with live order tracking.
            </p>
            <div className="pt-1">
              <BackendStatusPill />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3.5">
              Campus Menu
            </h4>
            <ul className="space-y-2 text-xs font-medium text-theme-lavender">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Smash Burgers & Zinger Meals
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Handcrafted Italian Pizza
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Special Chicken Dum Biryani
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Truffle & Porcini Fettuccine
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Karak Chai & Cold Drinks
                </Link>
              </li>
            </ul>
          </div>

          {/* Kitchen Hours & Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3.5">
              Delivery Hours & Hub
            </h4>
            <div className="space-y-2.5 text-xs text-theme-white-muted font-normal">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-theme-lavender shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold">Kitchen Hours:</p>
                  <p>10:00 AM – 11:30 PM (Daily)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-theme-lavender shrink-0 mt-0.5" />
                <p>BIIT Campus, PMAS Arid Univ, Shamsabad, Murree Road, Rawalpindi</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-theme-lavender shrink-0 mt-0.5" />
                <p>+92 (51) 9292100 / +92 301 5551234</p>
              </div>
            </div>
          </div>

          {/* University Competition & Tech Showcase */}
          <div className="bg-[#131A2B] p-4 sm:p-5 rounded-2xl border border-theme-lavender/15 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-theme-lavender">
              <Award className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Evaluation Build</span>
            </div>
            <p className="text-xs text-theme-white-muted leading-relaxed font-normal">
              Built for the University Full-Stack Engineering Showcase. Features NeDB backend persistence, token authentication, live order tracking, and role-based administration.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] bg-[#0B0F19] text-theme-lavender font-bold px-2 py-0.5 rounded-md border border-theme-lavender/20">
                React + Vite
              </span>
              <span className="text-[10px] bg-[#0B0F19] text-theme-lavender font-bold px-2 py-0.5 rounded-md border border-theme-lavender/20">
                Midnight + Pale Lavender
              </span>
              <span className="text-[10px] bg-[#0B0F19] text-theme-lavender font-bold px-2 py-0.5 rounded-md border border-theme-lavender/20">
                PKR / Rawalpindi
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-white-muted">
          <p className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} BIIT Food Hub Rawalpindi. Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for BIIT Students & Faculty.</span>
          </p>
          <div className="flex items-center gap-4 text-[11px] text-theme-lavender">
            <span>Rawalpindi & Islamabad Express Delivery</span>
            <span>•</span>
            <span>Halal Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
