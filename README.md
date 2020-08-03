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

If you want to test the docker setup (in root directory) :

```
yarn build -p 8089:80
```

## Production

```
yarn build
```
