export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function isWithinDeliveryRadius(
  branchLat: number,
  branchLon: number,
  customerLat: number,
  customerLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(branchLat, branchLon, customerLat, customerLon);
  return distance <= radiusKm;
}

export function calculateOrderPriority(order: any): number {
  let priority = 0;
  
  if (order.type === 'delivery') priority += 10;
  if (order.customerInfo.loyaltyTier === 'premium') priority += 5;
  
  const orderAge = Date.now() - new Date(order.createdAt).getTime();
  priority += Math.floor(orderAge / (1000 * 60 * 5));
  
  return Math.min(priority, 100);
}

export function fuzzySearch(query: string, items: any[], searchFields: string[]): any[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field]?.toLowerCase() || '';
      return value.includes(normalizedQuery) || 
             normalizedQuery.split(' ').every(word => value.includes(word));
    });
  }).sort((a, b) => {
    const aScore = searchFields.reduce((score, field) => {
      const value = a[field]?.toLowerCase() || '';
      if (value.startsWith(normalizedQuery)) return score + 10;
      if (value.includes(normalizedQuery)) return score + 5;
      return score;
    }, 0);
    
    const bScore = searchFields.reduce((score, field) => {
      const value = b[field]?.toLowerCase() || '';
      if (value.startsWith(normalizedQuery)) return score + 10;
      if (value.includes(normalizedQuery)) return score + 5;
      return score;
    }, 0);
    
    return bScore - aScore;
  });
}
