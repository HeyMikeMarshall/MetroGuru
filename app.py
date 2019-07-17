import os
import pandas as pd
import numpy as np
import requests, json
from flask import Flask, jsonify, render_template, redirect
from flask_pymongo import PyMongo

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app = Flask(__name__)
mongo = PyMongo(app, uri ="mongodb://ds131737.mlab.com:31737/heroku_2xs5kb65",
                    username='guru_writer', 
                    password='^8aSHN45cV*xj',
                    authSource='heroku_2xs5kb65',
                    authMechanism='SCRAM-SHA-1')



@app.route("/")
def index():
    """Return the homepage."""
    stations = mongo.db.stations.find_one()
    return render_template("index.html", stations=stations)


@app.route("/stations")
def stationlist():
    stations = mongo.db.stations.find()
    result= []
    for station in stations: 
        result.append({"name":station['Name'],
                        "code":station['Code']})
    return jsonify(result)


@app.route("/stations/<code>")
def stationinfo(code):
    station = mongo.db.stations.find({'Code':f"{code}"}) 
    result = {"name":station[0]['Name'],
            "code":station[0]['Code'],
            "address":station[0]['Address'],
            "stationtogether1": station[0]['StationTogether1'],
            "lat": station[0]['Lat'],
            "lng": station[0]['Lon']}

    predict_url = f'https://api.wmata.com/StationPrediction.svc/json/GetPrediction/'
    params = {'api_key': '2936bd0e3513432491fc22451728a327'}
    trains1 = requests.get(f'{predict_url}{code}', params=params).json()
    result['trains1'] = trains1['Trains']

    result['trains2'] = {}
    if station[0]['StationTogether1'] != "":
        code = station[0]['StationTogether1']
        trains2 = requests.get(f'{predict_url}{code}', params=params).json()
        result['trains2'] = trains2['Trains']

    return jsonify(result)



if __name__ == "__main__":
    app.run()
