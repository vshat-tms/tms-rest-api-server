# tms-rest-api-server

# API
Методы:

`GET /users`

Опциональные параметры: 
- `orderBy` (`“name_asc”, “name_desc”`) - порядок сортировки
- `query` (`String`) - поиск по имени

Примеры:
- `/users?orderBy=name_asc&query=elisa`
- `/users?orderBy=name_desc`
- `/users?query=elisa`

`POST /users`

`GET /users`

`GET /users/{id}`

`PUT /users/{id}`

`DELETE /users/{id}`

Каждый запрос также поддерживает query параметр delay, который просит сервер задержать ответ на n секунд. Примеры:
- `GET /users?orderBy=name_asc&query=elisa&delay=1`
- `GET /users/2?delay=2`


## Запуск

Run app via `node`
```shell
node index.js
```

## Heroku deployment

### Tutorial
[Getting started with nodejs](https://devcenter.heroku.com/articles/getting-started-with-nodejs)

[Deploying via git](https://devcenter.heroku.com/articles/git)

### Create an app
```shell
heroku create
```

### Or add remote to the exising one
```shell
heroku git:remote -a example-app
```

### Deploy app to Heroku
```shell
git push heroku main
```

### Open app in browser
```shell
heroku open
```