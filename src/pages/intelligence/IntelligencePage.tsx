import { useAppStore } from '@/stores/useAppStore';
import { MOCK_DATA } from '@/utils/mockData';

export const IntelligencePage = () => {
  const { currentCase } = useAppStore();
  const content = MOCK_DATA[currentCase].intelligence;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 text-gray-1000 mb-2">{content.title}</h2>
        <p className="text-body-m text-gray-600">{content.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
          <h3 className="text-h4 text-gray-800 mb-4">리스크 분석 차트</h3>
          <div className="flex items-center justify-center h-full text-gray-400">Chart Visualization</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
          <h3 className="text-h4 text-gray-800 mb-4">AI 인사이트 리포트</h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-2 text-sm text-gray-700">
              <span className="text-blue-500">•</span>
              <span>{currentCase === 'bio' ? '보스톤 공항 온도 급상승 예측' : '예상 도착 시간 지연 경보'}</span>
            </li>
            <li className="flex items-start space-x-2 text-sm text-gray-700">
              <span className="text-blue-500">•</span>
              <span>데이터 기반 최적 경로 제안</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
