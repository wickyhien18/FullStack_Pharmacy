export interface JwtPayload {
  userId: number;
  userName: string;
  role: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}
