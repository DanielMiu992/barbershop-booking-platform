export interface AVAILABLE_SLOTS_LIST_RESPONSE {
  data: string[];
  message: string;
  success: boolean;
}

export interface UPSERT_GUEST_USER_RESPONSE {
  message: string;
  success: boolean;
  customer_id: number;
}

export interface CREATE_APPOINTMENT_RESPONSE {
  message: string;
  success: boolean;
  appointment_id: number;
}


export interface CREATE_APPOINTMENT_DATA {
  appointment_id: number;
  customer_email: string;
  customer_first_name: string;
  barber_name: string;
  service_name: string;
  service_duration: number;
  service_price: number;
  start_time: string;
}


export interface CREATE_APPOINTMENT_RESPONSE {
  data: CREATE_APPOINTMENT_DATA | null;
  success: boolean;
  message: string;
}

