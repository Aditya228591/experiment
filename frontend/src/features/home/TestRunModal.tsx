import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { WorkflowData } from '../../types';
import { CheckCircle2, Loader2, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { loadUserProfile } from '../../services/storageService';

export interface TestRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WorkflowData;
}

export const TestRunModal: React.FC<TestRunModalProps> = ({
  isOpen,
  onClose,
  workflow,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsFinished(false);
      return;
    }

    const timer1 = setTimeout(() => setCurrentStepIndex(1), 800);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 1600);
    const timer3 = setTimeout(() => {
      setCurrentStepIndex(3);
      setIsFinished(true);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Test run simulation"
      subtitle={`Simulating execution for “${workflow.name}”`}
      maxWidth="lg"
    >
      <div className="space-y-4 py-2">
        {/* Step Progress Checklist */}
        <div className="space-y-2 p-3.5 rounded-xl bg-canvas border border-stone-200/70 text-xs">
          {workflow.steps.map((step, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-forest-700 animate-spin shrink-0" aria-hidden="true" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />
                  )}
                  <span className={`truncate font-medium ${isCompleted ? 'text-stone-900' : isCurrent ? 'text-forest-900' : 'text-stone-400'}`}>
                    {step.title}
                  </span>
                </div>
                <Badge variant={isCompleted ? 'green' : isCurrent ? 'blue' : 'stone'}>
                  {isCompleted ? 'Verified' : isCurrent ? 'Simulating...' : 'Pending'}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Live Output Simulation */}
        {isFinished ? (
          <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-forest-900 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-forest-700" />
                <span>Simulated sample draft (Student: Lucas Chen)</span>
              </div>
              <Badge variant="green" dot>Ready for teacher review</Badge>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-stone-200/80 text-xs space-y-2 text-stone-700">
              <div className="flex items-center gap-2 text-stone-500 border-b border-stone-100 pb-2">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-medium text-stone-800">To:</span>
                <span>chen.family@example.com</span>
              </div>
              <p className="font-semibold text-stone-900 text-xs">
                Subject: Lucas's Math Progress & Highlights — Lincoln Middle School
              </p>
              <div className="space-y-1.5 text-stone-600 leading-relaxed pt-1">
                <p>Hello Mr. and Mrs. Chen,</p>
                <p>
                  I wanted to share a quick celebration of Lucas's focus this week. He demonstrated real perseverance during our fractions check-in on Wednesday, independently completing all four word problems and helping his table partner.
                </p>
                <p>
                  Next week we begin coordinate planes. His graded practice notes are saved in the student portal for your reference.
                </p>
                <p className="pt-1 text-stone-800 font-medium">
                  Warmly,<br />{loadUserProfile().name} — {loadUserProfile().gradeSubject || 'Teacher'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-forest-800">
              <ShieldAlert className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span>In real mode, this message is queued in your teacher inbox for 1-click approval before delivery.</span>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-7 h-7 text-forest-700 animate-spin" />
            <p className="text-sm font-medium text-stone-800">Running simulated automation pipeline...</p>
            <p className="text-xs text-stone-500">Checking triggers, running test data pass, and assembling output preview.</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close test
          </Button>
          {isFinished && (
            <Button variant="primary" size="md" onClick={onClose}>
              Looks good
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
