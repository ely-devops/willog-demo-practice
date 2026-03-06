import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AIResponseBlock } from './AIResponseBlock';
import { AIKPICard } from './AIKPICard';
import { AITrendChart } from './AITrendChart';
import { AIPeriodTimeline } from './AIPeriodTimeline';
import { AIResponsePrompt2 } from './AIResponsePrompt2';
import { AIResponsePrompt3 } from './AIResponsePrompt3';
import { AIResponseAlert } from './AIResponseAlert';
import chartImage from '@/assets/ai-assistant/chart2.png';
import graph1Eng from '@/assets/ai-assistant/prompt-images/prompt1/graph_1_eng.svg';
import { type ResponseType } from './AIChatWindow';

interface AIResponseViewProps {
  onBack: () => void;
  responseType?: ResponseType;
}

export const AIResponseView = ({ onBack, responseType }: AIResponseViewProps) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const trendChartImage = isEnglish ? graph1Eng : chartImage;

  // Refs for scroll container and progressive scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const kpiRef = useRef<HTMLParagraphElement>(null);
  const trendRef = useRef<HTMLParagraphElement>(null);
  const periodRef = useRef<HTMLParagraphElement>(null);

  // Auto-scroll with progressive scrolling for each block
  useEffect(() => {
    // Only run scroll logic for logistics-90d (prompt1) response
    if (responseType && responseType !== 'logistics-90d') return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToElement = (element: HTMLElement | null) => {
      if (!element || !container) return;

      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 60;

      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    };

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Scroll to title section (delay: 500ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(titleRef.current);
      });
    }, 500));

    // Scroll to KPI section (delay: 1250ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(kpiRef.current);
      });
    }, 1250));

    // Scroll to trend analysis section (delay: 1850ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(trendRef.current);
      });
    }, 1850));

    // Scroll to period timeline section (delay: 2600ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(periodRef.current);
      });
    }, 2600));

    return () => timers.forEach(clearTimeout);
  }, [responseType]);

  // Route to appropriate response component based on responseType
  if (responseType === 'prompt2') {
    return <AIResponsePrompt2 onBack={onBack} />;
  }

  if (responseType === 'prompt3') {
    return <AIResponsePrompt3 onBack={onBack} />;
  }

  if (responseType === 'alert') {
    return <AIResponseAlert onBack={onBack} />;
  }

  // Default: logistics-90d (prompt1) response

  const periods = [
    {
      dateRange: t('aiAssistant.response.periodDate1'),
      trend: 'increase' as const,
      description: t('aiAssistant.response.period1Desc'),
    },
    {
      dateRange: t('aiAssistant.response.periodDate2'),
      trend: 'decrease' as const,
      description: t('aiAssistant.response.period2Desc'),
    },
    {
      dateRange: t('aiAssistant.response.periodDate3'),
      trend: 'recovery' as const,
      description: t('aiAssistant.response.period3Desc'),
    },
  ];

  return (
    <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div className="flex justify-center pt-[60px] pb-[200px]">
        <div className="w-[780px] flex flex-col gap-7">
          {/* Section 1: Title + Definitions */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <AIResponseBlock delay={0}>
              <p ref={titleRef} className="text-[24px] leading-[1.3] font-normal text-gray-1000 scroll-mt-8">{t('aiAssistant.response.title')}</p>
            </AIResponseBlock>

            {/* Definitions */}
            <div className="flex flex-col gap-4">
              {/* Definition 1 */}
              <AIResponseBlock delay={150} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <ol className="list-decimal ms-6 text-[1rem] leading-[1.3] text-gray-1000">
                    <li>{t('aiAssistant.response.def1Term')}</li>
                  </ol>
                  <p className="text-body-l text-gray-1000">{t('aiAssistant.response.def1Desc')}</p>
                </div>
              </AIResponseBlock>

              {/* Definition 2 */}
              <AIResponseBlock delay={300} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <ol className="list-decimal ms-6 text-[1rem] leading-[1.3] text-gray-1000" start={2}>
                    <li>{t('aiAssistant.response.def2Term')}</li>
                  </ol>
                  <p className="text-body-l text-gray-1000">{t('aiAssistant.response.def2Desc')}</p>
                </div>
              </AIResponseBlock>

              {/* Definition 3 */}
              <AIResponseBlock delay={450} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <ol className="list-decimal ms-6 text-[1rem] leading-[1.3] text-gray-1000" start={3}>
                    <li>{t('aiAssistant.response.def3Term')}</li>
                  </ol>
                  <p className="text-body-l text-gray-1000">{t('aiAssistant.response.def3Desc')}</p>
                </div>
              </AIResponseBlock>
            </div>
          </div>

          {/* Divider 1 */}
          <AIResponseBlock delay={550}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 2: Key Metrics + KPI Cards */}
          <div className="flex flex-col gap-6">
            {/* Key Metrics Summary */}
            <AIResponseBlock delay={600} className="flex flex-col gap-4">
              <p ref={kpiRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">{t('aiAssistant.response.kpiTitle')}</p>
              <p className="text-body-l text-gray-1000">{t('aiAssistant.response.kpiPeriod')}</p>
            </AIResponseBlock>

            {/* KPI Cards */}
            <AIResponseBlock delay={750}>
              <div className="bg-gray-50 rounded-2.5 px-12 py-6">
                <div className="flex items-center justify-center px-4">
                  <AIKPICard
                    label={t('aiAssistant.response.totalVolume')}
                    value="11,787"
                    showDivider
                  />
                  <AIKPICard
                    label={t('aiAssistant.response.dailyAvg')}
                    value="184"
                    showDivider
                  />
                  <AIKPICard
                    label={t('aiAssistant.response.departureShipments')}
                    value="148"
                  />
                </div>
              </div>
            </AIResponseBlock>
          </div>

          {/* Divider 2 */}
          <AIResponseBlock delay={850}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 3: Trend Analysis + Bullets + Chart */}
          <div className="flex flex-col gap-6">
            {/* Trend Analysis */}
            <AIResponseBlock delay={900} className="flex flex-col gap-4">
              <p ref={trendRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">{t('aiAssistant.response.trendTitle')}</p>
              <p className="text-body-l text-gray-1000">{t('aiAssistant.response.trendSummary')}</p>
            </AIResponseBlock>

            {/* Bullet Points */}
            <AIResponseBlock delay={1050}>
              <ul className="list-disc ms-6 text-body-l text-gray-1000">
                <li className="mb-0">{t('aiAssistant.response.bullet1')}</li>
                <li className="mb-0">{t('aiAssistant.response.bullet2')}</li>
                <li>{t('aiAssistant.response.bullet3')}</li>
              </ul>
            </AIResponseBlock>

            {/* Chart */}
            <AIResponseBlock delay={1200}>
              <AITrendChart imageSrc={trendChartImage} />
            </AIResponseBlock>
          </div>

          {/* Divider 3 */}
          <AIResponseBlock delay={1300}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 4: Period Timeline */}
          <div className="flex flex-col gap-5">
            {/* Period Timeline Title */}
            <AIResponseBlock delay={1350}>
              <p ref={periodRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">{t('aiAssistant.response.periodTitle')}</p>
            </AIResponseBlock>

            {/* Period Timeline */}
            <AIResponseBlock delay={1500}>
              <AIPeriodTimeline periods={periods} />
            </AIResponseBlock>
          </div>
        </div>
      </div>
    </div>
  );
};
