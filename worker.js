const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

const files = Object.create(null);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = files[pathname];

    if (!asset) {
      return new Response("Not found", { status: 404 });
    }

    const extension = pathname.slice(pathname.lastIndexOf("."));
    return new Response(Uint8Array.from(atob(asset), (character) => character.charCodeAt(0)), {
      headers: {
        "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
        "Content-Type": contentTypes[extension] || "application/octet-stream",
      },
    });
  },
};
