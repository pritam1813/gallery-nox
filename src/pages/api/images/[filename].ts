// src/pages/api/images/[filename].ts
export const prerender = false; // <-- ADD THIS LINE

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const GET: APIRoute = async ({ params }) => {
  const filename = params.filename;

  if (!filename) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const object = await env.BUCKET.get(filename);

    if (!object) {
      return new Response("Image not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new Response(object.body, { headers });
  } catch (error) {
    return new Response("Error loading image", { status: 500 });
  }
};
