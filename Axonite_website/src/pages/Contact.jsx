import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

import Reveal from "../components/Reveal";
import CloudBackground from "../components/CloudBackground";

export default function Contact() {

  // -----------------------------------
  // Step
  // 1 = Contact form
  // 2 = Cloudflare verification
  // -----------------------------------

  const [step, setStep] = useState(1);

  // -----------------------------------
  // Form state
  // -----------------------------------

  const [form, setForm] = useState({
    username: "",
    workEmail: "",
    companyName: "",
    description: "",
  });

  // -----------------------------------
  // Error state
  // -----------------------------------

  const [errors, setErrors] = useState({});

  // -----------------------------------
  // Turnstile state
  // -----------------------------------

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [verificationSuccessful, setVerificationSuccessful] =
    useState(false);

  // -----------------------------------
  // Loading / success
  // -----------------------------------

  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // -----------------------------------
  // Handle input changes
  // -----------------------------------

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Remove field error while typing
    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  }

  // -----------------------------------
  // Step 1
  // Validate contact form
  // -----------------------------------

  function handleSubmit(e) {
    e.preventDefault();

    // Clear old errors
    setErrors({});
    setTurnstileError("");
    setVerificationSuccessful(false);

    // -----------------------------------
    // Clean values
    // -----------------------------------

    const username = form.username.trim();
    const workEmail = form.workEmail.trim();
    const companyName = form.companyName.trim();
    const description = form.description.trim();

    // -----------------------------------
    // Name validation
    // -----------------------------------

    if (!username) {
      setErrors({
        username: "Please enter your name.",
      });

      return;
    }

    if (username.length > 100) {
      setErrors({
        username:
          "Name cannot be longer than 100 characters.",
      });

      return;
    }

    // -----------------------------------
    // Email validation
    // -----------------------------------

    if (!workEmail) {
      setErrors({
        workEmail: "Please enter your work email.",
      });

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(workEmail)) {
      setErrors({
        workEmail:
          "Please enter a valid work email.",
      });

      return;
    }

    // -----------------------------------
    // Company validation
    // -----------------------------------

    if (!companyName) {
      setErrors({
        companyName:
          "Please enter your company name.",
      });

      return;
    }

    if (companyName.length > 200) {
      setErrors({
        companyName:
          "Company name cannot be longer than 200 characters.",
      });

      return;
    }

    // -----------------------------------
    // Description validation
    // -----------------------------------

    if (!description) {
      setErrors({
        description:
          "Please enter your project details.",
      });

      return;
    }

    if (description.length > 5000) {
      setErrors({
        description:
          "Project details cannot be longer than 5000 characters.",
      });

      return;
    }

    // -----------------------------------
    // Save cleaned values
    // -----------------------------------

    setForm({
      username,
      workEmail,
      companyName,
      description,
    });

    // -----------------------------------
    // Move to Cloudflare step
    // -----------------------------------

    setStep(2);
  }

  // -----------------------------------
  // Step 2
  // Cloudflare verification successful
  // -----------------------------------

  async function handleTurnstileSuccess(token) {
    setTurnstileToken(token);

    setTurnstileError("");

    setVerificationSuccessful(true);

    // -----------------------------------
    // Prevent duplicate request
    // -----------------------------------

    if (processing) {
      return;
    }

    setProcessing(true);

    // -----------------------------------
    // Send data to backend
    // -----------------------------------

    try {
      const response = await fetch(
        "http://localhost:5000/api/contact",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: form.username,
            workEmail: form.workEmail,
            companyName: form.companyName,
            description: form.description,

            // Cloudflare token
            turnstileToken: token,
          }),
        }
      );

      const data = await response.json();

      // -----------------------------------
      // Backend error
      // -----------------------------------

      if (!response.ok) {
        // -----------------------------------
        // Cloudflare error
        // -----------------------------------

        if (data.field === "turnstile") {
          setTurnstileError(
            data.message ||
              "Security verification failed. Please try again."
          );

          setTurnstileToken("");

          setVerificationSuccessful(false);

          return;
        }

        // -----------------------------------
        // Normal field error
        // -----------------------------------

        if (data.field) {
          setErrors({
            [data.field]:
              data.message ||
              "Please check this field.",
          });

          setStep(1);

          return;
        }

        // -----------------------------------
        // General error
        // -----------------------------------

        setTurnstileError(
          data.message ||
            "Unable to send your message. Please try again."
        );

        setVerificationSuccessful(false);

        return;
      }

      // -----------------------------------
      // Success
      // -----------------------------------

      if (data.success) {
        setSubmitted(true);

        setErrors({});

        setTurnstileError("");

        setTurnstileToken("");

        setVerificationSuccessful(false);

        setForm({
          username: "",
          workEmail: "",
          companyName: "",
          description: "",
        });
      }
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      setTurnstileError(
        "Unable to connect to the server. Please try again."
      );

      setVerificationSuccessful(false);
    } finally {
      setProcessing(false);
    }
  }

  // -----------------------------------
  // Cloudflare error
  // -----------------------------------

  function handleTurnstileError() {
    setTurnstileToken("");

    setVerificationSuccessful(false);

    setTurnstileError(
      "Security verification failed. Please try again."
    );

    setProcessing(false);
  }

  // -----------------------------------
  // Cloudflare expired
  // -----------------------------------

  function handleTurnstileExpire() {
    setTurnstileToken("");

    setVerificationSuccessful(false);

    setTurnstileError(
      "Security verification expired. Please try again."
    );

    setProcessing(false);
  }

  // -----------------------------------
  // Go back to form
  // -----------------------------------

  function handleBack() {
    setStep(1);

    setTurnstileToken("");

    setTurnstileError("");

    setVerificationSuccessful(false);

    setProcessing(false);
  }

  // -----------------------------------
  // SUCCESS SCREEN
  // -----------------------------------

  if (submitted) {
    return (
      <div>
        <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-20 section-rule">
          {/* 1. Independent Cloud Background */}
      <CloudBackground showGrid={true} />
          <div className="relative max-w-prose mx-auto px-6">
            <p className="eyebrow mb-5">
              Contact
            </p>

            <h1 className="text-display">
              Thank you.
            </h1>

            <p className="mt-6 max-w-[52ch] text-[1.125rem] leading-relaxed text-ink-2">
              Your message has been successfully sent.
            </p>
          </div>
        </section>

        <section className="bg-white py-20 section-rule">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-[620px] mx-auto">
              <div className="card p-10 text-center">

                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>

                <h2 className="text-display-xs mb-3">
                  Message sent.
                </h2>

                <p className="text-ink-2">
                  Thanks for writing in — we'll get back
                  to you within one working day.
                </p>

              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>

      {/* ================================= */}
      {/* HERO SECTION */}
      {/* ================================= */}

      <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-20 section-rule">

        <div className="relative max-w-prose mx-auto px-6">

          <p className="eyebrow mb-5">
            Contact
          </p>

          <h1 className="text-display">
            Tell us what you're building.
          </h1>

          <p className="mt-6 max-w-[52ch] text-[1.125rem] leading-relaxed text-ink-2">
            A few lines about the problem are enough to start.
            We reply within one working day.
          </p>

        </div>
      </section>

      {/* ================================= */}
      {/* CONTACT SECTION */}
      {/* ================================= */}

      <section className="bg-white py-20 section-rule">

        <div className="max-w-container mx-auto px-6 grid md:grid-cols-5 gap-12">

          {/* ================================= */}
          {/* CONTACT INFORMATION */}
          {/* ================================= */}

          <div className="md:col-span-2">

            <Reveal>

              <p className="eyebrow mb-5">
                Reach us directly
              </p>

              <ul className="space-y-6">

                <li>
                  <p className="font-mono-label text-[0.68rem] text-ink-3 mb-1.5">
                    Email
                  </p>

                  <a
                    href="mailto:info@axonite.net"
                    className="font-serif text-[1.4rem] tracking-[-0.01em] text-ink hover:text-accent transition-colors"
                  >
                    info@axonite.net
                  </a>
                </li>

                <li>
                  <p className="font-mono-label text-[0.68rem] text-ink-3 mb-1.5">
                    Phone
                  </p>

                  <a
                    href="tel:+919823103626"
                    className="font-serif text-[1.4rem] tracking-[-0.01em] text-ink hover:text-accent transition-colors"
                  >
                    +91 98231 03626
                  </a>
                </li>

                <li>
                  <p className="font-mono-label text-[0.68rem] text-ink-3 mb-1.5">
                    Office
                  </p>

                  <p className="font-serif text-[1.4rem] tracking-[-0.01em] text-ink">
                    Pune, Maharashtra, India
                  </p>
                </li>

                <li className="pt-5 border-t border-line-soft">
                  <p className="text-[0.9rem] leading-relaxed text-ink-2">
                    Mon – Fri, 09:00 – 21:00 IST. For support questions, write
                    to{" "}
                    <a href="mailto:support@axonite.net" className="text-accent hover:underline">
                      support@axonite.net
                    </a>
                    .
                  </p>
                </li>

              </ul>

            </Reveal>

          </div>

          {/* ================================= */}
          {/* FORM / VERIFICATION */}
          {/* ================================= */}

          <div className="md:col-span-3">

            <Reveal delay={100}>

              {/* ================================= */}
              {/* STEP 1 — CONTACT FORM */}
              {/* ================================= */}

              {step === 1 && (

                <form
                  onSubmit={handleSubmit}
                  className="card p-8 space-y-5"
                >

                  <div className="mb-2">

                    <p className="font-mono-label text-[0.68rem] text-accent">
                      Step 1 of 2
                    </p>

                    <h2 className="text-display-xs mt-2">
                      Your information
                    </h2>

                  </div>

                  {/* NAME + EMAIL */}

                  <div className="grid md:grid-cols-2 gap-5">

                    <Field
                      label="Name"
                      id="username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      error={errors.username}
                    />

                    <Field
                      label="Work email"
                      id="workEmail"
                      name="workEmail"
                      type="email"
                      value={form.workEmail}
                      onChange={handleChange}
                      required
                      error={errors.workEmail}
                    />

                  </div>

                  {/* COMPANY */}

                  <Field
                    label="Company"
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={form.companyName}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    error={errors.companyName}
                  />

                  {/* DESCRIPTION */}

                  <div>

                    <label
                      htmlFor="description"
                      className="font-mono-label text-[0.68rem] text-ink-3 block mb-2"
                    >
                      Project details
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      maxLength={5000}
                      placeholder="What are you looking to build or fix?"
                      className={`w-full bg-paper border rounded-md px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-colors resize-none ${
                        errors.description
                          ? "border-coral"
                          : "border-line"
                      }`}
                    />

                    <div className="flex justify-between items-start mt-1.5">

                      {errors.description ? (
                        <p className="text-coral text-xs">
                          {errors.description}
                        </p>
                      ) : (
                        <span />
                      )}

                      <p className="text-xs text-ink-3">
                        Maximum 5000 characters
                      </p>

                    </div>

                  </div>

                  {/* GENERAL ERROR */}

                  {errors.general && (
                    <p className="text-coral text-sm">
                      {errors.general}
                    </p>
                  )}

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    className="w-full md:w-auto inline-flex justify-center bg-accent text-white font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:bg-accent-strong"
                  >
                    Continue
                  </button>

                </form>

              )}

              {/* ================================= */}
              {/* STEP 2 — CLOUDFLARE */}
              {/* ================================= */}

              {step === 2 && (

                <div className="card p-8 space-y-5">

                  <div>

                    <p className="font-mono-label text-[0.68rem] text-accent">
                      Step 2 of 2
                    </p>

                    <h2 className="text-display-xs mt-2">
                      Security verification
                    </h2>

                    <p className="text-ink-2 mt-3">
                      Please complete the Cloudflare verification
                      to send your message.
                    </p>

                  </div>

                  {/* ================================= */}
                  {/* TURNSTILE */}
                  {/* ================================= */}

                  <div className="py-2">

                    <Turnstile
                      siteKey={
                        import.meta.env
                          .VITE_CLOUDFLARE_TURNSTILE_SITE_KEY
                      }

                      onSuccess={
                        handleTurnstileSuccess
                      }

                      onError={
                        handleTurnstileError
                      }

                      onExpire={
                        handleTurnstileExpire
                      }

                      options={{
                        theme: "light",
                      }}
                    />

                  </div>

                  {/* ================================= */}
                  {/* VERIFICATION SUCCESS */}
                  {/* ================================= */}

                  {verificationSuccessful && (

                    <p className="text-accent text-sm">
                      ✓ Security verification successful.
                    </p>

                  )}

                  {/* ================================= */}
                  {/* CLOUDFLARE ERROR */}
                  {/* ================================= */}

                  {turnstileError && (

                    <p className="text-coral text-sm">
                      {turnstileError}
                    </p>

                  )}

                  {/* ================================= */}
                  {/* PROCESSING */}
                  {/* ================================= */}

                  {processing && (

                    <p className="text-sm text-ink-2">
                      {verificationSuccessful
                        ? "Sending your message..."
                        : "Processing verification..."}
                    </p>

                  )}

                  {/* ================================= */}
                  {/* BUTTONS */}
                  {/* ================================= */}

                  <div className="flex flex-col sm:flex-row gap-3">

                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={processing}
                      className="w-full sm:w-auto inline-flex justify-center border border-line text-ink font-semibold text-[0.9375rem] px-7 py-3.5 rounded-full transition-colors hover:border-ink-3 disabled:opacity-50"
                    >
                      ← Back
                    </button>

                  </div>

                </div>

              )}

            </Reveal>

          </div>

        </div>

      </section>

    </div>
  );
}

/* ================================= */
/* FIELD COMPONENT */
/* ================================= */

function Field({
  label,
  id,
  name,
  type,
  value,
  onChange,
  required,
  maxLength,
  error,
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="font-mono-label text-[0.68rem] text-ink-3 block mb-2"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        className={`w-full bg-paper border rounded-md px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-colors ${
          error
            ? "border-coral"
            : "border-line"
        }`}
      />

      {error && (

        <p className="text-coral text-xs mt-1.5">
          {error}
        </p>

      )}

    </div>
  );
}
