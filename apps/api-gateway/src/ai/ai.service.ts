import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async routeOrder(customerLocation: { lat: number; lng: number }, orderItems: any[]): Promise<any> {
    const mockRouting = {
      recommendedBranch: 'branch-1',
      estimatedDeliveryTime: 25,
      confidence: 0.85,
      reasoning: 'Closest branch with available inventory and shortest queue',
      alternatives: [
        { branchId: 'branch-2', estimatedTime: 35, reason: 'Higher queue load' },
        { branchId: 'branch-3', estimatedTime: 40, reason: 'Further distance' },
      ],
    };

    return mockRouting;
  }

  async predictInventory(branchId: string, menuItemId: string, days: number): Promise<any> {
    const mockPrediction = {
      currentStock: 50,
      predictedDemand: Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedSales: Math.floor(Math.random() * 20) + 5,
        confidence: 0.75 + Math.random() * 0.2,
      })),
      reorderRecommendation: {
        shouldReorder: true,
        recommendedQuantity: 100,
        urgency: 'medium',
        estimatedStockoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    return mockPrediction;
  }

  async askAssistant(query: string, context?: any): Promise<any> {
    const responses = {
      'sales today': 'Today\'s sales are £1,247.50 across 47 orders. Peak hour was 12-1pm with £312 in sales.',
      'low stock': 'You have 3 items running low: Chicken Breast (12 left), Tomatoes (8 left), Burger Buns (15 left).',
      'best seller': 'Today\'s best seller is Chicken Tikka Masala with 23 orders, followed by Fish & Chips with 18 orders.',
      'customer feedback': 'Recent feedback shows 4.6/5 average rating. Main compliments: fast service, food quality. Areas to improve: packaging.',
    };

    const lowerQuery = query.toLowerCase();
    let response = 'I can help you with sales data, inventory levels, popular items, customer feedback, and operational insights. What would you like to know?';

    for (const [key, value] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        response = value;
        break;
      }
    }

    return {
      query,
      response,
      confidence: 0.9,
      suggestedActions: [
        'Check inventory levels',
        'Review today\'s performance',
        'Update menu availability',
      ],
      relatedQueries: [
        'What are today\'s top selling items?',
        'Which items need restocking?',
        'How is customer satisfaction?',
      ],
    };
  }

  async getUpsellSuggestions(currentItems: any[], customerHistory?: any[]): Promise<any> {
    const suggestions = [
      {
        item: 'Garlic Naan',
        reason: 'Pairs well with curry dishes',
        confidence: 0.85,
        expectedUplift: '£3.50',
      },
      {
        item: 'Mango Lassi',
        reason: 'Popular drink with spicy food',
        confidence: 0.75,
        expectedUplift: '£2.95',
      },
      {
        item: 'Gulab Jamun',
        reason: 'Dessert to complete the meal',
        confidence: 0.65,
        expectedUplift: '£4.50',
      },
    ];

    return {
      suggestions,
      totalPotentialUplift: '£10.95',
      successRate: '32%',
      personalizedMessage: 'Based on this customer\'s previous orders, they often add drinks and sides.',
    };
  }

  async getMarketingInsights(branchId?: string): Promise<any> {
    return {
      customerSegments: [
        { name: 'Regular Customers', size: 245, avgOrderValue: '£18.50', frequency: 'Weekly' },
        { name: 'Occasional Diners', size: 892, avgOrderValue: '£22.30', frequency: 'Monthly' },
        { name: 'New Customers', size: 156, avgOrderValue: '£15.80', frequency: 'First time' },
      ],
      campaignRecommendations: [
        {
          type: 'Loyalty Reward',
          target: 'Regular Customers',
          message: 'Thank you for your loyalty! Enjoy 15% off your next order.',
          expectedResponse: '25%',
        },
        {
          type: 'Win-back Campaign',
          target: 'Lapsed Customers',
          message: 'We miss you! Come back with 20% off your favorite dish.',
          expectedResponse: '12%',
        },
      ],
      bestTimeToSend: '6:00 PM - 7:30 PM',
      seasonalTrends: {
        currentTrend: 'Comfort food demand increasing',
        recommendation: 'Promote hearty dishes and warm beverages',
      },
    };
  }

  async getDemandForecast(branchId: string, menuItemId: string, days: number): Promise<any> {
    return {
      forecast: Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedDemand: Math.floor(Math.random() * 30) + 10,
        confidence: 0.7 + Math.random() * 0.25,
        factors: ['weather', 'day_of_week', 'local_events', 'historical_trends'],
      })),
      totalPredictedDemand: days * 20,
      peakDays: ['Friday', 'Saturday', 'Sunday'],
      recommendations: [
        'Increase staff on weekends',
        'Prepare extra ingredients for Friday-Sunday',
        'Consider promotional pricing on Tuesday-Wednesday',
      ],
    };
  }
}
