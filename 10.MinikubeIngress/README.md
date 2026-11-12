# Minikube NGINX Ingress exercise

This exercise routes one host to two Pods by URL path:

- `http://chandan.com/v1` -> `app1-service` -> `app1` -> `hello world 1`
- `http://chandan.com/v2` -> `app2-service` -> `app2` -> `hello world 2`

Files:

- `pods.yaml`: two echo-server Pods listening on port 8000
- `services.yaml`: two internal ClusterIP Services
- `ingress.yaml`: NGINX path-based routing for `chandan.com`

Do not run Docker Compose for this exercise. Kubernetes pulls the echo-server image itself.
