import {
  Clock3,
  HeartHandshake,
  Map,
  MessageCircle,
  MessagesSquare,
  Search,
  ShieldCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

// Icon names used in src/data/home.ts, mapped to components here so the data
// file stays plain text.
export const homeIcons: Record<string, LucideIcon> = {
  search: Search,
  message: MessageCircle,
  map: Map,
  users: Users,
  group: UsersRound,
  shield: ShieldCheck,
  clock: Clock3,
  heart: HeartHandshake,
  chat: MessagesSquare,
}
