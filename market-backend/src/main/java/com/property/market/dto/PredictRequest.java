package com.property.market.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PredictRequest {

    @JsonProperty("square_footage")
    private int squareFootage;

    private double bedrooms;

    private double bathrooms;

    @JsonProperty("year_built")
    private int yearBuilt;

    @JsonProperty("lot_size")
    private int lotSize;

    @JsonProperty("distance_to_city_center")
    private double distanceToCityCenter;

    @JsonProperty("school_rating")
    private double schoolRating;

    public PredictRequest() {}

    public PredictRequest(int squareFootage, double bedrooms, double bathrooms,
                          int yearBuilt, int lotSize, double distanceToCityCenter,
                          double schoolRating) {
        this.squareFootage = squareFootage;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.yearBuilt = yearBuilt;
        this.lotSize = lotSize;
        this.distanceToCityCenter = distanceToCityCenter;
        this.schoolRating = schoolRating;
    }

    public int getSquareFootage() { return squareFootage; }
    public void setSquareFootage(int squareFootage) { this.squareFootage = squareFootage; }

    public double getBedrooms() { return bedrooms; }
    public void setBedrooms(double bedrooms) { this.bedrooms = bedrooms; }

    public double getBathrooms() { return bathrooms; }
    public void setBathrooms(double bathrooms) { this.bathrooms = bathrooms; }

    public int getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(int yearBuilt) { this.yearBuilt = yearBuilt; }

    public int getLotSize() { return lotSize; }
    public void setLotSize(int lotSize) { this.lotSize = lotSize; }

    public double getDistanceToCityCenter() { return distanceToCityCenter; }
    public void setDistanceToCityCenter(double distanceToCityCenter) { this.distanceToCityCenter = distanceToCityCenter; }

    public double getSchoolRating() { return schoolRating; }
    public void setSchoolRating(double schoolRating) { this.schoolRating = schoolRating; }
}
