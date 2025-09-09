import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, url }) => {
  const requestUrl = new URL(request.url);
  const q1 = url.searchParams.get("q");
  const q2 = requestUrl.searchParams.get("q");

  return new Response(
    JSON.stringify({
      message: "Test endpoint",
      astroUrl: url.toString(),
      requestUrl: requestUrl.toString(),
      queryFromAstro: q1,
      queryFromRequest: q2,
      astroParams: Array.from(url.searchParams.entries()),
      requestParams: Array.from(requestUrl.searchParams.entries()),
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
