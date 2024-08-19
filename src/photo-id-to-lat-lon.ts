/** photoId -> "lat,lon" */
export const photoIdToLatLon: Record<string, string> = {};

export async function getLatLonForPhotoId(photoId: string): Promise<string> {
  const id4 = photoId.slice(0, 4);
  const r = await fetch(`/id4-to-location/${id4}.json`);
  if (!r.ok) {
    throw new Error(r.statusText);
  }
  const data = (await r.json()) as { [id: string]: string };
  Object.assign(photoIdToLatLon, data);
  return data[photoId];
}
