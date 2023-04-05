import { NextPage } from "next";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";
import Layout from "../components/layout";
import TurndownService from "turndown";

import styles from "../styles/Video.module.css";
import ReactMarkdown from "react-markdown";
import { load as cheerioLoad } from "cheerio";
import { Box, Link, Typography } from "@mui/material";

const ArticleDetails: NextPage = () => {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState<string>();
  const $ = useMemo(
    () => (htmlContent ? cheerioLoad(htmlContent) : undefined),
    [htmlContent],
  );
  const title = $?.("h1").text() || $?.("h2").text();
  console.log("title", title);
  const [markdownContent, setMarkdownContent] = useState<string>();
  const [translatedMarkdownContent, setTranslatedMarkdownContent] =
    useState<string>();
  console.log(markdownContent);

  const url = router.query.url as string | undefined;
  const mainSectionTag = (router.query.mainSection as string) || "main";
  console.table(url);

  useEffect(() => {
    if (!htmlContent) return;

    const mainContent =
      $?.(mainSectionTag).html() ||
      $?.("article").html() ||
      $?.("section").html() ||
      $?.("div[id='main-content']").html();

    console.log("mainContent", mainContent);
    const turndownService = new TurndownService();
    setMarkdownContent(turndownService.turndown(mainContent!));
  }, [htmlContent, $, mainSectionTag]);

  useEffect(() => {
    if (!markdownContent) return;
    if (!url) return;
    if (!title) {
      console.error("No title");
      return;
    }

    const hostname = new URL(url).hostname;
    const cacheKey = `${hostname
      .replace("www.", "")
      .replace(".", ":")}:${title}`;

    fetch(`/api/translation/${cacheKey}`, {
      method: "POST",
      body: JSON.stringify({
        content: markdownContent,
      }),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((body) => setTranslatedMarkdownContent(body.translatedContent));
  }, [url, markdownContent, title]);

  useEffect(() => {
    if (!url) {
      console.error("Missing url query param");
      return;
    }

    if (markdownContent) {
      return;
    }

    fetch(`/api/scrape?url=${url}`)
      .then((res) => res.json())
      .then(({ html }) => {
        if (!html) {
          console.error("Empty content at", url);
          return;
        }
        console.log("html", html);
        setHtmlContent(html);
      });
  }, [url, markdownContent]);

  console.log("url", router.query);
  if (!translatedMarkdownContent) {
    return (
      <VideoDetailsLayout pageTitle={title}>Loading...</VideoDetailsLayout>
    );
  }

  return (
    <VideoDetailsLayout pageTitle={title}>
      <Box sx={{ marginX: 5 }}>
        <Box sx={{ marginTop: 1, marginBottom: 5 }}>
          <Typography sx={{ marginTop: 5 }} variant="caption">
            Преведено от:
          </Typography>{" "}
          <Link href={url} target="_none">
            {" "}
            {url}
          </Link>
        </Box>
        {/* eslint-disable-next-line */}
        <ReactMarkdown children={translatedMarkdownContent}></ReactMarkdown>
      </Box>
    </VideoDetailsLayout>
  );
};

const VideoDetailsLayout = ({
  previewImageUrl,
  pageTitle,
  children,
}: {
  previewImageUrl?: string;
  pageTitle: string | undefined;
  children: ReactNode;
}) => {
  return (
    <Layout
      pageTitle={pageTitle}
      description="Зеления Vbox"
      previewImageUrl={previewImageUrl}
    >
      <div className={styles.container}>
        <main>{children}</main>
      </div>
    </Layout>
  );
};

export default ArticleDetails;
