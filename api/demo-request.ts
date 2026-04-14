import type { VercelRequest, VercelResponse } from "@vercel/node"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.HOSTINGER_MAIL_USER || "contact@donna-legal.com",
    pass: process.env.HOSTINGER_MAIL_PASS || "",
  },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { nom, email, cabinet, volume } = req.body || {}

  if (!nom || !email) {
    return res.status(400).json({ error: "Nom et email requis" })
  }

  const demoUrl = "https://donna-legal.com/demo"

  const htmlBody = `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 540px; margin: 0 auto; color: #0D0D0D; line-height: 1.7;">
  <p>Bonjour ${nom},</p>

  <p>Merci pour votre intérêt pour Donna.</p>

  <p>Votre démo interactive est prête. En 30 secondes, vous allez voir ce que Donna fera pour vous chaque matin : lire vos emails, trier vos dossiers, préparer vos réponses.</p>

  <p style="text-align: center; margin: 28px 0;">
    <a href="${demoUrl}" style="display: inline-block; padding: 12px 32px; background: #0D0D0D; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">Voir la démo Donna</a>
  </p>

  <p>Si vous souhaitez tester Donna sur votre vraie boîte mail, vous pouvez réserver un créneau d'onboarding de 15 minutes :</p>

  <p style="text-align: center; margin: 20px 0;">
    <a href="https://calendly.com/contact-donna-legal/onboarding-15min" style="color: #0D0D0D; font-weight: 500; text-decoration: underline;">Réserver un onboarding gratuit</a>
  </p>

  <p>À très vite,</p>

  <p><strong>L'équipe Donna Legal</strong><br>
  <a href="mailto:contact@donna-legal.com" style="color: #737373;">contact@donna-legal.com</a></p>
</div>
`

  const textBody = `Bonjour ${nom},

Merci pour votre intérêt pour Donna.

Votre démo interactive est prête : ${demoUrl}

En 30 secondes, vous allez voir ce que Donna fera pour vous chaque matin.

Pour tester sur votre vraie boîte mail, réservez un onboarding de 15 min :
https://calendly.com/contact-donna-legal/onboarding-15min

À très vite,
L'équipe Donna Legal
contact@donna-legal.com`

  try {
    await transporter.sendMail({
      from: '"Donna Legal" <contact@donna-legal.com>',
      to: email,
      subject: "Votre démo Donna Legal est prête",
      text: textBody,
      html: htmlBody,
    })

    // Also notify Yoel via email (BCC-style)
    await transporter.sendMail({
      from: '"Donna Legal" <contact@donna-legal.com>',
      to: "contact@donna-legal.com",
      subject: `[Nouvelle demande démo] ${nom} — ${cabinet || "N/A"}`,
      text: `Nouvelle demande de démo :\n\nNom : ${nom}\nEmail : ${email}\nCabinet : ${cabinet || "N/A"}\nVolume emails : ${volume || "N/A"}\n\nMail de démo envoyé automatiquement.`,
    })

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error("Email send error:", error)
    return res.status(500).json({ error: "Erreur d'envoi", details: error.message })
  }
}
