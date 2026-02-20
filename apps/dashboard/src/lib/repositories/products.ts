export type { Product, CreateProductInput, UpdateProductInput, BookingProduct } from "./products/index";
export {
  getProductsForCurrentSalon, getProductById, createProduct, updateProduct, deleteProduct,
  getProductsForBooking, addProductToBooking, updateBookingProduct, removeProductFromBooking,
} from "./products/index";
