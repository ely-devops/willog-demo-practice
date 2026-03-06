import { useAppStore } from '@/stores/useAppStore';
import { MOCK_DATA } from '@/utils/mockData';

export const ManagementPage = () => {
  const { currentCase } = useAppStore();
  const content = MOCK_DATA[currentCase].management;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 text-gray-1000 mb-2">{content.title}</h2>
        <p className="text-body-m text-gray-600">{content.description}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="font-medium text-gray-700">관리 목록</span>
          <button className="text-sm text-primary hover:underline">필터 설정</button>
        </div>
        <div className="p-8 flex items-center justify-center text-gray-400 min-h-[300px]">
          Table / List Component Area
        </div>
      </div>
    </div>
  );
};
