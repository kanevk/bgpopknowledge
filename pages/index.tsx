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
                How the immune system actually works
              </Link>
            </li>
            <li>
              <Link href="/videos/X9GRsZvvvik">
                Ukraine War: Putin says Mariupol situation is ...
              </Link>
            </li>
          </ul>
        </main>

        <footer className={styles.footer}>
        </footer>
      </div>
    </Layout>
  );
};

export default Home;
