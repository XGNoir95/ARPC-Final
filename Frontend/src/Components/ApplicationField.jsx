const inputStyle = "block min-h-12 w-full rounded-lg border border-[#173d2e]/25 bg-white px-4 py-3 text-base text-[#173d2e] placeholder:text-[#547366] transition-colors focus:border-[#173d2e] focus:outline-2 focus:outline-offset-2 focus:outline-[#173d2e] aria-invalid:border-[#a33a32] aria-invalid:focus:outline-[#a33a32] motion-reduce:transition-none";
const enrollmentInputStyle = "block min-h-13 w-full rounded-lg border border-[#173d2e]/20 bg-[#f6f8f5] px-4 py-3.5 text-base text-[#173d2e] placeholder:text-[#547366] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#173d2e]/40 focus:border-[#173d2e] focus:bg-white focus:outline-2 focus:outline-offset-2 focus:outline-[#173d2e] focus:shadow-[0_0_0_4px_rgba(23,61,46,0.08)] aria-invalid:border-[#a33a32] aria-invalid:focus:outline-[#a33a32] motion-reduce:transition-none";

export default function ApplicationField({ field, value, error, onChange, compactError = false, prefix = "join", variant = "default", className = "" }) {
  const { name, label, type = "text", options, required = true, ...attributes } = field;
  const props = { id: `${prefix}-${name}`, name, required, value, onChange, "aria-invalid": Boolean(error), "aria-describedby": error ? `${prefix}-${name}-error` : undefined, className: variant === "enrollment" ? enrollmentInputStyle : inputStyle, ...attributes };
  return <div className={`min-w-0 [&_input]:min-w-0 [&_select]:min-w-0 ${name === "fullName" ? "sm:col-span-2" : ""} ${className}`}>
    <label htmlFor={props.id} className="mb-2 block text-sm font-semibold sm:text-base">{label} {required ? <span aria-hidden="true" className="text-[#b42318]">*</span> : <span className="font-normal text-[#547366]">(optional)</span>}</label>
    {options ? <select {...props}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...props} type={type} />}
    {error && <p id={`${prefix}-${name}-error`} className={compactError ? "sr-only" : "mt-2 text-sm text-[#862f29]"}>{error}</p>}
  </div>;
}
