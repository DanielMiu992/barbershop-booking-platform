import { FormControl } from "@angular/forms";


export interface BARBERS_LIST_ITEM {
  id: number | null;
  is_active: boolean;
  last_name: string;
  avatar_url: string;
  phone: string;
  email: string;
  created_at: string;
  first_name: string;
  rating_avg: number;
  rating_count: number;
}

export interface BARBERS_LIST_RESPONSE {
  data: BARBERS_LIST_ITEM[];
  total: number;
}

export interface SAVE_BARBER_DATA_RESPONSE {
  id: number;
  message: string;
  success: boolean;
}


export interface SET_BARBER_SCHEDULE_RESPONSE {
  message: string;
  success: boolean;
}


export interface BARBER_SCHEDULE_LIST_ITEM {
  id: number;
  end_hour: string;
  barber_id: number;
  start_hour: string;
  day_of_week: number;
}

export interface BARBER_SCHEDULE_LIST_RESPONSE {
  data: BARBER_SCHEDULE_LIST_ITEM[];
  success: boolean;
}

export interface FILTER_FORM_MODEL {
  barber_name: FormControl<string | null>;
  status: FormControl<{label: string, value: any} | null>;
  // status: FormControl< boolean | null>
}

export interface SET_FORM_MODEL {
  id: FormControl<number | null>;
  is_active: FormControl<boolean | null>;
  avatar_url: FormControl<string | null>;
  first_name: FormControl<string | null>;
  created_at: FormControl<string | null>;
  last_name: FormControl<string | null>;
  rating_avg: FormControl<number | null>;
  rating_count: FormControl<number | null>;
}


export interface SCHEDULE_DAY_FORM_MODEL {
  day_of_week: number;
  start_hour: string;
  end_hour: string;
  is_active: boolean;
}


export interface REGISTER_FORM_MODEL {
  id: FormControl<number | null>;
  is_active: FormControl<boolean | null>;
  first_name: FormControl<string | null>;
  last_name: FormControl<string | null>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  password: FormControl<string | null>;
  confirm_password: FormControl<string | null>;
  avatar_url: FormControl<string | null>;
}






