import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { config } from '../config.js';
const OAuth2 = google.auth.OAuth2;

export class Emailer {
  public oauth2Client = new OAuth2(
    config.auth.clientId,
    config.auth.clientSecret,
    'https://developers.google.com/oauthplayground', // Redirect URL
  );

  public constructor() {}

  public async sendMail(): Promise<void> {
    this.oauth2Client.setCredentials({
      refresh_token: config.auth.refreshToken,
    });
    const accessToken = this.oauth2Client.getAccessToken();

    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.auth.fromEmail,
        clientId: config.auth.clientId,
        clientSecret: config.auth.clientSecret,
        refreshToken: config.auth.refreshToken,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `Sensea Scanner <${config.auth.fromEmail}>`,
      to: config.auth.toEmail,
      subject: 'Sensea Scanner Report',
      generateTextFromHTML: true,
      html: `<h1>New Cancellations: 1, New Bookings: 2</h1>
      <p>There is 1 new cancellation: Thursday January 23</p>
      <p>There is 2 new bookings: Thursday January 23, Friday January 24</p>
      `,
    };

    smtpTransport.sendMail(mailOptions, (error, response) => {
      error ? console.log(error) : console.log(response);
      smtpTransport.close();
    });
  }
}
