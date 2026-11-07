export interface BARBER_APPOINTMENTS_LIST_ITEM {
  status: 'cancelled' | 'confirmed' | 'pending' | string;
  services: Array<{ name: string, price: number, duration: number, service_id: number }>;
  start_time: string;
  customer_name: string;
  avatar_url: string;
  service_name: string;
  service_price: number;
  appointment_id: number;
  service_duration: number;
  rating: number;
}

export interface BARBER_APPOINTMENTS_LIST_RESPONSE {
  data: BARBER_APPOINTMENTS_LIST_ITEM[];
  total: number;
}


export interface QUERY_RAW_BARBER_APPOINTMENTS_LIST_RESPONSE {
  result: BARBER_APPOINTMENTS_LIST_RESPONSE
}

