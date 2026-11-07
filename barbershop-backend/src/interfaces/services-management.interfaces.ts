export interface SERVICES_LIST_ITEM {
    id: number;
    name: string;
    price: number;
    is_active: boolean;
    duration_minutes: number;
}

export interface SERVICES_LIST_RESPONSE {
    data: SERVICES_LIST_ITEM[];
    total: number;
}

export interface QUERY_RAW_SERVICES_LIST_RESPONSE {
    result: SERVICES_LIST_RESPONSE
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

export interface QUERY_RAW_SPECIALTIES_LIST_RESPONSE {
    result: SPECIALTIES_LIST_ITEM
}


export interface SAVE_SP_RESPONSE {
    data: {id: number} | null;
    message: string;
    success: boolean;
}

export interface QUERY_RAW_SAVE_SP_RESPONSE {
    result: SAVE_SP_RESPONSE
}








export interface SAVE_SERVICE_RESPONSE {
    id: number;
    message: string;
    success: boolean;
}

export interface QUERY_RAW_SAVE_SERVICE_RESPONSE {
    result: SAVE_SERVICE_RESPONSE
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

export interface QUERY_RAW_GET_SERVICE_DETAILS_RESPONSE {
  result: GET_SERVICE_DETAILS_RESPONSE;
}


