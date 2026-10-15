import React from 'react';
import { ShieldCheck, Eye, Sliders, Lock } from 'lucide-react';
import { Card } from '../../components/common/Card';

export const TrustCard: React.FC = () => {
  return (
    <Card className="bg-white border-stone-200/80">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
          Designed for teacher trust & control
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-canvas/60 border border-stone-200/50">
          <div className="w-6 h-6 rounded-md bg-white border border-stone-200/80 flex items-center justify-center shrink-0 mt-0.5 text-stone-700">
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-stone-900 mb-0.5">Review every message</p>
            <p className="leading-relaxed text-stone-600">
              AI drafts notes and digests, but you always have the final say before anything is sent.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-canvas/60 border border-stone-200/50">
          <div className="w-6 h-6 rounded-md bg-white border border-stone-200/80 flex items-center justify-center shrink-0 mt-0.5 text-stone-700">
            <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-stone-900 mb-0.5">Pause or edit anytime</p>
            <p className="leading-relaxed text-stone-600">
              Adjust triggers, tone instructions, or pause active workflows during breaks and testing weeks.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-canvas/60 border border-stone-200/50">
          <div className="w-6 h-6 rounded-md bg-white border border-stone-200/80 flex items-center justify-center shrink-0 mt-0.5 text-stone-700">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-stone-900 mb-0.5">Student data stays protected</p>
            <p className="leading-relaxed text-stone-600">
              FERPA & COPPA compliant boundaries ensure student records remain private and secure.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
