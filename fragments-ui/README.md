# CCP555-2025F-NSC-Janice-Kang-jkang108-Lab2

A simple web app using Node.js and Parcel that connects to AWS Cognito for authentication and provides a basic UI to test the Fragments microservice.

## Docker

The UI ships as a static site. Build and run the nginx-hosted container:

```bash
docker build -t fragments-ui .
docker run --rm -p 8081:80 fragments-ui
```

The Parcel build happens in the first stage, and the final stage only contains the static assets served by nginx.
