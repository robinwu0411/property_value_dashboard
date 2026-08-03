package com.property.market.controller;

import com.property.market.dto.BreakdownPageResponse;
import com.property.market.dto.FilterRequest;
import com.property.market.dto.MarketStatsResponse;
import com.property.market.dto.PropertyResponse;
import com.property.market.dto.WhatIfRequest;
import com.property.market.dto.WhatIfResponse;
import com.property.market.service.MarketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

@WebMvcTest(MarketController.class)
class MarketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MarketService marketService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void health_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/market/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void summary_shouldReturnStats() throws Exception {
        MarketStatsResponse stats = new MarketStatsResponse();
        stats.setTotalProperties(100);
        stats.setAvgPrice(350000);
        stats.setMinPrice(100000);
        stats.setMaxPrice(800000);
        stats.setAvgPriceByBedrooms(Map.of("3", 350000d));
        stats.setPropertyCountByYearRange(Map.of());

        when(marketService.getSummary(any(FilterRequest.class))).thenReturn(stats);

        mockMvc.perform(get("/api/market/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProperties").value(100))
                .andExpect(jsonPath("$.avgPrice").value(350000))
                .andExpect(jsonPath("$.minPrice").value(100000))
                .andExpect(jsonPath("$.maxPrice").value(800000));
    }

    @Test
    void summary_shouldPassFilters() throws Exception {
        when(marketService.getSummary(any(FilterRequest.class)))
                .thenReturn(new MarketStatsResponse());

        mockMvc.perform(get("/api/market/summary")
                        .param("minPrice", "200000")
                        .param("bedrooms", "3", "4"))
                .andExpect(status().isOk());
    }

    @Test
    void breakdown_shouldReturnPagedResults() throws Exception {
        PropertyResponse item = new PropertyResponse();
        item.setId(1L);
        item.setPrice(350000);
        item.setBedrooms(3d);

        BreakdownPageResponse result = new BreakdownPageResponse(
                List.of(item), 1, 1, 20);

        when(marketService.getBreakdown(any(FilterRequest.class))).thenReturn(result);

        mockMvc.perform(get("/api/market/breakdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.items[0].price").value(350000))
                .andExpect(jsonPath("$.items[0].bedrooms").value(3));
    }

    @Test
    void export_shouldReturnCsvByDefault() throws Exception {
        byte[] csv = "ID,Square Footage\n1,2000".getBytes();
        when(marketService.exportCsv(any(FilterRequest.class))).thenReturn(csv);

        mockMvc.perform(get("/api/market/breakdown/export"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"properties.csv\""));
    }

    @Test
    void export_shouldReturnExcelForXlsxFormat() throws Exception {
        byte[] xlsx = new byte[]{(byte) 0x50, (byte) 0x4B, 0x03, 0x04};
        when(marketService.exportExcel(any(FilterRequest.class))).thenReturn(xlsx);

        mockMvc.perform(get("/api/market/breakdown/export")
                        .param("format", "xlsx"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"properties.xlsx\""));
    }

    @Test
    void whatIf_shouldReturnPrediction() throws Exception {
        WhatIfResponse response = new WhatIfResponse();
        response.setPredictedPrice(420000);

        when(marketService.whatIf(any(WhatIfRequest.class))).thenReturn(response);

        WhatIfRequest request = new WhatIfRequest();
        request.setSquareFootage(2200);
        request.setBedrooms(3d);
        request.setBathrooms(2d);
        request.setYearBuilt(2015);
        request.setLotSize(6000);
        request.setDistanceToCityCenter(3.5);
        request.setSchoolRating(9.0);

        mockMvc.perform(post("/api/market/what-if")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictedPrice").value(420000));
    }

    @Test
    void whatIf_shouldReturn400ForInvalidRequest() throws Exception {
        WhatIfRequest request = new WhatIfRequest();
        // missing all @NotNull fields

        mockMvc.perform(post("/api/market/what-if")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
