declare module "bcrypt" {
  const bcrypt: {
    compare(data: string, encrypted: string): Promise<boolean>;
    hash(data: string, saltOrRounds: number): Promise<string>;
  };

  export default bcrypt;
}

declare module "jsonwebtoken" {
  type SignOptions = {
    expiresIn?: string;
    subject?: string;
  };

  const jwt: {
    sign(payload: object, secretOrPrivateKey: string, options?: SignOptions): string;
    verify(token: string, secretOrPublicKey: string): object | string;
  };

  export default jwt;
}
