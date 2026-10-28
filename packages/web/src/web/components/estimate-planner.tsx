import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sprout,
  Trees,
  Route,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { services } from "./fieldnorth-content";

type Details = { location: string; area: string; name: string; email: string; details: string };
const empty: Details = { location: "", area: "", name: "", email: "", details: "" };
const areas = ["Under 1 acre", "1-3 acres", "3-5 acres", "More than 5 acres", "Not sure"];
const icons = [Trees, Sprout, Route];

export function EstimatePlanner({
  selected,
  setSelected,
  entryVersion,
}: {
  selected: number | null;
  setSelected: (value: number | null) => void;
  entryVersion: number;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Details>({ ...empty });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    setStep(0);
    setErrors({});
    setAnnouncement(
      "The work. Your service selection has been updated. Property details are preserved.",
    );
  }, [entryVersion]);

  function move(next: number) {
    setStep(next);
    setErrors({});
    setAnnouncement(
      next === 2
        ? "Demo preview complete. No request was sent."
        : next === 1
          ? "Step 2 of 3. Your property."
          : "Step 1 of 3. The work.",
    );
    requestAnimationFrame(() => stepHeading.current?.focus({ preventScroll: true }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (step === 0) {
      if (selected === null) nextErrors.service = "Choose a service to continue.";
    } else {
      if (!data.location.trim()) nextErrors.location = "Enter a property city or ZIP code.";
      if (!data.area) nextErrors.area = "Choose an approximate area, or select Not sure.";
      if (!data.name.trim())
        nextErrors.name = "Enter a full name. A fictional name is appropriate.";
      if (!data.email.trim())
        nextErrors.email = "Enter an email address. You can use demo@example.com.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        nextErrors.email = "Enter a valid email address, such as demo@example.com.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setAnnouncement("Please correct the highlighted fields before continuing.");
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>(`[data-field="${Object.keys(nextErrors)[0]}"]`)
          ?.focus(),
      );
    } else move(step + 1);
  }

  function sample() {
    if (selected === null) setSelected(1);
    setData({
      location: "Winter Garden",
      area: "1-3 acres",
      name: "Demo Visitor",
      email: "demo@example.com",
      details: "Open an access route while keeping mature trees.",
    });
    setErrors({});
    setStep(0);
    setAnnouncement("Sample project filled. Continue through the steps to preview it.");
  }

  function reset() {
    setData({ ...empty });
    setSelected(null);
    setStep(0);
    setErrors({});
    setAnnouncement("New preview started. All fields and service selection cleared.");
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }

  function update(key: keyof Details, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  return (
    <section id="estimate" className="estimate-section section-pad">
      <div className="container estimate-layout">
        <div className="estimate-intro">
          <span className="eyebrow">07 / LET’S TALK LAND</span>
          <h2 ref={heading} tabIndex={-1}>
            Tell us about
            <br />
            your land.
          </h2>
          <p>Start with the work you have in mind and a few details about the property.</p>
          <div className="demo-notice">
            <ShieldCheck size={21} />
            <div>
              <strong>Interactive demo.</strong>
              <p>Use sample details. No request will be sent or saved.</p>
            </div>
          </div>
          <button type="button" onClick={sample} className="text-button sample-button">
            Use sample project <ArrowUp />
          </button>
          <p className="small-copy">A little detail. A clearer starting point.</p>
        </div>
        <div className="planner">
          <ol className="planner-progress" aria-label="Estimate preview progress">
            {["The work", "Your property", "Request preview"].map((label, i) => (
              <li
                key={label}
                className={step === i ? "current" : step > i ? "complete" : ""}
                aria-current={step === i ? "step" : undefined}
              >
                <span>{step > i ? <Check size={15} /> : `0${i + 1}`}</span>
                <b>{label}</b>
              </li>
            ))}
          </ol>
          <output className="sr-only" aria-live="polite">
            {announcement}
          </output>
          {step < 2 ? (
            <form
              ref={form}
              onSubmit={submit}
              noValidate
              autoComplete="off"
              data-private="true"
              data-analytics-ignore="true"
            >
              <div className="planner-heading">
                <span className="eyebrow">STEP 0{step + 1} / 03</span>
                <h3 ref={stepHeading} tabIndex={-1}>
                  {step === 0 ? "What can we help open up?" : "A few details about the property."}
                </h3>
                <p>
                  {step === 0
                    ? "Choose the service that best fits your goal."
                    : "Fictional details are appropriate. Nothing is sent or saved."}
                </p>
              </div>
              {step === 0 ? (
                <fieldset className="service-choices">
                  <legend className="sr-only">Choose a service (required)</legend>
                  {services.map((service, i) => {
                    const Icon = icons[i]!;
                    return (
                      <label
                        key={service.title}
                        className={`service-choice ${selected === i ? "chosen" : ""}`}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={service.title}
                          aria-label={service.title}
                          checked={selected === i}
                          onChange={() => {
                            setSelected(i);
                            setErrors({});
                          }}
                          data-field={i === 0 ? "service" : undefined}
                          aria-describedby={errors.service ? "service-error" : undefined}
                        />
                        <Icon size={25} strokeWidth={1.5} />
                        <span>
                          <strong>{service.title}</strong>
                          <small>{service.short}</small>
                        </span>
                        <span className="radio-mark">{selected === i && <span />}</span>
                      </label>
                    );
                  })}
                  {errors.service && (
                    <p id="service-error" className="field-error">
                      {errors.service}
                    </p>
                  )}
                </fieldset>
              ) : (
                <div className="fields-grid">
                  <div className="field">
                    <label htmlFor="location">
                      Property city or ZIP code <span>*</span>
                    </label>
                    <input
                      id="location"
                      aria-label="Property city or ZIP code"
                      data-field="location"
                      value={data.location}
                      onChange={(e) => update("location", e.target.value)}
                      placeholder="e.g. Winter Garden"
                      required
                      aria-invalid={!!errors.location}
                      aria-describedby={errors.location ? "location-error" : "location-help"}
                    />
                    <small id="location-help">A city or ZIP code is enough for this demo.</small>
                    {errors.location && (
                      <p id="location-error" className="field-error">
                        {errors.location}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="area-size">
                      Approximate area <span>*</span>
                    </label>
                    <select
                      id="area-size"
                      data-field="area"
                      value={data.area}
                      onChange={(e) => update("area", e.target.value)}
                      required
                      aria-invalid={!!errors.area}
                      aria-describedby={errors.area ? "area-error" : undefined}
                    >
                      <option value="">Select an area</option>
                      {areas.map((area) => (
                        <option key={area}>{area}</option>
                      ))}
                    </select>
                    {errors.area && (
                      <p id="area-error" className="field-error">
                        {errors.area}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="full-name">
                      Full name <span>*</span>
                    </label>
                    <input
                      id="full-name"
                      aria-label="Full name"
                      data-field="name"
                      value={data.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your fictional name"
                      required
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="field-error">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="email">
                      Email <span>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      aria-label="Email"
                      data-field="email"
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="demo@example.com"
                      required
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="field-error">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="field full-field">
                    <label htmlFor="project-details">
                      Project details <span className="optional">Optional</span>
                    </label>
                    <textarea
                      id="project-details"
                      aria-label="Project details"
                      value={data.details}
                      onChange={(e) => update("details", e.target.value)}
                      rows={3}
                      placeholder="What would you like to open up, keep or make easier to reach?"
                    />
                    <small>Include vegetation, access conditions or trees you want to keep.</small>
                  </div>
                </div>
              )}
              <div className="planner-actions">
                {step === 1 ? (
                  <button type="button" className="text-button" onClick={() => move(0)}>
                    <ArrowLeft size={17} /> Back
                  </button>
                ) : (
                  <span className="small-copy">No commitment. Just a starting point.</span>
                )}
                <button type="submit" className="button button-forest">
                  {step === 0 ? "Continue" : "Preview Estimate Request"} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="preview-result" data-private="true">
              <div className="result-icon">
                <Check size={25} />
              </div>
              <span className="eyebrow">YOUR DEMO REQUEST</span>
              <h3 ref={stepHeading} tabIndex={-1}>
                Demo preview complete.
              </h3>
              <p className="result-notice">
                <strong>No request was sent.</strong> This is a fictional portfolio demonstration.
              </p>
              <dl>
                {[
                  ["Service", selected !== null ? services[selected]!.title : ""],
                  ["Location", data.location],
                  ["Approximate area", data.area],
                  ["Full name", data.name],
                  ["Email", data.email],
                  ["Project details", data.details || "No details added."],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="planner-actions">
                <button className="text-button" type="button" onClick={() => move(1)}>
                  <ArrowLeft size={17} /> Edit details
                </button>
                <button className="button button-forest" type="button" onClick={reset}>
                  Start another preview <RotateCcw size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
function ArrowUp() {
  return <ArrowRight size={18} className="tilted-arrow" />;
}
