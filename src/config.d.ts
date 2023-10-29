export interface Config {
  auth: {
    fromEmail: string;
    toEmail: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
}
