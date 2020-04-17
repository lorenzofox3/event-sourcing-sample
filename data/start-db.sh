#usr/bin/sh
docker run --name sample-test -v $PWD/fixture:/fixture -p 5432:5432 --env-file ../.env sample-db
