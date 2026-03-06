import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AIResponseBlock } from './AIResponseBlock';
// Korean versions
import graph1 from '@/assets/ai-assistant/prompt-images/prompt2/graph_1.svg';
import graph2 from '@/assets/ai-assistant/prompt-images/prompt2/graph_2.svg';
import graph3 from '@/assets/ai-assistant/prompt-images/prompt2/graph_3.svg';
import graph4 from '@/assets/ai-assistant/prompt-images/prompt2/graph_4.svg';
// English versions
import graph1Eng from '@/assets/ai-assistant/prompt-images/prompt2/graph_1_eng.svg';
import graph2Eng from '@/assets/ai-assistant/prompt-images/prompt2/graph_2_eng.svg';
import graph3Eng from '@/assets/ai-assistant/prompt-images/prompt2/graph_3_eng.svg';
import graph4Eng from '@/assets/ai-assistant/prompt-images/prompt2/graph_4_eng.svg';

interface AIResponsePrompt2Props {
  onBack?: () => void;
}

export const AIResponsePrompt2 = ({ onBack: _onBack }: AIResponsePrompt2Props) => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  // Refs for scroll container and progressive scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const overviewRef = useRef<HTMLParagraphElement>(null);
  const top3Ref = useRef<HTMLParagraphElement>(null);
  const insightsRef = useRef<HTMLParagraphElement>(null);
  const highRiskRef = useRef<HTMLParagraphElement>(null);
  const deviationRef = useRef<HTMLParagraphElement>(null);
  const seaTempRef = useRef<HTMLParagraphElement>(null);
  const seaShockRef = useRef<HTMLParagraphElement>(null);

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

    // Scroll to overview section (delay: 500ms - after overview appears at 300ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(overviewRef.current);
      });
    }, 500));

    // Scroll to top 3 section (delay: 700ms - after top3 title appears at 450ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(top3Ref.current);
      });
    }, 700));

    // Scroll to insights section (delay: 1000ms - after insights appear at 750ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(insightsRef.current);
      });
    }, 1000));

    // Scroll to high risk section (delay: 1200ms - after high risk appears at 900ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(highRiskRef.current);
      });
    }, 1200));

    // Scroll to deviation section (delay: 1600ms - after deviation appears at 1350ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(deviationRef.current);
      });
    }, 1600));

    // Scroll to sea temp section (delay: 1900ms - after sea temp appears at 1650ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(seaTempRef.current);
      });
    }, 1900));

    // Scroll to sea shock section (delay: 2200ms - after sea shock appears at 1950ms)
    timers.push(setTimeout(() => {
      requestAnimationFrame(() => {
        scrollToElement(seaShockRef.current);
      });
    }, 2200));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div className="flex justify-center pt-[60px] pb-[200px]">
        <div className="w-[780px] flex flex-col gap-7">
          {/* Section 1: Title + Description */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <AIResponseBlock delay={0}>
              <p ref={titleRef} className="text-[24px] leading-[1.3] font-normal text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.title')}
              </p>
            </AIResponseBlock>

            {/* Description */}
            <AIResponseBlock delay={150}>
              <p className="text-body-l text-gray-1000">
                {t('aiAssistant.prompt2Response.description')}
              </p>
            </AIResponseBlock>
          </div>

          {/* Divider 1 */}
          <AIResponseBlock delay={250}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 2: Overview Summary */}
          <div className="flex flex-col gap-6">
            <AIResponseBlock delay={300} className="flex flex-col gap-4">
              <p ref={overviewRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.overviewTitle')}
              </p>
              <ul className={`list-disc text-body-l text-gray-1000`}>
                <li className="ms-6">{t('aiAssistant.prompt2Response.overviewTarget')}</li>
              </ul>
              <ul className={`list-disc text-body-l text-gray-1000`}>
                <li className="ms-6">{t('aiAssistant.prompt2Response.overviewCriteria')}</li>
              </ul>
              <ul className={`list-disc text-body-l text-gray-1000`}>
                <li className="ms-6">{t('aiAssistant.prompt2Response.overviewPerspective')}</li>
              </ul>
            </AIResponseBlock>
          </div>

          {/* Divider 2 */}
          <AIResponseBlock delay={400}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 3: Top 3 Title + Image (graph_1) */}
          <div className="flex flex-col gap-6">
            <AIResponseBlock delay={450}>
              <p ref={top3Ref} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.top3Title')}
              </p>
            </AIResponseBlock>

            {/* Top 3 Image - graph_1 */}
            <AIResponseBlock delay={600}>
              <div className="w-full">
                <img
                  src={isEnglish ? graph1Eng : graph1}
                  alt={t('aiAssistant.prompt2Response.top3Title')}
                  className="w-full"
                />
              </div>
            </AIResponseBlock>
          </div>

          {/* Divider 3 */}
          <AIResponseBlock delay={700}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 4: Interpretation and Insights */}
          <div className="flex flex-col gap-6">
            <AIResponseBlock delay={750} className="flex flex-col gap-5">
              <p ref={insightsRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.insightTitle')}
              </p>
              <ul className={`list-disc text-body-l text-gray-1000`}>
                <li className="ms-6">{t('aiAssistant.prompt2Response.insightBullet1')}</li>
              </ul>
              <ul className={`list-disc text-body-l text-gray-1000`}>
                <li className="ms-6">{t('aiAssistant.prompt2Response.insightBullet2')}</li>
              </ul>
              <ul className={`list-disc text-body-l text-gray-1000`}>
                <li className="ms-6">{t('aiAssistant.prompt2Response.insightBullet3')}</li>
              </ul>
              <ul className={`list-disc text-body-l text-gray-1000`}>
                <li className="ms-6">{t('aiAssistant.prompt2Response.insightBullet4')}</li>
              </ul>
            </AIResponseBlock>
          </div>

          {/* Divider 4 */}
          <AIResponseBlock delay={850}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 5: High Risk Analysis */}
          <div className="flex flex-col gap-6">
            {/* High Risk Title + Tag */}
            <AIResponseBlock delay={900} className="flex flex-col gap-3">
              <p ref={highRiskRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.highRiskTitle')}
              </p>
              <div className="h-5 flex items-center gap-1 px-1.5 bg-black/8 rounded font-mono text-[0.75rem] w-fit">
                <span className="text-gray-1000">ID-SC05</span>
                <span className="text-gray-600">+2</span>
              </div>
            </AIResponseBlock>

            {/* Main Issue */}
            <AIResponseBlock delay={1050} className="flex flex-col gap-2">
              <p className="text-[1rem] leading-[1.3] font-medium text-gray-1000">
                {t('aiAssistant.prompt2Response.mainIssueSubtitle')}
              </p>
              <p className="text-body-l text-gray-1000 whitespace-pre-line">
                {t('aiAssistant.prompt2Response.mainIssueDesc')}
              </p>
            </AIResponseBlock>

            {/* Analysis */}
            <AIResponseBlock delay={1200} className="flex flex-col gap-2">
              <p className="text-[1rem] leading-[1.3] font-medium text-gray-1000">
                {t('aiAssistant.prompt2Response.analysisSubtitle')}
              </p>
              <p className="text-body-l text-gray-1000 whitespace-pre-line">
                {t('aiAssistant.prompt2Response.analysisDesc')}
              </p>
              {/* <p className="text-body-l text-gray-1000 whitespace-pre-line">
                {t('aiAssistant.prompt2Response.analysisDesc2')}
              </p> */}
            </AIResponseBlock>
          </div>

          {/* Divider 5 */}
          <AIResponseBlock delay={1300}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 6: Deviation Count + Image (graph_2) */}
          <div className="flex flex-col gap-6">
            <AIResponseBlock delay={1350}>
              <p ref={deviationRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.deviationTitle')}
              </p>
            </AIResponseBlock>

            {/* Deviation Image - graph_2 */}
            <AIResponseBlock delay={1500}>
              <div className="w-full">
                <img
                  src={isEnglish ? graph2Eng : graph2}
                  alt={t('aiAssistant.prompt2Response.deviationTitle')}
                  className="w-full"
                />
              </div>
            </AIResponseBlock>
          </div>

          {/* Divider 6 */}
          <AIResponseBlock delay={1600}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 7: Sea Temperature Trend + Image (graph_3) */}
          <div className="flex flex-col gap-6">
            <AIResponseBlock delay={1650} className="flex flex-col gap-3">
              <p ref={seaTempRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.seaTempTitle')}
              </p>
              <div className="h-5 flex items-center gap-1 px-1.5 bg-black/8 rounded font-mono text-[0.75rem] w-fit">
                <span className="text-gray-1000">ID-SC05</span>
                <span className="text-gray-600">+2</span>
              </div>
              <p className="text-body-l text-gray-600">
                {t('aiAssistant.prompt2Response.seaTempPeriod')}
              </p>
            </AIResponseBlock>

            {/* Temperature Chart - graph_3 */}
            <AIResponseBlock delay={1800}>
              <div className="w-full">
                <img
                  src={isEnglish ? graph3Eng : graph3}
                  alt={t('aiAssistant.prompt2Response.graph1Alt')}
                  className="w-full"
                />
              </div>
            </AIResponseBlock>
          </div>

          {/* Divider 7 */}
          <AIResponseBlock delay={1900}>
            <div className="w-full h-px bg-gray-300" />
          </AIResponseBlock>

          {/* Section 8: Sea Shock Trend + Image (graph_4) */}
          <div className="flex flex-col gap-5">
            <AIResponseBlock delay={1950} className="flex flex-col gap-3">
              <p ref={seaShockRef} className="text-[18px] leading-[1.3] font-medium text-gray-1000 scroll-mt-8">
                {t('aiAssistant.prompt2Response.seaShockTitle')}
              </p>
              <div className="h-5 flex items-center gap-1 px-1.5 bg-black/8 rounded font-mono text-[0.75rem] w-fit">
                <span className="text-gray-1000">ID-SC05</span>
                <span className="text-gray-600">+2</span>
              </div>
              <p className="text-body-l text-gray-600">
                {t('aiAssistant.prompt2Response.seaShockPeriod')}
              </p>
            </AIResponseBlock>

            {/* Shock Chart - graph_4 */}
            <AIResponseBlock delay={2100}>
              <div className="w-full">
                <img
                  src={isEnglish ? graph4Eng : graph4}
                  alt={t('aiAssistant.prompt2Response.graph2Alt')}
                  className="w-full"
                />
              </div>
            </AIResponseBlock>
          </div>
        </div>
      </div>
    </div>
  );
};
