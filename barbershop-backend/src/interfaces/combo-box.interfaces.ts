export interface BARBERS_COMBO_ITEM {
  id: number;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  specialites: string | null;
  rating_avg: number;
  rating_count: number;
}

export interface BARBERS_COMBO_RESPONSE {
  result: BARBERS_COMBO_ITEM[];
  success: boolean
}

export interface QUERY_RAW_BARBERS_COMBO_RESULT {
  response: BARBERS_COMBO_RESPONSE
}

export interface SERVICES_COMBO_ITEM {
  id: number;
  name: string;
  price: number;
  is_active: boolean;
  is_addon: boolean;
  duration: number
}

export interface SERVICES_COMBO_RESPONSE {
  result: SERVICES_COMBO_ITEM[];
  success: boolean;
}

export interface QUERY_RAW_SERVICES_COMBO_RESULT {
  response: SERVICES_COMBO_RESPONSE
}


export interface SP_COMBO_ITEM {
  id: number;
  name: string;
}

export interface SP_COMBO_RESPONSE {
  result: SP_COMBO_ITEM[];
  success: boolean
}

export interface QUERY_RAW_SP_COMBO_RESULT {
  response: SP_COMBO_RESPONSE
}

