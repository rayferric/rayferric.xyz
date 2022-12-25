# rayferric.xyz

🦊 My personal webpage.

## Prerequisites

- 🐋 [Docker Compose](https://docs.docker.com/compose)
- 🔗 [NodeJS](https://nodejs.org)
- 🐈 [Yarn](https://yarnpkg.com)

## Getting Started

### Initializing the Database

PostgreSQL data is not committed directly to the repository, because it takes a lot of space.
The data is stored as a PostgreSQL dump that must be restored with the following command:

```sh
$ yarn postgres-restore
```

Similarly, before committing to the repository, the database should be dumped:

```sh
$ yarn postgres-dump
```

### Deployment

To start up a production server, use:

```sh
$ yarn deploy
```

Then configure your reverse proxy to point to `localhost:3000`.
This server is broadcasted only on the loopback interface and thus is not accessible from other devices on the same network.
You can alter this behavior by modifying [docker-compose.yml](./docker-compose.yml).

The administrator authorization panel can be found under the `/admin` endpoint. The default password is `root`.

### Development

To start up a development server, use:

```sh
$ yarn dev
```

Create another terminal for your own use and leave the previous one untouched. NextJS logs and errors will show up in there.

The development server will become accessible as `localhost:3000`.
Contrary to production, this server will be broadcasted on every network interface.
PostgreSQL database and MinIO object storage can be accessed from host by [finding the IP addresses](#how-to-find-ip-addresses-of-docker-containers) of their respective containers.

The Postgres' credentials are already stored in pgAdmin which does not require further authorization. The login for the MinIO console available on port `9001` is `minioadmin`, password is the same.

More information about the credentials can be found in [docker-compose.yml](./docker-compose.yml).

### Committing to The Repository

Before committing to the repository, data directories will have invalid permissions.
To overcome this issue, run the following commands as root:

```sh
$ yarn stop
$ sudo chown -R $USER ./data
$ sudo chgrp -R $USER ./data

$ git add .
...

# pgAdmin directory must be reverted to the previous state
# Otherwise pgAdmin will reset its configuration on startup
$ sudo chown -R 5050:5050 ./data/pgadmin

# Other services i.e. Postgres and MinIO should reclaim their permissions automatically
```

Beware that you should not commit the ./data directory if you did not alter the data.
Some runtime files are being modified in there all the time, but those changes should never be committed unless explicitly needed.
You can stage all files except for the data using the following command:

```sh
$ git add -- . ':!./data'
```

### Patching pgAdmin

When initializing the development environment, pgAdmin service might refuse to start.
It is not vital for development but might sometimes come in handy.
If that is the case, it is most probably caused by invalid permissions of its data volume.
You can fix that up using the below command:

```sh
$ sudo chown -R 5050:5050 ./data/pgadmin
```

## Miscellaneous Utilities and Information

## API Routes

The backend exposes a substantial number of REST-compatible API routes:

```http
GET /api/featured - featured posts (JSON)
POST /api/featured - set featured posts
GET /api/posts[?search={query}] - all posts (optionally ordered by query) (JSON)
GET /api/posts/{id} - single post + content (JSON)
POST /api/posts/{id} - alter single post + content (JSON)
DELETE /api/posts/{id} - delete a post
GET /api/posts/{id}/{file} - file in the post's directory ("cover" is used to identify the cover image)
DELETE /api/posts/{id}/{file} - delete a file
PUT /api/posts/{id}/{file} - upload/replace a file
POST /api/posts/{id}/{file} - rename a file
POST /api/sign-in - acquire a session
POST /api/sign-out - remove the session
GET /api/validate-session - validate a session
POST /api/change-password - change the password
```

### How to Find IP Addresses of Docker Containers

All containers except for the NextJS server are run in an isolated network so they will not collide with other instances of those services that might be running on the host. This results in a rather nasty requirement of finding the ephemeral IP address of each container we want to access from the host network. It is done by using the following commands:

```sh
$ sudo docker network ls
NETWORK ID     NAME                   DRIVER    SCOPE
...
...   rayferricxyz_default   bridge    local

$ sudo docker network inspect rayferricxyz_default
...
"Containers": {
    "...": {
        "Name": "rayferricxyz-postgres-1",
        ...
        "IPv4Address": "172.28.0.1/16",
    },
    ...
}
...
```

### How to Dump and Restore PostgreSQL Database

In order to dump or restore the containerized database from the host, you can use those commands:

```sh
# -j - number of threads
# -Fd - custom (binary) partitioned format
# -Z0 - no compression
$ pg_dump --host={IP address assigned by Docker} --dbname=rayferric.xyz --port=5432 --username=postgres -Z0 -j 8 -Fd -f ./dump
# -O - reset ownership of objects
# -c - drop old objects before restoring
$ pg_restore --host={IP address assigned by Docker} --dbname=rayferric.xyz --port=5432 --username=postgres -c -j 8 -Fd -O ./dump
```

However, keep in mind that `yarn postgres-dump` and `yarn postgres-restore` should be used instead.

## About

### Tech Stack

- 🐋 Docker
- 📰 Markdown
- 💾 MinIO
- 🔺 NextJS
- 🔗 NodeJS
- 🗃️ PostgreSQL
- 🎛️ pgAdmin
- ⚛️ ReactJS
- ☁️ REST
- 🌠 TypeScript
- 🐈 Yarn

### Authors

- Ray Ferric ([rayferric](https://github.com/rayferric))

### License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
