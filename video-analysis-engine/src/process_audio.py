from __future__ import print_function

import cv2
import json
import math
import numpy as np
import os
import parselmouth
import re
import speech_recognition as sr
import scenedetect
import subprocess
import sys

from auditok import split
from os import path
from rake_nltk import Rake, Metric
from scenedetect.video_manager import VideoManager
from scenedetect.scene_manager import SceneManager
from scenedetect.frame_timecode import FrameTimecode
from scenedetect.stats_manager import StatsManager
from scenedetect.detectors import ContentDetector
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

VIDEO_DIR = '../videos'
AUDIO_DIR = '../normalized_audio'
TRANS_DIR = '../transcripts'
JSON_DIR = '../audio_json'
if len(sys.argv) < 2:
    print('Please specify the video name')
    exit(1)
VIDEO_NAME = sys.argv[1]
RAW_NAME = VIDEO_NAME.split('.')[0]

def split_scenes(video_dir, video_name, thrd, min_len):
    input_video_paths = [path.join(video_dir, video_name)]
    ret_dict = {}
    ret_scenes = []
    # Create a video_manager that points to video file. 
    video_manager = VideoManager(input_video_paths)
    stats_manager = StatsManager()
    scene_manager = SceneManager(stats_manager)
    # Add ContentDetector algorithm (constructor takes detector options like threshold).
    scene_manager.add_detector(ContentDetector(threshold = thrd, min_scene_len = min_len))

    base_timecode = video_manager.get_base_timecode()
    duration = video_manager.get_duration()[0]
    ret_dict['duration'] = duration.get_seconds()
    ret_dict['scenes'] = []

    try:
        video_manager.set_duration(start_time=base_timecode, duration=duration)
        # Set downscale factor to improve processing speed (no args means default).
        video_manager.set_downscale_factor()
        # Start video_manager.
        video_manager.start()
        # Perform scene detection on video_manager.
        scene_manager.detect_scenes(frame_source=video_manager)
        # Obtain list of detected scenes.
        scene_list = scene_manager.get_scene_list(base_timecode)
        # Like FrameTimecodes, each scene in the scene_list can be sorted if the
        # list of scenes becomes unsorted.

        # print info about scenes
        print('List of scenes obtained:')
        for i, scene in enumerate(scene_list):
            ret_scenes.append([scene[0].get_seconds(), scene[0].get_frames(), scene[1].get_seconds(), scene[1].get_frames()])
            print('    Scene %2d: Start %s / Frame %d, End %s / Frame %d' % (
                i+1,
                scene[0].get_timecode(), scene[0].get_frames(),
                scene[1].get_timecode(), scene[1].get_frames(),))

        ret_dict['scenes'] = ret_scenes

    finally:
        video_manager.release()
        return ret_dict

# Extract the audio from a video with ffmpeg
def extract_audio(video_dir, raw_name, audio_dir):
    in_rel_path = path.join(video_dir, raw_name)
    out_raw_name = raw_name.split('.')[0] + '.wav'
    out_rel_path = path.join(audio_dir, out_raw_name)
    print('processing file: %s and output: %s' % (in_rel_path, out_rel_path))
    # extract the audio from video with loudness normalization and 48000hz rate
    subprocess.call(['ffmpeg', '-i', in_rel_path, '-filter:a', 'loudnorm', '-ar', '48000', out_rel_path])

# define mapping for keywords here
questions = ['who', 'what', 'where', 'why', 'how', 'maybe']
negations = ['no', 'not', 'none', "don't", "doesn't", "didn't" , "can't", 'but']
fillers = ['okay', 'like']

# map transcript to ux keywords
# returns a dictionary with keys {q, n, f}
def get_ux_keywords(text):
    text_list = text.split(' ')
    output_tokens = {'q': 0, 'n': 0, 'f': 0}
    ret = []
    for i in text_list:
        if i in questions:
            output_tokens['q'] += 1
        elif i in negations:
            output_tokens['n'] += 1
        elif i in fillers:
            output_tokens['f'] += 1
    for k in output_tokens.keys():
        if output_tokens[k] > 0:
            ret.append(k)
    return ret

# returns a list of tuple(score, keyword)
def get_domain_keywords(text):
    r = Rake(ranking_metric=Metric.WORD_DEGREE, max_length = 1)
    r.extract_keywords_from_text(text)
    keys = r.get_ranked_phrases_with_scores()
    return keys

# returns a dictionary with keys{neg, neu, pos, compound}
def sentiment_analysis(text):
    analyser = SentimentIntensityAnalyzer()
    score = analyser.polarity_scores(text)
    return score

# returns a dictionary containing segments information
def split_and_transcript_audio(audio_dir, audio_name, trans_dir, energy, max_sil, is_trans = True, save_region = True):
    ret_dict_list = []
    raw_name = audio_name.split('.')[0]
    in_rel_path = path.join(audio_dir, audio_name)

    #split returns a generator of AudioRegion objects
    # Tune parameters here to generate a reasonable split
    audio_regions = split(in_rel_path, max_silence=max_sil, max_dur=30, min_dur = 5,
                        sampling_rate=48000, energy_threshold=energy)
    unique_id = 0
    speech_rates = []
    loudness_values = []
    pitch_values = []

    if is_trans:
        if not os.path.exists(trans_dir):
            os.makedirs(trans_dir)

        trans_rel_path = path.join(trans_dir, raw_name + '.txt')
        wfile = open(trans_rel_path, 'w')
        out_trans = ''

    for region in audio_regions:
        ret_dict = {'id': -1, 'start': 0, 'end': 0, 'transcript': '', 'uxKeywords': [], 'domainKeywords':[], 'semantics': '', 'lowSpeechRate': 0, 'loudness': 0, 'pitch': 0}
        ret_dict['start'] = round(region.meta['start'], 2)
        ret_dict['end'] = round(region.meta['end'], 2)
        ret_dict['id'] = unique_id

        if not path.exists('../' + raw_name):
            os.makedirs('../' + raw_name)

        out_rel_path = path.join('../' + raw_name, 'segment' + str(unique_id) + '.wav')
        # save regions
        if save_region:
            filename = region.save(out_rel_path)
            print("segment saved as: {}".format(filename))

        # transcribing
        if is_trans:
            r = sr.Recognizer()
            with sr.AudioFile(out_rel_path) as source:
                # read the entire audio file
                r.adjust_for_ambient_noise(source)
                audio = r.record(source)  
            try:
                # using the default API key
                # to use another API key, use `r.recognize_google(audio, key="GOOGLE_SPEECH_RECOGNITION_API_KEY")`
                # instead of `r.recognize_google(audio)`
                seg_trans = r.recognize_google(audio)
                ret_dict['transcript'] = seg_trans
                out_trans += seg_trans

            except sr.UnknownValueError:
                print("Google Speech Recognition could not understand audio")
            except sr.RequestError as e:
                print("Could not request results from Google Speech Recognition service; {0}".format(e))
            out_trans += '\n'

        if ret_dict['transcript'] != '':
            # keywords
            try:
                ret_dict['uxKeywords'] = get_ux_keywords(ret_dict['transcript'])
            except:
                print('get_ux_keywords failed for script: ' + ret_dict['transcript'])
            try:
                domain_list = get_domain_keywords(ret_dict['transcript'])
                for d in domain_list:
                    ret_dict['domainKeywords'].append(d[1])
            except:
                print('get_domain_keywords failed for script: ' + ret_dict['transcript'])
            try:
                compound_score = sentiment_analysis(ret_dict['transcript'])['compound']
                if compound_score <= - 0.1:
                    ret_dict['semantics'] = 'Neg'
                elif compound_score >= 0.2:
                    ret_dict['semantics'] = 'Pos'
                else:
                    ret_dict['semantics'] = 'Neu'
            except:
                print('semantics analysis failed for script: ' + ret_dict['transcript'])

            # speech rate
            try:
                duration = region.meta['end'] - region.meta['start']
                words = len(ret_dict['transcript'].strip().split())
                speech_rates.append(round(words * 60 / duration, 2));
            except:
                print('speech rate failed for script: ' + ret_dict['transcript'])

            # loudness (dB) and pitch (Hz)
            try:
                snd = parselmouth.Sound(filename)
                intensity = snd.to_intensity()
                intensity_array = intensity.values.T
                loudness_values.append(intensity_array[intensity_array != 0])

                pitch = snd.to_pitch()
                pitch_array = pitch.selected_array['frequency']
                pitch_values.append(pitch_array[pitch_array != 0])
            except:
                print('pitch and loudness failed for segment: ' + filename)

        unique_id += 1
        ret_dict_list.append(ret_dict)

    # Check for abnormally low speech, high/low loudness, and high/low pitch
    mean_speech_rate = np.mean(speech_rates)
    std_speech_rate = np.std(speech_rates)
    mean_loudness = np.mean(np.concatenate(loudness_values))
    std_loudness = np.std(np.concatenate(loudness_values))
    mean_pitch = np.mean(np.concatenate(pitch_values))
    std_pitch = np.std(np.concatenate(pitch_values))

    for i in range(len(speech_rates)):
        if speech_rates[i] <= (mean_speech_rate - 2*std_speech_rate):
            ret_dict_list[i]['lowSpeechRate'] = 1

        if sum(l >= mean_loudness + 2*std_loudness for l in loudness_values[i])/len(loudness_values[i]) > 0.1:
            ret_dict_list[i]['loudness'] = 1
        elif sum(l <= mean_loudness - 2*std_loudness for l in loudness_values[i])/len(loudness_values[i]) > 0.1:
            ret_dict_list[i]['loudness'] = -1

        if sum(p >= mean_pitch + 2*std_pitch for p in pitch_values[i])/len(pitch_values[i]) > 0.1:
            ret_dict_list[i]['pitch'] = 1
        elif sum(p <= mean_pitch - 2*std_pitch for p in pitch_values[i])/len(pitch_values[i]) > 0.1:
            ret_dict_list[i]['pitch'] = -1

    # write to the file
    if is_trans:
        wfile.write(out_trans)
    return ret_dict_list

if __name__ == "__main__":
    post_data = {}
    raw_name = VIDEO_NAME.split('.')[0]

    # Extract audio if it does not exist
    if not os.path.exists(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)

    audio_list = os.listdir(AUDIO_DIR)
    if raw_name + '.wav' not in audio_list:
        extract_audio(VIDEO_DIR, VIDEO_NAME, AUDIO_DIR)

    # get energy threshold and max_silence to split audio
    energy = 40
    max_sil = 0.5
    if len(sys.argv) >= 3:
        energy = sys.argv[2]
        if len(sys.argv) > 3:
            max_sil = sys.argv[3]
    try:
        energy = int(energy)
        max_sil = float(max_sil)
    except:
        print('energy_threshold or max_silence not valid')
        exit(1)
    
    # split and transcribe the audio
    audioSegments = split_and_transcript_audio(AUDIO_DIR, raw_name + '.wav', TRANS_DIR, energy=energy, max_sil = max_sil, is_trans = True, save_region= True)

    # get threshold and min_len to split scenes
    sceneBreaks = []
    thrd = 10 
    min_len = 5 

    if len(sys.argv) >= 5:
        thrd = sys.argv[4]
        if len(sys.argv) > 5:
            min_len = sys.argv[5]
    try:
        thrd = float(thrd)
        min_len = float(min_len)
    except:
        print('scene_threshold or min_scene_length not valid')
        exit(1)

    scenes = split_scenes(VIDEO_DIR, VIDEO_NAME, thrd = thrd, min_len = min_len)
    duration = scenes['duration']

    # format: scenes['scenes'] = (start_sec, start_frame, end_sec, end_frame)
    for s in scenes['scenes']:
        sceneBreaks.append(s[2]) # append the second of the end of each scene

    # prepare data
    post_data['name'] = raw_name
    post_data['duration'] = duration
    post_data['sceneBreaks'] = sceneBreaks
    post_data['audioSegments'] = audioSegments

    # save to json file
    if not os.path.exists(JSON_DIR):
        os.makedirs(JSON_DIR)

    with open (JSON_DIR + '/' + RAW_NAME + '.json', 'w') as fp:
        json.dump(post_data, fp)
