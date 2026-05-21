import {
  BookOpen,
  Coffee,
  Droplet,
  Dumbbell,
  Heart,
  Leaf,
  Moon,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  droplet: Droplet,
  book: BookOpen,
  dumbbell: Dumbbell,
  heart: Heart,
  moon: Moon,
  sun: Sun,
  coffee: Coffee,
  leaf: Leaf,
};

export const HABIT_ICON_KEYS = Object.keys(ICONS);

export function HabitIcon({
  name,
  color,
  size = 22,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon size={size} color={color} />;
}
