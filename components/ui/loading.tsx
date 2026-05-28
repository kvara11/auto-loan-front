import React from "react"

type LoadingProps = {
  size?: "sm" | "md" | "lg" | number
  label?: string
  className?: string
}

function sizeClass(size?: LoadingProps["size"]) {
  if (typeof size === "number") return ""
  switch (size) {
    case "sm":
      return "h-4 w-4"
    case "lg":
      return "h-6 w-6"
    default:
      return "h-5 w-5"
  }
}

export function Loading({ size = "md", label = undefined, className = "" }: LoadingProps) {
  const sClass = sizeClass(size);
  
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-live="polite">
      <svg
        className={`animate-spin text-muted-foreground ${sClass}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label ? <span className="ml-3 text-sm text-muted-foreground">{label}</span> : null}
    </div>
  )
}
