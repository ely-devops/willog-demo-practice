import { useTranslation } from 'react-i18next';

interface AITrendChartProps {
  imageSrc: string;
}

export const AITrendChart = ({ imageSrc }: AITrendChartProps) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden">
      <img
        src={imageSrc}
        alt={t('aiAssistant.response.chartAlt')}
        className="w-full h-auto"
        style={{ imageRendering: '-webkit-optimize-contrast' }}
      />
    </div>
  );
};
