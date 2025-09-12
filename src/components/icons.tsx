import type { SVGProps } from "react";

export const Icons = {
  Gavel: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/>
      <path d="m16 16 6-6"/>
      <path d="m8 8 6-6"/>
      <path d="m9 7 4-4"/>
      <path d="m15 13 4-4"/>
    </svg>
  ),
  Logo: (props: SVGProps<SVGSVGElement>) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28ZM11.1053 8.16666V19.8333H13.2105L17.8421 12.05V19.8333H19.9474V8.16666H17.8421L13.2105 15.95V8.16666H11.1053Z" />
    </svg>
  ),
};
