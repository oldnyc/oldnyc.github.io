// Styles for Google Maps. These de-emphasize features on the map.
export const MAP_STYLE: google.maps.MapTypeStyle[] = [
  // to remove buildings
  { stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'simplified' }] },
  // end remove buildings
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'on',
      },
      {
        color: '#e3e3e3',
      },
    ],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [
      {
        color: '#cccccc',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#FFFFFF',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [
      {
        color: '#94989C',
      },
      {
        visibility: 'simplified',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

function buildStaticStyle(styleStruct: google.maps.MapTypeStyle[]) {
  let style = '';
  for (var i = 0; i < styleStruct.length; i++) {
    var s = styleStruct[i];
    var strs = [];
    if (s.featureType != null) strs.push('feature:' + s.featureType);
    if (s.elementType != null) strs.push('element:' + s.elementType);
    if (s.stylers != null) {
      for (var j = 0; j < s.stylers.length; j++) {
        for (const [key, value] of Object.entries(s.stylers[j])) {
          if (typeof value !== 'string') {
            continue;
          }
          strs.push(key + ':' + value.replace(/#/, '0x'));
        }
      }
    }
    var str = '&style=' + strs.join('%7C');
    style += str;
  }
  return style;
}

export const STATIC_MAP_STYLE = buildStaticStyle(MAP_STYLE);
