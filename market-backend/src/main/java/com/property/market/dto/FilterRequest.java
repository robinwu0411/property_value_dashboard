package com.property.market.dto;

import jakarta.validation.constraints.Min;
import java.util.List;

public class FilterRequest {

    private Integer minSquareFootage;
    private Integer maxSquareFootage;
    private Integer minYearBuilt;
    private Integer maxYearBuilt;
    private Integer minLotSize;
    private Integer maxLotSize;
    private Double minDistanceToCityCenter;
    private Double maxDistanceToCityCenter;
    private Double minPrice;
    private Double maxPrice;

    private List<Double> bedrooms;
    private Double minBedrooms;
    private List<Double> bathrooms;
    private Double minBathrooms;
    private Integer minSchoolRating;
    private Integer maxSchoolRating;

    @Min(1)
    private int page = 1;
    @Min(1)
    private int pageSize = 20;

    private String sortBy;
    private String sortOrder;

    public Integer getMinSquareFootage() { return minSquareFootage; }
    public void setMinSquareFootage(Integer minSquareFootage) { this.minSquareFootage = minSquareFootage; }

    public Integer getMaxSquareFootage() { return maxSquareFootage; }
    public void setMaxSquareFootage(Integer maxSquareFootage) { this.maxSquareFootage = maxSquareFootage; }

    public Integer getMinYearBuilt() { return minYearBuilt; }
    public void setMinYearBuilt(Integer minYearBuilt) { this.minYearBuilt = minYearBuilt; }

    public Integer getMaxYearBuilt() { return maxYearBuilt; }
    public void setMaxYearBuilt(Integer maxYearBuilt) { this.maxYearBuilt = maxYearBuilt; }

    public Integer getMinLotSize() { return minLotSize; }
    public void setMinLotSize(Integer minLotSize) { this.minLotSize = minLotSize; }

    public Integer getMaxLotSize() { return maxLotSize; }
    public void setMaxLotSize(Integer maxLotSize) { this.maxLotSize = maxLotSize; }

    public Double getMinDistanceToCityCenter() { return minDistanceToCityCenter; }
    public void setMinDistanceToCityCenter(Double minDistanceToCityCenter) { this.minDistanceToCityCenter = minDistanceToCityCenter; }

    public Double getMaxDistanceToCityCenter() { return maxDistanceToCityCenter; }
    public void setMaxDistanceToCityCenter(Double maxDistanceToCityCenter) { this.maxDistanceToCityCenter = maxDistanceToCityCenter; }

    public Double getMinPrice() { return minPrice; }
    public void setMinPrice(Double minPrice) { this.minPrice = minPrice; }

    public Double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }

    public List<Double> getBedrooms() { return bedrooms; }
    public void setBedrooms(List<Double> bedrooms) { this.bedrooms = bedrooms; }

    public Double getMinBedrooms() { return minBedrooms; }
    public void setMinBedrooms(Double minBedrooms) { this.minBedrooms = minBedrooms; }

    public List<Double> getBathrooms() { return bathrooms; }
    public void setBathrooms(List<Double> bathrooms) { this.bathrooms = bathrooms; }

    public Double getMinBathrooms() { return minBathrooms; }
    public void setMinBathrooms(Double minBathrooms) { this.minBathrooms = minBathrooms; }

    public Integer getMinSchoolRating() { return minSchoolRating; }
    public void setMinSchoolRating(Integer minSchoolRating) { this.minSchoolRating = minSchoolRating; }

    public Integer getMaxSchoolRating() { return maxSchoolRating; }
    public void setMaxSchoolRating(Integer maxSchoolRating) { this.maxSchoolRating = maxSchoolRating; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortOrder() { return sortOrder; }
    public void setSortOrder(String sortOrder) { this.sortOrder = sortOrder; }
}
