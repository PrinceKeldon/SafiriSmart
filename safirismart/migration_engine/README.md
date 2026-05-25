# SafiriSmart Migration Engine

FastAPI service for the Great Migration probability score and public tracking API.

## Run

```bash
PYTHONPATH=. uvicorn safirismart.migration_engine.app.main:app --reload
```

## Test

```bash
PYTHONPATH=. pytest safirismart/migration_engine/tests/test_scoring.py -v
```

## Endpoints

- `GET /health`
- `GET /migration/score`
- `GET /migration/score/history`
- `GET /migration/phase`
- `POST /migration/score/refresh`
- `POST /migration/signals/manual`

Internal `POST` endpoints require the `x-service-key` header. Set `MIGRATION_SERVICE_KEY` in production.
