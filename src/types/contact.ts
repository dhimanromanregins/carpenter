// Mirrors backend/app/schemas/contact.py exactly (snake_case on the wire).

export interface ContactCreateRequest {
  name: string;
  phone: string;
  email: string;
  message?: string;
}

export interface ContactOut {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}
