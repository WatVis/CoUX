# Video Analysis Engine

## Step One: Installing Requirements 

- Install Python 3 
- Install ffmpeg 
- Install required Python packages: `pip install -r requirements.txt`

## Step Two: Processing Audio
Create a `videos` directory under `video-analysis-engine` and place your video file under this directory. <br />
Run the python script with the following commands (after replacing `videoName` with the name of your video): <br />

`cd src` <br />

`python process_audio.py videoName.mp4 energy_threshold(optional) max_silence(optional) scene_split_threshold(optional) min_scene_len(optional)` <br />

The extracted audio will be saved under the directory `./normalized_audio` <br />
The extracted audio is automatically split into segments and saved under the directory `./videoName` <br />
The transcript for the video will be saved under the directory `./transcripts` <br />
A json format output named `videoName.json` will be saved under `./audio_json` <br />

## Step Three: Processing video
Run the following command: <br />

`python process_video.py videoName.mp4` <br />

to get `videoName_Magnitude.csv`, which contains the magnitude of the optical flow in the video for every frame. <br />

Then run the following command: <br />

`python convert_csv_to_json.py videoName.mp4` <br />

to convert speeds in csv format to json format, saved under `./speed_json`

The final json files under `./audio_json` and `./speed_json` are required for the CoUX backend. 
