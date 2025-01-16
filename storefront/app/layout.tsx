import {cx} from "cva";
import {
  Lexend,
  // Climate_Crisis,
  // Instrument_Sans,
  // Instrument_Serif
} from "next/font/google";

import dynamicFavicon from "./dynamic-favicon";
import "./globals.css";

const instrumentSans = Lexend({
  subsets: ["vietnamese"],
  variable: "--font-instrumentSans",
  weight: ["400"],
});
const instrumentSerif = Lexend({
  subsets: ["vietnamese"],
  variable: "--font-instrumentSerif",
  weight: ["400"],
});
const climateCrisis = Lexend({
  subsets: ["vietnamese"],
  variable: "--font-climateCrisis",
  weight: ["400"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cx(
        instrumentSans.variable,
        instrumentSerif.variable,
        climateCrisis.variable,
        "overflow-x-clip overscroll-none scroll-smooth",
      )}
      lang="vi"
    >
      <head>
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
        <script dangerouslySetInnerHTML={{__html: dynamicFavicon}} />
      </head>
      {children}
    </html>
  );
}
