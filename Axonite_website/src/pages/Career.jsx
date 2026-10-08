import { useEffect, useState } from "react";
import Reveal from "../components/Reveal";
import CloudBackground from "../components/CloudBackground";
const API_BASE_URL = "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| CAREER PAGE - PERKS
|--------------------------------------------------------------------------
*/

const perks = [
  {
    label: "Health cover",
    desc: "For you and your immediate family, from day one.",
  },
  {
    label: "Flexible hours",
    desc: "Core overlap hours, otherwise work when you're sharpest.",
  },
  {
    label: "Learning budget",
    desc: "Courses, books, and conferences — no approval theatre.",
  },
  {
    label: "Real ownership",
    desc: "You ship to production in your first two weeks.",
  },
];

/*
|--------------------------------------------------------------------------
| INITIAL FORM DATA
|--------------------------------------------------------------------------
*/

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  linkedin: "",
  qualification: "",
  experience: "",
  city: "",
  resume: null,
};

/*
|--------------------------------------------------------------------------
| INITIAL ERROR DATA
|--------------------------------------------------------------------------
*/

const initialErrors = {
  name: "",
  phone: "",
  email: "",
  linkedin: "",
  qualification: "",
  experience: "",
  city: "",
  resume: "",
};

/*
|--------------------------------------------------------------------------
| REGEX VALIDATIONS
|--------------------------------------------------------------------------
*/

const nameRegex = /^[A-Za-z ]+$/;
const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const cityRegex = /^[A-Za-z .-]+$/;
const MAX_RESUME_SIZE = 3 * 1024 * 1024;

export default function Career() {
  // Live database jobs state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Job rows whose full description is revealed
  const [expandedJobs, setExpandedJobs] = useState(() => new Set());

  const toggleJobDescription = (id) => {
    setExpandedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Application states
  const [showApplication, setShowApplication] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [submitted, setSubmitted] = useState(false);

  // Fetch jobs from Flask MySQL backend on component mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (!response.ok) throw new Error("Failed to load jobs");
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    }

    fetchJobs();
  }, []);

  const handleApply = (job) => {
    setSelectedJob(job);
    setFormData({ ...initialFormData });
    setErrors({ ...initialErrors });
    setStep(1);
    setSubmitted(false);
    setShowApplication(true);
  };

  const closeApplication = () => {
    setShowApplication(false);
    setStep(1);
    setSelectedJob(null);
    setFormData({ ...initialFormData });
    setErrors({ ...initialErrors });
    setSubmitted(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateName = () => {
    const value = formData.name.trim();
    if (!value) return "Name is required.";
    if (value.length > 100) return "Name cannot be more than 100 characters.";
    if (!nameRegex.test(value)) return "Name can contain only letters and spaces.";
    return "";
  };

  const validateEmail = () => {
    const value = formData.email.trim();
    if (!value) return "Gmail address is required.";
    if (!gmailRegex.test(value)) return "Please enter a valid Gmail address, e.g. example@gmail.com.";
    return "";
  };

  const validateExperience = () => {
    if (!formData.experience) return "Please select your experience.";
    return "";
  };

  const validateCity = () => {
    const value = formData.city.trim();
    if (!value) return "Residential city is required.";
    if (value.length > 20) return "City cannot be more than 20 characters.";
    if (!cityRegex.test(value)) return "City can contain only letters, spaces, dots and hyphens.";
    return "";
  };

  const validateResume = () => {
    const file = formData.resume;
    if (!file) return "Please upload your resume.";

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
      return "Only PDF files are allowed.";
    }

    if (file.size > MAX_RESUME_SIZE) {
      return "Resume size must not exceed 3 MB.";
    }

    return "";
  };

  const validateStep1 = () => {
    const newErrors = {
      name: validateName(),
      phone: "",
      email: validateEmail(),
      linkedin: "",
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return !Object.values(newErrors).some((err) => err);
  };

  const validateStep2 = () => {
    const newErrors = {
      qualification: "",
      experience: validateExperience(),
      city: validateCity(),
      resume: validateResume(),
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return !Object.values(newErrors).some((err) => err);
  };

  const handleStep1Continue = (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
    requestAnimationFrame(() => {
      document.getElementById("career-application-content")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleStep2Continue = (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setStep(3);
    requestAnimationFrame(() => {
      document.getElementById("career-application-content")?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // Add these state hooks inside Career component
const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState("");

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = new FormData();
      payload.append("job_id", selectedJob?.job_id || "");
      payload.append("user_name", formData.name);
      payload.append("user_email", formData.email);
      payload.append("user_mobile", formData.phone);
      payload.append("user_qualifications", formData.qualification);
      payload.append("user_experience", formData.experience);
      payload.append("user_residential", formData.city);
      payload.append("user_linkedin", formData.linkedin || "");
      payload.append("user_status", 1);

      if (formData.resume) {
        payload.append("resume", formData.resume);
      }

      const response = await fetch(`${API_BASE_URL}/applied_jobs`, {
        method: "POST",
        body: payload,
      });

      // 1. Declare and read response FIRST
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const result = isJson ? await response.json() : await response.text();

      // 2. Inspect status AFTER result is initialized
      if (!response.ok) {
        const errorDetail = isJson
          ? (result.details ? `${result.error}: ${result.details}` : result.error)
          : result;
        throw new Error(errorDetail || "Failed to submit application");
      }

      // 3. Set success state
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-20 section-rule">
        {/* 1. Independent Cloud Background */}
      <CloudBackground showGrid={true} />
        <div className="relative max-w-prose mx-auto px-6">
          <p className="eyebrow mb-5">Career</p>
          <h1 className="text-display">
            Work on software people actually depend on.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.125rem] leading-relaxed text-ink-2">
            We're a small team building products that finance teams, field crews, and shift workers use every day.
          </p>
        </div>
      </section>

      {/* OPEN ROLES SECTION */}
      <section className="bg-white py-24 section-rule">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <p className="eyebrow mb-4">Open roles</p>
            <h2 className="text-display-sm max-w-[24ch]">
              {loadingJobs
                ? "Loading opportunities..."
                : jobs.length > 0
                ? `Currently hiring for ${jobs.length} position${jobs.length === 1 ? "" : "s"}.`
                : "No open roles right now."}
            </h2>
          </Reveal>

          <div className="mt-12 divide-y divide-line border-t border-b border-line">
            {!loadingJobs && jobs.length === 0 && (
              <p className="py-8 text-sm text-ink-3">
                Check back soon, or write to us anyway below.
              </p>
            )}

            {jobs.map((job, i) => {
              const isExpanded = expandedJobs.has(job.job_id);
              return (
              <Reveal key={job.job_id} delay={i * 80}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-5">
                  <div className="min-w-0">
                    <h3 className="text-[1.1rem] mb-1">
                      {job.job_title}
                    </h3>
                     <h5 className="text-[0.8rem] mb-1">
                      {job.job_experience}
                    </h5>

                    <p
                      className={`text-ink-2 text-[0.85rem] max-w-lg leading-relaxed whitespace-pre-line ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {job.job_description}
                    </p>

                    {job.job_description && (
                      <button
                        type="button"
                        onClick={() => toggleJobDescription(job.job_id)}
                        aria-expanded={isExpanded}
                        className="mt-1.5 text-[0.8rem] font-semibold text-accent transition-colors hover:text-accent-strong"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}

                    <div className="flex flex-wrap gap-4 mt-2.5 font-mono-label text-[0.68rem] text-accent">
                      <span>{job.job_location}</span>
                      <span>•</span>
                      <span>{job.job_type}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(job)}
                    className="shrink-0 inline-flex items-center justify-center border border-line rounded-full px-5 py-2 text-[0.875rem] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    Apply
                  </button>
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PERKS SECTION */}
      <section className="section-dark section-rule py-24">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <p className="eyebrow mb-4">Why join</p>
            <h2 className="text-display-sm text-paper max-w-[22ch]">
              What you get, beyond the paycheck.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mt-14">
            {perks.map((p, i) => (
              <Reveal key={p.label} delay={i * 100}>
                <div className="border-t-2 border-accent pt-5">
                  <h3 className="text-[1.15rem] font-serif text-paper mb-2">{p.label}</h3>
                  <p className="text-[0.9rem] leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-paper py-20 section-rule">
        <div className="max-w-[620px] mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-display-xs">
              Don't see the right role listed?
            </h2>
            <p className="text-ink-2 mt-3">
              Write to us anyway at{" "}
              <a href="mailto:careers@axonite.in" className="text-accent hover:underline">
                careers@axonite.in
              </a>
              . We keep every good resume on file.
            </p>
          </Reveal>
        </div>
      </section>

      {/* APPLICATION MODAL */}
      {showApplication && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-paper w-full max-w-xl max-h-[92vh] rounded-lg sm:rounded-md shadow-lg border border-line overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="relative px-5 sm:px-7 py-5 sm:py-6 border-b border-line bg-paper shrink-0">
              <p className="font-mono-label text-[0.68rem] text-accent">
                Job Application
              </p>
              <h2 className="text-[1.5rem] mt-1 pr-12 break-words">
                {selectedJob?.job_title} 
              </h2>
              <span className="inline-block text-xs text-ink-3 mt-1"> {selectedJob?.job_experience}</span>
              <button
                type="button"
                onClick={closeApplication}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border border-line text-ink-3 text-xl hover:bg-dark hover:text-paper transition-all"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            {!submitted && (
              <div className="px-5 sm:px-7 pt-5 sm:pt-6 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        step >= num ? "bg-accent" : "bg-line"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center gap-3 mt-2.5">
                  <p className="font-mono-label text-[0.62rem] text-ink-3">Step {step} of 3</p>
                  <p className="font-mono-label text-[0.62rem] text-accent text-right">
                    {step === 1 && "Personal Information"}
                    {step === 2 && "Professional Information"}
                    {step === 3 && "Confirmation"}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div
              id="career-application-content"
              className="px-5 sm:px-7 py-5 sm:py-6 overflow-y-auto flex-1 min-h-0"
            >
              {step === 1 && !submitted && (
                <form onSubmit={handleStep1Continue} noValidate>
                  <h3 className="text-[1.25rem] font-serif text-ink mb-1">
                    Tell us about yourself
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-3 mb-5">
                    Please provide your basic contact information.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        Full Name <span className="text-accent">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="Enter your full name"
                        className={`w-full border rounded-md px-4 py-3 bg-paper text-sm outline-none transition-all ${
                          errors.name
                            ? "border-coral"
                            : "border-line focus:border-accent focus:ring-2 focus:ring-accent/10"
                        }`}
                      />
                      <FieldError message={errors.name} />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          }))
                        }
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10 digit mobile number"
                        className="w-full border border-line rounded-md px-4 py-3 bg-paper text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        Gmail Address <span className="text-accent">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@gmail.com"
                        className={`w-full border rounded-md px-4 py-3 bg-paper text-sm outline-none transition-all ${
                          errors.email
                            ? "border-coral"
                            : "border-line focus:border-accent focus:ring-2 focus:ring-accent/10"
                        }`}
                      />
                      <FieldError message={errors.email} />
                    </div>

                    <div>
                      <label htmlFor="linkedin" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        LinkedIn URL <span className="text-ink-3">(Optional)</span>
                      </label>
                      <input
                        id="linkedin"
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://www.linkedin.com/in/your-profile"
                        className="w-full border border-line rounded-md px-4 py-3 bg-paper text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-accent text-white rounded-full px-8 py-3 font-mono-label text-[0.68rem] hover:bg-accent-strong transition-all"
                    >
                      Continue →
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && !submitted && (
                <form onSubmit={handleStep2Continue} noValidate>
                  <h3 className="text-[1.25rem] font-serif text-ink mb-1">
                    Professional information
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-3 mb-5">
                    Tell us about your education and experience.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="qualification" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        Qualification
                      </label>
                      <input
                        id="qualification"
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="e.g. B.E. Computer Engineering"
                        className="w-full border border-line rounded-md px-4 py-3 bg-paper text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="experience" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        Experience <span className="text-accent">*</span>
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className={`w-full border rounded-md px-4 py-3 bg-paper text-sm outline-none transition-all ${
                          errors.experience
                            ? "border-coral"
                            : "border-line focus:border-accent focus:ring-2 focus:ring-accent/10"
                        }`}
                      >
                        <option value="">Select experience</option>
                        <option value="0">0 Years</option>
                        <option value="1">1 Year</option>
                        <option value="2">2 Years</option>
                        <option value="3">3 Years</option>
                        <option value="4">4 Years</option>
                        <option value="5">5 Years</option>
                        <option value="6">6 Years</option>
                        <option value="7">7 Years</option>
                        <option value="8">8 Years</option>

                      </select>
                      <FieldError message={errors.experience} />
                    </div>

                    <div>
                      <label htmlFor="city" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        Residential City <span className="text-accent">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value.replace(/[^A-Za-z .-]/g, "").slice(0, 20),
                          }))
                        }
                        maxLength={20}
                        placeholder="Enter your city"
                        className={`w-full border rounded-md px-4 py-3 bg-paper text-sm outline-none transition-all ${
                          errors.city
                            ? "border-coral"
                            : "border-line focus:border-accent focus:ring-2 focus:ring-accent/10"
                        }`}
                      />
                      <FieldError message={errors.city} />
                    </div>

                    <div>
                      <label htmlFor="resume" className="block font-mono-label text-[0.68rem] text-ink-3 block mb-2">
                        Resume <span className="text-accent">*</span>{" "}
                        <span className="text-ink-3">(PDF, Max 3 MB)</span>
                      </label>
                      <input
                        id="resume"
                        type="file"
                        name="resume"
                        accept="application/pdf,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file && !file.name.toLowerCase().endsWith(".pdf")) {
                            setErrors((prev) => ({ ...prev, resume: "Only PDF files are allowed." }));
                            setFormData((prev) => ({ ...prev, resume: null }));
                            e.target.value = "";
                            return;
                          }
                          if (file && file.size > MAX_RESUME_SIZE) {
                            setErrors((prev) => ({ ...prev, resume: "Resume size must not exceed 3 MB." }));
                            setFormData((prev) => ({ ...prev, resume: null }));
                            e.target.value = "";
                            return;
                          }
                          setErrors((prev) => ({ ...prev, resume: "" }));
                          setFormData((prev) => ({ ...prev, resume: file }));
                        }}
                        className="w-full border border-line rounded-md px-3 py-2.5 bg-white text-xs sm:text-sm file:mr-4 file:rounded-full file:border-0 file:bg-paper file:px-4 file:py-2 file:text-xs file:text-ink hover:file:bg-accent transition-all"
                      />
                      <FieldError message={errors.resume} />
                      {formData.resume && !errors.resume && (
                        <p className="text-xs text-accent mt-2 truncate">
                          ✓ {formData.resume.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="border border-line rounded-full px-7 py-3 font-mono-label text-[0.68rem] hover:border-accent transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="bg-accent text-white rounded-full px-8 py-3 font-mono-label text-[0.68rem] hover:bg-accent-strong transition-all"
                    >
                      Continue →
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && !submitted && (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-[1.25rem] font-serif text-ink mb-1">
                    Review your application
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-3 mb-5">
                    Please check your information before submitting.
                  </p>

                  <div className="bg-accent-soft border border-accent/15 rounded-md p-4 mb-4">
                    <p className="font-mono-label text-[0.62rem] text-accent uppercase">Applying for</p>
                    <p className="text-base sm:text-lg font-serif text-ink mt-1 break-words">
                      {selectedJob?.job_title}
                    </p>
                    <span className="inline-block text-xs text-ink-3 mt-1"> {selectedJob?.job_experience}</span>
                  </div>

                  <div className="border border-line rounded-md overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      <ConfirmationItem label="Name" value={formData.name} />
                      <ConfirmationItem label="Phone" value={formData.phone || "Not provided"} />
                      <ConfirmationItem label="Email" value={formData.email} />
                      <ConfirmationItem label="LinkedIn" value={formData.linkedin || "Not provided"} />
                      <ConfirmationItem label="Qualification" value={formData.qualification || "Not provided"} />
                      <ConfirmationItem label="Experience" value={formData.experience} />
                      <ConfirmationItem label="Residential City" value={formData.city} />
                      <ConfirmationItem
                        label="Resume"
                        value={formData.resume ? formData.resume.name : "Not uploaded"}
                      />
                    </div>
                  </div>

                  {submitError && (
  <p className="text-xs text-coral bg-coral/10 border border-coral/40 rounded-md p-2.5 mt-4">
    {submitError}
  </p>
)}

<div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
  <button
    type="button"
    disabled={submitting}
    onClick={() => setStep(2)}
    className="border border-line rounded-full px-7 py-3 font-mono-label text-[0.68rem] hover:border-accent transition-all disabled:opacity-50"
  >
    ← Back
  </button>
  <button
    type="submit"
    disabled={submitting}
    className="bg-accent text-white rounded-full px-8 py-3 font-mono-label text-[0.68rem] hover:bg-accent-strong transition-all disabled:opacity-50"
  >
    {submitting ? "Submitting..." : "Submit Application"}
  </button>
</div>
                </form>
              )}

              {submitted && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-accent-soft text-accent mx-auto flex items-center justify-center text-3xl">
                    ✓
                  </div>
                  <h3 className="text-display-xs mt-6">Applied</h3>
                  <p className="text-sm text-ink-2 mt-3 max-w-md mx-auto">
                    Your application for <strong className="text-ink font-semibold">{selectedJob?.job_title}</strong> has been submitted successfully.
                  </p>
                  <button
                    type="button"
                    onClick={closeApplication}
                    className="mt-7 bg-accent text-white rounded-full px-8 py-3 font-mono-label text-[0.68rem] hover:bg-accent-strong transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FieldError = ({ message }) => {
  if (!message) return null;
  return <p className="text-coral text-xs mt-1.5 leading-relaxed">{message}</p>;
};

const ConfirmationItem = ({ label, value }) => (
  <div className="p-3.5 sm:p-4 border-b border-r border-line min-w-0">
    <p className="text-[10px] md:text-xs text-ink-3 mb-1">{label}</p>
    <p className="text-xs md:text-sm font-medium break-words">{value}</p>
  </div>
);