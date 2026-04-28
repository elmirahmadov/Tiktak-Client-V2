import type { ICheckoutRequest } from "@/common/types/api.types";
import Fetcher from "@/common/helpers/instance";
import { REQUEST_METHODS } from "@/common/utils/networking";
import { API } from "../EndpointResources.g";

const ORDER_ROUTE_FALLBACKS = {
  list: "/api/tiktak/orders/user",
  listLegacy: "/api/tiktak/order/user",
  detail: (id: string | number) => `/api/tiktak/orders/user/${id}`,
  detailLegacy: (id: string | number) => `/api/tiktak/order/user/${id}`,
  detailById: (id: string | number) => `/api/tiktak/orders/${id}`,
} as const;

export interface IOrderListItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  address: string;
  status: string;
  itemCount: number;
  totalPrice: number;
  phone: string;
}

export interface IOrderProductItem {
  id: string;
  title: string;
  quantity: number;
  totalPrice: number;
  imgUrl: string | null;
}

export interface IOrderDetail extends IOrderListItem {
  orderNumber: string;
  items: IOrderProductItem[];
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
};

const asArray = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : [];
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (value: unknown, fallback = ""): string => {
  return typeof value === "string" && value.trim() ? value : fallback;
};

const toIdString = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
};

const sanitizeOrderKey = (value: string): string => {
  return value.replace(/^#+/, "").trim();
};

const extractDataNode = (payload: unknown): unknown => {
  const root = asRecord(payload);
  if (!root) return payload;

  return root.data ?? payload;
};

const normalizeOrderItem = (raw: unknown): IOrderProductItem | null => {
  const node = asRecord(raw);
  if (!node) return null;

  const productNode = asRecord(node.product);
  const productId =
    productNode?.id ?? node.productId ?? node.product_id ?? node.id;
  const title =
    toStringValue(productNode?.title) ||
    toStringValue(productNode?.name) ||
    toStringValue(node.title) ||
    "Mehsul";
  const quantity = toNumber(node.quantity ?? node.qty ?? 0);
  const perItemPrice = toNumber(
    node.price ?? node.unit_price ?? productNode?.price ?? 0,
  );
  const totalPrice = toNumber(
    node.total_price ?? node.totalPrice ?? perItemPrice * quantity,
  );

  return {
    id: String(productId ?? title),
    title,
    quantity,
    totalPrice,
    imgUrl: toStringValue(productNode?.img_url) || null,
  };
};

const normalizeOrder = (raw: unknown): IOrderDetail | null => {
  const node = asRecord(raw);
  if (!node) return null;
  console.log(
    "[ORDER RAW FIELDS]",
    JSON.stringify(Object.keys(node)),
    JSON.stringify(node),
  );

  const itemsSource =
    node.items ?? node.orderItems ?? node.order_items ?? node.products;
  const items = asArray(itemsSource)
    .map(normalizeOrderItem)
    .filter(Boolean) as IOrderProductItem[];
  const totalPrice = toNumber(
    node.totalAmount ?? node.total_price ?? node.total ?? node.subtotal ?? 0,
  );
  const itemCount =
    toNumber(node.itemCount ?? node.item_count ?? 0) ||
    items.reduce((acc, item) => acc + item.quantity, 0);

  const rawId = toIdString(node.id ?? node.orderId ?? node.order_id);
  const rawOrderNumber = toIdString(
    node.orderNumber ?? node.order_number ?? node.number,
  );
  const id = sanitizeOrderKey(rawId || rawOrderNumber);
  const orderNumber = sanitizeOrderKey(rawOrderNumber || rawId);

  return {
    id,
    orderNumber,
    createdAt: toStringValue(node.created_at ?? node.createdAt ?? node.date),
    address: toStringValue(
      node.address ?? node.shippingAddress ?? "Ünvan qeyd olunmayıb",
    ),
    status: toStringValue(node.status ?? "-"),
    itemCount,
    totalPrice,
    phone: toStringValue(
      node.phone ??
        node.phoneNumber ??
        node.phone_number ??
        node.telephone ??
        "",
    ),
    items,
  };
};

const fetchUserOrdersDetailed = async (): Promise<IOrderDetail[]> => {
  const listUrls = [
    ORDER_ROUTE_FALLBACKS.list,
    API.order.list,
    ORDER_ROUTE_FALLBACKS.listLegacy,
  ];

  for (const url of listUrls) {
    try {
      const response = await Fetcher<unknown>({
        method: REQUEST_METHODS.GET,
        url,
      });

      const payload = extractDataNode(response.data);
      const list = asArray(payload)
        .map(normalizeOrder)
        .filter(Boolean) as IOrderDetail[];

      if (list.length > 0) {
        return list;
      }
    } catch {
      // Continue trying list fallback routes.
    }
  }

  return [];
};

export const getUserOrders = async (): Promise<IOrderListItem[]> => {
  const list = await fetchUserOrdersDetailed();

  return list.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    address: order.address,
    status: order.status,
    itemCount: order.itemCount,
    totalPrice: order.totalPrice,
  })) as IOrderListItem[];
};

export const getOrderDetail = async (
  orderId: string | number,
): Promise<IOrderDetail | null> => {
  const orderKey = String(orderId);
  const detailUrls = [
    ORDER_ROUTE_FALLBACKS.detail(orderId),
    API.order.detail(orderId),
    ORDER_ROUTE_FALLBACKS.detailLegacy(orderId),
    ORDER_ROUTE_FALLBACKS.detailById(orderId),
  ];

  for (const url of detailUrls) {
    try {
      const response = await Fetcher<unknown>({
        method: REQUEST_METHODS.GET,
        url,
      });

      const payload = extractDataNode(response.data);
      const normalized = normalizeOrder(
        asRecord(payload)?.order ?? asRecord(payload)?.orderDetail ?? payload,
      );
      if (normalized) {
        return normalized;
      }
    } catch {
      // Keep trying next fallback route.
    }
  }

  // If route expects internal id but UI passed order number, resolve it from user order list.
  try {
    const orders = await fetchUserOrdersDetailed();
    const matchedOrder = orders.find(
      (order) =>
        order.id === orderKey ||
        order.orderNumber === orderKey ||
        `#${order.id}` === orderKey ||
        `#${order.orderNumber}` === orderKey,
    );

    if (matchedOrder) {
      if (matchedOrder.items.length > 0) {
        return matchedOrder;
      }

      if (matchedOrder.id === orderKey) {
        return matchedOrder;
      }

      for (const url of [
        ORDER_ROUTE_FALLBACKS.detail(matchedOrder.id),
        API.order.detail(matchedOrder.id),
        ORDER_ROUTE_FALLBACKS.detailLegacy(matchedOrder.id),
        ORDER_ROUTE_FALLBACKS.detailById(matchedOrder.id),
      ]) {
        try {
          const response = await Fetcher<unknown>({
            method: REQUEST_METHODS.GET,
            url,
          });

          const payload = extractDataNode(response.data);
          const normalized = normalizeOrder(
            asRecord(payload)?.order ??
              asRecord(payload)?.orderDetail ??
              payload,
          );
          if (normalized) {
            return normalized;
          }
        } catch {
          // Continue trying remaining routes.
        }
      }
    }
  } catch {
    // Ignore user list resolution errors and return null.
  }

  return null;
};

export const checkout = async (data: ICheckoutRequest): Promise<unknown> => {
  const checkoutUrls = [
    "/api/tiktak/orders/checkout",
    API.order.checkout,
    "/api/tiktak/order/checkout",
  ];

  const paymentUpper = String(data.paymentMethod || "").toUpperCase();
  const requestVariants: Array<Record<string, unknown>> = [
    {
      paymentMethod: data.paymentMethod,
      address: data.address,
      phone: data.phone,
      note: data.note || "",
    },
    {
      payment_method: data.paymentMethod,
      address: data.address,
      phone: data.phone,
      note: data.note || "",
    },
    {
      paymentMethod: paymentUpper,
      address: data.address,
      phone: data.phone,
      note: data.note || "",
    },
    {
      payment_method: paymentUpper,
      address: data.address,
      phone: data.phone,
      note: data.note || "",
      phone_number: data.phone,
    },
  ];

  let lastError: unknown = null;

  for (const url of checkoutUrls) {
    for (const body of requestVariants) {
      try {
        const response = await Fetcher<unknown>({
          method: REQUEST_METHODS.POST,
          url,
          data: body,
        });

        return response.data;
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError;
};
