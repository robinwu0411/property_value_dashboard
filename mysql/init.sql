CREATE DATABASE IF NOT EXISTS estimator;
USE estimator;

CREATE TABLE IF NOT EXISTS prediction_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    square_footage INT NOT NULL,
    bedrooms DECIMAL(3,1) NOT NULL,
    bathrooms DECIMAL(3,1) NOT NULL,
    year_built INT NOT NULL,
    lot_size INT NOT NULL,
    distance_to_city_center DECIMAL(5,2) NOT NULL,
    school_rating DECIMAL(3,1) NOT NULL,
    predicted_price DECIMAL(12,2) NOT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_features (square_footage, bedrooms, bathrooms, year_built, lot_size, distance_to_city_center, school_rating)
);
