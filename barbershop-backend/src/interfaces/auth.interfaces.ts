export interface REGISTER_RESPONSE {
  message: string;
  success: boolean;
  user_id: number;
}

export interface QUERY_RAW_REGISTER_RESPONSE {
  result: REGISTER_RESPONSE
}

export interface CLAIM_ACCOUNT_RESPONSE {
  message: string;
  success: false;
  code: string;
  user_id: number;
}

export interface QUERY_RAW_CLAIM_ACCOUNT_RESPONSE {
  result: CLAIM_ACCOUNT_RESPONSE
}


export interface LOGIN_RESPONSE {
  message: string;
  success: boolean;
  user_data: {
    id: number;
    role: string;
    last_name: string;
    first_name: string;
    password_hash: string;
  }
}

export interface QUERY_RAW_LOGIN_RESPONSE {
  result: LOGIN_RESPONSE
}

