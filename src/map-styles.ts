// Styles for Google Maps. These de-emphasize features on the map.
// https://mapstyle.withgoogle.com/
export const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'simplified' }] },

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

  // Hide highway icons
  {
    featureType: 'road.arterial',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  // hide traffic lights
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

function buildStaticStyle(styleStruct: google.maps.MapTypeStyle[]) {
  let style = '';
  for (const s of styleStruct) {
    const strs = [];
    if (s.featureType != null) strs.push('feature:' + s.featureType);
    if (s.elementType != null) strs.push('element:' + s.elementType);
    if (s.stylers != null) {
      for (const styler of s.stylers) {
        for (const [key, value] of Object.entries(styler)) {
          if (typeof value !== 'string') {
            continue;
          }
          strs.push(key + ':' + value.replace(/#/, '0x'));
        }
      }
    }
    const str = '&style=' + strs.join('%7C');
    style += str;
  }
  return style;
}

export const STATIC_MAP_STYLE = buildStaticStyle(MAP_STYLE);
