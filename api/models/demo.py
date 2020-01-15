# By: Wei Kit Wong
# This file loads the persisted model and uses it for basic prediction of an input audio file

import sys
import os
import librosa
import numpy as np
from joblib import load
from sklearn import svm

inputAudioFilePath = ""

# File that the model is persisted at
MODEL_PERSISTANCE_FILE = "classifier.joblib"

def ensureFilePath(filePath):
    print("0. Ensuring argument given is a file path")
    return os.path.exists(filePath)

def loadInputFile(filePath):
    print("1. Load in input audio file")

    audioStream, sampleRate = librosa.load(filePath)

    print("Input audio file loading fin.")
    return audioStream, sampleRate

def audioFeatureExtractionFrom(audioStream, sampleRate):
    print("2. Audio feature extraction from file")

    audioFeatures = np.array([])

    mfccs = np.mean(librosa.feature.mfcc(y=audioStream, sr=sampleRate).T, axis=0)
    mel = np.mean(librosa.feature.melspectrogram(y=audioStream, sr=sampleRate).T, axis=0)

    audioFeatures = np.hstack((audioFeatures, mfccs))
    audioFeatures = np.hstack((audioFeatures, mel))

    print("Audio feature extraction from file fin.")
    return audioFeatures

def loadPersistedClassifier():
    print("3. Load the persisted SVM classifier model")
    return load(MODEL_PERSISTANCE_FILE)

def makeEmotionalStatisticsPrediction(model, audioFeatures):
    print("4. Predict and output emotion statistics from the input audio file")
    return model.predict([audioFeatures])

def main():
    print("Hello World")

    if len(sys.argv) >= 2 and ensureFilePath(sys.argv[1]):
        inputAudioFilePath = sys.argv[1]
    else:
        print("No valid argument given, usage: demo.py [filePath]")
        return

    audioStream, sampleRate = loadInputFile(inputAudioFilePath)
    audioFeatures = audioFeatureExtractionFrom(audioStream, sampleRate)
    model = loadPersistedClassifier()
    print(makeEmotionalStatisticsPrediction(model, audioFeatures))

main()