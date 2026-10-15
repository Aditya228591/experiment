import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

export interface HelpResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpResourcesModal: React.FC<HelpResourcesModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Teacher help & resources"
      subtitle="How Classflow AI assists your classroom while keeping you in complete control"
      maxWidth="lg"
    >
      <div className="space-y-4 py-1 text-sm text-stone-700 max-h-[68vh] overflow-y-auto pr-1">
        {/* Core Principles */}
        <div className="p-4 rounded-xl bg-forest-50/60 border border-forest-200/60 space-y-2">
          <div className="flex items-center gap-2 text-forest-900 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-forest-700" aria-hidden="true" />
            <span>Human-in-the-loop by design</span>
          </div>
          <p className="text-xs text-forest-800 leading-relaxed">
            Classflow AI drafts messages, flags missing work, and suggests feedback. It <strong>never sends messages or modifies permanent records</strong> without your explicit review and sign-off.
          </p>
        </div>

        {/* Prompting Tips */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            <span>How to write great prompts</span>
          </h3>
          <ul className="space-y-2 text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 shrink-0" />
              <span><strong>State the timing clearly:</strong> Mention “Every Friday at 3 PM” or “When a quiz is graded”.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 shrink-0" />
              <span><strong>Define what AI should analyze:</strong> e.g., “Check for missing homework” or “Summarize quiz misconceptions”.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 shrink-0" />
              <span><strong>Specify the intended output:</strong> e.g., “Draft an email for parents” or “Prepare homeroom check-in list”.</span>
            </li>
          </ul>
        </div>

        {/* FAQs */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-forest-700" />
            <span>Frequently asked questions</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-stone-200/70 bg-white">
              <p className="font-semibold text-stone-900">How is student privacy protected?</p>
              <p className="text-stone-600 mt-1 leading-relaxed">
                Student data is processed within FERPA and COPPA compliant boundaries. Personally identifiable information is de-identified and never used to train public language models.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-stone-200/70 bg-white">
              <p className="font-semibold text-stone-900">Can I pause an automation during holidays or exam weeks?</p>
              <p className="text-stone-600 mt-1 leading-relaxed">
                Yes. Any active automation can be paused with one click from the <strong>My automations</strong> tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
