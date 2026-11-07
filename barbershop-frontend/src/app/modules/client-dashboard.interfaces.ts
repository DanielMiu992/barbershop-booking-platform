import { FormControl } from "@angular/forms";
import { BARBERS_COMBO_ITEM, SERVICES_COMBO_ITEM } from "./combo-box.interfaces";


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


export interface CANCEL_APPOINTMENT_RESPONSE {
  appointment_id: number;
  success: boolean;
  message: string;
}

export interface FILTER_FORM_MODEL {
  service_id: FormControl<SERVICES_COMBO_ITEM | null>;
  barber_id: FormControl<BARBERS_COMBO_ITEM | null>;
  start_date: FormControl<string | null>;
  end_date: FormControl<string | null>; 
  max_price: FormControl<number | null>;
  max_duration: FormControl<number | null>;
  search_query: FormControl<string | null>; 
}

export interface SET_FORM_MODEL {
  appointment_id: FormControl<number | null>;
  appointment_status: FormControl<string | null>;
  barber_name: FormControl<string | null>;
  cancel_reason: FormControl<string | null>;
  customer_name:  FormControl<string | null>;
  barber_avatar_url: FormControl<string | null>;
}

export interface SET_FORM_RATING_MODEL {
  rating: FormControl<number | null>;
  barber_rating_count: FormControl<number | null>;
  barber_rating: FormControl<number | null>; 
  barber_id: FormControl<number | null>;
  barber_name: FormControl<string | null>;
  appointment_id: FormControl<number | null>;
  barber_avatar_url: FormControl<string | null>;
}

export interface SET_BARBER_RATE_RESPONSE {
  message: string;
  success: boolean;
  barber_id: number;
}

export interface OVERVIEW_FORM_MODEL {
  appointment_id: FormControl<number | null>;
  barber_name: FormControl<string | null>;
  appointment_barber_rating: FormControl<number | null>;
  barber_rating_avg: FormControl<number | null>;
  barber_rating_count: FormControl<number | null>;
  service_name: FormControl<string | null>;
  appointment_status: FormControl<string | null>;
  appointment_overview: FormControl<string | null>;
  cancel_reason: FormControl<string | null>;
  start_time:  FormControl<string | null>;
  barber_avatar_url: FormControl<string | null>;
}




