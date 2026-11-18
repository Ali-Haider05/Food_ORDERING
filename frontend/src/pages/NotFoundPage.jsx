import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 text-theme-white bg-theme-canvas">
      <div className="w-20 h-20 rounded-3xl bg-theme-purple border border-theme-lavender/30 text-theme-lavender flex items-center justify-center mb-6 shadow-lavender-glow">
        <UtensilsCrossed className="w-10 h-10" />
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-theme-lavender mb-2">
        Error 404
      </span>
      <h1 className="text-4xl sm:text-6xl font-black text-theme-white tracking-tight mb-3">
        Page Not on the Menu
      </h1>
      <p className="text-sm text-theme-white-muted max-w-md mb-8 leading-relaxed font-medium">
        We searched high and low in the kitchen, but couldn't find the page you're looking for. It might have been moved or removed.
      </p>
      <Button
        variant="primary"
        size="md"
        icon={ArrowLeft}
        onClick={() => navigate('/')}
        className="shadow-violet-glow"
      >
        Back to Food Menu
      </Button>
    </div>
  );
};

export default NotFoundPage;
