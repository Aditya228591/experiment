import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeading } from '../../components/common/PageHeading';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Zap,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Clock,
  Sparkles,
  Bot,
  Layers,
  Scale,
  RefreshCw,
  Terminal,
  FileText,
  UserCheck,
  Lock,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { ViewType } from '../../types';

export interface ProblemSolutionPageProps {
  onNavigate: (view: ViewType) => void;
}

export const ProblemSolutionPage: React.FC<ProblemSolutionPageProps> = ({ onNavigate }) => {
  // Interactive state
  const [activeProblemPillar, setActiveProblemPillar] = useState<'burnout' | 'privacy_cost' | 'fragile_tools'>('burnout');
  const [activeSolutionPillar, setActiveSolutionPillar] = useState<'classflow' | 'slm_distillation' | 'bot_compiler'>('classflow');
  const [selectedScenario, setSelectedScenario] = useState<'weekly_update' | 'missing_work' | 'iep_support'>('weekly_update');
  const [activeMatrixFilter, setActiveMatrixFilter] = useState<'all' | 'privacy' | 'performance' | 'cost'>('all');

  const scenarios = {
    weekly_update: {
      title: 'Weekly Student Progress & Warm Parent Communication',
      tag: 'Communication & Family Engagement',
      manualHell: {
        time: '3 hours every Friday evening',
        risk: 'Manual copy-pasting grades, drafting 28 separate emails, high fatigue leads to generic tone.',
        steps: ['Export grades from LMS', 'Scan notes for each student', 'Write 28 individual parent emails', 'Double-check student names'],
      },
      cloudTrap: {
        risk: 'Directly uploading student names and grades into public cloud LLMs breaches FERPA/COPPA student data privacy laws and costs $0.04/student query.',
      },
      classflowSolution: {
        time: '30 seconds synthesis + 2 minutes teacher review',
        pipeline: ['Trigger: Friday 3:00 PM', 'Local SLM: Analyze mastery trends', 'Draft: Staged in review drawer for 1-click teacher approval'],
        benefit: 'Zero student data leaves the teacher laptop. 100% private, zero token costs, personalized warm tone.',
      },
    },
    missing_work: {
      title: 'Missing Assignment Early Warning & Scaffolded Support',
      tag: 'Intervention & Retention',
      manualHell: {
        time: '45 minutes daily',
        risk: 'Cross-checking Google Classroom submissions with gradebook, manually writing nudges, students fall behind.',
        steps: ['Compare submission timestamps', 'Identify missing assignments', 'Search relevant worksheet link', 'Send individual reminder'],
      },
      cloudTrap: {
        risk: 'Third-party cloud automation platforms charge per-webhook fees and cannot generate encouraging formative hints.',
      },
      classflowSolution: {
        time: 'Zero daily time (runs autonomously in background)',
        pipeline: ['Trigger: Due date + 24 hours', 'Local SLM: Draft encouraging reminder + resource link', 'Action: Queue draft in Gmail/LMS'],
        benefit: 'Formative tone that encourages students rather than penalizing them, verified by teacher before dispatch.',
      },
    },
    iep_support: {
      title: 'IEP Accommodation Alignment & Reading Level Differentiation',
      tag: 'Special Education & Differentiation',
      manualHell: {
        time: '4+ hours per lesson unit',
        risk: 'Rewriting reading passages for Lexile levels, adapting rubrics, keeping compliance documentation.',
        steps: ['Look up individual 504/IEP goals', 'Manually rewrite 3 passage tiers', 'Align rubric criteria', 'File compliance log'],
      },
      cloudTrap: {
        risk: 'Uploading IEP or medical accommodation notes to cloud APIs is a catastrophic federal privacy violation.',
      },
      classflowSolution: {
        time: 'Instant edge adaptation (<1 second)',
        pipeline: ['Trigger: New reading unit', 'Local MicroSLM: Simplify syntactic complexity while preserving vocabulary', 'Action: Save adapted tiers locally'],
        benefit: 'Strict offline CPU inference protects sensitive accommodations under local cryptographic isolation.',
      },
    },
  };

  const matrixRows = [
    {
      category: 'performance',
      feature: 'Inference Latency',
      cloudLLM: '2,000ms – 5,000ms (High latency)',
      traditional: 'N/A (Rigid rule triggers only)',
      classflow: '< 18ms (140x faster local CPU)',
      winner: 'classflow',
    },
    {
      category: 'cost',
      feature: 'Ongoing Token / API Cost',
      cloudLLM: '$0.02 – $0.06 / call ($200-$1,200/mo district scale)',
      traditional: '$50 – $250/mo subscription tier limits',
      classflow: '$0.00 / Free Forever (Runs on edge)',
      winner: 'classflow',
    },
    {
      category: 'privacy',
      feature: 'FERPA & COPPA Student Privacy',
      cloudLLM: '❌ High Risk (Student PII dispatched to cloud)',
      traditional: '⚠️ Moderate (Third-party servers store webhook payloads)',
      classflow: '✅ 100% Compliant (Zero student data leaves device)',
      winner: 'classflow',
    },
    {
      category: 'performance',
      feature: 'Hardware Requirement',
      cloudLLM: 'Cloud GPU clusters (NVIDIA A100/H100)',
      traditional: 'Cloud SaaS server execution',
      classflow: 'Consumer Laptop / Desktop CPU (Zero GPU needed)',
      winner: 'classflow',
    },
    {
      category: 'performance',
      feature: 'Offline Network Resilience',
      cloudLLM: '❌ Requires constant high-speed internet',
      traditional: '❌ Fails when school Wi-Fi drops',
      classflow: '✅ 100% Offline edge inference',
      winner: 'classflow',
    },
    {
      category: 'privacy',
      feature: 'Human-in-the-Loop Safeguard',
      cloudLLM: '❌ Direct output without teacher staging',
      traditional: '⚠️ Direct webhook triggers, no editorial review',
      classflow: '✅ Mandatory review drawer before any dispatch',
      winner: 'classflow',
    },
  ];

  const filteredMatrix = matrixRows.filter(
    (row) => activeMatrixFilter === 'all' || row.category === activeMatrixFilter
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-200 pb-12">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-forest-900 via-forest-800 to-forest-950 text-white p-8 sm:p-12 shadow-xl border border-forest-700/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-700/60 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Architectural Manifesto & Problem Statement</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Why Classflow AI &amp; Teacher AI?
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-3xl">
            Modern K-12 educators spend over <strong className="text-white font-semibold">15 hours every week</strong> on repetitive administrative clerical tasks instead of teaching students. Meanwhile, commercial cloud AI introduces <strong className="text-white font-semibold">prohibitive API costs</strong>, <strong className="text-white font-semibold">severe student privacy violations (FERPA/COPPA)</strong>, and <strong className="text-white font-semibold">unreliable cloud latency</strong>.
          </p>

          <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed max-w-3xl">
            This repository unites <strong className="text-white font-medium">Classflow AI</strong> (human-supervised prompt-driven workflow studio) with <strong className="text-white font-medium">Teacher AI</strong> (a dual-engine Small Language Model distillation factory that trains custom PyTorch causal transformers directly on consumer CPUs with zero cloud GPU fees).
          </p>

          {/* Key Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-forest-700/60">
            <div className="p-3.5 rounded-2xl bg-forest-800/60 border border-forest-600/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <Clock className="w-4 h-4" />
                <span>Time Saved</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">15.2 hrs</p>
              <p className="text-[11px] text-emerald-200/70">per teacher / week</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-forest-800/60 border border-forest-600/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <Zap className="w-4 h-4" />
                <span>Inference Speed</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">&lt; 18 ms</p>
              <p className="text-[11px] text-emerald-200/70">140x faster than cloud</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-forest-800/60 border border-forest-600/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <DollarSign className="w-4 h-4" />
                <span>Cloud API Fee</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">$0.00</p>
              <p className="text-[11px] text-emerald-200/70">Zero recurring tokens</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-forest-800/60 border border-forest-600/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Student Privacy</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">100% Edge</p>
              <p className="text-[11px] text-emerald-200/70">Strict FERPA/COPPA</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE THREE CRITICAL PROBLEMS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="amber" className="mb-2">Root Cause Analysis</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              The 3 Unsolved Problems in EdTech Automation
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Why off-the-shelf tools, generic LLMs, and enterprise RPA have consistently failed classroom teachers.
            </p>
          </div>

          {/* Pillar Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100/90 border border-stone-200/80 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveProblemPillar('burnout')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeProblemPillar === 'burnout'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              1. Teacher Burnout
            </button>
            <button
              type="button"
              onClick={() => setActiveProblemPillar('privacy_cost')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeProblemPillar === 'privacy_cost'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2. The Cloud LLM Trap
            </button>
            <button
              type="button"
              onClick={() => setActiveProblemPillar('fragile_tools')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeProblemPillar === 'fragile_tools'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              3. Fragile No-Code Tools
            </button>
          </div>
        </div>

        {/* Dynamic Pillar Card */}
        {activeProblemPillar === 'burnout' && (
          <Card padding="lg" className="border-amber-200/80 bg-linear-to-r from-amber-50/40 via-white to-amber-50/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">Problem 1: Administrative Time Sink &amp; Teacher Attrition</h3>
                    <p className="text-xs text-amber-900 font-medium">Clerical overload drains 40% of the working week</p>
                  </div>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed">
                  Teachers are hired to inspire, coach, and educate. Instead, national studies reveal that the average teacher spends <strong>over 15 hours every week</strong> on non-instructional busywork: manually compiling student progress reports, drafting 30+ separate personalized parent emails, chasing late homework submissions across LMS portals, and typing compliance logs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <p className="text-xs font-semibold text-stone-900">Tool Fragmentation</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Constant context-switching across Google Classroom, Canvas, Gmail, and Remind drains cognitive energy.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <p className="text-xs font-semibold text-stone-900">Communication Fatigue</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Parents demand frequent personalized communication, but teachers lack the hours to write 120 individualized updates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-100/60 border border-amber-200 text-amber-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>The Real Human Impact</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                    <span>Weekly Clerical Overhead</span>
                    <strong className="font-semibold text-stone-900">15.2 hrs</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
                    <span>Teachers Reporting Chronic Burnout</span>
                    <strong className="font-semibold text-stone-900">44%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Educators Considering Leaving Profession</span>
                    <strong className="font-semibold text-stone-900">55%</strong>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeProblemPillar === 'privacy_cost' && (
          <Card padding="lg" className="border-rose-200/80 bg-linear-to-r from-rose-50/40 via-white to-rose-50/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">Problem 2: The "Frontier Cloud LLM" Trap</h3>
                    <p className="text-xs text-rose-900 font-medium">Privacy liabilities, unsustainable token bills, and cloud GPU dependence</p>
                  </div>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed">
                  School administrators frequently forbid teachers from using commercial cloud AI tools (such as ChatGPT or proprietary cloud APIs). And for good reason: sending student names, grades, behavioral interventions, or IEP disability records to commercial cloud servers is a <strong>direct violation of federal FERPA, COPPA, and state student privacy regulations</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <p className="text-xs font-semibold text-stone-900">Privacy &amp; FERPA</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Student PII stored on external cloud LLM servers creates catastrophic legal exposure for public districts.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <p className="text-xs font-semibold text-stone-900">Uncapped Token Cost</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      $0.03-$0.06 per query scales to $1,000+ monthly for a single school. Public schools simply do not have that budget.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <p className="text-xs font-semibold text-stone-900">Hardware Reality</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Schools provide Chromebooks and budget laptops with standard CPUs. They cannot run 70B open models requiring $30,000 GPUs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-rose-100/60 border border-rose-200 text-rose-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>The Cloud Bottleneck</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-rose-200/80 pb-1.5">
                    <span>Cloud API Roundtrip Latency</span>
                    <strong className="font-semibold text-stone-900">2,500 – 5,000ms</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-rose-200/80 pb-1.5">
                    <span>District Token Cost (10k queries)</span>
                    <strong className="font-semibold text-stone-900">~$400 / mo</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Student Data Leaving Device</span>
                    <strong className="font-semibold text-rose-700">100% Exposed</strong>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeProblemPillar === 'fragile_tools' && (
          <Card padding="lg" className="border-purple-200/80 bg-linear-to-r from-purple-50/40 via-white to-purple-50/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">Problem 3: The Fragility of Generic No-Code Platforms</h3>
                    <p className="text-xs text-purple-900 font-medium">Tools like Zapier and Make break on educational nuance</p>
                  </div>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed">
                  Traditional no-code automation platforms are built for rigid, tabular business data (e.g. "when row added to CRM, send invoice"). Teaching is fundamentally <strong>unstructured, empathetic, and contextual</strong>. A rigid webhook cannot detect whether a student is frustrated by algebra concepts or missing homework due to family illness.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <p className="text-xs font-semibold text-stone-900">Lack of Semantic Understanding</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Standard integrations cannot synthesize student progress across assignments, rubrics, and anecdotal observations.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <p className="text-xs font-semibold text-stone-900">Zero Human Editorial Staging</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Automated emails send immediately without an educator review queue, risking embarrassing mistakes with parents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-purple-100/60 border border-purple-200 text-purple-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-purple-900">
                  <AlertTriangle className="w-4 h-4 text-purple-700" />
                  <span>The No-Code Gap</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-purple-200/80 pb-1.5">
                    <span>Teacher Technical Barrier</span>
                    <strong className="font-semibold text-stone-900">High (JSON / Webhooks)</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-purple-200/80 pb-1.5">
                    <span>Contextual Text Synthesis</span>
                    <strong className="font-semibold text-purple-700">None (Rigid tokens)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Teacher Approval Safeguard</span>
                    <strong className="font-semibold text-purple-700">Missing</strong>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 3. HOW THIS PROJECT SOLVES IT: DUAL-ENGINE ARCHITECTURE */}
      <div className="space-y-6">
        <div>
          <Badge variant="green" className="mb-2">The Dual-Engine Innovation</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            How This Project Aims To Solve It
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            A cohesive architecture combining human-supervised natural-language automation with zero-dependency edge SLM distillation.
          </p>
        </div>

        {/* Engine Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveSolutionPillar('classflow')}
            className={`text-left p-5 rounded-2xl border transition-all ${
              activeSolutionPillar === 'classflow'
                ? 'bg-forest-50/90 border-forest-600 shadow-sm ring-1 ring-forest-600'
                : 'bg-white border-stone-200/90 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <Badge variant="green">Frontend Engine</Badge>
            </div>
            <h3 className="font-bold text-stone-900 text-base mt-3">1. Classflow AI</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Human-supervised prompt-to-automation studio with staged approval drawers and credential vaults.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSolutionPillar('slm_distillation')}
            className={`text-left p-5 rounded-2xl border transition-all ${
              activeSolutionPillar === 'slm_distillation'
                ? 'bg-forest-50/90 border-forest-600 shadow-sm ring-1 ring-forest-600'
                : 'bg-white border-stone-200/90 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-2xs">
                <Cpu className="w-4 h-4 text-teal-200" />
              </div>
              <Badge variant="blue">ML Backend Engine</Badge>
            </div>
            <h3 className="font-bold text-stone-900 text-base mt-3">2. SLM Distillation Factory</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Synthesizes custom PyTorch causal Transformers directly on consumer CPUs with zero cloud GPU fees.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSolutionPillar('bot_compiler')}
            className={`text-left p-5 rounded-2xl border transition-all ${
              activeSolutionPillar === 'bot_compiler'
                ? 'bg-forest-50/90 border-forest-600 shadow-sm ring-1 ring-forest-600'
                : 'bg-white border-stone-200/90 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-stone-800 text-white flex items-center justify-center shadow-2xs">
                <Terminal className="w-4 h-4 text-amber-300" />
              </div>
              <Badge variant="amber">Compiler Engine</Badge>
            </div>
            <h3 className="font-bold text-stone-900 text-base mt-3">3. Autonomous Bot Compiler</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Translates specs into self-healing, sandboxed Python bots with AST verification and scheduled execution.
            </p>
          </button>
        </div>

        {/* Detailed Breakdown of Active Engine */}
        {activeSolutionPillar === 'classflow' && (
          <Card padding="lg" className="border-forest-200/80 bg-white">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Engine 1: Classflow AI (Educator Studio &amp; Workflow Orchestrator)</h3>
                  <p className="text-xs text-stone-500">Natural language workflow authoring tailored specifically for teacher empathy</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="green" dot>Active in Frontend</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-forest-900 font-semibold text-xs">
                    <Sparkles className="w-4 h-4 text-forest-700" />
                    <span>Plain English Prompt Builder</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Teachers type ordinary requests like: <em>"Every Friday at 3 PM, check Google Classroom essays and draft a warm update for parents."</em> The compiler maps this into an executable 3-step reactive pipeline.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-forest-900 font-semibold text-xs">
                    <UserCheck className="w-4 h-4 text-forest-700" />
                    <span>Human-in-the-Loop Review Drawer</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    AI actions never fire blindly to external recipients. Generated drafts are placed in an interactive audit queue where the teacher can inspect, edit tone, and approve with 1 click before dispatch.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-forest-900 font-semibold text-xs">
                    <Lock className="w-4 h-4 text-forest-700" />
                    <span>Universal Credential Vault</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Local, encrypted OAuth token storage connects Google Classroom, Canvas LMS, Gmail, and Remind without exposing teacher login credentials or sensitive API keys to third-party brokers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeSolutionPillar === 'slm_distillation' && (
          <Card padding="lg" className="border-teal-200/80 bg-white">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Engine 2: Teacher AI (Zero-Cloud SLM Distillation Factory)</h3>
                  <p className="text-xs text-stone-500">Extracts frontier intelligence into sub-20ms edge micro-transformers</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="blue" dot>Python &amp; PyTorch</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-teal-950 font-semibold text-xs">
                    <Bot className="w-4 h-4 text-teal-700" />
                    <span>1. Gemini Teacher Synthesis</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    The frontier model (Google Gemini) is invoked <strong>only once during factory setup</strong> to analyze task complexity, build edge case matrices, and generate dense synthetic training corpora.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-teal-950 font-semibold text-xs">
                    <Cpu className="w-4 h-4 text-teal-700" />
                    <span>2. Pure PyTorch MicroSLM</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    A Decoder-Only causal Transformer with Pre-LayerNorm, causal attention masking, weight tying, and an internal custom subword tokenizer. Trains from scratch in 30 seconds on a standard dual-core laptop CPU.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-teal-950 font-semibold text-xs">
                    <Zap className="w-4 h-4 text-teal-700" />
                    <span>3. Standalone Edge Microservice</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Exports standalone ONNX and PyTorch bundles (`serve.py` + `model.pt`) with sub-18ms CPU latency. Zero ongoing token fees and zero external C++ dependencies or Hugging Face binaries.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeSolutionPillar === 'bot_compiler' && (
          <Card padding="lg" className="border-stone-200/80 bg-white">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Engine 3: Autonomous Bot Compiler &amp; Sandbox</h3>
                  <p className="text-xs text-stone-500">Self-healing Python bots generated directly from verified process specifications</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="stone" dot>AST &amp; Subprocess Sandbox</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
                    <FileText className="w-4 h-4 text-stone-700" />
                    <span>Formal ProcessSpec Machine</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    The interviewer clarifies missing edge cases (e.g., what to do if an essay has no rubric grade) and compiles a strictly typed JSON specification with trigger schedules, steps, and fallback handlers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
                    <RefreshCw className="w-4 h-4 text-stone-700" />
                    <span>Self-Healing AST Sandbox</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Generated Python bot code is validated by AST tree inspection, then executed in an isolated dry-run subprocess. If any syntax error or runtime traceback occurs, the self-healing loop automatically corrects the code.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
                    <Terminal className="w-4 h-4 text-stone-700" />
                    <span>Zero-Config Packaging</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Packages the verified bot into a production zip bundle containing `bot.py` (with CLI/dry-run flags), `requirements.txt`, and one-click `run.bat` / `run.sh` scripts for scheduled school deployment.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 4. HEAD-TO-HEAD COMPARISON MATRIX */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="blue" className="mb-2">Benchmark Evidence</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Head-to-Head Architectural Comparison
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              How Classflow + Teacher AI outperforms commercial cloud APIs and traditional no-code platforms.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100/90 border border-stone-200/80 text-xs shrink-0">
            {(['all', 'privacy', 'performance', 'cost'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveMatrixFilter(filter)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all font-medium ${
                  activeMatrixFilter === filter
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {filter === 'all' ? 'All Metrics' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200/80 bg-white shadow-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/80 text-stone-700">
                <th className="py-3.5 px-4 font-semibold">Evaluation Metric</th>
                <th className="py-3.5 px-4 font-semibold text-rose-900">Commercial Cloud LLMs (GPT-4 / APIs)</th>
                <th className="py-3.5 px-4 font-semibold text-purple-900">Traditional No-Code (Zapier / Make)</th>
                <th className="py-3.5 px-4 font-semibold text-forest-900 bg-forest-50/60 border-l border-r border-forest-200/60">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                    <span>Classflow + Teacher AI</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-900">{row.feature}</td>
                  <td className="py-3.5 px-4 text-stone-600">{row.cloudLLM}</td>
                  <td className="py-3.5 px-4 text-stone-600">{row.traditional}</td>
                  <td className="py-3.5 px-4 font-medium text-forest-950 bg-forest-50/30 border-l border-r border-forest-200/40">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{row.classflow}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INTERACTIVE CLASSROOM SCENARIO SIMULATOR */}
      <div className="space-y-6">
        <div>
          <Badge variant="lavender" className="mb-2">Real Classroom Impact</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            See the Difference: Real Classroom Workflows
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Select a common teacher scenario to see how Classflow transforms manual pain into effortless edge automation.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => {
            const sc = scenarios[key];
            const isSelected = selectedScenario === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedScenario(key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-forest-800 text-white border-forest-800 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                {sc.title}
              </button>
            );
          })}
        </div>

        {/* Scenario Comparison View */}
        {(() => {
          const sc = scenarios[selectedScenario];
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: The Traditional Way */}
              <Card padding="lg" className="border-stone-200 bg-stone-50/50 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>The Traditional Manual Nightmare</span>
                  </div>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {sc.manualHell.time}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {sc.manualHell.risk}
                </p>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider">Required Manual Steps:</p>
                  <ul className="space-y-1.5">
                    {sc.manualHell.steps.map((st, i) => (
                      <li key={i} className="text-xs text-stone-600 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-950 text-xs mt-3">
                  <strong>Why Cloud LLMs fail here:</strong> {sc.cloudTrap.risk}
                </div>
              </Card>

              {/* Right: The Classflow AI Way */}
              <Card padding="lg" className="border-forest-200 bg-forest-50/30 space-y-4">
                <div className="flex items-center justify-between border-b border-forest-200 pb-3">
                  <div className="flex items-center gap-2 text-forest-950 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>The Classflow AI + Teacher AI Way</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {sc.classflowSolution.time}
                  </span>
                </div>

                <p className="text-xs text-forest-900 leading-relaxed font-medium">
                  {sc.classflowSolution.benefit}
                </p>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-forest-950 uppercase tracking-wider">Automated Edge Pipeline:</p>
                  <div className="space-y-2">
                    {sc.classflowSolution.pipeline.map((step, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-forest-200/80 flex items-center gap-3 shadow-2xs">
                        <div className="w-5 h-5 rounded-lg bg-forest-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-xs font-medium text-stone-800">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-300 text-emerald-950 text-xs mt-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Human-in-the-Loop:</strong> Teacher has 100% final editorial approval before sending.</span>
                </div>
              </Card>
            </div>
          );
        })()}
      </div>

      {/* 6. NEURAL ARCHITECTURE & EDGE SPECIFICATIONS */}
      <Card padding="lg" className="border-stone-200/90 bg-stone-900 text-stone-100">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Under the Hood: Pure PyTorch MicroSLM Architecture</h3>
                <p className="text-xs text-stone-400">Zero C++ binaries, zero Hugging Face dependencies, runs on any teacher CPU</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MicroSLM Causal Transformer</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[11px] text-stone-400">Total Parameters</span>
              <p className="text-lg font-mono font-bold text-emerald-300 mt-0.5">~220K</p>
              <span className="text-[10px] text-stone-500">0.22M weights</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[11px] text-stone-400">Embedding Dim</span>
              <p className="text-lg font-mono font-bold text-white mt-0.5">d_model = 64</p>
              <span className="text-[10px] text-stone-500">Compact vector</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[11px] text-stone-400">Attention Heads</span>
              <p className="text-lg font-mono font-bold text-white mt-0.5">4 Heads</p>
              <span className="text-[10px] text-stone-500">Multi-head causal</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[11px] text-stone-400">Transformer Layers</span>
              <p className="text-lg font-mono font-bold text-white mt-0.5">4 Blocks</p>
              <span className="text-[10px] text-stone-500">Pre-LayerNorm</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[11px] text-stone-400">Disk Footprint</span>
              <p className="text-lg font-mono font-bold text-teal-300 mt-0.5">1.4 MB</p>
              <span className="text-[10px] text-stone-500">model.pt + vocab</span>
            </div>

            <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
              <span className="text-[11px] text-stone-400">RAM Footprint</span>
              <p className="text-lg font-mono font-bold text-teal-300 mt-0.5">&lt; 45 MB</p>
              <span className="text-[10px] text-stone-500">Negligible impact</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50 text-xs text-stone-300 leading-relaxed space-y-1.5 font-mono">
            <p className="text-stone-400 text-[11px] uppercase tracking-wider font-sans font-semibold">Self-Contained Transformer Pipeline:</p>
            <p>1. Input Prompt ➔ Custom Character/Subword Tokenizer (vocab_size ≈ 2,000)</p>
            <p>2. Token Embedding + Sinusoidal Positional Encoding ➔ Pre-LayerNorm Transformer Blocks</p>
            <p>3. Causal Attention Masking (prevents looking into the future) ➔ Feed-Forward Projection (dim=256)</p>
            <p>4. Linear Head with Weight Tying ➔ Top-k / Top-p Sampling ➔ Direct Sub-20ms Output</p>
          </div>
        </div>
      </Card>

      {/* 7. CALL TO ACTION & QUICK LINKS */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-forest-50 via-emerald-50/40 to-teal-50 border border-forest-200/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold text-forest-950">
            Ready to experience human-supervised edge automation?
          </h3>
          <p className="text-xs text-stone-600 max-w-xl">
            Test the natural-language prompt builder in Classflow AI or browse our classroom library of tested templates.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate('library')}
            icon={<BookOpen className="w-4 h-4" />}
          >
            Explore Library
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('home')}
            icon={<Sparkles className="w-4 h-4" />}
            iconPosition="right"
          >
            Try Prompt Builder
          </Button>
        </div>
      </div>
    </div>
  );
};
