"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CarouselProps } from "@/types/product";
import "./Carousel.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

const Carousel: React.FC<CarouselProps> = ({
  products,
  autoRotateSpeed = 3500,
  dragThreshold = 50,
  enableDrag = true,
  showDots = true,
  showProductInfo = true,
}) => {
  const [current, setCurrent] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const autoRotateRef = useRef<number | null>(null);

  const updateClasses = useCallback(
    (index: number): string => {
      const total = products.length;
      if (total === 0) return "card";

      const prev = (current - 1 + total) % total;
      const next = (current + 1) % total;
      const prev2 = (current - 2 + total) % total;
      const next2 = (current + 2) % total;

      if (index === current) return "card active";
      if (index === prev) return "card prev";
      if (index === next) return "card next";
      if (index === prev2) return "card offscreen-left";
      if (index === next2) return "card offscreen-right";

      return "card";
    },
    [current, products.length],
  );

  const rotateCarousel = useCallback(
    (direction: number = 1) => {
      setCurrent(
        (prev) => (prev + direction + products.length) % products.length,
      );
    },
    [products.length],
  );

  const startAuto = useCallback(() => {
    if (autoRotateRef.current) {
      window.clearInterval(autoRotateRef.current);
    }
    if (autoRotateSpeed > 0) {
      autoRotateRef.current = window.setInterval(
        () => rotateCarousel(1),
        autoRotateSpeed,
      );
    }
  }, [autoRotateSpeed, rotateCarousel]);

  const handleStart = useCallback(
    (x: number) => {
      if (!enableDrag) return;
      if (autoRotateRef.current) {
        window.clearInterval(autoRotateRef.current);
      }
      setStartX(x);
      setIsDragging(true);
    },
    [enableDrag],
  );

  const handleMove = useCallback(
    (_x: number) => {
      if (!isDragging) return;
    },
    [isDragging],
  );

  const handleEnd = useCallback(
    (x: number) => {
      if (!isDragging || !enableDrag) return;
      const delta = x - startX;
      setIsDragging(false);
      if (Math.abs(delta) > dragThreshold) {
        rotateCarousel(delta < 0 ? 1 : -1);
      }
      startAuto();
    },
    [isDragging, startX, dragThreshold, rotateCarousel, enableDrag, startAuto],
  );

  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleMouseUp = (e: React.MouseEvent) => handleEnd(e.clientX);

  const handleTouchStart = (e: React.TouchEvent) =>
    handleStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleMove(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) =>
    handleEnd(e.changedTouches[0].clientX);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrent(index);
      if (autoRotateRef.current) {
        window.clearInterval(autoRotateRef.current);
      }
      startAuto();
    },
    [startAuto],
  );

  useEffect(() => {
    startAuto();
    return () => {
      if (autoRotateRef.current) {
        window.clearInterval(autoRotateRef.current);
      }
    };
  }, [startAuto]);

  if (products.length === 0) {
    return (
      <section className="carousel-container">
        <div className="no-products">No products to display</div>
      </section>
    );
  }

  return (
    <section className="carousel-container">
      <div
        className="carousel"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className={updateClasses(index)}
            onClick={() => index !== current && goToSlide(index)}
          >
            <Image
              src={product.image}
              alt={product.name}
              width={260}
              height={300}
              quality={100}
              priority={true}
              className="w-full h-auto"
            />
            {showProductInfo && (
              <div className="product-info">
                <div>
                  <h3>{product.name}</h3>
                  <p className="price">{product.price}</p>
                </div>
                <div className="buttons-container">
                  <Button className="buy-btn">Buy On Cnfans</Button>
                  <Button className="buy-btn secondary">Quality Check</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDots && products.length > 1 && (
        <div className="dots">
          {products.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={`dot ${index === current ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {products.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="nav-arrow nav-arrow-left group"
            onClick={() => rotateCarousel(-1)}
            aria-label="Previous product"
          >
            <ChevronLeft className="text-gray-200 group-hover:text-black transition-all" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="nav-arrow nav-arrow-right group"
            onClick={() => rotateCarousel(1)}
            aria-label="Next product"
          >
            <ChevronRight className="text-gray-200 group-hover:text-black transition-all" />
          </Button>
        </>
      )}
    </section>
  );
};

export default Carousel;
