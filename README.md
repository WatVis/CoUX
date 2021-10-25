# CoUX

CoUX is a collaborative visual analytics tool to support multiple UX evaluators with analyzing think-aloud usability test recordings. From an input video, a video analysis engine extracts various types of features, which are stored on a back-end and presented on a front-end visual interface to facilitate the identification of usability problems among UX evaluators. Moreover, the front-end, consisting of three interactively coordinated panels, communicates with the back-end to support individual problem logging and annotation as well as collaboration amongst a team of UX evaluators.

This repo contains the code for two main parts of the system: 1) the video analysis engine, and 2) the user interface. The code is in corresponding with the following paper:
> Ehsan Jahangirzadeh Soure*, Emily Kuang*, Mingming Fan, Jian Zhao. [CoUX: Collaborative Visual Analysis of Think-Aloud Usability Test Videos for Digital Interfaces](https://ieeexplore.ieee.org/document/9552211). IEEE Transactions on Visualization and Computer Graphics (Proceedings of VIS'21), 2022. 

A video demostration of the system can be viewed [here](https://youtu.be/cqFq6zF-nG8).

<img src="https://www.jeffjianzhao.com/assets/img/snapshots/coux.png" width="100%" />

## Video Analysis Engine

Follow the instuctions in the `README.md` under the `video-analysis-engine` folder to extract the acoustic, visual, and textual features.

## User Interface

Follow the instuctions in the `README.md` under the `user-interface` folder to run/deploy the backend and frontend.
