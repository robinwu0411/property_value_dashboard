package com.property.market.dto;

public class PropertyResponse {

    private Long id;
    private int squareFootage;
    private double bedrooms;
    private double bathrooms;
    private int yearBuilt;
    private int lotSize;
    private double distanceToCityCenter;
    private double schoolRating;
    private double price;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
