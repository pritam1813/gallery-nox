// src/pages/api/albums/[id].ts
export const prerender = false;

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const PATCH: APIRoute = async ({ params, request }) => {
  const albumId = params.id;
  if (!albumId) {
    return new Response(JSON.stringify({ error: "Album ID required" }), {
      status: 400,
    });
  }

  try {
    const data = await request.json();
    const { coverImage, title } = data;

    if (coverImage) {
      await env.DB.prepare("UPDATE Albums SET coverImage = ? WHERE id = ?")
        .bind(coverImage, albumId)
        .run();
    }

    if (title) {
      await env.DB.prepare("UPDATE Albums SET title = ? WHERE id = ?")
        .bind(title, albumId)
        .run();
    }

    return new Response(JSON.stringify({ message: "Album updated!" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update album" }), {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const albumId = params.id;

  if (!albumId) {
    return new Response(JSON.stringify({ error: "Album ID required" }), {
      status: 400,
    });
  }

  try {
    // 1. Fetch all photos in this album to delete them from R2
    const { results: photos } = await env.DB.prepare(
      "SELECT url FROM Photos WHERE albumId = ?"
    )
      .bind(albumId)
      .all();

    // 2. Delete each photo from R2
    for (const photo of photos) {
      const urlParts = (photo.url as string).split("/");
      const filename = urlParts[urlParts.length - 1];
      try {
        await env.BUCKET.delete(filename);
      } catch (e) {
        console.error(`Failed to delete ${filename} from R2:`, e);
        // We continue even if one fails, to try to clean up as much as possible
      }
    }

    // 3. Delete the album from D1 (Photos will be deleted via CASCADE)
    const result = await env.DB.prepare("DELETE FROM Albums WHERE id = ?")
      .bind(albumId)
      .run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Album not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Album deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Album Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete album" }), {
      status: 500,
    });
  }
};
