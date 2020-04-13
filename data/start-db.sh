#usr/bin/sh
docker run --rm --name sample-test -v $PWD/fixture:/fixture --env-file ../.env sample-db
