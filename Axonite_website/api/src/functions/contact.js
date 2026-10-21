import { app } from "@azure/functions";

const json = (status, body) => ({
  status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function isValidEmail(value) {
  return typeof value === "string"
    && value.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

app.http("contact", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "contact",
  handler: async (request, context) => {
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const sendGridKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!turnstileSecret || !sendGridKey || !fromEmail || !toEmail) {
      context.error("Contact function is missing required configuration.");
      return json(500, { error: "Contact service is temporarily unavailable." });
    }

    let form;
    try {
      form = await request.json();
    } catch {
      return json(400, { error: "Request body must be valid JSON." });
    }

    const { username, workEmail, companyName, description, turnstileToken } = form || {};
    if (
      typeof username !== "string" || !username.trim() || username.trim().length > 100
      || !isValidEmail(workEmail)
      || typeof companyName !== "string" || !companyName.trim() || companyName.trim().length > 200
      || typeof description !== "string" || !description.trim() || description.trim().length > 5000
      || typeof turnstileToken !== "string" || !turnstileToken
    ) {
      return json(400, { error: "Please check the submitted contact details and try again." });
    }

    const verification = new URLSearchParams({
      secret: turnstileSecret,
      response: turnstileToken,
    });
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwardedFor) verification.set("remoteip", forwardedFor);

    let verificationResponse;
    try {
      verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verification,
      });
    } catch (error) {
      context.error("Turnstile verification request failed.", error);
      return json(502, { error: "Security verification is temporarily unavailable. Please try again." });
    }

    if (!verificationResponse.ok) {
      context.error("Turnstile verification returned a non-success status.", verificationResponse.status);
      return json(502, { error: "Security verification is temporarily unavailable. Please try again." });
    }

    let verificationResult;
    try {
      verificationResult = await verificationResponse.json();
    } catch (error) {
      context.error("Turnstile returned an invalid response.", error);
      return json(502, { error: "Security verification is temporarily unavailable. Please try again." });
    }

    if (!verificationResult.success) {
      return json(400, { error: "Security verification failed. Please complete the check again." });
    }

    const message = [
      `Name: ${username.trim()}`,
      `Work email: ${workEmail.trim()}`,
      `Company: ${companyName.trim()}`,
      "",
      "Project details:",
      description.trim(),
    ].join("\n");

    let emailResponse;
    try {
      emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendGridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: fromEmail },
          reply_to: { email: workEmail.trim(), name: username.trim() },
          subject: `Website enquiry from ${username.trim()}`,
          content: [{ type: "text/plain", value: message }],
        }),
      });
    } catch (error) {
      context.error("Contact email provider request failed.", error);
      return json(502, { error: "We couldn't send your message. Please try again shortly." });
    }

    if (!emailResponse.ok) {
      context.error("Contact email provider returned a non-success status.", emailResponse.status);
      return json(502, { error: "We couldn't send your message. Please try again shortly." });
    }

    return json(200, { ok: true });
  },
});
