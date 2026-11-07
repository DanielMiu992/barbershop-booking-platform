
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
  start_time_iso: string;
  end_time_iso: string;
  calendar_uid: string;

}

export interface QUERY_RAW_SET_CANCEL_APPOINTMENT_RESPONSE {
  //result: SET_CANCEL_APPOINTMENT_RESPONSE;
  result: {
    data: CANCEL_APPOINTMENT_DATA | null;
    success: boolean;
    code: number;
    message: string;
  };
}



export interface GET_APPOINTMENT_CANCEL_INFO_RESPONSE {
  customer_name: string,
  appointment_id: number;
  barber_name: string;
  appointment_overview: string,
  appointment_status: string,
  success: boolean;
  message: string;
}


export interface QUERY_RAW_GET_APPOINTMENT_CANCEL_INFO_RESPONSE {
  result: GET_APPOINTMENT_CANCEL_INFO_RESPONSE;
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
  customer_avatar_url: string;
  barber_avatar_url: string;
  success: boolean;
  message: string;
}

export interface QUERY_RAW_GET_APPOINTMENT_DETAILS_RESPONSE {
  result: GET_APPOINTMENT_DETAILS_RESPONSE;
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

export interface QUERY_RAW_GET_BARBER_DETAILS_RESPONSE {
  result: GET_BARBER_DETAILS_RESPONSE;
}


export interface SET_APPOINTMENT_COMPLETED_RESPONSE {
  message: string;
  success: boolean;
  code: number;
  appointment_id: number;
}

export interface QUERY_RAW_SET_APPOINTMENT_COMPLETED_RESPONSE {
  result: SET_APPOINTMENT_COMPLETED_RESPONSE;
}






