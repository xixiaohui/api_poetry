export interface UserDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly avatar: string | null;
  readonly createdAt: string;
}

export interface LoginResponseDTO {
  readonly token: string;
  readonly user: UserDTO;
}
