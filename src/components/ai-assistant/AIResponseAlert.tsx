import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AIResponseBlock } from './AIResponseBlock';

// Import SVG graphs
import graph1Ko from '@/assets/ai-assistant/alert/graph_1.svg';
import graph1En from '@/assets/ai-assistant/alert/graph_1_eng.svg';
import graph3 from '@/assets/ai-assistant/alert/graph_3.svg';
import graph4 from '@/assets/ai-assistant/alert/graph_4.svg';
import checkBrokenIcon from '@/assets/ai-assistant/alert/check-broken.svg';
import upArrowIcon from '@/assets/ai-assistant/alert/up-arrow.svg';
import downArrowIcon from '@/assets/ai-assistant/alert/down-arrow.svg';

// Import loading animation video
import loadingAnimationVideo from '@/assets/ai-assistant/alert/Willog_Symbol_motion.mp4';

interface AIResponseAlertProps {
  onBack: () => void; // Reserved for future back navigation functionality
}

// Analysis phase types
type AnalysisPhase = 'analyzing' | 'preparing' | 'content';

// Task status types for monitoring feed
type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Task data structure
interface MonitoringTask {
  id: string;
  title: string;
  subItems?: string[];
  completedTime?: string;
}

// Arrow up icon for delta badges (uses imported SVG)
const ArrowUpIcon = () => (
  <img src={upArrowIcon} alt="" className="w-2 h-2" />
);

// Arrow down icon for positive delta badges (temperature decrease, uses imported SVG)
const ArrowDownIcon = () => (
  <img src={downArrowIcon} alt="" className="w-2 h-2" />
);

// Check icon for completion title (uses imported check-broken.svg)
const CheckIcon = () => (
  <img src={checkBrokenIcon} alt="" className="w-6 h-6" />
);

// iOS Style Spinner Component (slower animation - 2.5s)
const IOSSpinner = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ animation: 'spin 2.5s linear infinite' }}
  >
    {[...Array(12)].map((_, i) => (
      <rect
        key={i}
        x="13"
        y="2"
        width="2"
        height="6"
        rx="1"
        fill="#737680"
        fillOpacity={1 - i * 0.08}
        transform={`rotate(${i * 30} 14 14)`}
      />
    ))}
  </svg>
);

// Task dot icon - gray circle for completed/pending (Figma exact)
const TaskDotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="4" fill="#B8B8C0" />
  </svg>
);

// Task dot icon - blue circle for in-progress (Figma exact)
const TaskDotActiveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="4" fill="#417DF7" />
  </svg>
);

// Sub-item vertical line icon (Figma exact)
const SubItemLineIcon = () => (
  <svg width="16" height="26" viewBox="0 0 16 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0L8 26" stroke="#B8B8C0" strokeWidth="1" />
  </svg>
);

// Chevron down icon
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 6L8 9.5L11.5 6" stroke="#909097" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AIResponseAlert = ({ onBack: _onBack }: AIResponseAlertProps) => {
  const { t, i18n } = useTranslation();
  const [phase, setPhase] = useState<AnalysisPhase>('analyzing');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const actionSectionRef = useRef<HTMLDivElement>(null);
  const completionSectionRef = useRef<HTMLDivElement>(null);

  // Refs for progressive scrolling
  const realtimeTempRef = useRef<HTMLParagraphElement>(null);
  const monitoringFeedRef = useRef<HTMLParagraphElement>(null);
  const resultSummaryRef = useRef<HTMLDivElement>(null);
  const followUpRef = useRef<HTMLDivElement>(null);

  // Task completion state
  const [completedTaskIndex, setCompletedTaskIndex] = useState(-1);
  const [showActionSection, setShowActionSection] = useState(false);
  const [showCompletionSection, setShowCompletionSection] = useState(false);

  // Select appropriate graph based on language
  const graph1 = i18n.language === 'en' ? graph1En : graph1Ko;

  // Monitoring tasks data (from Figma) - using translation keys
  const monitoringTasks: MonitoringTask[] = [
    {
      id: 'task-1',
      title: t('aiAssistant.alert.action.tasks.systemWarning'),
      subItems: [t('aiAssistant.alert.action.tasks.systemWarningSub')],
      completedTime: '06:53:15'
    },
    {
      id: 'task-2',
      title: t('aiAssistant.alert.action.tasks.driverComm'),
      subItems: [t('aiAssistant.alert.action.tasks.driverCommSub')],
      completedTime: '06:53:18'
    },
    {
      id: 'task-3',
      title: t('aiAssistant.alert.action.tasks.speedReduction'),
      subItems: [t('aiAssistant.alert.action.tasks.speedReductionSub')],
      completedTime: '06:53:21'
    },
    {
      id: 'task-4',
      title: t('aiAssistant.alert.action.tasks.sendingAlerts'),
      subItems: [
        t('aiAssistant.alert.action.tasks.alertSub1'),
        t('aiAssistant.alert.action.tasks.alertSub2'),
        t('aiAssistant.alert.action.tasks.alertSub3')
      ],
      completedTime: '06:53:24'
    },
    {
      id: 'task-5',
      title: t('aiAssistant.alert.action.tasks.vehicleSpeed'),
      completedTime: '06:53:27'
    },
    {
      id: 'task-6',
      title: t('aiAssistant.alert.action.tasks.targetSpeed'),
      subItems: [t('aiAssistant.alert.action.tasks.targetSpeedSub')],
      completedTime: '06:53:30'
    },
    {
      id: 'task-7',
      title: t('aiAssistant.alert.action.tasks.tempDrop'),
      completedTime: '06:53:33'
    },
  ];

  // Get current task status
  const getTaskStatus = (index: number): TaskStatus => {
    if (index < completedTaskIndex) return 'completed';
    if (index === completedTaskIndex) return 'in_progress';
    return 'pending';
  };

  // Get current in-progress task title for header
  const getCurrentTaskTitle = () => {
    if (completedTaskIndex >= 0 && completedTaskIndex < monitoringTasks.length) {
      const task = monitoringTasks[completedTaskIndex];
      // Check if it's the alerts task (task-4)
      if (task.id === 'task-4') {
        return t('aiAssistant.alert.action.sendingAlerts');
      }
      return task.title + '...';
    }
    return t('aiAssistant.alert.action.preparingAction');
  };

  // Helper function to scroll to element within the scroll container
  const scrollToElement = (element: HTMLElement | null) => {
    if (!element || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate the scroll position relative to the container
    // Use larger offset (60px = 3.75rem) to ensure title is clearly visible at top
    // This accounts for any header space and gives comfortable breathing room
    const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 60;

    container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    });
  };

  // Set video playback speed to 1.5x
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
  }, []);

  // Analysis phase timing: 3s analyzing -> 3s preparing -> content
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('preparing');
    }, 3000);

    const timer2 = setTimeout(() => {
      setPhase('content');
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Task completion animation - starts after content is shown
  useEffect(() => {
    if (phase !== 'content') return;

    // Start task completion sequence after action section appears
    const startDelay = setTimeout(() => {
      setShowActionSection(true);

      // Start first task after a short delay
      setTimeout(() => {
        setCompletedTaskIndex(0);
      }, 500);
    }, 1500); // Wait for action section to animate in

    return () => clearTimeout(startDelay);
  }, [phase]);

  // Progress through tasks every 2 seconds
  useEffect(() => {
    if (completedTaskIndex < 0 || completedTaskIndex >= monitoringTasks.length - 1) return;

    const timer = setTimeout(() => {
      setCompletedTaskIndex(prev => prev + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [completedTaskIndex, monitoringTasks.length]);

  // Auto-scroll to action section with progressive scrolling for each block
  useEffect(() => {
    if (!showActionSection) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Scroll to action section title with spinner (delay: 500ms)
    // Use requestAnimationFrame to ensure element is rendered before scrolling
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(actionSectionRef.current);
      });
    }, 500));

    // Scroll to realtime temp section (delay: 3500ms - 3s viewing time for spinner/title)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(realtimeTempRef.current);
      });
    }, 3500));

    // Scroll to monitoring feed section (delay: 6500ms - 3s viewing time for temp chart)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(monitoringFeedRef.current);
      });
    }, 6500));

    return () => timers.forEach(clearTimeout);
  }, [showActionSection]);

  // Show completion section after all tasks are done
  useEffect(() => {
    if (completedTaskIndex >= monitoringTasks.length - 1) {
      // Wait 2 seconds after last task completes, then show completion section
      const timer = setTimeout(() => {
        setShowCompletionSection(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [completedTaskIndex, monitoringTasks.length]);

  // Auto-scroll to completion section with progressive scrolling for each block
  useEffect(() => {
    if (!showCompletionSection) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Scroll to completion section title (delay: 500ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(completionSectionRef.current);
      });
    }, 500));

    // Scroll to result summary section (delay: 3500ms - 3s viewing time for completion title)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(resultSummaryRef.current);
      });
    }, 3500));

    // Scroll to follow-up actions section (delay: 6500ms - 3s viewing time for result summary)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(followUpRef.current);
      });
    }, 6500));

    return () => timers.forEach(clearTimeout);
  }, [showCompletionSection]);

  // Always show the main container with title, loading text below title during analysis
  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="flex justify-center pt-[3.75rem] pb-[12.5rem]">
        <div className="w-[48.75rem] flex flex-col gap-[1.75rem]">
          {/* Title Section - Always visible */}
          <div className="flex flex-col gap-[1rem]">
            <p className="text-[1.5rem] leading-[1.3] font-normal text-gray-1000 whitespace-pre-line">
              {t('aiAssistant.alert.title')}
            </p>
          </div>

          {/* Loading State - Shows below title during analysis phases */}
          {phase !== 'content' && (
            <div className="flex items-center">
              <div className="w-[3rem] h-[3rem] shrink-0 overflow-hidden">
                <video
                  ref={videoRef}
                  src={loadingAnimationVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-[6rem] h-[6rem] object-contain origin-top-left scale-50"
                />
              </div>
              <p className="text-[1rem] leading-[1.48] text-gray-1000 ml-[-1rem]">
                {phase === 'analyzing'
                  ? t('aiAssistant.alert.analyzing')
                  : t('aiAssistant.alert.preparingResponse')}
              </p>
            </div>
          )}

          {/* Content - Shows after loading completes */}
          {phase === 'content' && (
            <>
              {/* Description Section */}
              <AIResponseBlock delay={0} className="flex flex-col gap-[0.5rem]">
                <p className="text-[1rem] leading-[1.48] text-gray-1000">
                  {t('aiAssistant.alert.description')}
                </p>
                <div className="flex items-center gap-[0.25rem] bg-black/8 rounded px-[0.375rem] h-[1.25rem] w-fit">
                  <span className="font-mono text-[0.75rem] text-gray-1000">CRN-2025-0045</span>
                  <span className="font-mono text-[0.75rem] text-gray-600">+2</span>
                </div>
              </AIResponseBlock>

              {/* Divider */}
              <AIResponseBlock delay={150}>
                <div className="h-px bg-gray-300" />
              </AIResponseBlock>

              {/* Current Status Section */}
              <AIResponseBlock delay={300} className="flex flex-col gap-[1rem]">
                <p className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000">
                  {t('aiAssistant.alert.currentStatus')}
                </p>
                <div className="bg-gray-50 rounded-[0.625rem] px-[3rem] py-[1.5rem]">
                  <div className="flex items-center justify-center gap-[3rem] px-[1rem]">
                    {/* Current Temperature */}
                    <div className="flex flex-col gap-[0.5rem] items-center">
                      <p className="text-[0.875rem] leading-none text-gray-600">
                        {t('aiAssistant.alert.currentTemp')}
                      </p>
                      <p className="text-[2rem] leading-none font-display text-gray-1000">
                        {t('aiAssistant.alert.tempValue')}
                      </p>
                      <div className="flex items-center gap-[0.25rem] bg-red-100 text-error rounded-full px-[0.625rem] h-[1.25rem]">
                        <ArrowUpIcon />
                        <span className="font-mono text-[0.75rem]">
                          {t('aiAssistant.alert.tempDelta')}
                        </span>
                      </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px h-[4rem] bg-gray-300" />

                    {/* Current Speed */}
                    <div className="flex flex-col gap-[0.5rem] items-center">
                      <p className="text-[0.875rem] leading-none text-gray-600">
                        {t('aiAssistant.alert.currentSpeed')}
                      </p>
                      <p className="text-[2rem] leading-none font-display text-gray-1000">
                        {t('aiAssistant.alert.speedValue')}
                      </p>
                      <div className="flex items-center gap-[0.25rem] bg-red-100 text-error rounded-full px-[0.625rem] h-[1.25rem]">
                        <ArrowUpIcon />
                        <span className="font-mono text-[0.75rem]">
                          {t('aiAssistant.alert.speedDelta')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AIResponseBlock>

              {/* Divider */}
              <AIResponseBlock delay={450}>
                <div className="h-px bg-gray-300" />
              </AIResponseBlock>

              {/* Forecast & Temperature Trends Section */}
              <AIResponseBlock delay={600} className="flex flex-col gap-[1.5rem]">
                <div className="flex flex-col gap-[1rem]">
                  <p className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000">
                    {t('aiAssistant.alert.forecastTitle')}
                  </p>
                  <div className="flex flex-col gap-[0.5rem]">
                    <p className="text-[1rem] leading-[1.48] text-gray-1000">
                      {t('aiAssistant.alert.forecastDesc')}
                    </p>
                    <div className="flex items-center gap-[0.25rem] bg-black/8 rounded px-[0.375rem] h-[1.25rem] w-fit">
                      <span className="font-mono text-[0.75rem] text-gray-1000">CRN-2025-0045</span>
                      <span className="font-mono text-[0.75rem] text-gray-600">+2</span>
                    </div>
                  </div>
                </div>
                {/* Graph 1 - Temperature Trend */}
                <div className="rounded-[0.625rem] overflow-hidden">
                  <img
                    src={graph1}
                    alt={t('aiAssistant.alert.forecastTitle')}
                    className="w-full h-auto"
                  />
                </div>
              </AIResponseBlock>

              {/* Divider */}
              <AIResponseBlock delay={750}>
                <div className="h-px bg-gray-300" />
              </AIResponseBlock>

              {/* AI Root Cause Analysis Section */}
              <AIResponseBlock delay={900} className="flex flex-col gap-[1.5rem]">
                <div className="flex flex-col gap-[1rem]">
                  <p className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000">
                    {t('aiAssistant.alert.rcaTitle')}
                  </p>
                  <div className="flex flex-col gap-[0.5rem]">
                    <p className="text-[1rem] leading-[1.48] text-gray-1000">
                      {t('aiAssistant.alert.rcaDesc')}
                    </p>
                    <div className="flex gap-[0.5rem]">
                      <div className="flex items-center gap-[0.25rem] bg-black/8 rounded px-[0.375rem] h-[1.25rem]">
                        <span className="text-[0.75rem] leading-none text-gray-1000">
                          {t('aiAssistant.alert.rcaTags.historical')}
                        </span>
                        <span className="font-mono text-[0.75rem] text-gray-600">67</span>
                      </div>
                      <div className="flex items-center gap-[0.25rem] bg-gray-200 rounded px-[0.375rem] h-[1.25rem]">
                        <span className="text-[0.75rem] leading-none text-gray-1000">
                          {t('aiAssistant.alert.rcaTags.equipment')}
                        </span>
                        <span className="font-mono text-[0.75rem] text-gray-600">112</span>
                      </div>
                      <div className="flex items-center bg-gray-200 rounded px-[0.375rem] h-[1.25rem]">
                        <span className="text-[0.75rem] leading-none text-gray-1000">
                          {t('aiAssistant.alert.rcaTags.sensor')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* RCA Bar Chart */}
                <div className="bg-gray-50 rounded-[0.625rem] p-[2rem] flex flex-col gap-[0.75rem]">
                  {/* Power supply issue - 87% */}
                  <div className="bg-primary flex items-start justify-between p-[1rem] h-[3.75rem] text-white w-full">
                    <span className="text-[0.875rem] leading-none">
                      {t('aiAssistant.alert.rcaCauses.powerSupply')}
                    </span>
                    <span className="text-[1.5rem] leading-none font-display">87%</span>
                  </div>
                  {/* Cooling fan assembly failure - 12% */}
                  <div className="bg-black/8 flex items-start justify-between p-[1rem] h-[3.75rem] text-gray-1000" style={{ width: '71%' }}>
                    <span className="text-[0.875rem] leading-none">
                      {t('aiAssistant.alert.rcaCauses.coolingFan')}
                    </span>
                    <span className="text-[1.5rem] leading-none font-display">12%</span>
                  </div>
                  {/* Main board damage - 1% */}
                  <div className="bg-black/8 flex items-start justify-between p-[1rem] h-[3.75rem] text-gray-1000" style={{ width: '60.5%' }}>
                    <span className="text-[0.875rem] leading-none">
                      {t('aiAssistant.alert.rcaCauses.mainBoard')}
                    </span>
                    <span className="text-[1.5rem] leading-none font-display">1%</span>
                  </div>
                </div>
              </AIResponseBlock>

              {/* Divider */}
              <AIResponseBlock delay={1050}>
                <div className="h-px bg-gray-300" />
              </AIResponseBlock>

              {/* AI Recommended Actions Section */}
              <AIResponseBlock delay={1200} className="flex flex-col gap-[1rem]">
                <div className="flex flex-col gap-[1rem]">
                  <p className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000">
                    {t('aiAssistant.alert.recommendedTitle')}
                  </p>
                  <ul className="list-disc ms-[1.5rem] text-[1rem] leading-[1.48] text-gray-1000">
                    {(t('aiAssistant.alert.recommendedActions', { returnObjects: true }) as string[]).map((action, index) => (
                      <li key={index} className={index < 2 ? 'mb-0' : ''}>
                        {action}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[1rem] leading-[1.48] text-gray-1000">
                    {t('aiAssistant.alert.recommendedDesc')}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-[0.5rem]">
                  <button className="h-[2rem] px-[0.75rem] bg-[#E1EEFE] text-[#1858B4] text-[0.8125rem] leading-none font-medium rounded-[0.25rem]">
                    {t('aiAssistant.alert.sendNotifications')}
                  </button>
                  <button className="h-[2rem] px-[0.75rem] border border-gray-300 text-gray-800 text-[0.8125rem] leading-none font-medium rounded-[0.25rem]">
                    {t('aiAssistant.alert.viewDetailedData')}
                  </button>
                </div>
              </AIResponseBlock>

              {/* ========== NEW SECTIONS FROM FIGMA ========== */}

              {/* Divider */}
              <AIResponseBlock delay={1350}>
                <div className="h-px bg-gray-300" />
              </AIResponseBlock>

              {/* Action Execution Section - Title with iOS Spinner */}
              {showActionSection && (
                <>
                  <AIResponseBlock delay={0} className="flex flex-col gap-[1rem]">
                    <div ref={actionSectionRef} className="flex items-center gap-[0.75rem] scroll-mt-8">
                      <IOSSpinner />
                      <p className="text-[1.5rem] leading-[1.3] font-normal text-gray-1000">
                        {t('aiAssistant.alert.action.title')}
                      </p>
                    </div>
                    <p className="text-[1rem] leading-[1.48] text-gray-1000">
                      {t('aiAssistant.alert.action.description')}
                    </p>
                  </AIResponseBlock>

                  {/* Divider */}
                  <AIResponseBlock delay={100}>
                    <div className="h-px bg-gray-300" />
                  </AIResponseBlock>

                  {/* Realtime Temperature Trend Section */}
                  <AIResponseBlock delay={200} className="flex flex-col gap-[1rem]">
                    <p ref={realtimeTempRef} className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                      {t('aiAssistant.alert.action.realtimeTempTrends')}
                    </p>
                    <div className="rounded-[0.625rem] overflow-hidden">
                      <img
                        src={graph3}
                        alt={t('aiAssistant.alert.action.realtimeTempTrends')}
                        className="w-full h-auto"
                      />
                    </div>
                  </AIResponseBlock>

                  {/* Divider */}
                  <AIResponseBlock delay={300}>
                    <div className="h-px bg-gray-300" />
                  </AIResponseBlock>

                  {/* Realtime Monitoring Feed Section */}
                  <AIResponseBlock delay={400} className="flex flex-col gap-[1rem]">
                    <p ref={monitoringFeedRef} className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                      {t('aiAssistant.alert.action.realtimeMonitoringFeed')}
                    </p>
                    <div className="border border-gray-300 rounded-[0.625rem] overflow-hidden bg-white">
                      {/* Header */}
                      <div className="flex items-center justify-between p-[1rem] border-b border-gray-300">
                        <p className="text-[0.8125rem] leading-none text-gray-1000">
                          {getCurrentTaskTitle()}
                        </p>
                        <button className="flex items-center gap-[0.25rem] text-[0.75rem] text-gray-600">
                          {t('aiAssistant.alert.action.viewDetails')}
                          <ChevronDownIcon />
                        </button>
                      </div>

                      {/* Task List - all content visible */}
                      <div className="p-[1rem]">
                        <div className="flex flex-col gap-[0.5rem]">
                          {monitoringTasks.map((task, index) => {
                            const status = getTaskStatus(index);
                            return (
                              <div key={task.id} className="flex flex-col gap-[0.5rem]">
                                {/* Main task item */}
                                <div className="flex items-center gap-[0.25rem]">
                                  {/* Status icon - Figma exact (gray/blue circles) */}
                                  <div className="w-[1rem] h-[1rem] flex items-center justify-center shrink-0">
                                    {status === 'completed' && <TaskDotIcon />}
                                    {status === 'in_progress' && <TaskDotActiveIcon />}
                                    {status === 'pending' && <TaskDotIcon />}
                                  </div>

                                  {/* Task content */}
                                  <div className="flex-1 flex items-center justify-between">
                                    <p className={`text-[0.75rem] leading-[1.48] ${
                                      status === 'pending' ? 'text-gray-500' : 'text-gray-1000'
                                    }`}>
                                      {task.title}
                                    </p>

                                    {/* Completed time badge */}
                                    {status === 'completed' && task.completedTime && (
                                      <div className="bg-black/8 rounded px-[0.375rem] h-[1.125rem] flex items-center">
                                        <span className="text-[0.75rem] leading-none text-gray-1000">
                                          <span className="font-mono">{task.completedTime}</span>
                                          <span> {t('aiAssistant.alert.action.completed')}</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Sub items with vertical line icon (Figma exact) */}
                                {task.subItems && (status === 'completed' || status === 'in_progress') && (
                                  <div className="flex flex-col ml-[0rem]">
                                    {task.subItems.map((subItem, subIndex) => (
                                      <div key={subIndex} className="flex items-start gap-[0.25rem]">
                                        <div className="w-[1rem] flex items-center justify-center shrink-0">
                                          <SubItemLineIcon />
                                        </div>
                                        <p className="text-[0.6875rem] leading-[1.48] text-gray-600 pt-[0.25rem]">
                                          {subItem}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </AIResponseBlock>

                  {/* ========== COMPLETION SECTION (Figma: 635-41212) ========== */}
                  {showCompletionSection && (
                    <>
                      {/* Divider */}
                      <AIResponseBlock delay={0}>
                        <div className="h-px bg-gray-300" />
                      </AIResponseBlock>

                      {/* Completion Title with Check Icon */}
                      <AIResponseBlock delay={400} className="flex flex-col gap-[1rem]">
                        <div ref={completionSectionRef} className="flex items-center gap-[0.75rem] scroll-mt-8">
                          <CheckIcon />
                          <p className="text-[1.5rem] leading-[1.3] font-normal text-gray-1000">
                            {t('aiAssistant.alert.completion.title')}
                          </p>
                        </div>
                        <p className="text-[1rem] leading-[1.48] text-gray-1000">
                          {t('aiAssistant.alert.completion.description')}
                        </p>
                      </AIResponseBlock>

                      {/* Divider */}
                      <AIResponseBlock delay={1000}>
                        <div className="h-px bg-gray-300" />
                      </AIResponseBlock>

                      {/* Result Summary Section */}
                      <AIResponseBlock delay={1200} className="flex flex-col gap-[1.5rem]">
                        <div ref={resultSummaryRef} className="flex flex-col gap-[1rem] scroll-mt-8">
                          <p className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000">
                            {t('aiAssistant.alert.completion.resultSummary')}
                          </p>
                          <p className="text-[1rem] leading-[1.48] text-gray-1000">
                            {t('aiAssistant.alert.completion.resultSummaryDesc')}
                          </p>
                        </div>

                        {/* KPI Cards */}
                        <div className="bg-gray-50 rounded-[0.625rem] px-[3rem] py-[1.5rem]">
                          <div className="flex items-start justify-center gap-[3rem] px-[1rem]">
                            {/* Start Temperature */}
                            <div className="flex flex-col gap-[0.5rem] items-center">
                              <p className="text-[0.875rem] leading-none text-gray-600">
                                {t('aiAssistant.alert.completion.startTemp')}
                              </p>
                              <p className="text-[2rem] leading-none font-display text-gray-1000">
                                {i18n.language === 'en' ? '48.2°F' : '9.0°C'}
                              </p>
                            </div>

                            {/* Vertical Divider */}
                            <div className="w-px h-[4rem] bg-gray-300" />

                            {/* End Temperature */}
                            <div className="flex flex-col gap-[0.5rem] items-center">
                              <p className="text-[0.875rem] leading-none text-gray-600">
                                {t('aiAssistant.alert.completion.endTemp')}
                              </p>
                              <p className="text-[2rem] leading-none font-display text-gray-1000">
                                {i18n.language === 'en' ? '40.6°F' : '4.8°C'}
                              </p>
                              <div className="flex items-center gap-[0.25rem] bg-blue-100 text-blue-600 rounded-full px-[0.625rem] h-[1.25rem]">
                                <ArrowDownIcon />
                                <span className="font-mono text-[0.75rem]">
                                  {i18n.language === 'en' ? '7.6°F' : '4.2°C'}
                                </span>
                              </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="w-px h-[4rem] bg-gray-300" />

                            {/* Duration */}
                            <div className="flex flex-col gap-[0.5rem] items-center">
                              <p className="text-[0.875rem] leading-none text-gray-600">
                                {t('aiAssistant.alert.completion.duration')}
                              </p>
                              <p className="text-[2rem] leading-none font-display text-gray-1000">
                                <span>5</span>
                                <span className="text-[1.125rem] font-medium">{t('aiAssistant.alert.completion.min')}</span>
                                <span> 15</span>
                                <span className="text-[1.125rem] font-medium">{t('aiAssistant.alert.completion.sec')}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Temperature Recovery Chart */}
                        <div className="rounded-[0.625rem] overflow-hidden">
                          <img
                            src={graph4}
                            alt={t('aiAssistant.alert.completion.resultSummary')}
                            className="w-full h-auto"
                          />
                        </div>
                      </AIResponseBlock>

                      {/* Divider */}
                      <AIResponseBlock delay={2000}>
                        <div className="h-px bg-gray-300" />
                      </AIResponseBlock>

                      {/* Follow-up Actions Section */}
                      <AIResponseBlock delay={2200} className="flex flex-col gap-[1.5rem]">
                        <div ref={followUpRef} className="flex flex-col gap-[1rem] scroll-mt-8">
                          <p className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000">
                            {t('aiAssistant.alert.completion.followUpActions')}
                          </p>
                          <p className="text-[1rem] leading-[1.48] text-gray-1000">
                            {t('aiAssistant.alert.completion.followUpActionsDesc')}
                          </p>
                        </div>

                        {/* Completed Actions (Auto) Card */}
                        <div className="border border-gray-300 rounded-[0.625rem] overflow-hidden bg-white">
                          <div className="flex items-center justify-between p-[1rem] border-b border-gray-300">
                            <p className="text-[0.8125rem] leading-none text-gray-1000">
                              {t('aiAssistant.alert.completion.completedActionsAuto')}
                            </p>
                            <button className="flex items-center gap-[0.25rem] text-[0.75rem] text-gray-600">
                              {t('aiAssistant.alert.action.viewDetails')}
                              <ChevronDownIcon />
                            </button>
                          </div>
                          <div className="p-[1rem] flex flex-col gap-[0.5rem]">
                            {/* Task 1: Event Log */}
                            <div className="flex items-center gap-[0.25rem]">
                              <TaskDotIcon />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-[0.75rem] leading-[1.48] text-gray-1000">
                                  {t('aiAssistant.alert.completion.autoTasks.eventLog')}
                                </p>
                                <div className="bg-black/8 rounded px-[0.375rem] h-[1.125rem] flex items-center">
                                  <span className="text-[0.75rem] leading-none text-gray-1000">
                                    <span className="font-mono">07:00:32</span>
                                    <span> {t('aiAssistant.alert.action.completed')}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-[0.25rem]">
                              <SubItemLineIcon />
                              <p className="text-[0.6875rem] leading-[1.48] text-gray-600 pt-[0.25rem]">
                                {t('aiAssistant.alert.completion.autoTasks.eventLogSub')}
                              </p>
                            </div>

                            {/* Task 2: Stakeholder Alert */}
                            <div className="flex items-center gap-[0.25rem]">
                              <TaskDotIcon />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-[0.75rem] leading-[1.48] text-gray-1000">
                                  {t('aiAssistant.alert.completion.autoTasks.stakeholderAlert')}
                                </p>
                                <div className="bg-black/8 rounded px-[0.375rem] h-[1.125rem] flex items-center">
                                  <span className="text-[0.75rem] leading-none text-gray-1000">
                                    <span className="font-mono">07:00:50</span>
                                    <span> {t('aiAssistant.alert.action.completed')}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-[0.25rem]">
                              <SubItemLineIcon />
                              <p className="text-[0.6875rem] leading-[1.48] text-gray-600 pt-[0.25rem]">
                                {t('aiAssistant.alert.completion.autoTasks.stakeholderAlertSub')}
                              </p>
                            </div>

                            {/* Task 3: Temperature History */}
                            <div className="flex items-center gap-[0.25rem]">
                              <TaskDotIcon />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-[0.75rem] leading-[1.48] text-gray-1000">
                                  {t('aiAssistant.alert.completion.autoTasks.tempHistory')}
                                </p>
                                <div className="bg-black/8 rounded px-[0.375rem] h-[1.125rem] flex items-center">
                                  <span className="text-[0.75rem] leading-none text-gray-1000">
                                    <span className="font-mono">07:00:52</span>
                                    <span> {t('aiAssistant.alert.action.completed')}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-[0.25rem]">
                              <SubItemLineIcon />
                              <p className="text-[0.6875rem] leading-[1.48] text-gray-600 pt-[0.25rem]">
                                {t('aiAssistant.alert.completion.autoTasks.tempHistorySub')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Upcoming Tasks Card */}
                        <div className="border border-gray-300 rounded-[0.625rem] overflow-hidden bg-white">
                          <div className="flex items-center justify-between p-[1rem] border-b border-gray-300">
                            <p className="text-[0.8125rem] leading-none text-gray-1000">
                              {t('aiAssistant.alert.completion.upcomingTasks')}
                            </p>
                            <button className="flex items-center gap-[0.25rem] text-[0.75rem] text-gray-600">
                              {t('aiAssistant.alert.action.viewDetails')}
                              <ChevronDownIcon />
                            </button>
                          </div>
                          <div className="p-[1rem] flex flex-col gap-[0.5rem]">
                            {/* Task 1: Incident Report */}
                            <div className="flex items-center gap-[0.25rem]">
                              <TaskDotActiveIcon />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-[0.75rem] leading-[1.48] text-gray-1000">
                                  {t('aiAssistant.alert.completion.scheduledTasks.incidentReport')}
                                </p>
                                <div className="bg-black/8 rounded px-[0.375rem] h-[1.125rem] flex items-center">
                                  <span className="text-[0.75rem] leading-none text-gray-1000">
                                    <span className="font-mono">00:00:10</span>
                                    <span> {t('aiAssistant.alert.action.remaining')}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-[0.25rem]">
                              <SubItemLineIcon />
                              <p className="text-[0.6875rem] leading-[1.48] text-gray-600 pt-[0.25rem]">
                                {t('aiAssistant.alert.completion.scheduledTasks.incidentReportSub')}
                              </p>
                            </div>

                            {/* Task 2: Cooling Inspection */}
                            <div className="flex items-center gap-[0.25rem]">
                              <TaskDotIcon />
                              <div className="flex-1 flex items-center justify-between">
                                <p className="text-[0.75rem] leading-[1.48] text-gray-1000">
                                  {t('aiAssistant.alert.completion.scheduledTasks.coolingInspection')}
                                </p>
                                <div className="bg-black/8 rounded px-[0.375rem] h-[1.125rem] flex items-center">
                                  <span className="text-[0.75rem] leading-none text-gray-1000">
                                    {t('aiAssistant.alert.completion.scheduled')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-[0.25rem]">
                              <SubItemLineIcon />
                              <p className="text-[0.6875rem] leading-[1.48] text-gray-600 pt-[0.25rem]">
                                {t('aiAssistant.alert.completion.scheduledTasks.coolingInspectionSub')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AIResponseBlock>

                      {/* Download Report Button */}
                      <AIResponseBlock delay={3000}>
                        <button className="h-[2rem] px-[0.75rem] bg-[#E1EEFE] text-[#1858B4] text-[0.8125rem] leading-none font-medium rounded-[0.25rem]">
                          {t('aiAssistant.alert.completion.downloadReport')}
                        </button>
                      </AIResponseBlock>
                    </>
                  )}

                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
