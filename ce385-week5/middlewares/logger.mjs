// middlewares/logger.mjs
export function logger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms.toFixed(0)}ms)`);
  });
  next();
}
