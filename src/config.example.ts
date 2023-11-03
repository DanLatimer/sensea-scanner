import { DateYYYYMMDD } from './types.js';

export interface Config {
  auth: {
    fromEmail: string;
    toEmail: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  datesInterested: DateYYYYMMDD[];
  pollIntervalInSeconds: number;
}

export const config: Config = {
  auth: {
    fromEmail: 'from-email@gmail.com',
    toEmail: 'to-email@gmail.com',
    clientId: '<client-id here>',
    clientSecret: '<client-secret-here>',
    refreshToken: '<refresh-token-here>',
  },
  datesInterested: ['2023-10-11', '2023-10-12'],
  pollIntervalInSeconds: 60 * 5,
};

// To generate clientId, clientSecret and refreshToken follow the following tutorial: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1
