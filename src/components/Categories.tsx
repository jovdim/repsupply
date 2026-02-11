"use client";

import Image from "next/image";

const categories = [
  { name: "Shoes", image: "/test-product-images/img1.avif" },
  { name: "T-Shirts", image: "/test-product-images/img2.avif" },
  { name: "Hoodies", image: "/test-product-images/img3.avif" },
  { name: "Jackets", image: "/test-product-images/img4.avif" },
  { name: "Pants", image: "/test-product-images/img5.avif" },
  { name: "Jewelry", image: "/test-product-images/img1.avif" },
];

export function Categories() {
  return (
    <div className="min-h-screen text-neutral-100 flex flex-col items-center py-8 px-4 mt-8 sm:py-12 sm:px-6 sm:mt-12">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-10 tracking-wide font-[var(--font-poetsen-one)] text-center">
        FEATURED CATEGORIES
      </h2>

      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full max-w-6xl">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transform transition duration-300 cursor-pointer flex flex-col h-full"
          >
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-neutral-700">
              <Image
                src={cat.image}
                alt={cat.name}
                width={300}
                height={224}
                className="w-full h-auto max-h-48 sm:max-h-56 object-contain"
              />
            </div>
            <div className="p-3 sm:p-4 text-center font-semibold uppercase tracking-wider bg-neutral-800 border-t border-neutral-700">
              {cat.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
