import React, { useState } from 'react';
import { WorkflowData } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { WorkflowStepCard } from './WorkflowStepCard';
import { Play, BookmarkPlus, Check, Sparkles } from 'lucide-react';
import { TestRunModal } from './TestRunModal';
import { useToast } from '../../components/common/Toast';

export interface WorkflowPreviewProps {
  workflow: WorkflowData;
  onSaveToAutomations?: (workflow: WorkflowData) => void;
  isSaved?: boolean;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  workflow,
  onSaveToAutomations,
  isSaved = false,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleTestWorkflow = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setIsTestModalOpen(true);
    }, 900);
  };

  const handleSave = () => {
    if (onSaveToAutomations) {
      onSaveToAutomations(workflow);
      showToast({
        title: 'Automation saved to your library',
        message: `“${workflow.name}” is now active in My automations.`,
        type: 'success',
      });
    }
  };

  return (
    <>
      <Card className="border-stone-200/90 shadow-sm relative overflow-hidden">
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-forest-700/80" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/60 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggested Workflow</span>
              </span>
              <Badge variant="green" dot>
                Ready to review
              </Badge>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-stone-900 tracking-tight">
              {workflow.name}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              {workflow.summary}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="md"
              loading={isTesting}
              onClick={handleTestWorkflow}
              icon={<Play className="w-4 h-4 fill-forest-700" />}
            >
              Test this workflow
            </Button>

            {onSaveToAutomations && (
              <Button
                variant={isSaved ? 'secondary' : 'primary'}
                size="md"
                onClick={handleSave}
                disabled={isSaved}
                icon={isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <BookmarkPlus className="w-4 h-4" />}
              >
                {isSaved ? 'Saved in automations' : 'Save automation'}
              </Button>
            )}
          </div>
        </div>

        {/* 3 Connected Steps */}
        <div className="space-y-1 max-w-3xl mx-auto py-2">
          {workflow.steps.map((step, index) => (
            <WorkflowStepCard
              key={index}
              step={step}
              index={index}
              isLast={index === workflow.steps.length - 1}
            />
          ))}
        </div>
      </Card>

      {/* Test Execution Simulation Modal */}
      <TestRunModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        workflow={workflow}
      />
    </>
  );
};
