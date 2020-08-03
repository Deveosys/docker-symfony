# Docker symfony

## Usage

```
git clone git@github.com:Deveosys/docker-symfony.git
```

### Setup

With yarn

```
yarn
yarn setup
```

With npm

```
npm install
npm run setup
```

## Dev

I recommand using symfony server for development.
In app/ directory :

```
symfony server:start
yarn watch
```

**If you want to test the docker setup on localhost :**

-   Add port binding on `docker-compose.yml` file under nginx donfiguration:

```
my_app_nginx:
    ...
    ports:
        - 8080:80
```

-   Then build container

```
yarn build
```

## Production

```
yarn build
```
