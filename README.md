# event-sourcing-sample

## getting started

1. go in data folder ``cd data``
2. build the db container ``docker build -t sample-db .`` (It will have schema, functions, etc packaged)
3. start the db ``source ./start-db.sh``

You can connect to the DB from inside the container using psql

``docker exec -it sample-test bash`` will open a bash session inside the container

And then you use psql running ``psql test docker`` (where "test" is the db name used when starting the container and "docker" the username)




