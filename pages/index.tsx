import { Link } from "@mui/material";
import type { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Layout from "../components/layout";

const Home: NextPage = () => {
  return (
    <Layout
      pageTitle="На Зелено"
      description="Зеления Vbox"
      previewImageUrl="/xp-original.jpeg"
    >
      <div className={styles.container}>
        <main className={styles.main}>
          <ul>
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
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                width={72}
                height={16}
              />
            </span>
          </a>
        </footer>
      </div>
    </Layout>
  );
};

export default Home;
