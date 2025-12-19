
import React from 'react';
import { Check, Zap, Shield, Crown } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for casual job seekers',
      features: ['2 Analysis Per Month', 'Standard AI Rewriter', 'ATS Basic Checklist', 'Community Support'],
      icon: Zap,
      color: 'bg-slate-100',
      textColor: 'text-slate-600',
      button: 'Current Plan',
      current: true
    },
    {
      name: 'Professional',
      price: '29',
      description: 'Ideal for serious career moves',
      features: ['Unlimited Analyses', 'Advanced STAR Rewriter', 'Deep Keyword Mapping', 'Multi-format Export', 'Priority AI Models'],
      icon: Crown,
      color: 'bg-indigo-600',
      textColor: 'text-white',
      button: 'Get Pro',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: '99',
      description: 'For recruitment agencies & schools',
      features: ['Team Dashboard', 'API Access', 'White Label Reports', 'Bulk Analysis', 'Dedicated Manager'],
      icon: Shield,
      color: 'bg-slate-900',
      textColor: 'text-white',
      button: 'Contact Sales'
    }
  ];

  return (
    <div className="space-y-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Simple, Professional Pricing</h2>
        <p className="text-slate-500 text-lg">Choose the plan that fits your career goals. Unlock unlimited AI power.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div key={i} className={`relative flex flex-col p-8 rounded-3xl border ${plan.highlight ? 'border-indigo-600 shadow-2xl shadow-indigo-100 scale-105 z-10' : 'border-slate-200 bg-white'}`}>
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="flex items-center space-x-3 mb-6">
              <div className={`${plan.current ? 'bg-slate-100 text-slate-600' : plan.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-800 text-white'} p-2.5 rounded-xl`}>
                <plan.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                <span className="text-slate-500 ml-1 text-sm font-semibold">/month</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start text-sm font-medium text-slate-600">
                  <Check className={`h-5 w-5 mr-3 shrink-0 ${plan.highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
              plan.highlight 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                : plan.current 
                ? 'bg-slate-100 text-slate-400 cursor-default' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}>
              {plan.button}
            </button>
          </div>
        ))}
      </div>
      
      <div className="text-center pt-8">
        <p className="text-slate-400 text-sm">All plans include standard security, 256-bit encryption, and GDPR compliance.</p>
      </div>
    </div>
  );
};

export default Pricing;
