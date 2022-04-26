import { Link } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Script from "next/script";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>На Български</title>
        <link rel="icon" href="/favicon.jpeg" />
        <meta name="description" content="Общо описание" />
        <meta property="og:title" content="Test test" />
        <meta
          property="og:image"
          content="https://www.popsci.com/uploads/2019/03/18/5FNEGA7NKCLLWO3PUHR3KV663A.png"
        />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="600" />
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

      <main className={styles.main}>
        <ul>
          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          <li>
            <Link href="/videos/lXfEK8G8CUI">
              <a>How the immune system actually works</a>
            </Link>
          </li>
          <li>
            <Link href="/videos/X9GRsZvvvik">
              <a>Ukraine War: Putin says Mariupol situation is ...</a>
            </Link>
          </li>
        </ul>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
