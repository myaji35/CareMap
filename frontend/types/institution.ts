export interface Institution {
  id: number;
  institution_code: string;
  name: string;
  service_type: string;
  capacity: number;
  current_headcount: number;
  address: string;
  operating_hours?: string;
  latitude: number;
  longitude: number;
  occupancy_rate?: number;
  last_updated_at: string;
}

export interface InstitutionHistory {
  recorded_date: string;
  capacity: number;
  current_headcount: number;
  name?: string;
  address?: string;
}
