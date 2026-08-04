package com.property.market.service;

import com.property.market.client.ModelClient;
import com.property.market.dto.FilterRequest;
import com.property.market.dto.BreakdownPageResponse;
import com.property.market.dto.WhatIfRequest;
import com.property.market.dto.WhatIfResponse;
import com.property.market.model.PropertyDocument;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketServiceTest {

    @Mock
    private ElasticsearchOperations es;

    @Mock
    private ModelClient modelClient;

    @InjectMocks
    private MarketService marketService;

    private PropertyDocument doc() {
        PropertyDocument doc = new PropertyDocument();
        doc.setId(1L);
        doc.setSquareFootage(2000);
        doc.setBedrooms(3);
        doc.setBathrooms(2);
        doc.setYearBuilt(2010);
        doc.setLotSize(5000);
        doc.setDistanceToCityCenter(5.0);
        doc.setSchoolRating(8.0);
        doc.setPrice(350000);
        return doc;
    }

    @SuppressWarnings("unchecked")
    @Test
    void getBreakdown_shouldReturnPagedResults() {
        PropertyDocument doc = doc();
        SearchHit<PropertyDocument> hit = (SearchHit<PropertyDocument>) mock(SearchHit.class);
        when(hit.getContent()).thenReturn(doc);

        SearchHits<PropertyDocument> searchHits = (SearchHits<PropertyDocument>) mock(SearchHits.class);
        when(searchHits.getTotalHits()).thenReturn(1L);
        when(searchHits.getSearchHits()).thenReturn(List.of(hit));

        when(es.search(any(NativeQuery.class), eq(PropertyDocument.class)))
                .thenReturn(searchHits);

        FilterRequest filter = new FilterRequest();
        filter.setPage(1);
        filter.setPageSize(20);

        BreakdownPageResponse result = marketService.getBreakdown(filter);

        assertThat(result.getTotal()).isEqualTo(1L);
        assertThat(result.getItems()).hasSize(1);
        assertThat(((com.property.market.dto.PropertyResponse) result.getItems().get(0)).getPrice()).isEqualTo(350000);
        assertThat(result.getPage()).isEqualTo(1);
    }

    @SuppressWarnings("unchecked")
    @Test
    void getBreakdown_shouldApplyFilters() {
        SearchHits<PropertyDocument> searchHits = (SearchHits<PropertyDocument>) mock(SearchHits.class);
        when(searchHits.getTotalHits()).thenReturn(0L);
        when(searchHits.getSearchHits()).thenReturn(List.of());
        when(es.search(any(NativeQuery.class), eq(PropertyDocument.class)))
                .thenReturn(searchHits);

        FilterRequest filter = new FilterRequest();
        filter.setMinPrice(200000d);
        filter.setMaxPrice(500000d);
        filter.setBedrooms(List.of(3d, 4d));

        BreakdownPageResponse result = marketService.getBreakdown(filter);
        assertThat(result.getTotal()).isEqualTo(0L);
        assertThat(result.getItems()).isEmpty();
    }

    @SuppressWarnings("unchecked")
    @Test
    void exportCsv_shouldReturnBytes() {
        PropertyDocument doc = doc();
        SearchHit<PropertyDocument> hit = (SearchHit<PropertyDocument>) mock(SearchHit.class);
        when(hit.getContent()).thenReturn(doc);

        SearchHits<PropertyDocument> searchHits = (SearchHits<PropertyDocument>) mock(SearchHits.class);
        when(searchHits.getSearchHits()).thenReturn(List.of(hit));

        when(es.count(any(NativeQuery.class), eq(PropertyDocument.class))).thenReturn(1L);
        when(es.search(any(NativeQuery.class), eq(PropertyDocument.class)))
                .thenReturn(searchHits);

        byte[] result = marketService.exportCsv(new FilterRequest());
        String csv = new String(result);

        assertThat(csv).contains("ID", "Square Footage", "Bedrooms");
        assertThat(csv).contains("1", "2000", "3");
    }

    @SuppressWarnings("unchecked")
    @Test
    void exportPdf_shouldReturnBytes() {
        PropertyDocument doc = doc();
        SearchHit<PropertyDocument> hit = (SearchHit<PropertyDocument>) mock(SearchHit.class);
        when(hit.getContent()).thenReturn(doc);

        SearchHits<PropertyDocument> searchHits = (SearchHits<PropertyDocument>) mock(SearchHits.class);
        when(searchHits.getSearchHits()).thenReturn(List.of(hit));

        when(es.count(any(NativeQuery.class), eq(PropertyDocument.class))).thenReturn(1L);
        when(es.search(any(NativeQuery.class), eq(PropertyDocument.class)))
                .thenReturn(searchHits);

        byte[] result = marketService.exportPdf(new FilterRequest());
        assertThat(result).isNotEmpty();
        assertThat(new String(result)).startsWith("%PDF");
    }

    @Test
    void whatIf_shouldReturnPrediction() {
        when(modelClient.predict(any())).thenReturn(350000d);

        WhatIfRequest request = new WhatIfRequest();
        request.setSquareFootage(2000);
        request.setBedrooms(3d);
        request.setBathrooms(2d);
        request.setYearBuilt(2010);
        request.setLotSize(5000);
        request.setDistanceToCityCenter(5.0);
        request.setSchoolRating(8.0);

        WhatIfResponse result = marketService.whatIf(request);

        assertThat(result.getPredictedPrice()).isEqualTo(350000);
    }
}
