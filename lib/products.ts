export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  coins: number
  bonus?: string
}

export const PRODUCTS: Product[] = [
  {
    id: "coins-500",
    name: "500 Coins",
    description: "Starter pack - 500 coins for Survival Quiz",
    priceInCents: 99,
    coins: 500,
  },
  {
    id: "coins-1500",
    name: "1,500 Coins",
    description: "Popular pack - 1,500 coins for Survival Quiz",
    priceInCents: 199,
    coins: 1500,
    bonus: "Most Popular",
  },
  {
    id: "coins-5000",
    name: "5,000 Coins",
    description: "Pro pack - 5,000 coins for Survival Quiz",
    priceInCents: 499,
    coins: 5000,
    bonus: "Best Value",
  },
  {
    id: "coins-15000",
    name: "15,000 Coins",
    description: "Ultimate pack - 15,000 coins for Survival Quiz",
    priceInCents: 999,
    coins: 15000,
    bonus: "VIP Pack",
  },
]
