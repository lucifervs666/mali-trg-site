const PATHS = {
  cup: (
    <>
      <path d="M4 8h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8Z" />
      <path d="M17 10h2a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M7 3.5c0 1-1 1-1 2s1 1 1 2" />
      <path d="M11 3.5c0 1-1 1-1 2s1 1 1 2" />
    </>
  ),
  glass: (
    <>
      <path d="M6 3h12l-1.6 15a2 2 0 0 1-2 1.8h-4.8a2 2 0 0 1-2-1.8L6 3Z" />
      <path d="M7 8h10" />
    </>
  ),
  scoop: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13l2.2 7.2a1 1 0 0 0 1.9 0L15 13" />
    </>
  ),
};

export default function Icon({ name, size = 26 }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
