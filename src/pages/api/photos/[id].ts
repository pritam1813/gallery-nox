// src/pages/api/photos/[id].ts
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const DELETE: APIRoute = async ({ params }) => {
  const photoId = params.id;

  if (!photoId) {
    return new Response(JSON.stringify({ error: "Photo ID required" }), {
      status: 400,
    });
  }

  try {
    // 1. Fetch the photo details from D1 first
    const photo = await env.DB.prepare("SELECT * FROM Photos WHERE id = ?")
      .bind(photoId)
      .first();

    if (!photo) {
      return new Response(JSON.stringify({ error: "Photo not found" }), {
        status: 404,
      });
    }

    // 2. Extract the filename from the URL to delete it from R2
    // If URL is "https://images.domain.com/uuid.jpg", this grabs "uuid.jpg"
    const urlParts = (photo.url as string).split("/");
    const filename = urlParts[urlParts.length - 1];

    // Delete from Cloudflare R2
    await env.BUCKET.delete(filename);

    // 3. Delete from D1 Database
    await env.DB.prepare("DELETE FROM Photos WHERE id = ?").bind(photoId).run();

    // 4. Update the Album's photo count
    // We also check if the album is now empty, and if so, reset the cover image
    const defaultCover =
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

    await env.DB.prepare(
      `
      UPDATE Albums 
      SET photoCount = MAX(0, photoCount - 1),
          coverImage = CASE WHEN photoCount <= 1 THEN ? ELSE coverImage END
      WHERE id = ?
    `,
    )
      .bind(defaultCover, photo.albumId)
      .run();

    return new Response(
      JSON.stringify({ message: "Photo deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete photo" }), {
      status: 500,
    });
  }
};
