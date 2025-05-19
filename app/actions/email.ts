"use server";

import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!email || !message) {
    return {
      error: "Email and message are required",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // Update with your verified domain
      to: "hello@spaak.app", // The email address that should receive contact form submissions
      subject: `Contact form submission from ${name || email}`,
      text: `
        Name: ${name || "Not provided"}
        Email: ${email}
        Message: ${message}
      `,
      // You can also use HTML for more formatted emails
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name || "Not provided"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      error: "Failed to send email. Please try again later.",
    };
  }
}
