#!/usr/bin/env python3
import argparse
import pymongo


parser = argparse.ArgumentParser(
    description='Setup MongoDB collection for records with indices')

parser.add_argument('-mh', '--mongo_host', dest='mongo_host', action='store', default='localhost',
                    help='specify the mongo host uri')

parser.add_argument('-mp', '--mongo_port', dest='mongo_port', action='store', default=27017,
                    help='specify the mongo host port')

parser.add_argument('-mdb', '--mongo_database', dest='mongo_database', action='store', default='bdr',
                    help='specify the mongo database')

args = parser.parse_args()


client = pymongo.MongoClient(args.mongo_host, args.mongo_port)
db = client[args.mongo_database]
forges = db['forges']  # create forges collection
# have to create an index or insert something to create the collection.
forges.create_index("name")
forgegraphs = db['forgegraphs']  # create metagraphs collection
# Forgegraph indices?
metagraphs = db['metagraphs']  # create metagraphs collection
# Metagraph indices?
