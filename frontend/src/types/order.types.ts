export interface OrderEventSummary {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  placeAddress: string | null;
}

export interface OrderItem {
  id: string;
  userId: string;
  eventId: string;
  promoCodeId: string | null;
  quantity: number;
  unitPrice: string;
  discountPercent: number;
  totalPrice: string;
  showUserInVisitors: boolean;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  paymentStatus: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  event: OrderEventSummary | null;
}
