# # # # # # # # # # # # # # # # # # # # # # # # # # # 
# Loads the SciKit-Learn RandomForest Speech Emotion Recognition model and
# formats the input audio file for classification and outputs the prediction
#
# Used to predict correlations between all or separate emotions from an
# audio file (all or seperate -> based on modelPath input).
#
# By: Wei Kit Wong
# # # # # # # # # # # # # # # # # # # # # # # # # # # 

import sys
import os
import librosa
import numpy as np
from joblib import load
from sklearn import svm
import json

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

# Load the persisted classifier model from input
def loadPersistedClassifier(modelPersistanceFile):
    return load(modelPersistanceFile)

# Predict and output emotion statistics from the input audio file
def makeEmotionalStatisticsPrediction(model, audioFeatures):
    result = model.predict_proba([audioFeatures])[0]
    classesAvailable = model.classes_

    return {"data": list(map(list, zip(classesAvailable, result)))}

def main():

    # Atleast two arguments are required, for the audio file to be inspected and the SER model to use
    if len(sys.argv) >= 3 and ensureFilePath(sys.argv[1]):
        inputAudioFilePath = sys.argv[1]
        modelPersistanceFile = sys.argv[2]
    else:
        sys.stdout.write("No valid argument given, usage: predictSER.py [filePath] [modelPath]")
        return

    # Has the 2 required arguments, proceed with operations
    audioStream, sampleRate = loadInputFile(inputAudioFilePath)
    audioFeatures = audioFeatureExtractionFrom(audioStream, sampleRate)
    model = loadPersistedClassifier(modelPersistanceFile)

    # Predict and output the result via stdout as JSON so 
    # it's accesible through Node.js
    sys.stdout.write(json.dumps(makeEmotionalStatisticsPrediction(model, audioFeatures)))

main()