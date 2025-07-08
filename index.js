const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Intel parser is running.");
});

app.post("/parse", async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) return res.status(400).json({ error: "Brak URL" });

    const { data: html } = await axios.get(url);

    const title = (html.match(/<h1[^>]*class="entry-title"[^>]*>(.*?)<\/h1>/is) || [])[1]?.replace(/<[^>]*>/g, "").trim() || "";
    const date = (html.match(/<span[^>]*class="item-post-date"[^>]*>(.*?)<\/span>/is) || [])[1]?.replace(/<[^>]*>/g, "").trim() || "";
    const category = (html.match(/<span[^>]*class="tile-flag"[^>]*>\s*(?:<span[^>]*>)?(.*?)(?:<\/span>)?\s*<\/span>/is) || [])[1]?.replace(/<[^>]*>/g, "").trim() || "";

    const contentMatch = html.match(/<div[^>]*class="entry-content"[^>]*>([\s\S]*?)<\/div>/i);
    let content = contentMatch ? contentMatch[1] : "";

    content = content
      .replace(/<figure[\s\S]*?<\/figure>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<\/p>|<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\n{2,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    const fullArticle = [title, date, category, content].filter(Boolean).join("\n\n");
    const wordCount = fullArticle.split(/\s+/).length;

    return res.json({
      success: true,
      title,
      date,
      category,
      wordCount,
      fullArticle
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Intel parser działa na porcie 3000");
});
