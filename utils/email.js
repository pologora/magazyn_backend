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

  #body;

  constructor(user, url, from = 'no-reply@snti.pl', body = '') {
    this.#to = user.email;
    this.#url = url;
    this.#surname = user.surname;
    this.#name = user.name;
    this.#from = `SNTI <${from}>`;
    this.#hostname = 'urlop.snti.pl';
    this.#body = body;
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

  async #send(template, subject, to = this.#to) {
    const html = pug.renderFile(
      `${__dirname}/emailTemplates/${template}.pug`,
      {
        name: this.#name,
        surname: this.#surname,
        subject,
        body: this.#body,
        url: this.#url,
        hostname: this.#hostname,
      },
    );

    const text = htmlToText.convert(html);

    const mailOptions = {
      from: this.#from,
      to,
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

  async sendProposalCreation() {
    const userMail = this.#send('proposalCreatingUser', 'Złożenie wniosku urlopowego');
    const adminMail = this.#send('proposalCreatingAdmin', 'Złożenie wniosku urlopowego', 'lysakova@yahoo.com');
    const adminMail2 = this.#send('proposalCreatingAdmin', 'Złożenie wniosku urlopowego', 'lysakov555@gmail.com');
    await Promise.all([userMail, adminMail, adminMail2]);
  }
};
