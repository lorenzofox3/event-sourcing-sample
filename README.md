# event-sourcing-sample

## getting started

1. go in data folder ``cd data``
2. build the db container ``docker build -t es-db .`` (It will have schema, functions, etc packaged)
3. start the db ``source ./start-db.sh``

### data fixture

From the root you can create data fixture using ``node ./scripts/create-fixture.js --csv > data/fixture/sample.csv`` (``node ./scripts/create-fixture.js --help`` for more details)

The database container share the ``data/fixture`` folder with the host.
So you can connect to the DB from inside the container using psql:
1. ``docker exec -it es-dev-db psql dev docker`` (where "test" is the db name used when starting the container and "docker" the username)
2. As you may insert a lot of data, you should first disable the trigger ``ALTER TABLE events DISABLE TRIGGER new_event_created``
3. You should be able to load you data from psql ``\copy events(event_type, event_data) from 'fixture/sample.csv' with delimiter ',' csv header`` 
4. Finally, you can re enable the trigger ``ALTER TABLE events ENABLE TRIGGER new_event_created``

### Updating data

For now, all the updates come from components out of the current system. To simulate such events, you can use one of the scripts listed in the directory [scripts](./scripts)

