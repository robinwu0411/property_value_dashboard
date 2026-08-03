package com.property.market.dto;

import java.util.List;

public class BreakdownPageResponse extends PageResponse<PropertyResponse> {

    public BreakdownPageResponse() {}

    public BreakdownPageResponse(List<PropertyResponse> items, long total, int page, int pageSize) {
        super(items, total, page, pageSize);
    }
}
