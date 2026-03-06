interface AIKPICardProps {
  label: string;
  value: string;
  showDivider?: boolean;
}

export const AIKPICard = ({ label, value, showDivider = false }: AIKPICardProps) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-label-m text-gray-600">{label}</p>
        <p className="text-display-l text-gray-1000 text-center whitespace-nowrap">{value}</p>
      </div>
      {showDivider && <div className="h-16 w-px bg-gray-300 mx-6" />}
    </div>
  );
};
