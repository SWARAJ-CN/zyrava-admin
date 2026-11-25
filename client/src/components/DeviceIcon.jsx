import {
  Bot,
  HelpCircle,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Watch,
} from "lucide-react";

const ICONS = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
  Bot: Bot,
  Console: Tv,
  "Smart TV": Tv,
  Wearable: Watch,
  Embedded: Monitor,
  Unknown: HelpCircle,
};

export function DeviceIcon({ name, className = "h-4 w-4" }) {
  const Icon = ICONS[name] ?? HelpCircle;
  return <Icon className={className} />;
}
