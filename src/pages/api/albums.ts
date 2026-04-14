import type { APIRoute } from "astro";

// NEW ASTRO 6 SYNTAX: Import environment directly
import { env } from "cloudflare:workers";
import { DEFAULT_ALBUM_COVER } from "../../data/constants";

// GET /api/albums - Fetch all albums
export const GET: APIRoute = async () => {
  try {
    // env.DB is fully typed thanks to `wrangler types`
    const { results } = await env.DB.prepare(
      "SELECT * FROM Albums ORDER BY createdAt DESC",
    ).all();

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch albums" }), {
      status: 500,
    });
  }
};

// POST /api/albums - Create a new album
export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const title = data.title;

    // Generate a quick random ID (e.g., using standard web crypto)
    const id = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO Albums (id, title, coverImage) VALUES (?, ?, ?)",
    )
      .bind(id, title, DEFAULT_ALBUM_COVER)
      .run();

    return new Response(
      JSON.stringify({ id, title, message: "Album created!" }),
      {
        status: 201,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create album" }), {
      status: 500,
    });
  }
};
