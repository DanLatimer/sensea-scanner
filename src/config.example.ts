import { Config } from './config.js';

export const config: Config = {
  auth: {
    fromEmail: 'from-email@gmail.com',
    toEmail: 'to-email@gmail.com',
    clientId: '<client-id here>',
    clientSecret: '<client-secret-here>',
    refreshToken: '<refresh-token-here>',
  },
};

// To generate clientId, clientSecret and refreshToken follow the following tutorial: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1
