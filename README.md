# SERaaS' API Service

Outputs emotion statistics from audio files containing speech, as an API.

SERaaS is a Final Year Project for [Waterford Institute of Technology](https://www.wit.ie/) developed by [Wei Kit Wong](https://github.com/andyAndyA), which aims to provide a Speech Emotion Recognition as a Web API service. This service is to provide this core deliverable. This is achieved by Machine Learning to build the SER classification model, the [User Management Service](https://github.com/andyAndyA/SERaaS-User-Management-Service) to provide authentication features, and Node.js to deploy it all as a service.

## General

### Technologies Used

Note that when testing the service, these must be installed.

#### Python

* *LibROSA* - Audio Feature Extraction
* *SciKit-Learn* - Machine Learning Model
* *joblib* - Model Persistence

#### JavaScript

* *Node.js* - JavaScript Runtime
* *Swagger.js* - Node.js API Development Tool

#### Other

* *ffmpeg* - File Splitting

## Usage

Note that this service is tightly coupled in its implementation with other SERaaS services, therefore there is little reason to use this other than for testing or learning purposes. The steps below assumes knowledge of Git cloning and installing NPM modules.

### Missing Dependency

##### *User Management Service*

As the service is integrated with the User Management Service, it must also be cloned and ran in order to be able to use this service.

By default, the User Management Service is configured to run at port 4000 and expected here to do so as defined at `api/helpers/userManagementURLS.js`. The file must be changed if it is ran in a different port.

### Missing Files

Note that the following files are missing from the repo, and these must be introduced by yourself in order to run the service;

##### *api/models/classifier.joblib*

This file is the SER model built using scikit-learn, persisted using joblib. Note that when building using the algorithm of your choice, probability estimates must be enabled to support the usage of the `predict_proba` function.

Learn more about building models using scikit-learn at [this](https://scikit-learn.org/stable/tutorial/basic/tutorial.html) article.

##### *tmp/*

This directory is required for running the API endpoint, as this is the directory where temporarily files are made so the SER model can perform emotional analytics on the audio file sent by the user.

##### *test/api/controllers/testingCredentials.js*

This is only required if you're executing the unit tests. In order to use the API endpoint, a registered user ID must be provided as part of the API endpoint. This can be retrieved through registration and authentication using the User Management Service as linked above.

```
module.exports = "yourUserUUID";
```

### Swagger Commands

* *swagger project test* - Runs all the unit tests in `test/api`
* *swagger project start* - Starts the service at port 5000

### API Endpoints

The API endpoints provided by this service can be inspected in `api/swagger/swagger.yaml` file.