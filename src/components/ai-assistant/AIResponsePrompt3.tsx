import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AIResponseBlock } from './AIResponseBlock';
// Korean graph images
import graph1 from '@/assets/ai-assistant/prompt-images/prompt3/graph_1.svg';
import graph2 from '@/assets/ai-assistant/prompt-images/prompt3/graph_2.svg';
import graph3 from '@/assets/ai-assistant/prompt-images/prompt3/graph_3.svg';
import graph4 from '@/assets/ai-assistant/prompt-images/prompt3/graph_4.svg';
// English graph images
import graph1Eng from '@/assets/ai-assistant/prompt-images/prompt3/graph_1_eng.svg';
import graph2Eng from '@/assets/ai-assistant/prompt-images/prompt3/graph_2_eng.svg';
import graph3Eng from '@/assets/ai-assistant/prompt-images/prompt3/graph_3_eng.svg';
import graph4Eng from '@/assets/ai-assistant/prompt-images/prompt3/graph_4_eng.svg';

interface AIResponsePrompt3Props {
  onBack?: () => void;
}

// Divider component for consistent styling
const Divider = () => (
  <div className="h-0 relative w-full">
    <div className="absolute inset-[-0.0625rem_0_0_0] border-t border-gray-300" />
  </div>
);

// ID Badge component - shrink-0 to only take content width
const IDBadge = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-black/8 flex items-center justify-center gap-1 h-[1.25rem] px-[0.375rem] rounded-[0.25rem] font-mono text-[0.75rem] shrink-0 whitespace-nowrap w-fit">
      <span className="text-gray-1000 shrink-0">{t('aiAssistant.prompt3Response.highRiskIdPrimary')}</span>
      <span className="text-gray-600 shrink-0">{t('aiAssistant.prompt3Response.highRiskIdSecondary')}</span>
    </div>
  );
};

export const AIResponsePrompt3 = ({ onBack: _onBack }: AIResponsePrompt3Props) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  // Refs for scroll container and progressive scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const slaComplianceRef = useRef<HTMLParagraphElement>(null);
  const top3Ref = useRef<HTMLParagraphElement>(null);
  const interpretationRef = useRef<HTMLParagraphElement>(null);
  const highestRiskRef = useRef<HTMLParagraphElement>(null);
  const usTempRef = useRef<HTMLParagraphElement>(null);
  const transportStageRef = useRef<HTMLParagraphElement>(null);
  const comparisonRef = useRef<HTMLParagraphElement>(null);

  // Helper function to scroll to element within the scroll container
  const scrollToElement = (element: HTMLElement | null) => {
    if (!element || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 60;

    container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    });
  };

  // Auto-scroll with progressive scrolling for each block
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Scroll to title section (delay: 200ms after title appears)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(titleRef.current);
      });
    }, 200));

    // Scroll to SLA compliance section (delay: 350ms - after SLA appears at 150ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(slaComplianceRef.current);
      });
    }, 350));

    // Scroll to top 3 section (delay: 550ms - after top3 appears at 300ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(top3Ref.current);
      });
    }, 550));

    // Scroll to interpretation section (delay: 700ms - after interpretation appears at 450ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(interpretationRef.current);
      });
    }, 700));

    // Scroll to highest risk section (delay: 850ms - after highest risk appears at 600ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(highestRiskRef.current);
      });
    }, 850));

    // Scroll to US temp section (delay: 1450ms - after US temp appears at 1200ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(usTempRef.current);
      });
    }, 1450));

    // Scroll to transport stage section (delay: 1600ms - after transport stage appears at 1350ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(transportStageRef.current);
      });
    }, 1600));

    // Scroll to comparison section (delay: 1750ms - after comparison appears at 1500ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(comparisonRef.current);
      });
    }, 1750));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div className="flex justify-center pt-[3.75rem] pb-[12.5rem]">
        <div className="w-[48.75rem] flex flex-col gap-7">
          {/* Section 1: Title */}
          <AIResponseBlock delay={0} className="flex flex-col gap-7">
            <p ref={titleRef} className="text-[1.5rem] leading-[1.3] font-normal text-gray-1000 scroll-mt-8">
              {t('aiAssistant.prompt3Response.title')}
            </p>
            <Divider />
          </AIResponseBlock>

          {/* Section 2: SLA Compliance Summary */}
          <AIResponseBlock delay={150} className="flex flex-col gap-7">
            <div className="flex flex-col gap-4 text-gray-1000">
              <p ref={slaComplianceRef} className="text-[1.125rem] leading-[1.3] font-medium scroll-mt-8">
                {t('aiAssistant.prompt3Response.statusTitle')}
              </p>
              <ul className={`list-disc text-[1rem] leading-[0]`}>
                <li className="ms-[1.5rem] whitespace-pre-wrap">
                  <span className="leading-[1.48]">{t('aiAssistant.prompt3Response.statusDesc1')}</span>
                </li>
              </ul>
              <ul className={`list-disc text-[1rem] leading-[0]`}>
                <li className="ms-[1.5rem] whitespace-pre-wrap">
                  <span className="leading-[1.48]">{t('aiAssistant.prompt3Response.statusDesc2')}</span>
                </li>
              </ul>
            </div>
            <Divider />
          </AIResponseBlock>

          {/* Section 3: Top 3 Non-Compliant Shipments */}
          <AIResponseBlock delay={300} className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <p ref={top3Ref} className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt3Response.top3Title')}
              </p>
              <div className="w-full">
                <img
                  src={isEnglish ? graph1Eng : graph1}
                  alt={t('aiAssistant.prompt3Response.top3Title')}
                  className="w-full"
                />
              </div>
            </div>
            <Divider />
          </AIResponseBlock>

          {/* Section 4: Interpretation & Insights */}
          <AIResponseBlock delay={450} className="flex flex-col gap-7">
            <div className="flex flex-col gap-5 text-gray-1000">
              <p ref={interpretationRef} className="text-[1.125rem] leading-[1.3] font-medium scroll-mt-8">
                {t('aiAssistant.prompt3Response.insightTitle')}
              </p>
              <ul className={`list-disc text-[1rem] leading-[0]`}>
                <li className="ms-[1.5rem] whitespace-pre-wrap">
                  <span className="leading-[1.48]">{t('aiAssistant.prompt3Response.insightBullet1')}</span>
                </li>
              </ul>
              <ul className={`list-disc text-[1rem] leading-[0]`}>
                <li className="ms-[1.5rem] whitespace-pre-wrap">
                  <span className="leading-[1.48]">{t('aiAssistant.prompt3Response.insightBullet2')}</span>
                </li>
              </ul>
              <ul className={`list-disc text-[1rem] leading-[0]`}>
                <li className="ms-[1.5rem] whitespace-pre-wrap">
                  <span className="leading-[1.48]">{t('aiAssistant.prompt3Response.insightBullet3')}</span>
                </li>
              </ul>
              <ul className={`list-disc text-[1rem] leading-[0]`}>
                <li className="ms-[1.5rem] whitespace-pre-wrap">
                  <span className="leading-[1.48]">{t('aiAssistant.prompt3Response.insightBullet4')}</span>
                </li>
              </ul>
            </div>
            <Divider />
          </AIResponseBlock>

          {/* Section 5: Highest Risk Shipment SLA Details */}
          <AIResponseBlock delay={600} className="flex flex-col gap-3">
            <p ref={highestRiskRef} className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
              {t('aiAssistant.prompt3Response.highRiskTitle')}
            </p>
            <IDBadge />
          </AIResponseBlock>

          {/* Section 6: Main Issue */}
          <AIResponseBlock delay={750} className="flex flex-col gap-2">
            <p className="text-[1rem] leading-[1.3] font-medium text-gray-1000">
              {t('aiAssistant.prompt3Response.mainIssueTitle')}
            </p>
            <div className="text-[1rem] leading-[1.48] text-gray-1000 w-[48.75rem] whitespace-pre-wrap">
              <p className="mb-0">{t('aiAssistant.prompt3Response.mainIssueDesc1')}</p>
              <p className="mt-4">{t('aiAssistant.prompt3Response.mainIssueDesc2')}</p>
            </div>
          </AIResponseBlock>

          {/* Section 7: Analysis */}
          <AIResponseBlock delay={900} className="flex flex-col gap-2">
            <p className="text-[1rem] leading-[1.3] font-medium text-gray-1000">
              {t('aiAssistant.prompt3Response.analysisTitle')}
            </p>
            <p className="text-[1rem] leading-[1.48] text-gray-1000 w-[48.75rem] whitespace-pre-wrap">
              {t('aiAssistant.prompt3Response.analysisDesc')}
            </p>
          </AIResponseBlock>

          {/* Section 8: Improvement Suggestion */}
          <AIResponseBlock delay={1050} className="flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <p className="text-[1rem] leading-[1.3] font-medium text-gray-1000">
                {t('aiAssistant.prompt3Response.improvementTitle')}
              </p>
              <p className="text-[1rem] leading-[1.48] text-gray-1000 w-[48.75rem] whitespace-pre-wrap">
                {t('aiAssistant.prompt3Response.improvementDesc')}
              </p>
            </div>
            <Divider />
          </AIResponseBlock>

          {/* Section 9: US Inland Temperature Trend */}
          <AIResponseBlock delay={1200} className="flex flex-col gap-7">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 text-gray-1000">
                <p ref={usTempRef} className="text-[1.125rem] leading-[1.3] font-medium scroll-mt-8">
                  {t('aiAssistant.prompt3Response.tempTrendTitle')}
                </p>
                <p className="text-[1rem] leading-[1.48]">
                  {t('aiAssistant.prompt3Response.tempTrendPeriod')}
                </p>
              </div>
              <div className="w-full">
                <img
                  src={isEnglish ? graph2Eng : graph2}
                  alt={t('aiAssistant.prompt3Response.graph1Alt')}
                  className="w-full"
                />
              </div>
            </div>
            <Divider />
          </AIResponseBlock>

          {/* Section 10: Transport Stage Risk Score */}
          <AIResponseBlock delay={1350} className="flex flex-col gap-7">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p ref={transportStageRef} className="text-[1.125rem] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                  {t('aiAssistant.prompt3Response.stageScoreTitle')}
                </p>
                <IDBadge />
              </div>
              <div className="w-full">
                <img
                  src={isEnglish ? graph3Eng : graph3}
                  alt={t('aiAssistant.prompt3Response.graph2Alt')}
                  className="w-full"
                />
              </div>
            </div>
            <Divider />
          </AIResponseBlock>

          {/* Section 11: ICN-LAX vs Major Section Average Risk Comparison */}
          <AIResponseBlock delay={1500} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 text-gray-1000">
              <p ref={comparisonRef} className="text-[1.125rem] leading-[1.3] font-medium scroll-mt-8">
                {t('aiAssistant.prompt3Response.comparisonTitle')}
              </p>
              <div className="text-[1rem] leading-[1.48] whitespace-pre-wrap">
                <p className="mb-0">{t('aiAssistant.prompt3Response.comparisonDesc')}</p>
                <p>{t('aiAssistant.prompt3Response.comparisonNote')}</p>
              </div>
            </div>
            <div className="w-full">
              <img
                src={isEnglish ? graph4Eng : graph4}
                alt={t('aiAssistant.prompt3Response.graph3Alt')}
                className="w-full"
              />
            </div>
          </AIResponseBlock>
        </div>
      </div>
    </div>
  );
};
