const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const files = Object.create(null);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = files[pathname];

    if (!asset) {
      const notFoundAsset = files["/404.html"];
      if (notFoundAsset && !pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|mp4|webm|woff2|woff|ttf|css|js)$/i)) {
        return new Response(Uint8Array.from(atob(notFoundAsset), (character) => character.charCodeAt(0)), {
          status: 404,
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      }
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
