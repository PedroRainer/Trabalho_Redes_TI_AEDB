# build
FROM mirror.gcr.io/library/golang:1.22 AS build
WORKDIR /src

# copie os manifests
COPY go.mod ./

# copie o código antes de "tidy"
COPY command ./command
COPY main ./main

# resolve dependências e gera go.sum
RUN go mod tidy

# compila
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/app ./main

# run
FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=build /out/app /app/app
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/app/app"]
