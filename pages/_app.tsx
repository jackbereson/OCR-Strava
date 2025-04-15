import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
