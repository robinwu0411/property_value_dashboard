package com.property.market.dto;

import java.util.List;
import java.util.Map;

public class MarketStatsResponse {

    private long totalProperties;
    private double avgPrice;
    private double medianPrice;
    private double minPrice;
    private double maxPrice;
    private double avgSquareFootage;
    private double avgYearBuilt;
    private double avgLotSize;
    private double avgDistanceToCityCenter;
    private double avgSchoolRating;
    private Map<String, Double> avgPriceByBedrooms;
    private Map<String, Long> propertyCountByYearRange;
    private List<PriceRangeBucket> priceDistribution;

    public long getTotalProperties() { return totalProperties; }
    public void setTotalProperties(long totalProperties) { this.totalProperties = totalProperties; }

    public double getAvgPrice() { return avgPrice; }
    public void setAvgPrice(double avgPrice) { this.avgPrice = avgPrice; }

    public double getMedianPrice() { return medianPrice; }
    public void setMedianPrice(double medianPrice) { this.medianPrice = medianPrice; }

    public double getMinPrice() { return minPrice; }
    public void setMinPrice(double minPrice) { this.minPrice = minPrice; }

    public double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(double maxPrice) { this.maxPrice = maxPrice; }

    public double getAvgSquareFootage() { return avgSquareFootage; }
    public void setAvgSquareFootage(double avgSquareFootage) { this.avgSquareFootage = avgSquareFootage; }

    public double getAvgYearBuilt() { return avgYearBuilt; }
    public void setAvgYearBuilt(double avgYearBuilt) { this.avgYearBuilt = avgYearBuilt; }

    public double getAvgLotSize() { return avgLotSize; }
    public void setAvgLotSize(double avgLotSize) { this.avgLotSize = avgLotSize; }

    public double getAvgDistanceToCityCenter() { return avgDistanceToCityCenter; }
    public void setAvgDistanceToCityCenter(double avgDistanceToCityCenter) { this.avgDistanceToCityCenter = avgDistanceToCityCenter; }

    public double getAvgSchoolRating() { return avgSchoolRating; }
    public void setAvgSchoolRating(double avgSchoolRating) { this.avgSchoolRating = avgSchoolRating; }

    public Map<String, Double> getAvgPriceByBedrooms() { return avgPriceByBedrooms; }
    public void setAvgPriceByBedrooms(Map<String, Double> avgPriceByBedrooms) { this.avgPriceByBedrooms = avgPriceByBedrooms; }

    public Map<String, Long> getPropertyCountByYearRange() { return propertyCountByYearRange; }
    public void setPropertyCountByYearRange(Map<String, Long> propertyCountByYearRange) { this.propertyCountByYearRange = propertyCountByYearRange; }

    public List<PriceRangeBucket> getPriceDistribution() { return priceDistribution; }
    public void setPriceDistribution(List<PriceRangeBucket> priceDistribution) { this.priceDistribution = priceDistribution; }

    public static class PriceRangeBucket {
        private String range;
        private long count;

        public PriceRangeBucket() {}

        public PriceRangeBucket(String range, long count) {
            this.range = range;
            this.count = count;
        }

        public String getRange() { return range; }
        public void setRange(String range) { this.range = range; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}
