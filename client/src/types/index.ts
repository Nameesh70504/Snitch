// ─── Product Types ───────────────────────────────────────────────────────────

export interface ProductImage {
  _id?: string
  imagekitId?: string
  url: string
  order?: string
}

export interface ProductSize {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  stock: number
  _id?: string
}

export interface ProductPrice {
  amount: number
  currency: 'INR' | 'USD' | 'EUR' | 'CAD'
}

export interface Product {
  _id: string
  id?: string
  title: string
  description: string
  price: ProductPrice
  categories: string[]
  images: ProductImage[]
  sizes: ProductSize[]
  seller: string
  isPublished: boolean
  createdAt?: string
  updatedAt?: string
}

// ─── User / Auth Types ──────────────────────────────────────────────────────

export interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: 'user' | 'seller'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: 'user' | 'seller'
}

export interface AuthResponse {
  token: string
  user: User
  message?: string
}

export interface MeResponse {
  user: User
}

// ─── Cart Types ─────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product | string
  quantity: number
  size: string
  _id?: string
}

export interface Cart {
  _id: string
  user: string
  products: CartItem[]
}

export interface CartApiResponse {
  cart: Cart
  totalPrice: number
}

// ─── Order Types ────────────────────────────────────────────────────────────

export interface OrderAddress {
  state: string
  city: string
  street: string
  house: string
  zip: string
}

export interface OrderProductSnapshot {
  title: string
  description: string
  price: { amount: number; currency: string }
  image: string
  productId: string
}

export interface OrderItem {
  product: OrderProductSnapshot
  quantity: number
  size: string
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  _id: string
  id?: string
  user: string
  address: OrderAddress
  products: OrderItem[]
  totalPrice: { amount: number; currency: string }
  status: OrderStatus
  createdAt?: string
  updatedAt?: string
}

// ─── API Error Type ─────────────────────────────────────────────────────────

export interface ApiError {
  status?: number
  message: string
  errors?: Array<{ message: string }>
  originalError?: unknown
}

// ─── Redux Store Types ──────────────────────────────────────────────────────

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface ProductState {
  items: Product[]
  totalPages: number
  currentPage: number
  isLoading: boolean
  error: string | null
  selectedProduct: Product | null
  sellerItems: Product[]
  sellerTotalPages: number
  sellerCurrentPage: number
  isSellerLoading: boolean
  sellerError: string | null
  selectedCategory: string
  searchQuery: string
  sortBy: 'featured' | 'price-asc' | 'price-desc'
}

export interface CartState {
  cart: Cart | null
  items: CartItem[]
  totalPrice: number
  itemCount: number
  isLoading: boolean
  error: string | null
}

export interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
}

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  type: ToastType
  message: string
}

export type AuthModalView = 'login' | 'register'

export interface UiState {
  isCartDrawerOpen: boolean
  isAuthModalOpen: boolean
  authModalView: AuthModalView
  mobileMenuOpen: boolean
  toast: Toast | null
}

export interface RootState {
  auth: AuthState
  products: ProductState
  cart: CartState
  orders: OrderState
  ui: UiState
}
