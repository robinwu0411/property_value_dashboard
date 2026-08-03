package com.property.market.client;

import com.property.market.dto.PredictRequest;
import com.property.market.dto.PredictResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;



@Service
public class ModelClient {

    private static final Logger log = LoggerFactory.getLogger(ModelClient.class);
    private final RestTemplate restTemplate;
    private final String modelServiceUrl;

    public ModelClient(RestTemplate modelRestTemplate,
                       @Value("${model-service.url}") String modelServiceUrl) {
        this.restTemplate = modelRestTemplate;
        this.modelServiceUrl = modelServiceUrl;
    }

    @CircuitBreaker(name = "model-service", fallbackMethod = "predictFallback")
    public double predict(PredictRequest request) {
        PredictResponse response = restTemplate.postForObject(
                modelServiceUrl + "/predict", request, PredictResponse.class);
        return response.getPredictedPrice();
    }

    private double predictFallback(PredictRequest request, Throwable t) {
        log.error("model-service /predict failed (circuit open): {}", t.getMessage());
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Model service unavailable", t);
    }
}
