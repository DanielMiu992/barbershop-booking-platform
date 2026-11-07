export interface AVAILABLE_SLOTS_LIST_RESPONSE {
  data: string[];
  success: boolean;
  message: string | null;
}

export interface QUERY_RAW_AVAILABLE_SLOTS_LIST_RESPONSE {
  result: AVAILABLE_SLOTS_LIST_RESPONSE;
}

export interface UPSERT_GUEST_USER_RESPONSE {
  message: string;
  success: boolean;
  customer_id: number;
}

export interface QUERY_RAW_UPSERT_GUEST_USER_RESPONSE {
  result: UPSERT_GUEST_USER_RESPONSE
}

export interface CREATE_APPOINTMENT_DATA {
  appointment_id: number;
  customer_email: string;
  customer_first_name: string;
  barber_name: string;
  services_names: string;
  total_duration: number;
  total_price: number;
  service_price: number;
  start_time: string;
  start_time_iso: string;
  end_time_iso: string;
  calendar_uid: string;
}

export interface QUERY_RAW_CREATE_APPOINTMENT_RESPONSE {
  result: {
    data: CREATE_APPOINTMENT_DATA | null;
    success: boolean;
    message: string;
  }
}


