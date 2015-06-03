#!/usr/bin/env python
'''Generates rotated versions of static images.

This winds up being way simpler than trying to apply the rotations in the
client's browser.

Input:  data.json
Output: rotated-assets/{thumb,600px}/*.jpg

This won't overwrite existing files (i.e. it's incremental).
'''

import json
import os
import sys
import time

import requests
import shutil
from PIL import Image


def download(url, destination_path):
    response = requests.get(url, stream=True)
    with open(destination_path, 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)


def image_path(photo_id, degrees, is_thumb):
    return 'rotated-assets/%s/%s.%s.jpg' % (
        'thumb' if is_thumb else '600px',
        photo_id, degrees)


def image_url(photo_id, is_thumb):
    return 'http://oldnyc-assets.nypl.org/%s/%s.jpg' % (
        'thumb' if is_thumb else '600px', photo_id)


work = []  # (photo_id, degrees) tuples
for photo in json.load(open('data.json')):
    degrees = photo.get('rotation')
    if not degrees:
        continue

    photo_id = photo['photo_id']
    if not os.path.exists(image_path(photo_id, degrees, is_thumb=False)):
        work.append((photo_id, degrees))

print 'Will generate %d rotated images and thumbnails' % len(work)

for photo_id, degrees in work:
    for is_thumb in (False, True):
        temp_dest = '/tmp/%s.jpg' % photo_id
        final_dest = image_path(photo_id, degrees, is_thumb)
        url = image_url(photo_id, is_thumb)
        sys.stderr.write('Fetching %s --> %s\n' % (url, final_dest))
        download(url, temp_dest)
        im = Image.open(open(temp_dest))
        if degrees == 90:
            im = im.transpose(Image.ROTATE_270)
        elif degrees == 180:
            im = im.transpose(Image.ROTATE_180)
        elif degrees == 270:
            im = im.transpose(Image.ROTATE_90)
        else:
            raise ValueError('Invalid rotation: %d' % degrees)
        im.save(final_dest)
    time.sleep(1)

