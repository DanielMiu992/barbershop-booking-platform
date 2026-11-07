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

export interface QUERY_RAW_BARBERS_LIST_RESULT {
  result: BARBERS_LIST_RESPONSE
}

export interface SAVE_BARBER_DATA_RESPONSE {
  id: number;
  message: string;
  success: boolean;
}

export interface QUERY_RAW_SAVE_BARBER_DATA_RESULT {
  result: SAVE_BARBER_DATA_RESPONSE
}


export interface SET_BARBER_SCHEDULE_RESPONSE {
  message: string;
  success: boolean;
}

export interface QUERY_RAW_SET_BARBER_SCHEDULE_RESPONSE {
  result: SET_BARBER_SCHEDULE_RESPONSE;
}

export interface BARBER_SCHEDULE_LIST_ITEM {
  id: number;
  end_hour: string;
  barber_id: number;
  start_hour: string;
  day_of_the_week: number;
}

export interface BARBER_SCHEDULE_LIST_RESPONSE {
  data: BARBER_SCHEDULE_LIST_ITEM[];
  success: boolean;
}

export interface QUERYRAW_BARBER_SCHEDULE_LIST_RESPONSE {
  result: BARBER_SCHEDULE_LIST_RESPONSE
}


