import { FormControl } from "@angular/forms";

export interface SERVICES_LIST_ITEM {
    id: number | null;
    name: string;
    price: number;
    is_active: boolean;
    duration_minutes: number;
}

export interface SERVICES_LIST_RESPONSE {
    data: SERVICES_LIST_ITEM[];
    total: number;
}


export interface SAVE_SERVICE_RESPONSE {
    id: number | null;
    message: string;
    success: boolean;
}

export interface FILTER_FORM_MODEL {
    service_name: FormControl<string | null>;
    status: FormControl<{label:string, value: boolean} | null>;
    max_price: FormControl<number | null>;
}
export interface FILTER_FORM_SPECIALTIES_MODEL {
    search_query: FormControl<string | null>;
    status: FormControl<{label:string, value: boolean} | null>;
    // max_price: FormControl<number | null>;
}

export interface SET_FORM_MODEL {
    id: FormControl<number | null>;
    name: FormControl<string | null>;
    price: FormControl<number | null>;
    is_active: FormControl<boolean | null>;
    duration_minutes: FormControl<number | null>;
}


export interface SET_FORM_SP_MODEL {
    id: FormControl<number | null>;
    name: FormControl<string | null>;
    is_active: FormControl<boolean | null>;
}


export interface GET_SERVICE_DETAILS_RESPONSE {
  service_id: number;
  service_name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  success: boolean;
  message: string;
}

export interface SPECIALTIES_LIST_ITEM {
    id: number;
    name: string;
    is_active: boolean;
    barbers_count: number;
    created_at: number;
}

export interface SPECIALTIES_LIST_RESPONSE {
    data: SPECIALTIES_LIST_ITEM[];
    total: number;
}

export interface SAVE_SP_RESPONSE {
    data: {id: number} | null;
    message: string;
    success: boolean;
}





