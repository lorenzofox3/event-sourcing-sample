# event-sourcing-sample

## getting started

1. go in data folder ``cd data``
2. build the db container ``docker build -t sample-db .`` (It will have schema, functions, etc packaged)
3. start the db ``source ./start-db.sh``

### data fixture

From the root you can create data fixture using ``node ./scripts/feed-db.js --csv > data/fixture/sample.csv`` (``node ./scripts/feed-db.js --help`` for more details)

The database container share the ``data/fixture`` folder with the host.
So you can connect to the DB from inside the container using psql:
1. ``docker exec -it sample-test bash`` will open a bash session inside the container.
2. then you can use psql running ``psql test docker`` (where "test" is the db name used when starting the container and "docker" the username)
3. finally, should be able to load you data from psql ``\copy events(event_type, event_data) from 'fixture/sample.csv' with delimiter ',' csv header`` 





