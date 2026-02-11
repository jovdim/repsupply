export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description?: string;
}

export interface CarouselProps {
  products: Product[];
  autoRotateSpeed?: number;
  dragThreshold?: number;
  enableDrag?: boolean;
  showDots?: boolean;
  showProductInfo?: boolean;
}
