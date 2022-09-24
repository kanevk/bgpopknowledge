import Head from "next/head";
import { ReactNode } from "react";
import Script from "next/script";

type LayoutProps = {
  children: ReactNode;
  pageTitle?: string;
  description?: string;
  currentURL?: string;
  previewImageUrl?: string;
};

export default function Layout({
  children,
  pageTitle,
  description,
  currentURL,
  previewImageUrl,
}: LayoutProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        {pageTitle && <title>{pageTitle}</title>}
        <link rel="icon" href="/p-logo.png" />
        <meta property="og:site_name" content="Превод" key="ogsitename" />
        {pageTitle && (
          <meta property="og:title" content={pageTitle} key="ogtitle" />
        )}
        {description && (
          <meta property="og:description" content={description} key="ogdesc" />
        )}
        {currentURL && (
          <meta property="og:url" content={currentURL} key="ogurl" />
        )}
        {previewImageUrl && (
          <>
            <meta property="og:image" content={previewImageUrl} key="ogimage" />
            {/* <meta property="og:image:width" content="600" />
            <meta property="og:image:height" content="600" /> */}
          </>
        )}

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-YN38HXPXGN"
        ></script>
        <script>
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-YN38HXPXGN');`}
        </script>
      </Head>

      <Script id="hotjar">
        {`(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:2864129,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
      </Script>

      <section style={{ height: "100%" }}>{children}</section>
    </>
  );
}
