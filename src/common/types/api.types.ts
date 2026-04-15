export interface ILoginRequest {
  phone: string;
  password: string;
}

export interface ISignupRequest {
  password: string;
  full_name: string;
  phone: string;
}

export interface IRefreshTokenRequest {
  refresh_token: string;
}

export interface IUser {
  id: number;
  full_name: string;
  phone: string;
  address?: string | null;
  email?: string | null;
  img_url?: string | null;
  role?: string;
  created_at?: string;
}

export interface IProfileUpdateRequest {
  full_name?: string;
  phone?: string;
  address?: string;
  email?: string;
  password?: string;
  password_repeat?: string;
}

export interface IAuthResponse {
  access_token?: string;
  refresh_token?: string;
  user?: IUser;
  profile?: IUser;
  tokens?: {
    access_token: string;
    refresh_token: string;
  };
  data?: {
    access_token?: string;
    refresh_token?: string;
    user?: IUser;
    profile?: IUser;
    tokens?: {
      access_token: string;
      refresh_token: string;
    };
  };
  message?: string;
}

export interface ICategory {
  id: number;
  name: string;
  img_url: string | null;
}

export interface IBaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICampaign extends IBaseEntity {
  title: string;
  description: string;
  img_url: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface IProductCategoryRef {
  id: number;
  name: string;
}

export interface IProduct {
  id: number;
  title: string;
  description?: string;
  price: string | number;
  img_url: string | null;
  category: IProductCategoryRef;
}

export interface IBasketProduct {
  id: number;
  title: string;
  description?: string;
  price: string | number;
  img_url: string | null;
}

export interface IBasketItem {
  id: number;
  quantity: number;
  total_price: string | number;
  product: IBasketProduct;
}

export interface IBasket {
  items: IBasketItem[];
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
}

export interface ICheckoutRequest {
  paymentMethod: PaymentMethod;
  address: string;
  phone: string;
  note?: string;
}
