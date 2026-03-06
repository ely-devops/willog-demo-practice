import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore, type BizCase } from '@/stores/useAppStore';

/**
 * URL Query Parameter를 앱 상태와 동기화하는 훅
 *
 * 지원하는 파라미터:
 * - case: bio | semicon | fnb | general (도메인 선택)
 * - ai: fullscreen (AI 어시스턴트 전체화면)
 * - alert: true (Alert 대응 - AI 어시스턴트 alert 응답)
 *
 * 사용 예:
 * - /dashboard?case=bio → 바이오 도메인으로 전환
 * - /dashboard?ai=fullscreen → AI 어시스턴트 전체화면 열기
 * - /dashboard?alert=true → Alert 대응 화면 (AI 전체화면 + alert 응답)
 * - /dashboard?case=semicon&ai=fullscreen → 반도체 도메인 + AI 전체화면
 */
export const useUrlStateSync = () => {
  const [searchParams] = useSearchParams();
  const { currentCase, setCase } = useAppStore();

  // AI 이벤트가 이미 발생했는지 추적 (중복 방지)
  const hasTriggeredAI = useRef(false);

  // case 파라미터 동기화
  useEffect(() => {
    const caseParam = searchParams.get('case');

    if (caseParam && ['bio', 'semicon', 'fnb', 'general'].includes(caseParam)) {
      const newCase = caseParam as BizCase;
      if (newCase !== currentCase) {
        setCase(newCase);
      }
    }
  }, [searchParams, currentCase, setCase]);

  // ai/alert 파라미터로 AI 어시스턴트 트리거
  useEffect(() => {
    // 이미 트리거했으면 스킵
    if (hasTriggeredAI.current) return;

    const aiParam = searchParams.get('ai');
    const alertParam = searchParams.get('alert');

    // alert=true → AI 전체화면 + alert 응답
    if (alertParam === 'true') {
      hasTriggeredAI.current = true;
      // 약간의 지연을 두어 컴포넌트가 마운트된 후 이벤트 발생
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('openAIAssistant', {
            detail: { responseType: 'alert' },
          })
        );
      }, 100);
      return;
    }

    // ai=fullscreen → AI 전체화면 (기본 응답)
    if (aiParam === 'fullscreen') {
      hasTriggeredAI.current = true;
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('openAIAssistant', {
            detail: { responseType: null },
          })
        );
      }, 100);
    }
  }, [searchParams]);

  return {
    caseParam: searchParams.get('case') as BizCase | null,
    aiParam: searchParams.get('ai'),
    alertParam: searchParams.get('alert'),
  };
};
