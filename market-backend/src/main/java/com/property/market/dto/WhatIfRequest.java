package com.property.market.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class WhatIfRequest {

    @NotNull @Positive @Max(50000)
    private Integer squareFootage;

    @NotNull @Positive @Max(20)
    private Double bedrooms;

    @NotNull @Positive @Max(10)
    private Double bathrooms;

    @NotNull @Min(1800) @Max(2030)
    private Integer yearBuilt;

    @NotNull @Positive @Max(50000)
    private Integer lotSize;

    @NotNull @Positive @Max(100)
    private Double distanceToCityCenter;

    @NotNull @Min(1) @Max(10)
    private Double schoolRating;

    public Integer getSquareFootage() { return squareFootage; }
    public void setSquareFootage(Integer squareFootage) { this.squareFootage = squareFootage; }

    public Double getBedrooms() { return bedrooms; }
    public void setBedrooms(Double bedrooms) { this.bedrooms = bedrooms; }

    public Double getBathrooms() { return bathrooms; }
    public void setBathrooms(Double bathrooms) { this.bathrooms = bathrooms; }

    public Integer getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(Integer yearBuilt) { this.yearBuilt = yearBuilt; }

    public Integer getLotSize() { return lotSize; }
    public void setLotSize(Integer lotSize) { this.lotSize = lotSize; }

    public Double getDistanceToCityCenter() { return distanceToCityCenter; }
    public void setDistanceToCityCenter(Double distanceToCityCenter) { this.distanceToCityCenter = distanceToCityCenter; }

    public Double getSchoolRating() { return schoolRating; }
    public void setSchoolRating(Double schoolRating) { this.schoolRating = schoolRating; }
}
