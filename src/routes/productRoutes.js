import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE PRODUCT (Creator adds product to video)
router.post("/", protect, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      creatorId: req.user.id
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// GET products for a specific video
router.get("/video/:id", async (req, res) => {
  const products = await Product.find({ videoId: req.params.id });
  res.json(products);
});

export default router;
