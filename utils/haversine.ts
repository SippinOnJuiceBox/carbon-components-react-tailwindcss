function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export function haversineDistance(
  coords1: UserLocation,
  coords2: UserLocation,
  isMiles: boolean = false
) {
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.latitude)) *
      Math.cos(toRad(coords2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance = R * c; // Distance in km

  if (isMiles) {
    distance /= 1.60934;
  }

  return distance;
}
