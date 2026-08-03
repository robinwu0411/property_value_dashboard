package com.property.market.dao;

import com.property.market.model.PropertyDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface PropertyDao extends ElasticsearchRepository<PropertyDocument, Long> {
}
