export function parseLatLon(latLngStr: string): [number, number] {
  const ll = latLngStr.split(',');
  return [parseFloat(ll[0]), parseFloat(ll[1])];
}
