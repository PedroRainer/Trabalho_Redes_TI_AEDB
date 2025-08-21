# build
FROM mirror.gcr.io/library/golang:1.22 AS build
WORKDIR /src

COPY go.mod ./
RUN go mod tidy

COPY command ./command
COPY main ./main

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/app ./main

# run
FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=build /out/app /app/app
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/app"]
