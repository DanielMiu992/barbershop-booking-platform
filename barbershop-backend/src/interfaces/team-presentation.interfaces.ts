export interface BARBER_SHOWCASE_ITEM {
  barber_id: number;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  rating_avg: number;
  rating_count: number;
  specialties: string[];
  completed_appointments: number;
}