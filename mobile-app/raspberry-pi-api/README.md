# AutoPulse Flask API

This Flask application serves as a backend API to receive telemetry data from a Raspberry Pi and serve it to the AutoPulse mobile application. It connects to a Supabase database to store and retrieve data.

## Setup

### 1. Prerequisites
- Python 3.8+
- A Supabase project

### 2. Installation
Clone the repository and navigate into the `raspberry-pi-api` directory.

Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

Install the required dependencies:
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
You need to provide your Supabase credentials. Rename the `.env.example` file to `.env` and add your project's URL and service key.

```
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_KEY="YOUR_SUPABASE_SERVICE_KEY"
```
**Note:** The `SERVICE_KEY` has admin privileges and should be kept secret. Do not expose it on the client-side.

### 4. Running the Application

#### Development Server
To run the app in development mode (with debugging enabled):
```bash
flask run
```
The API will be available at `http://127.0.0.1:5000`.

#### Production Server
For a production environment, it is recommended to use a WSGI server like Gunicorn:
```bash
gunicorn --bind 0.0.0.0:8000 app:app
```

## API Endpoints

### `POST /log`
Receives a JSON payload of telemetry data from the Raspberry Pi and logs it to the `telemetry_data` table in Supabase.

- **Method:** `POST`
- **Body (JSON):**
  ```json
  {
    "vehicle_id": "your-vehicle-uuid",
    "rpm": 2500,
    "speed": 65,
    "coolant_temp": 88.5,
    "engine_load_pct": 45.8,
    // ... and all other sensor fields
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "new-row-uuid",
        ...
      }
    ]
  }
  ```
- **Error Response (400, 500):**
  ```json
  {
    "error": "Error message description"
  }
  ```

### `GET /data/latest`
Retrieves the most recent entry from the `telemetry_data` table.

- **Method:** `GET`
- **Success Response (200):** A JSON object representing the latest telemetry row.
- **Error Response (404):** If no data is found.

### `GET /logs`
Retrieves a list of historical logs from the `logs` table. Can be filtered by severity.

- **Method:** `GET`
- **Query Parameters:**
  - `severity` (optional): Filter logs by severity level (e.g., `warning`, `advisory`). If omitted or set to `all`, returns all logs.
- **Success Response (200):** An array of log objects.
