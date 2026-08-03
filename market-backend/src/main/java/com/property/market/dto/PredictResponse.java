package com.property.market.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PredictResponse {

    @JsonProperty("predicted_price")
    private double predictedPrice;

    public double getPredictedPrice() { return predictedPrice; }
    public void setPredictedPrice(double predictedPrice) { this.predictedPrice = predictedPrice; }
}
