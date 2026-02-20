export type { Product, CreateProductInput, UpdateProductInput, BookingProduct } from "./types";
export { getProductsForCurrentSalon, getProductById, createProduct, updateProduct, deleteProduct } from "./product-crud";
export { getProductsForBooking, addProductToBooking, updateBookingProduct, removeProductFromBooking } from "./booking-products";
