import {
  Button,
  Link,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Layout from "../components/layout";
import { useState } from "react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [youtubeLink, setYoutubeLink] = useState<string>();
  const hasYoutubeLinkError =
    !youtubeLink ||
    !(youtubeLink.includes("youtube.com") || youtubeLink.includes("youtu.be"));

  const openYoutubeLink = () => {
    if (!youtubeLink) throw Error("Missing youtube link");

    const youtubeIdWeb = youtubeLink.split("v=")[1]?.split("&")[0];
    const youtubeLinkMobile = youtubeLink.split("youtu.be/")[1]?.split("?")[0];

    router.push(`/videos/${youtubeIdWeb || youtubeLinkMobile}`);
  };

  return (
    <Layout
      pageTitle="На Зелено"
      description="Зеления Vbox"
      previewImageUrl="/xp-original.jpeg"
    >
      <div className={styles.container}>
        <main className={styles.main}>
          <Stack sx={{ marginTop: 5 }} alignItems="center" spacing={2}>
            <TextField
              label="Въведете YouTube видео линк"
              sx={{ width: isMobile ? 300 : 600 }}
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.currentTarget.value)}
            />
            <Tooltip
              title={
                hasYoutubeLinkError ? "Моля поставете валиден YouTube линк" : ""
              }
            >
              <span>
                <Button
                  disabled={hasYoutubeLinkError}
                  variant="contained"
                  sx={{ width: 200 }}
                  onClick={openYoutubeLink}
                >
                  Гледай с превод
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </main>

        <footer className={styles.footer}></footer>
      </div>
    </Layout>
  );
};

export default Home;
