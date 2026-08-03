package com.property.market.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@Document(indexName = "properties")
public class PropertyDocument {

    @Id
    private Long id;

    @Field(type = FieldType.Integer, name = "square_footage")
    private int squareFootage;

    @Field(type = FieldType.Float, name = "bedrooms")
    private double bedrooms;

    @Field(type = FieldType.Float, name = "bathrooms")
    private double bathrooms;

    @Field(type = FieldType.Integer, name = "year_built")
    private int yearBuilt;

    @Field(type = FieldType.Integer, name = "lot_size")
    private int lotSize;

    @Field(type = FieldType.Float, name = "distance_to_city_center")
    private double distanceToCityCenter;

    @Field(type = FieldType.Float, name = "school_rating")
    private double schoolRating;

    @Field(type = FieldType.Float, name = "price")
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
