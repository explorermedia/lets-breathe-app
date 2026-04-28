import React, { useState } from 'react';
import { X, Check, CreditCard, Lock, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

interface PaywallProps {
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose, onUpgradeSuccess }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    monthly: { price: '$4.99', label: 'per month', total: 'Billed monthly', savings: null },
    yearly: { price: '$2.49', label: 'per month', total: 'Billed annually ($29.99/yr)', savings: 'Save 50%' }
  };

  const selectedPlan = plans[billingPeriod];

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setFormError('Invalid card number.');
      return;
    }
    if (!expiry.includes('/') || expiry.length < 5) {
      setFormError('Expiry date is required (MM/YY).');
      return;
    }
    if (cvv.length < 3) {
      setFormError('Security code (CVV) is required.');
      return;
    }
    if (!nameOnCard.trim()) {
      setFormError('Name on card is required.');
      return;
    }

    setIsProcessing(true);

    // Simulate 2s processing time
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess();
    }, 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setExpiry(val.substring(0, 5));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-fade-in my-8">
        
        {/* Close button */}
        {!isProcessing && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-300 bg-slate-950/30 rounded-full border border-slate-800/40 hover:bg-slate-800/50 transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {!isCheckingOut ? (
          /* SECTION 1: PLAN SELECTOR & VALUE PROP */
          <div className="flex flex-col h-full animate-slide-up">
            {/* Hero Image / Glow */}
            <div className="relative bg-gradient-to-b from-cyan-500/10 via-cyan-500/5 to-transparent px-6 pt-10 pb-6 text-center border-b border-slate-800/30">
              <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-cyan-400 mb-4 shadow-lg shadow-cyan-500/5 animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Flowbreath Premium</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                Unlock the full power of mindful breathing and nervous system regulation.
              </p>
            </div>

            {/* Features List */}
            <div className="px-8 py-6 space-y-4 flex-1">
              {[
                { title: 'Unlock All Breath Patterns', desc: 'Access 4-7-8 Deep Sleep, Awakening, and specialized routines.' },
                { title: 'Unlimited Custom Routines', desc: 'Design your own custom breathing ratios without restrictions.' },
                { title: 'Premium Audio Soundscapes', desc: 'Meditate to synthetic Deep Drone and Summer Rain audio spaces.' },
                { title: 'Exclusive Visual Themes', desc: 'Immerse yourself in premium visual modes like Sunset and Aurora.' },
                { title: 'Priority Analytics Tracking', desc: 'Get deep journal logs, consistency metrics, and stress-reduction stats.' },
              ].map((f, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-left">
                  <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{f.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing Switcher */}
            <div className="px-8 pb-4">
              <div className="bg-slate-950 p-1.5 rounded-2xl flex border border-slate-800/60 max-w-xs mx-auto">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700/50 shadow-md'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1 relative ${
                    billingPeriod === 'yearly'
                      ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700/50 shadow-md'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] px-1.5 py-0.5 rounded-md scale-90 font-bold">
                    -50%
                  </span>
                </button>
              </div>
            </div>

            {/* Price Display and CTA */}
            <div className="px-8 pb-8 pt-2 text-center bg-slate-950/30 border-t border-slate-800/40">
              <div className="my-3">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-4xl font-extrabold text-white">{selectedPlan.price}</span>
                  <span className="text-sm text-slate-400 font-medium">{selectedPlan.label}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">{selectedPlan.total}</p>
              </div>

              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/10 flex items-center justify-center space-x-2 transition-all hover:translate-y-[-1px] active:translate-y-0"
              >
                <Lock className="w-4 h-4" />
                <span>Upgrade to Premium</span>
              </button>
              
              <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-500 mt-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure 256-bit SSL encrypted checkout. Cancel anytime.</span>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 2: SIMULATED PAYMENT CHECKOUT */
          <div className="p-6 md:p-8 animate-fade-in">
            <div className="flex items-center space-x-2 mb-6 border-b border-slate-800/40 pb-4">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-lg font-medium text-slate-100">Secure Payment</h3>
                <p className="text-xs text-slate-400">Upgrade to Flowbreath Premium • {billingPeriod === 'yearly' ? '$29.99/yr' : '$4.99/mo'}</p>
              </div>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start space-x-2 text-red-400 text-xs mb-4 animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {/* Card Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4444 4444 4444 4444"
                    disabled={isProcessing}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-700 text-sm focus:outline-none font-mono disabled:opacity-50"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-1">
                    <div className="w-7 h-4 bg-slate-800 rounded border border-slate-700"></div>
                    <div className="w-7 h-4 bg-slate-800 rounded border border-slate-700"></div>
                  </div>
                </div>
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM / YY"
                    disabled={isProcessing}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-700 text-sm focus:outline-none font-mono disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Security CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    disabled={isProcessing}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-700 text-sm focus:outline-none font-mono tracking-widest disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Name on Card */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Name on Card</label>
                <input
                  type="text"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="Jane Doe"
                  disabled={isProcessing}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-700 text-sm focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Submit / Processing CTA */}
              <div className="pt-4 border-t border-slate-800/40 mt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/5 flex items-center justify-center space-x-2 transition-all disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Complete Checkout & Unlock</span>
                    </>
                  )}
                </button>
                
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="w-full text-center py-2 text-xs text-slate-500 hover:text-slate-400 font-medium mt-2"
                  >
                    Go Back
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
