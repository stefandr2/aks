const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3000);
const readyDelayMs = Number(process.env.READY_DELAY_MS || 0);
const startedAt = Date.now();
const readyAt = startedAt + Math.max(0, readyDelayMs);

function clampMs(value, fallback) {
  const ms = Number(value);
  if (!Number.isFinite(ms)) return fallback;
  return Math.min(Math.max(ms, 0), 10000);
}

function burnCpu(ms) {
  const end = Date.now() + ms;
  let acc = 0;
  while (Date.now() < end) {
    acc += Math.sqrt(Math.random());
  }
  return acc;
}

app.get("/", (req, res) => {
  res.json({
    name: "k8s-scale-test",
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    now: new Date().toISOString()
  });
});

app.get("/healthz", (req, res) => {
  res.status(200).send("ok");
});

app.get("/readyz", (req, res) => {
  if (Date.now() >= readyAt) {
    res.status(200).send("ready");
    return;
  }
  res.status(503).send("not ready");
});

app.get("/cpu", (req, res) => {
  const ms = clampMs(req.query.ms, 200);
  const work = burnCpu(ms);
  res.json({
    type: "cpu",
    ms,
    work
  });
});

app.get("/latency", (req, res) => {
  const ms = clampMs(req.query.ms, 200);
  setTimeout(() => {
    res.json({
      type: "latency",
      ms
    });
  }, ms);
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
