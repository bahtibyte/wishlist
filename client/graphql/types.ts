export interface User {
  id: string;
  profile_name: string;
  username: string;
  email: string;
  icon: string;
  stats: Stats;
}

export interface Stats {
  events: number;
  wishes: number;
  friends: number;
}

export interface Event {
  id: number;
  user_id: number;
  event_type: string;
  event_date: Date;
  timezone: string;
  color: string;
}
