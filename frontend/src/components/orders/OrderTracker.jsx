import React from 'react';
import { 
  ClipboardCheck, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Play, 
  Clock
} from 'lucide-react';
import Button from '../common/Button';

const STEPS = [
  {
    key: 'Pending',
    title: 'Order Confirmed',
    description: 'Received by BIIT Food Hub dispatch.',
    icon: ClipboardCheck,
  },
  {
    key: 'Preparing',
    title: 'Kitchen Preparing',
    description: 'Chefs preparing hot fresh meal with halal ingredients.',
    icon: ChefHat,
  },
  {
    key: 'Out for Delivery',
    title: 'Rider En Route',
    description: 'Rider dispatched on bike across Shamsabad / Murree Road.',
    icon: Bike,
  },
  {
    key: 'Delivered',
    title: 'Delivered',
    description: 'Handed over at BIIT campus department or hostel.',
    icon: CheckCircle2,
  },
];

const OrderTracker = ({ order, onAdvanceSimulation }) => {
  if (!order) return null;

  const currentStepKey = order.status || 'Pending';
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStepKey);
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;
  const isDelivered = currentStepKey === 'Delivered';

  return (
    <div className="bg-[#131A2B] rounded-3xl p-6 sm:p-8 border border-theme-lavender/20 shadow-md space-y-6 text-white">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-lavender/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-theme-lavender">
              Live Delivery Tracking
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-theme-lavender/15 text-theme-lavender border border-theme-lavender/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Live Radar
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Order #{order.id}
          </h3>
          <p className="text-xs text-theme-white-muted mt-0.5 font-normal">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Estimated Delivery Time or Simulation button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-theme-lavender/20 text-theme-lavender flex items-center gap-2 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>
              {isDelivered ? 'Delivered' : `Estimated ETA: ${order.estimatedDeliveryTime || '15-25 mins'}`}
            </span>
          </div>

          {/* Judges demo button */}
          {!isDelivered && onAdvanceSimulation && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdvanceSimulation(order.id)}
              className="text-xs font-bold border-theme-lavender/40 text-theme-lavender hover:bg-[#1E2842] gap-1.5 shadow-none"
              title="Advance step to showcase live transition to judges"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Simulate Next Step
            </Button>
          )}
        </div>
      </div>

      {/* Animated Stepper Bar */}
      <div className="relative pt-2">
        {/* Background connector line */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-[#0B0F19] rounded-full hidden md:block" />
        
        {/* Active progress connector line */}
        <div
          className="absolute top-8 left-8 h-1 bg-theme-violet rounded-full hidden md:block transition-all duration-500"
          style={{
            width: `${(activeIndex / (STEPS.length - 1)) * 88}%`,
          }}
        />

        {/* Step Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < activeIndex;
            const isCurrent = index === activeIndex;

            return (
              <div
                key={step.key}
                className="flex md:flex-col items-center md:text-center gap-4 md:gap-3"
              >
                {/* Circle Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 border ${
                    isCurrent
                      ? 'bg-theme-violet text-white border-theme-lavender scale-110 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-[#0B0F19] text-theme-white-muted border-theme-lavender/20'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>

                {/* Text Content */}
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-theme-lavender font-black'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-theme-white-muted'
                    }`}
                  >
                    Step {index + 1}
                  </p>
                  <h4 className="text-sm font-black text-white mt-0.5 leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-theme-white-muted mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Destination Footer Card */}
      <div className="p-4 rounded-2xl bg-[#0B0F19] border border-theme-lavender/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-theme-lavender block tracking-wider">
            Destination Address
          </span>
          <span className="font-bold text-white text-sm">
            {order.deliveryAddress}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-theme-lavender block tracking-wider">
            Recipient Contact
          </span>
          <span className="font-bold text-white">
            {order.userName} ({order.userPhone || '+92 301 5551234'})
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
