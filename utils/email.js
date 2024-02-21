const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  #to;

  #url;

  #name;

  #surname;

  #from;

  #hostname;

  constructor(user, url, from = 'no-reply@snti.pl') {
    this.#to = user.email;
    this.#url = url;
    this.#surname = user.surname;
    this.#name = user.name;
    this.#from = `SNTI <${from}>`;
    this.#hostname = 'urlop.snti.pl';
  }

  // eslint-disable-next-line class-methods-use-this
  createTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async #send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/emailTemplates/${template}.pug`,
      {
        name: this.#name,
        surname: this.#surname,
        subject,
        url: this.#url,
        hostname: this.#hostname,
      },
    );

    const text = htmlToText.convert(html);

    const mailOptions = {
      from: this.#from,
      to: this.#to,
      subject,
      text,
      html,
    };

    const transporter = this.createTransport();
    await transporter.sendMail(mailOptions);
  }

  async sendWellcome() {
    await this.#send('welcome', 'Witamy w SNTI!');
  }

  async sendResetPassword() {
    await this.#send('resetPassword', 'Resetuj Hasło');
  }

  async sendRejestration() {
    await this.#send('registration', 'Rejestracja SNTI');
  }
};
