import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: "$999",
    image: "/test-product-images/img1.avif",
    description:
      "Latest iPhone with titanium design and advanced camera system",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    price: "$849",
    image: "/test-product-images/img2.avif",
    description: "Powerful Android smartphone with AI features",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    price: "$399",
    image: "/test-product-images/img3.avif",
    description: "Industry-leading noise canceling wireless headphones",
  },
  {
    id: 4,
    name: "MacBook Air M3",
    price: "$1099",
    image: "/test-product-images/img4.avif",
    description: "Lightweight laptop with Apple M3 chip",
  },
  {
    id: 5,
    name: "Jaded London Voltage Cargos (2-Colors)",
    price: "$1099",
    image: "/test-product-images/img5.avif",
    description: "Professional tablet with Liquid Retina XDR display",
  },
];
