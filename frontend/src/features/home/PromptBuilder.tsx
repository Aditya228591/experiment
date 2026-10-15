import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export interface PromptBuilderProps {
  initialPrompt?: string;
  onBuild: (prompt: string) => Promise<void>;
  isLoading: boolean;
  focusTrigger?: number;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  initialPrompt = '',
  onBuild,
  isLoading,
  focusTrigger = 0,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      setError(null);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (focusTrigger > 0 && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusTrigger]);

  const examples = [
    {
      label: 'Weekly parent updates',
      text: 'Every Friday, summarize each student’s progress and draft an update for their parents based on this week’s assignments.',
    },
    {
      label: 'Create quiz feedback',
      text: 'After a quiz is graded, generate personalized feedback for every student focusing on specific misconceptions.',
    },
    {
      label: 'Flag missing work',
      text: 'Every morning at 8:00 AM, identify students with missing assignments and prepare a quiet check-in list.',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Please describe a task or choose an example below to build an automation.');
      textareaRef.current?.focus();
      return;
    }

    setError(null);
    try {
      await onBuild(trimmed);
      showToast({
        title: 'Automation generated successfully',
        message: 'Classflow analyzed your instructions and assembled a 3-step workflow.',
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Could not generate workflow',
        message: err.message || 'Please try rephrasing your description.',
        type: 'error',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="border-stone-200/90 shadow-sm">
      {/* Header section */}
      <div className="space-y-1.5 mb-5 text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
          What can we take off your plate?
        </h2>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
          Describe a repetitive task in plain language. Classflow will turn it into a simple automation you can review and control.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Natural Language Textarea */}
        <div className="relative">
          <label htmlFor="automation-prompt" className="sr-only">
            Describe a repetitive classroom task
          </label>
          <textarea
            id="automation-prompt"
            ref={textareaRef}
            rows={4}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="For example: Every Friday, summarize each student’s progress and draft an update for their parents..."
            className={`w-full p-4 rounded-xl text-stone-900 text-sm sm:text-base placeholder:text-stone-400 bg-canvas/40 border transition-all resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white ${
              error ? 'border-red-400 ring-1 ring-red-300' : 'border-stone-300/80 hover:border-stone-400'
            }`}
          />

          {/* Shortcut hint on desktop */}
          <div className="hidden sm:flex items-center gap-1.5 absolute right-3 bottom-3 text-[11px] text-stone-400 pointer-events-none select-none">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-mono">
              Ctrl+Enter
            </kbd>
          </div>
        </div>

        {/* Validation error if prompt empty */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 animate-in fade-in duration-150" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Examples & Build button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Clickable example prompts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-stone-500 mr-1">Examples:</span>
            {examples.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => {
                  setPrompt(example.text);
                  setError(null);
                  textareaRef.current?.focus();
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200/70 text-stone-700 transition-colors border border-stone-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700"
              >
                {example.label}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              icon={<Sparkles className="w-4 h-4 text-emerald-300" />}
              className="w-full sm:w-auto"
            >
              Build my automation
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
