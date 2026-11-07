import { FormControl } from "@angular/forms";

export interface ADMIN_APPOINTMENTS_ITEM_LIST {
  id: number;
  status: 'confirmed' | 'cancelled' | 'pending' | string;
  end_time: string;
  services: Array<{ name: string, price: number, duration: number, service_id: number }>
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

export interface FILTER_FORM_MODEL {
  customer_name: FormControl<string | null>;
  barber_id: FormControl<{ id: number, full_name: string } | null>;
  service_id: FormControl<{ id: number, name: string, price: number, is_active: boolean, duration_minutes: number } | null>;
  start_date: FormControl<string | null>;
  end_date: FormControl<string | null>;
  search_query: FormControl<string | null>;
  status: FormControl<{ label: string, value: string } | null>;
}


export interface SET_FORM_MODEL {
  customer_name: FormControl<string | null>;
  appointment_id: FormControl<number | null>;
  appointment_overview: FormControl<string | null>;
  appointment_status: FormControl<string | null>;
}

export interface SET_FORM_RATING_MODEL {
  rating: FormControl<number | null>;
  client_rating_count: FormControl<number | null>;
  client_rating: FormControl<number | null>; 
  client_id: FormControl<number | null>;
  client_name: FormControl<string | null>;
  appointment_id: FormControl<number | null>;
  client_avatar_url: FormControl<string | null>;
  // customer_avatar_url: FormControl<string | null>;
}


export interface SET_FORM_MODEL_CANCELLED_APP{
  appointment_id: FormControl<number | null>;
  appointment_status: FormControl<string | null>;
  barber_name: FormControl<string | null>;
  cancel_reason: FormControl<string | null>;
  customer_name: FormControl<string | null>;
  customer_avatar_url: FormControl<string | null>;
  barber_avatar_url: FormControl<string | null>;

}

export interface OVERVIEW_FORM_MODEL {
  appointment_id: FormControl<number | null>;
  barber_name: FormControl<string | null>;
  customer_name: FormControl<string | null>;
  appointment_barber_rating: FormControl<number | null>;
  appointment_customer_rating: FormControl<number | null>;
  barber_rating_avg: FormControl<number | null>;
  client_rating_avg: FormControl<number | null>;
  barber_rating_count: FormControl<number | null>;
  client_rating_count: FormControl<number | null>;
  service_name: FormControl<string | null>;
  appointment_status: FormControl<string | null>;
  appointment_overview: FormControl<string | null>;
  cancel_reason: FormControl<string | null>;
  admin_cancel_reason: FormControl<string | null>;
  customer_cancel_reason: FormControl<string | null>;
  start_time:  FormControl<string | null>;
  customer_avatar_url: FormControl<string | null>;
  barber_avatar_url: FormControl<string | null>;
}


// export interface SET_APPOINTMENT_COMPLETED_RESPONSE {
//   appointment_id: number;
//   success: boolean;
//   message: string;
// }


export interface GET_APPOINTMENT_OVERVIEW_RESPONSE {
  customer_name: string,
  appointment_id: number;
  appointment_overview: string,
  appointment_status: string,
  success: boolean;
  message: string;
}

export interface SET_CLIENT_RATE_RESPONSE {
  message: string;
  success: boolean;
  appointment_id:number;

}

