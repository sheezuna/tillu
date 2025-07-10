export const API_ENDPOINTS = {
  AUTH: '/auth',
  ORDERS: '/orders',
  MENU: '/menu',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  CAMPAIGNS: '/campaigns',
  OFFERS: '/offers',
  KITCHEN: '/kitchen',
  ANALYTICS: '/analytics',
  AI: '/ai',
  BRANCHES: '/branches',
} as const;

export const WEBSOCKET_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  KITCHEN_UPDATE: 'kitchen:update',
  INVENTORY_UPDATE: 'inventory:update',
  STAFF_NOTIFICATION: 'staff:notification',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_DISCONNECTED: 'user:disconnected',
  INVENTORY_ALERT: 'inventory:alert',
  STAFF_MESSAGE: 'staff:message',
  DELIVERY_READY: 'delivery:ready',
  FLASH_OFFER: 'flash:offer',
  SYSTEM_ALERT: 'system:alert',
  BRANCH_METRICS: 'branch:metrics',
} as const;

export const USER_PERMISSIONS = {
  manager: ['*'],
  kitchen_staff: ['kitchen:read', 'kitchen:update', 'orders:read'],
  cashier: ['orders:create', 'orders:read', 'orders:update', 'customers:read', 'customers:create'],
  delivery_staff: ['orders:read', 'orders:update'],
  marketing_team: ['campaigns:*', 'customers:read', 'analytics:read'],
} as const;

export const AI_MODELS = {
  ORDER_ROUTING: 'order-routing-v1',
  INVENTORY_PREDICTION: 'inventory-forecast-v1',
  CUSTOMER_SEGMENTATION: 'customer-segment-v1',
  DEMAND_FORECASTING: 'demand-forecast-v1',
} as const;

export const CACHE_KEYS = {
  MENU_ITEMS: 'menu:items',
  BRANCH_INFO: 'branch:info',
  USER_PERMISSIONS: 'user:permissions',
  INVENTORY_LEVELS: 'inventory:levels',
  ACTIVE_OFFERS: 'offers:active',
} as const;
