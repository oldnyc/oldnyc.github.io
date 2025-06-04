import os.path
import math
import sys

def deg2num(pos, zoom):
    lon_deg, lat_deg = pos
    lat_rad = math.radians(lat_deg)
    n = 1 << zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile


if __name__ == '__main__':

    sw, ne = (-74.25423,40.500426), (-73.707672,40.912507)
    bucket = 's3://long-term.cache.maps.stamen.com/toner-lite'

    count = 0
    for z in range(10, 17):
        x0, y0 = deg2num(sw, z)
        x1, y1 = deg2num(ne, z)
        n = (abs(x1 - x0) + 1) * (abs(y1 - y0) + 1)
        # print(f'z:{z} x:{x0}-{x1} y:{y0}-{y1} n={n}')
        count += n
        for x in range(min(x0, x1), 1 + max(x0, x1)):
            for y in range(min(y0, y1), 1 + max(y0, y1)):
                for r in ('', '@2x'):
                # for r in ('',):
                    url = f'{bucket}/{z}/{x}/{y}{r}.png'
                    out = f'static/toner-lite/{z}-{x}-{y}{r}.png'
                    if not os.path.exists(out):
                        if r == '@2x':
                            out_chunky = f'static/toner-lite/{z}-{x}-{y}.png'
                            if os.path.exists(out_chunky) and os.path.getsize(out_chunky) < 900:
                                sys.stderr.write(f'dropping {out}\n')
                        print(f's3cmd get {url} {out} --requester-pays')

    # print(f'total: {n}')
