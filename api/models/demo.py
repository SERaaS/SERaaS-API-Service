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
modelPersistanceFile = "classifier.joblib"

# Ensuring argument given is a file path
def ensureFilePath(filePath):
    return os.path.exists(filePath)

# Load in input audio file
def loadInputFile(filePath):
    audioStream, sampleRate = librosa.load(filePath)

    return audioStream, sampleRate

# Audio feature extraction from file
def audioFeatureExtractionFrom(audioStream, sampleRate):
    audioFeatures = np.array([])

    mfccs = np.mean(librosa.feature.mfcc(y=audioStream, sr=sampleRate).T, axis=0)
    mel = np.mean(librosa.feature.melspectrogram(y=audioStream, sr=sampleRate).T, axis=0)

    audioFeatures = np.hstack((audioFeatures, mfccs))
    audioFeatures = np.hstack((audioFeatures, mel))

    return audioFeatures

# Load the persisted SVM classifier model from input
def loadPersistedClassifier(modelPersistanceFile):
    return load(modelPersistanceFile)

# Predict and output emotion classification from the input audio file
def makeEmotionalStatisticsPrediction(model, audioFeatures):
    return model.predict([audioFeatures])

def main():
    # Atleast one argument is required, for the audio file to be inspected
    if len(sys.argv) >= 2 and ensureFilePath(sys.argv[1]):
        inputAudioFilePath = sys.argv[1]

        # Second argument is the path to the SER model
        if ensureFilePath(sys.argv[2]):
            modelPersistanceFile = sys.argv[2]
    else:
        print("No valid argument given, usage: demo.py [filePath] [modelPath]")
        return

    audioStream, sampleRate = loadInputFile(inputAudioFilePath)
    audioFeatures = audioFeatureExtractionFrom(audioStream, sampleRate)
    model = loadPersistedClassifier(modelPersistanceFile)
    print(makeEmotionalStatisticsPrediction(model, audioFeatures)[0])

main()