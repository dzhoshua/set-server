Сервер на node.js с использованием фреймворка express

Отладка сервера проводилась через Insomnia
## Реализованные функции
- регистрация (/user/register)
- получение списка карт (/set/field)
- взятие сета (/set/pick)
- подсчёт очков каждого игрока (/set/score)

##  VS Code + Insomnia
Создать папку и и файл. Скопировать в файл код из app.js

При вызове npm init в entry point: (index.js) прописать название вашего файла
```
npm init
npm install express
npm install rand-token --save
node app.js
```
В Insomnia выбрать POST  и вставить адресс http://localhost:3000
