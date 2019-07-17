import requests, json, threading
from pymongo import MongoClient

# Get updated rail and bus incidents every 30 seconds and upsert to MongoDB

def getincidents ():
    threading.Timer(30.0, getincidents).start()
    
    params = {'api_key': '2936bd0e3513432491fc22451728a327'}
    apiurl = 'https://api.wmata.com/Incidents.svc/json/Incidents'

    response = requests.get(apiurl, params=params).json()

    client = MongoClient('ds131737.mlab.com', 31737, 
                         username='guru_writer', 
                         password='^8aSHN45cV*xj',
                         authSource='heroku_2xs5kb65',
                         authMechanism='SCRAM-SHA-1')
    db = client['heroku_2xs5kb65']
    collection = db['incidents_rail']

    for incident in response['Incidents']:
        collection.update_one(incident, {'$set':incident}, upsert=True)  

    client.close()
    
    params = {'api_key': '2936bd0e3513432491fc22451728a327'}
    apiurl = 'https://api.wmata.com/Incidents.svc/json/BusIncidents'

    response = requests.get(apiurl, params=params).json()

    client = MongoClient('ds131737.mlab.com', 31737,
                        username='guru_writer', 
                        password='^8aSHN45cV*xj',
                        authSource='heroku_2xs5kb65',
                        authMechanism='SCRAM-SHA-1')
    db = client['heroku_2xs5kb65']
    collection = db['incidents_bus']


    for incident in response['BusIncidents']:
        collection.update_one(incident, {'$set':incident}, upsert=True)  

    client.close()
    
getincidents()