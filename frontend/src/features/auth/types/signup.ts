export type SignupFormValues = {
  age: string;
  confirmPassword: string;
  dob: string;
  email: string;
  name: string;
  password: string;
  username: string;
};

export type SignupPayload = {
  age?: number;
  dob?: string;
  email: string;
  name: string;
  password: string;
  username: string;
};
