export const MALE_GARMENTS = [
  'Kandoora',
  'Suit',
  'Shirt',
  'Trousers',
  'Vest',
  'Jacket',
  'Thobe',
  'Bisht',
  'Jalabiya',
  'Shorts',
  'Other (specify in comments)',
]

export const FEMALE_GARMENTS = [
  'Abaya',
  'Dress',
  'Jalabiya',
  'Skirt',
  'Blouse',
  'Gown',
  'Suit',
  'Kaftan',
  'Maxi Dress',
  'Tunic',
  'Other (specify in comments)',
]

export const MALE_UPCYCLING_ITEMS = [
  'Kandoora',
  'Suit',
  'Jacket',
  'Shirt',
  'Trousers',
  'Thobe',
  'Denim Jacket',
  'Denim Jeans',
  'Bisht',
  'Vest',
  'Shorts',
  'Other (specify in comments)',
]

export const FEMALE_UPCYCLING_ITEMS = [
  'Abaya',
  'Dress',
  'Skirt',
  'Blouse',
  'Gown',
  'Kaftan',
  'Jalabiya',
  'Denim Jacket',
  'Denim Jeans',
  'Tunic',
  'Coat',
  'Other (specify in comments)',
]

// Kept for backward compat
export const UPCYCLING_ITEMS = [
  ...new Set([...FEMALE_UPCYCLING_ITEMS, ...MALE_UPCYCLING_ITEMS]),
]
