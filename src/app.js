const express = require("express");
const productsRoutes = require("./routes/products.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    
    origin: [process.env.CLIENT_URL || "https://codevector-frontend-zeta.vercel.app/"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use("/products", productsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
