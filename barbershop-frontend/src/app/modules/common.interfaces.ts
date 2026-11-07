// export interface SET_CANCEL_APPOINTMENT_RESPONSE {
//   message: string;
//   success: boolean;
//   appointment_id: number;
// }


export interface CANCEL_APPOINTMENT_DATA {
  appointment_id: number;
  cancelled_by: 'customer' | 'admin' | 'barber';
  reason: string | null;
  customer_email: string;
  customer_first_name: string;
  customer_name: string;
  barber_email: string;
  barber_first_name: string;
  barber_name: string;
  service_name: string;
  service_price: number;
  start_time: string;
}

export interface SET_CANCEL_APPOINTMENT_RESPONSE {
  
  data: CANCEL_APPOINTMENT_DATA | null;
  success: boolean;
  message: string;
  
}

export interface SET_APPOINTMENT_COMPLETED_RESPONSE {
  appointment_id: number;
  success: boolean;
  message: string;
}




export interface GET_APPOINTMENT_OVERVIEW_RESPONSE {
  customer_name: string,
  appointment_id: number;
  barber_name: string;
  appointment_overview: string,
  appointment_status: string,
  success: boolean;
  message: string;
}


export interface GET_APPOINTMENT_CANCEL_INFO_RESPONSE {
  customer_name: string,
  appointment_id: number;
  barber_name: string;
  customer_cancel_reason: string,
  admin_cancel_reason: string,
  appointment_status: string,
  success: boolean;
  message: string;
}


export interface GET_APPOINTMENT_DETAILS_RESPONSE {
  customer_name:string;
  customer_id: number;
  barber_name: string;
  barber_id: number;
  customer_phone: string;
  service_name: string;
  service_price: string;
  start_time: string;
  appointment_overview: string;
  appointment_status: string;
  appointment_id: number;
  admin_cancel_reason: string;
  customer_cancel_reason: string;
  barber_rating_avg: number;
  barber_rating_count: number;
  client_rating_count: number;
  client_rating_avg: number;
  appointment_customer_rating: number;
  appointment_barber_rating: number;
  customer_avatar_url: string | null;
  barber_avatar_url: string | null;

  success: boolean;
  message: string;
}


export interface GET_BARBER_DETAILS_RESPONSE {
  barber_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  rating_avg: number;
  rating_count: number;
  is_active: boolean;
  avatar_url: string;
  created_at: string;
  success: boolean;
  message: string;
}




