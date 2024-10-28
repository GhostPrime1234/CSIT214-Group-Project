# Lounge Ops Backend

This is a simple web application built with Flask where customers can book and cancel airline tickets.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Raz200327/airline-ticket-booking.git
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:

   ```bash
   python main.py
   ```

## Features

- User authentication: Users can sign up, log in, and log out.
- Ticket booking: Users can book airline tickets, including return flights.
- Dashboard: Users can view their bookings and cancel them if needed.
- API: Provides access to airline data.

## Usage

- Visit the homepage to sign up or log in.
- Once logged in, you can book tickets by selecting departure and destination cities and choosing a date.
- View your bookings and cancel them on the dashboard.

## Endpoints

- `/` (GET): Homepage
- `/signup` (GET): Sign up page
- `/create-user` (POST): Create a new user
- `/login` (GET): Log in page
- `/login-user` (POST): Log in user
- `/book-tickets` (GET): Book tickets page
- `/api/airlines` (GET): API endpoint to get airline data
- `/book` (POST): Book tickets
- `/dashboard` (GET): User dashboard
- `/cancel-booking/<id>` POST: Cancel a booking
- `/occupancy` (GET): Occupancy page
- `/search-data` (POST): Search available flights


