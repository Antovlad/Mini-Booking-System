Mini Booking System

A mini full-stack booking system built with Spring Boot (REST API) and a React frontend, using PostgreSQL for persistence. Designed as a portfolio project that demonstrates clean backend structure (controller/service/repository), validations, and a simple UI consuming the API.

✨ Features

Rooms management (create/list)

Bookings management (create/list/cancel)

Availability checking (based on time intervals)

Global error handling + validation

PostgreSQL persistence

🧰 Tech Stack

Backend

Java + Spring Boot

Spring Data JPA

PostgreSQL

Frontend

React (Vite)

Fetch/Axios-style API calls (depending on implementation)

DevOps

Docker + Docker Compose

📦 Requirements

Docker Desktop (with docker compose)

Optional (for local dev without Docker):

Node.js (v18+ recommended)

JDK (matching the project config)

🚀 Run with Docker (recommended)
1️⃣ Start PostgreSQL + Backend

From the repository root (where docker-compose.yml is):

docker compose up -d --build


This should start:

PostgreSQL (container)

Backend API (container)

2️⃣ Verify backend is running

Open:

http://localhost:8080

Or test an endpoint (example):

curl http://localhost:8080/api/rooms

3️⃣ Stop containers
docker compose down


To also remove DB volume data:

docker compose down -v

