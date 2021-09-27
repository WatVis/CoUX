import csv
import cv2
import numpy as np
import os
import sys

from os import path

VIDEO_DIR = '../videos'
OUTPUT_DIR = '../optical_flow'
VIDEO_NAME = sys.argv[1]
RAW_NAME = VIDEO_NAME.split('.')[0]

# returns a list of optical flow speeds by frames
def dense_optical_flow(video_rel_dir, video_name):
    video_rel_path = path.join(video_rel_dir, video_name)
    # Capturing the video file 0 for videocam else you can provide the url 
    capture = cv2.VideoCapture(video_rel_path) 
    # Reading the first frame 
    _, frame1 = capture.read() 
    # Convert to gray scale 
    prvs = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY) 
    print('processing video')

    curr = 0 #report progress
    mag_speeds = []
    len_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))

    while(1):
        # Capture another frame and convert to gray scale 
        _, frame2 = capture.read() 
        next = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY) 
        # Optical flow is now calculated 
        flow = cv2.calcOpticalFlowFarneback(prvs, next, None, 0.5, 3, 15, 3, 5, 1.2, 0) 

        vertical_speed = flow[...,1]
        horizontal_speed = flow[..., 0]
        magnitude_matrix = np.sqrt(np.multiply(vertical_speed,vertical_speed) + np.multiply(horizontal_speed, horizontal_speed))
        average_magnitude = magnitude_matrix.mean()
        mag_speeds.append(average_magnitude)

        # report progress
        curr += 1
        if curr % 100 == 0:
            print('%d frames were processed' % curr)

        # move to the next frame
        prvs = next
        if curr == len_frames - 1:
            break
        
    # save
    capture.release()
    mag = np.array(mag_speeds)
    if not path.exists('./' + OUTPUT_DIR):
        os.makedirs('./' + OUTPUT_DIR)
    np.savetxt(OUTPUT_DIR + '/' + RAW_NAME + '_Magnitude.csv', mag, delimiter=',', header = RAW_NAME)

if __name__ == "__main__":
    dense_optical_flow(VIDEO_DIR, VIDEO_NAME)