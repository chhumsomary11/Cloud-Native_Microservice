# Student Management System - Final Lab

This project contains three Node.js microservices:

- API Gateway (`4000`): the only public entry point.
- Registration Service (`5001`): creates a student and hashes the password.
- Login Service (`5002`): checks the password and returns a JWT.

## Request flow

`Postman -> api-gateway-service -> API Gateway -> Registration or Login -> MongoDB`

Pod 1 contains the API Gateway and Registration containers. The Gateway reaches
Registration at `http://localhost:5001`. Pod 2 contains Login. The Gateway reaches
it through Kubernetes DNS at `http://login-service:5002`.

## API requests

Register:

```http
POST /api/students/register
Content-Type: application/json

{
  "student_id": "STU001",
  "student_name": "Loeung Chhumso Mary",
  "student_mobile": "012345678",
  "student_email": "mary@example.com",
  "student_password": "Password123"
}
```

Login:

```http
POST /api/students/login
Content-Type: application/json

{
  "student_email": "mary@example.com",
  "student_password": "Password123"
}
```

## 1. Build and push Docker images

Replace `YOUR_DOCKERHUB_USERNAME` in these commands and in
`kubernetes/pods.yaml`:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/student-api-gateway:v1 ./api-gateway
docker build -t YOUR_DOCKERHUB_USERNAME/student-registration-service:v1 ./registration-service
docker build -t YOUR_DOCKERHUB_USERNAME/student-login-service:v1 ./login-service

docker push YOUR_DOCKERHUB_USERNAME/student-api-gateway:v1
docker push YOUR_DOCKERHUB_USERNAME/student-registration-service:v1
docker push YOUR_DOCKERHUB_USERNAME/student-login-service:v1
```

For an x86-64 target from an Apple Silicon Mac, use
`docker buildx build --platform linux/amd64 --push` instead.

## 2. Create the Kubernetes Secret

Do not commit a real database password or JWT secret. Create the Secret directly:

```bash
kubectl create secret generic student-app-secrets \
  --from-literal=MONGODB_URI='YOUR_MONGODB_ATLAS_URI' \
  --from-literal=JWT_SECRET='YOUR_LONG_RANDOM_SECRET'
```

`kubernetes/secret.example.yaml` is only a template for the screenshot.

## 3. Deploy to Minikube

```bash
minikube start --driver=docker
kubectl apply -f kubernetes/pods.yaml
kubectl apply -f kubernetes/services.yaml
kubectl get pods
kubectl get services
```

Both Deployments use one replica, so Kubernetes creates exactly two application
Pods. Wait until both show `Running`; Pod 1 should show `2/2` ready and Pod 2
should show `1/1` ready.

## 4. Get the Gateway URL and test

```bash
minikube service api-gateway-service --url
```

Copy that URL into the Postman collection variable `gatewayUrl`, register first,
then login with the same email and password. All Postman requests must use the
Gateway URL, never ports `5001` or `5002` directly.

Useful checks:

```bash
kubectl get pods,services
kubectl get endpoints login-service
kubectl logs deployment/gateway-registration -c api-gateway
kubectl logs deployment/gateway-registration -c registration-service
kubectl logs deployment/login -c login-service
```

## Screenshot checklist

1. Code for all three services.
2. Three Dockerfiles.
3. `kubernetes/pods.yaml` showing both containers in Pod 1 and Login in Pod 2.
4. `kubernetes/services.yaml`.
5. Registration request/response in Postman and the MongoDB `students` record.
6. Login request/response in Postman showing the returned token.
7. GitHub repository page and URL.

In the database screenshot, the `student_password` value should be a bcrypt hash,
not the original password.
