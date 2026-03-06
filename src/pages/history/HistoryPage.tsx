import { useAppStore } from '@/stores/useAppStore';
import { MOCK_DATA } from '@/utils/mockData';

export const HistoryPage = () => {
  const { currentCase } = useAppStore();
  const content = MOCK_DATA[currentCase].history;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 text-gray-1000 mb-2">{content.title}</h2>
        <p className="text-body-m text-gray-600">{content.description}</p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-900">운송 ID: TR-202504-{100 + i}</p>
              <p className="text-sm text-gray-500">2025. 04. 0{i} 완료</p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              상세 보기
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
