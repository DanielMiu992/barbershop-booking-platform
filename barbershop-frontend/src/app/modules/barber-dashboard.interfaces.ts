import { FormControl } from "@angular/forms";
import { SERVICES_COMBO_ITEM } from "./combo-box.interfaces";

export interface BARBER_APPOINTMENTS_LIST_ITEM {
  status: 'cancelled' | 'confirmed' | 'pending' | string;
  services: Array<{ name: string, price: number, duration: number, service_id: number }>;
  start_time: string;
  barber_name: string;
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

export interface FILTER_FORM_MODEL {
  service_id: FormControl<SERVICES_COMBO_ITEM | null>;
  start_date: FormControl<string | null>;
  end_date: FormControl<string | null>; 
  max_price: FormControl<number | null>;
  max_duration: FormControl<number | null>;
  search_query: FormControl<string | null>; 
}

export interface SET_FORM_MODEL {
  customer_name: FormControl<string | null>;
  appointment_id: FormControl<number | null>;
  appointment_overview: FormControl<string | null>;
  appointment_status: FormControl<string | null>;
}




export interface SET_FORM_MODEL_CANCELLED_APP {
  appointment_id: FormControl<number | null>;
  appointment_status: FormControl<string | null>;
  barber_name: FormControl<string | null>;
  cancel_reason: FormControl<string | null>;
  customer_name:  FormControl<string | null>;
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

export interface SET_FORM_RATING_MODEL {
  rating: FormControl<number | null>;
  client_rating_count: FormControl<number | null>;
  client_rating: FormControl<number | null>; 
  client_id: FormControl<number | null>;
  client_name: FormControl<string | null>;
  client_avatar_url: FormControl<string | null>;
  appointment_id: FormControl<number | null>;
}
