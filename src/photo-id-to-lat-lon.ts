/** photoId -> "lat,lon" */
export const photoIdToLatLon: Record<string, string> = {};

export async function getLatLonForPhotoId(
  photoId: string,
): Promise<string | undefined> {
  const id4 = photoId.slice(0, 4);
  const r = await fetch(`/id4-to-location/${id4}.json`);
  if (!r.ok) {
    throw new Error(r.statusText);
  }
  const data = (await r.json()) as { [id: string]: string };
  let latLon = photoIdToLatLon[photoId];
  if (!latLon) {
    // As a convenience, allow prefixes. This is helpful for debugging.
    for (const id of Object.keys(data)) {
      if (id.startsWith(photoId)) {
        latLon = data[id];
        data[photoId] = latLon;
        break;
      }
    }
  }
  Object.assign(photoIdToLatLon, data);
  return latLon;
}
