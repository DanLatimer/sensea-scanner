import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { getConfig } from '../config.js';
import { ChangedBookings } from '../persistence/persistence.js';
import { MonthAvailabilities } from '../types.js';
import { generateEmailBody } from './email-generator.js';
const OAuth2 = google.auth.OAuth2;

export class Emailer {
  public oauth2Client = new OAuth2(
    getConfig().auth.clientId,
    getConfig().auth.clientSecret,
    'https://developers.google.com/oauthplayground', // Redirect URL
  );

  public constructor() {}

  public async sendMail(
    datesInterested: string[],
    newAvailabilities: ChangedBookings,
    allAvailabilities: MonthAvailabilities,
  ): Promise<void> {
    this.oauth2Client.setCredentials({
      refresh_token: getConfig().auth.refreshToken,
    });
    const accessToken = this.oauth2Client.getAccessToken();

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: getConfig().auth.fromEmail,
        clientId: getConfig().auth.clientId,
        clientSecret: getConfig().auth.clientSecret,
        refreshToken: getConfig().auth.refreshToken,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `Sensea Scanner <${getConfig().auth.fromEmail}>`,
      to: getConfig().notification.toEmail,
      subject: 'Sensea Scanner Report',
      generateTextFromHTML: true,
      html: generateEmailBody(
        datesInterested,
        newAvailabilities,
        allAvailabilities,
      ),
    };

    console.log('\nSending email with updates');
    smtpTransport.sendMail(mailOptions, (error) => {
      console.log(`Email sent ${error ? 'unsuccessfully' : 'successfully'}`);

      if (error) {
        console.error(error);
      }

      smtpTransport.close();
    });
  }
}
