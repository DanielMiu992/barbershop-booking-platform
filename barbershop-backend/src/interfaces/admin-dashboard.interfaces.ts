export interface ADMIN_APPOINTMENTS_ITEM_LIST {
  id: number;
  status: 'confirmed' | 'cancelled' | 'pending' | string;
  end_time: string;
  services: Array<{ name: string, price: number, duration: number, service_id: number }>;
  created_at: string;
  start_time: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  customer_email: string;
  customer_phone: string;
  barber_last_name: string;
  barber_first_name: string;
  customer_last_name: string;
  customer_first_name: string;
  customer_avatar_url: string | null;
}

export interface ADMIN_APPOINTMENTS_LIST_RESPONSE {
  data: ADMIN_APPOINTMENTS_ITEM_LIST[];
  total: number
}

export interface QUERY_RAW_ADMIN_APPOINTMENTS_LIST_RESULT {
  result: ADMIN_APPOINTMENTS_LIST_RESPONSE
}

// export interface SET_APPOINTMENT_COMPLETED_RESPONSE {
//   message: string;
//   success: boolean;
//   appointment_id: number;
// }

// export interface QUERY_RAW_SET_APPOINTMENT_COMPLETED_RESPONSE {
//   result: SET_APPOINTMENT_COMPLETED_RESPONSE;
// }

export interface GET_APPOINTMENT_OVERVIEW_RESPONSE {
  customer_name: string,
  appointment_id: number;
  appointment_overview: string,
  appointment_status: string,
  success: boolean;
  message: string;
}

export interface QUERY_RAW_GET_APPOINTMENT_OVERVIEW_RESPONSE {
  result: GET_APPOINTMENT_OVERVIEW_RESPONSE;
}


export interface SET_CLIENT_RATE_RESPONSE {
  message: string;
  success: boolean;
  code: number;
  appointment_id:number;

}

export interface QUERY_RAW_SET_CLIENT_RATE_RESPONSE {
  result: SET_CLIENT_RATE_RESPONSE;
}



// set-appointment-completed
