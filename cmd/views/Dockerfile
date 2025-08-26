# syntax=docker/dockerfile:1
FROM golang:1.22-alpine AS build
WORKDIR /src
RUN apk add --no-cache ca-certificates
COPY . .
RUN go build -o /out/views ./main

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=America/Sao_Paulo
COPY --from=build /out/views /usr/local/bin/views
EXPOSE 1234
CMD ["views"]
