import express from "express";
import cors from "cors";

const app = express();

// middlewares básicos
app.use(cors());
app.use(express.json());

// healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "node-ts", framework: "express" });
});

// exemplo de rota de API
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Node+TS (Express)!" });
});

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[node-ts] Express up on http://localhost:${PORT}`);
});
