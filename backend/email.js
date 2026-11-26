const nodemailer = require('nodemailer');

function createMailer(env = process.env) {
  function getTransport() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      const error = new Error('Email delivery is not configured.');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: env.SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }

  async function send(to, subject, text) {
    const transport = getTransport();
    await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text
    });
  }

  return {
    sendVerificationEmail: (to, url) => send(
      to,
      'Confirme seu e-mail — EntrePausas',
      `Para confirmar seu e-mail, abra este link:\n\n${url}\n\nSe você não criou esta conta, ignore esta mensagem.`
    ),
    sendPasswordResetEmail: (to, url) => send(
      to,
      'Redefina sua senha — EntrePausas',
      `Para definir uma nova senha, abra este link:\n\n${url}\n\nSe você não pediu a redefinição, ignore esta mensagem.`
    )
  };
}

module.exports = { createMailer };
