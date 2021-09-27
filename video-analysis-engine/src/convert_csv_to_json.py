import json
import os
import sys

from numpy import genfromtxt
from os import path

# relative directions of input and output
DATA_DIR = '../optical_flow'
JSON_DIR = '../speed_json'
DURATION_DIR = '../audio_json'
VIDEO_NAME = sys.argv[1]
RAW_NAME = VIDEO_NAME.split('.')[0]

# convert speed for frames to average speed for seconds
def calc_average(original_speeds, duration):
    new_speeds = []
    frame_num = len(original_speeds)
    int_duration = int(round(duration))
    if int_duration == 0:
        print("video's duration equals to 0")
        return []
    # Calculate frame per second
    fps = int(round(frame_num / int_duration))

    if fps == 0:
        print("fps = 0")
        return []

    count = 0
    speed_sum = 0
    for i in range(frame_num):
        if count == fps - 1:
            speed_sum += original_speeds[i]
            #   Calculate the speed and reset count
            sec_speed = speed_sum / fps
            new_speeds.append(sec_speed)
            count = 0
            speed_sum = 0
        else:
            count += 1
            speed_sum += original_speeds[i]
    return new_speeds

# get duration of the video
read_from = path.join(DURATION_DIR, RAW_NAME + '.json')
try:
    audio_f = open(read_from, 'r')
except:
    print('cannot get duration of the video; run process_audio.py first and generate audio data')
    exit(1)
audio_data = json.load(audio_f)
DURATION = audio_data['duration']

# read speeds and convert
magnitude = genfromtxt(path.join(DATA_DIR, RAW_NAME) + '_Magnitude.csv', delimiter=',')
magnitude = calc_average(magnitude, DURATION)
print('%d speeds were calculated' % len(magnitude))

# save in json format
output_data = json.dumps({"name": RAW_NAME, "speeds": magnitude})
if not path.exists('./' + JSON_DIR):
    os.makedirs('./' + JSON_DIR)
f = open(path.join(JSON_DIR, RAW_NAME) + '_speed.json', 'w')
f.write(output_data)
f.close()

