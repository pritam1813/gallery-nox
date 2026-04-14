// src/pages/api/photos/[id].ts
export const prerender = false; // <-- ADD THIS MAGIC LINE

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { DEFAULT_ALBUM_COVER } from "../../../data/constants";

export const DELETE: APIRoute = async ({ params }) => {
  const photoId = params.id;

  if (!photoId) {
    return new Response(JSON.stringify({ error: "Photo ID required" }), {
      status: 400,
    });
  }

  try {
    // 1. Fetch the photo details from D1
    const photo = (await env.DB.prepare("SELECT * FROM Photos WHERE id = ?")
      .bind(photoId)
      .first()) as any;

    if (!photo) {
      return new Response(JSON.stringify({ error: "Photo not found" }), {
        status: 404,
      });
    }

    // 2. Extract the filename to delete from R2
    const urlParts = (photo.url as string).split("/");
    const filename = urlParts[urlParts.length - 1];

    await env.BUCKET.delete(filename);

    // 3. Delete from D1 Database
    await env.DB.prepare("DELETE FROM Photos WHERE id = ?").bind(photoId).run();

    // 4. Update the Album's photo count and revert cover if necessary
    await env.DB.prepare(
      `
      UPDATE Albums 
      SET photoCount = MAX(0, photoCount - 1),
          coverImage = CASE WHEN coverImage = ? THEN ? ELSE coverImage END
      WHERE id = ?
    `,
    )
      .bind(photo.url, DEFAULT_ALBUM_COVER, photo.albumId)
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
