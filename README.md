# Resumable File Upload

This project is the result of my learning from the [Resumable Upload course by Imre Nagi](https://courses.imrenagi.com/implementing-resumable-upload). The course was originally implemented using the Go programming language, but I decided to reimplement it in Node.js using the NestJS framework. On the client side, I used React with Vite, and Tailwind CSS for styling. Both applications already have Docker images published to the GitHub Container Registry, so you don't have to set anything up manually if you'd like to try it out.


## Run application with docker compose

First, download the docker-compose.yml by run this command

```
curl https://raw.githubusercontent.com/egiiputra/resumable-upload/refs/heads/main/docker-compose.yml -o docker-compose.yml
```

Then, run docker compose with yml file that downloaded
```
docker compose -f ./docker-compose.yml up
```

The client application can be accessed at [http:/localhost]. The REST application is well-documented using OpenAPI and Swagger. You can access the documentation at [http://localhost:3000/docs].