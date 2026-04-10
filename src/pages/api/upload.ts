// src/pages/api/upload.ts
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parse the incoming multipart form data
    const formData = await request.formData();
    const file = formData.get("photo") as File;
    const albumId = formData.get("albumId") as string;

    if (!file || !albumId) {
      return new Response(
        JSON.stringify({ error: "Missing file or albumId" }),
        { status: 400 },
      );
    }

    // 2. Prepare the file for R2
    // Create a unique filename so uploads don't overwrite each other
    const fileExtension = file.name.split(".").pop();
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

    // Convert the file into an ArrayBuffer (which R2 requires)
    const arrayBuffer = await file.arrayBuffer();

    // 3. Upload to Cloudflare R2 Bucket
    await env.BUCKET.put(uniqueFilename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type, // e.g., 'image/jpeg' or 'image/png'
      },
    });

    const isDev = import.meta.env.DEV;

    // 4. Construct the Public URL
    // You will configure a public domain for your bucket in the Cloudflare Dashboard later
    const baseUrl = isDev ? "/api/images" : "https://images.yourdomain.com";
    const photoUrl = `${baseUrl}/${uniqueFilename}`;

    // 5. Save the record to the D1 Database
    const photoId = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO Photos (id, albumId, url) VALUES (?, ?, ?)",
    )
      .bind(photoId, albumId, photoUrl)
      .run();

    // Optionally: Update the album's photo count and set this as the cover image if it's the first photo
    await env.DB.prepare(
      `
      UPDATE Albums 
      SET photoCount = photoCount + 1,
          coverImage = CASE WHEN photoCount = 0 THEN ? ELSE coverImage END
      WHERE id = ?
    `,
    )
      .bind(photoUrl, albumId)
      .run();

    // 6. Return success to the frontend
    return new Response(
      JSON.stringify({
        id: photoId,
        url: photoUrl,
        message: "Upload successful!",
      }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process upload" }), {
      status: 500,
    });
  }
};
