import os

import httpx
import pybreaker
from tenacity import retry, stop_after_attempt, wait_exponential

MODEL_SERVICE_URL = os.getenv("MODEL_SERVICE_URL", "http://model-service:8000")

breaker = pybreaker.CircuitBreaker(
    fail_max=5,
    reset_timeout=30,
)


class ModelClientError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


def _client() -> httpx.Client:
    return httpx.Client(
        base_url=MODEL_SERVICE_URL,
        timeout=httpx.Timeout(10.0),
    )


def predict(features: dict) -> float:
    data = _call_with_retry("/predict", features)
    return data["predicted_price"]


def _call_with_retry(url: str, payload: dict) -> dict:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    def _do_request() -> dict:
        with _client() as client:
            resp = client.post(url, json=payload)

        if resp.is_error:
            raise ModelClientError(
                status_code=resp.status_code,
                detail=f"model-service {url} failed: {resp.text}",
            )

        return resp.json()

    try:
        return breaker.call(_do_request)
    except pybreaker.CircuitBreakerError:
        raise ModelClientError(
            status_code=503,
            detail="model-service circuit breaker open",
        )
    except (httpx.ConnectError, httpx.TimeoutException, httpx.RemoteProtocolError) as e:
        raise ModelClientError(
            status_code=502,
            detail=f"model-service unreachable: {e}",
        )
