package com.property.market.controller;

import com.property.market.dto.FilterRequest;
import com.property.market.dto.MarketStatsResponse;
import com.property.market.dto.BreakdownPageResponse;
import com.property.market.dto.WhatIfRequest;
import com.property.market.dto.WhatIfResponse;
import com.property.market.service.MarketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final MarketService marketService;

    public MarketController(MarketService marketService) {
        this.marketService = marketService;
    }

    private void bindListParams(FilterRequest filter,
                                 List<Double> bedrooms,
                                 List<Double> bathrooms) {
        if (bedrooms != null && !bedrooms.isEmpty()) filter.setBedrooms(bedrooms);
        if (bathrooms != null && !bathrooms.isEmpty()) filter.setBathrooms(bathrooms);
    }

    @GetMapping("/summary")
    public MarketStatsResponse summary(@ModelAttribute FilterRequest filter,
                                       @RequestParam(required = false) List<Double> bedrooms,
                                       @RequestParam(required = false) List<Double> bathrooms) {
        bindListParams(filter, bedrooms, bathrooms);
        return marketService.getSummary(filter);
    }

    @GetMapping("/breakdown")
    public BreakdownPageResponse breakdown(
            @ModelAttribute FilterRequest filter,
            @RequestParam(required = false) List<Double> bedrooms,
            @RequestParam(required = false) List<Double> bathrooms) {
        bindListParams(filter, bedrooms, bathrooms);
        return marketService.getBreakdown(filter);
    }

    @PostMapping("/what-if")
    public WhatIfResponse whatIf(@Valid @RequestBody WhatIfRequest request) {
        return marketService.whatIf(request);
    }

    @GetMapping("/breakdown/export")
    public ResponseEntity<byte[]> export(
            @ModelAttribute FilterRequest filter,
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) List<Double> bedrooms,
            @RequestParam(required = false) List<Double> bathrooms) {
        bindListParams(filter, bedrooms, bathrooms);
        byte[] data;
        MediaType contentType;
        String filename;
        if ("pdf".equalsIgnoreCase(format)) {
            data = marketService.exportPdf(filter);
            contentType = MediaType.parseMediaType("application/pdf");
            filename = "properties.pdf";
        } else {
            data = marketService.exportCsv(filter);
            contentType = MediaType.parseMediaType("text/csv");
            filename = "properties.csv";
        }
        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(data);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
