# simple-static-server

a simple static server that should only be used for tinkering and development phase, not ready for production use yet.

# steps to run the project

1. install required packages
    * ```npm i ```
2. delete existing files inside public directory and replace them with your static files (html, css, js) inside public directory
3. run the dev server
    * ```npm run dev```
    * server will just restart whenever there are any changes inside public directory
5. navigate to browser and go to 127.0.0.1:8080
6. happy coding!

## how to configure files to work with this server?
* for linking javascript to html
    * add ```<script type="module" src="script.js"></script>```
* for linking css to html
  * add ```<link rel="stylesheet" href="style.css">```

## how to import another javascript file into script.js?
just use ```import funtionName from 'path/to/file.js'```

make sure it ends with `.js` or it won't work

also make sure that path is after public folder

example:
if the file you wanna import exists in /public/hello.js

then in script.js file you need add
```import functionName from './hello.js'```

check the placeholder files in public directory for more on how its done.