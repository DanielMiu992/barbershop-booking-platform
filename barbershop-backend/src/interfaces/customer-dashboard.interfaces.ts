export interface CUSTOMER_APPOINTMENTS_LIST_ITEM {
  status: 'cancelled' | 'confirmed' | 'pending' | string;
  start_time: string;
  services: Array<{ name: string, price: number, duration: number, service_id: number }>;
  barber_name: string;
  service_name: string;
  service_price: number;
  appointment_id: number;
  service_duration: number;

  rating: number;
}

export interface CUSTOMER_APPOINTMENTS_LIST_RESPONSE {
  data: CUSTOMER_APPOINTMENTS_LIST_ITEM[];
  total: number;
}

export interface QUERY_RAW_CUSTOMER_APPOINTMENTS_LIST_RESPONSE {
  result: CUSTOMER_APPOINTMENTS_LIST_RESPONSE
}

export interface CANCEL_APPOINTMENT_BY_CLIENT_RESPONSE {
  message: string;
  success: boolean;
  appointment_id: number;
}

export interface QUERY_RAW_CANCEL_APPOINTMENT_BY_CLIENT_RESPONSE {
  result: CANCEL_APPOINTMENT_BY_CLIENT_RESPONSE;
}


export interface SET_BARBER_RATE_RESPONSE {
  message: string;
  success: boolean;
  barber_id: number;
  appointment_id:number;

}

export interface QUERY_RAW_SET_BARBER_RATE_RESPONSE {
  result: SET_BARBER_RATE_RESPONSE;
}



