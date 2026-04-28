export type Gender = 'male' | 'female'
export type ServiceType = 'alterations' | 'from_scratch' | 'upcycling'
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'
export type MeasurementMethod = 'self' | 'tailor'

export interface Profile {
  id: string
  full_name: string
  phone: string
  city: string
  area: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Measurement {
  id: string
  user_id: string
  name: string // e.g. "Khalifa", "Maha"
  gender: Gender
  // Upper body
  chest: number | null
  waist: number | null
  hips: number | null
  shoulder_width: number | null
  arm_length: number | null
  neck: number | null
  // Lower body
  inseam: number | null
  thigh: number | null
  // Full body
  height: number | null
  weight: number | null
  notes: string | null
  is_default: boolean
  created_at: string
}

export interface Tailor {
  id: string
  name: string
  location: string
  area: string
  distance_km: number
  experience_years: number
  expertise: string[]
  specialties: ServiceType[]
  rating: number
  review_count: number
  availability: string
  availability_hours: string
  avatar_url: string | null
  phone: string
  is_available: boolean
  created_at: string
}

export interface TailorReview {
  id: string
  tailor_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  tailor_id: string
  tailor_name: string
  service_type: ServiceType
  garment_type: string
  status: OrderStatus
  gender: Gender
  comments: string | null
  measurement_id: string | null
  image_urls: string[]
  price: number | null
  pickup_date: string | null
  pickup_time: string | null
  pickup_address: string | null
  expected_delivery: string | null
  order_number: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  order_id: string
  sender_id: string
  sender_type: 'user' | 'tailor'
  sender_name: string
  message: string
  created_at: string
}

export interface UserAddress {
  id: string
  user_id: string
  label: string
  full_name: string
  phone: string
  city: string
  area: string
  street: string
  is_default: boolean
  created_at: string
}

export interface SavedTailor {
  id: string
  user_id: string
  tailor_id: string
  created_at: string
}
