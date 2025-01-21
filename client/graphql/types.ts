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