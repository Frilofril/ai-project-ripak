// Файли ілюстрацій та мап статті у приватному сховищі Supabase Storage (складна складова ПР 5).
import { db } from "./client";

const BUCKET = "wiki-media";

export type ArticleFile = { name: string; url: string };

// Отримати перелік файлів статті з підписаними посиланнями на 10 хвилин.
export async function listArticleFiles(articleId: string): Promise<ArticleFile[]> {
  if (!/^[0-9a-f-]{36}$/i.test(articleId)) return [];
  const storage = db().storage.from(BUCKET);
  const { data, error } = await storage.list(articleId);
  if (error || !data) return [];

  const files: ArticleFile[] = [];
  for (const item of data) {
    if (!item.name || item.name === ".emptyFolderPlaceholder") continue;
    const { data: signed, error: signError } = await storage.createSignedUrl(
      `${articleId}/${item.name}`,
      600,
    );
    if (!signError && signed?.signedUrl) {
      files.push({ name: item.name, url: signed.signedUrl });
    }
  }
  return files;
}

export async function uploadArticleFile(articleId: string, file: File): Promise<void> {
  const path = `${articleId}/${file.name}`;
  const { error } = await db()
    .storage.from(BUCKET)
    .upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);

  const { error: updateErr } = await db()
    .from("articles")
    .update({ image_url: `storage://${BUCKET}/${path}` })
    .eq("id", articleId);
  if (updateErr) throw new Error(updateErr.message);
}
