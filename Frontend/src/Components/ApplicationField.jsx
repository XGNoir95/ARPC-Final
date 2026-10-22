const inputStyle = "block min-h-12 w-full rounded-lg border border-ink/25 bg-surface px-4 py-3 text-base text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink aria-invalid:border-danger aria-invalid:focus:outline-danger motion-reduce:transition-none";
const enrollmentInputStyle = "block min-h-13 w-full rounded-lg border border-ink/20 bg-field px-4 py-3.5 text-base text-ink placeholder:text-muted transition-[background-color,border-color,box-shadow] duration-200 hover:border-ink/40 focus:border-ink focus:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-ink focus:shadow-[0_0_0_4px_rgba(23,61,46,0.08)] aria-invalid:border-danger aria-invalid:focus:outline-danger motion-reduce:transition-none";

export default function ApplicationField({ field, value, error, onChange, compactError = false, prefix = "join", variant = "default", className = "" }) {
  const { name, label, type = "text", options, required = true, ...attributes } = field;
  const props = { id: `${prefix}-${name}`, name, required, value, onChange, "aria-invalid": Boolean(error), "aria-describedby": error ? `${prefix}-${name}-error` : undefined, className: variant === "enrollment" ? enrollmentInputStyle : inputStyle, ...attributes };
  return <div className={`min-w-0 [&_input]:min-w-0 [&_select]:min-w-0 ${name === "fullName" ? "sm:col-span-2" : ""} ${className}`}>
    <label htmlFor={props.id} className="mb-2 block text-sm font-semibold sm:text-base">{label} {required ? <span aria-hidden="true" className="text-danger">*</span> : <span className="font-normal text-muted">(optional)</span>}</label>
    {options ? <select {...props}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...props} type={type} />}
    {error && <p id={`${prefix}-${name}-error`} className={compactError ? "sr-only" : "mt-2 text-sm text-danger"}>{error}</p>}
  </div>;
}
