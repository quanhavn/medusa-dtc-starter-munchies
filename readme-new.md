
```
docker compose up -d
```

```
cp backend/.env.template backend/.env
```

```
cd backend

yarn

yarn medusa user --email admin@bepnhasun.com --password admin

```


create publisable key
```
http://localhost:9000/app/settings/publishable-api-keys/create
```


```
cd storefront
sudo corepack enable pnpm
corepack use pnpm@latest-10

pnpm install
pnpm dev
pnpm sanity login
pnpm sanity deploy

```
