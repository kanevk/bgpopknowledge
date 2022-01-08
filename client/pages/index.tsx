import { Link } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>На Български</title>
        <link rel="icon" href="/favicon.jpeg" />
        <meta name="description" content="Общо описание" />
        <meta property="og:title" content="Test test" />
        <meta property="og:image" content="https://www.popsci.com/uploads/2019/03/18/5FNEGA7NKCLLWO3PUHR3KV663A.png" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="600" />
      </Head>

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
