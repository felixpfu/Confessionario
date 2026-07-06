# Confessionario TTL

## Rodar localmente em desenvolvimento

Em um terminal:

```sh
npm --prefix server run dev
```

Em outro terminal:

```sh
npm --prefix client run dev
```

Abra o site em:

```txt
http://localhost:5173
```

O endereco `http://localhost:3001` fica reservado para a API durante o desenvolvimento.

## Rodar localmente como producao

```sh
npm run build
npm start
```

Depois abra:

```txt
http://localhost:3001
```

Nesse modo o Express serve o site React ja compilado e tambem a API em `/api`.

## Publicar

Use estes comandos na plataforma de hospedagem:

```txt
Build command: npm run build
Start command: npm start
```

Variaveis recomendadas:

```txt
HOST=0.0.0.0
PORT=<definido pela plataforma>
MESSAGE_STORE=postgres
DATABASE_URL=<url do banco Postgres>
CORS_ORIGIN=<url publica do site>
IP_HASH_SALT=<um valor secreto longo>
```

Para um teste simples sem banco, use `MESSAGE_STORE=memory`, mas as mensagens somem quando o servidor reinicia.
