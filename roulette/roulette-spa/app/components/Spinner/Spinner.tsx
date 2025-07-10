import { JSX } from "react";

export function Spinner(): JSX.Element {
  return (
    <span>
      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
        <circle
          r="10"
          cx="12"
          cy="12"
          strokeWidth="4"
          stroke="currentColor"
          className="opacity-25"
        />
        <path
          fill="currentColor"
          className="opacity-75"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </span>
  )
}
