import { z } from 'zod';

export const UserRoleSchema = z.enum(['manager', 'kitchen_staff', 'cashier', 'delivery_staff', 'marketing_team']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderTypeSchema = z.enum(['dine_in', 'takeaway', 'delivery']);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  postcode: string;
  phone: string;
  latitude: number;
  longitude: number;
  deliveryRadius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  complexity: number;
  allergens: string[];
  nutritionalInfo?: Record<string, any>;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  modifiers: Record<string, any>;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  branchId: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  postcode?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  branchId: string;
  menuItemId: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  costPerUnit: number;
  lastRestocked: Date;
  expiryDate?: Date;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'push';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  targetSegment: string;
  content: {
    subject?: string;
    message: string;
    imageUrl?: string;
  };
  scheduledAt?: Date;
  sentAt?: Date;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  value: number;
  minimumOrderValue?: number;
  applicableItems?: string[];
  maxUses?: number;
  currentUses: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  branchIds: string[];
  customerSegment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KitchenQueue {
  id: string;
  orderId: string;
  branchId: string;
  items: OrderItem[];
  priority: number;
  estimatedTime: number;
  assignedChef?: string;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface StaffPerformance {
  id: string;
  userId: string;
  branchId: string;
  date: Date;
  ordersProcessed: number;
  averageOrderTime: number;
  customerRating: number;
  salesAmount: number;
  upsellSuccess: number;
  trainingRecommendations: string[];
}

export interface AIInsight {
  id: string;
  type: 'order_routing' | 'inventory_prediction' | 'staff_recommendation' | 'marketing_suggestion';
  branchId?: string;
  confidence: number;
  data: Record<string, any>;
  actionTaken: boolean;
  createdAt: Date;
}
