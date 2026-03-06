import assistantIconUrl from './assistant-icon.svg';

interface AssistantIconProps {
  className?: string;
}

export const AssistantIcon = ({ className }: AssistantIconProps) => (
  <img src={assistantIconUrl} alt="" className={className} />
);
