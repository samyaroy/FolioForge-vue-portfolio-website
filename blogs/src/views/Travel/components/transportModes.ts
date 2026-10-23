import type { TransportMode } from '../../../content/travel/trips'

// One icon per transport mode, shared by the itinerary on the details page
// and the route line / overview on the travel page.
export const MODE_ICONS: Record<TransportMode, string> = {
  flight: 'mdi-airplane',
  train: 'mdi-train',
  bus: 'mdi-bus',
  car: 'mdi-car',
  bike: 'mdi-motorbike',
  ferry: 'mdi-ferry',
  foot: 'mdi-walk',
}
