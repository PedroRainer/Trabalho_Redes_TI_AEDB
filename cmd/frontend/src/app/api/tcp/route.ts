import { NextRequest, NextResponse } from "next/server";
import net from "net";

// POST /api/tcp { message: "..." }
export async function POST(req: NextRequest) {
  const { message } = await req.json().catch(() => ({ message: "" }));

  return new Promise<Response>((resolve) => {
    const sock = net.createConnection({ host: "views", port: 8080 }, () => {
      // Envia com quebra de linha para o Scanner no Go
      sock.write(String(message || "Hello from client") + "\n");
    });

    let data = Buffer.alloc(0);
    sock.on("data", (chunk) => { data = Buffer.concat([data, chunk]); });
    sock.on("end", () => {
      resolve(NextResponse.json({ reply: data.toString("utf8") }));
    });
    sock.on("error", (err) => {
      resolve(new NextResponse(`TCP error: ${err.message}`, { status: 500 }));
    });
  });
}
