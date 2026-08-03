package com.property.market.service;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.handler.SheetWriteHandler;
import com.alibaba.excel.write.metadata.holder.WriteSheetHolder;
import com.alibaba.excel.write.metadata.holder.WriteWorkbookHolder;
import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.Sheet;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregate;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregation;
import co.elastic.clients.elasticsearch._types.aggregations.AggregationRange;
import co.elastic.clients.elasticsearch._types.aggregations.RangeBucket;
import co.elastic.clients.elasticsearch._types.aggregations.DoubleTermsBucket;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.RangeQuery;
import co.elastic.clients.json.JsonData;
import com.property.market.client.ModelClient;
import com.property.market.dto.FilterRequest;
import com.property.market.dto.MarketStatsResponse;
import com.property.market.dto.BreakdownPageResponse;
import com.property.market.dto.PropertyResponse;
import com.property.market.dto.PredictRequest;
import com.property.market.dto.WhatIfRequest;
import com.property.market.dto.WhatIfResponse;
import com.property.market.model.PropertyDocument;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MarketService {

    // histogram bins: <$100k, $100k-200k, $200k-300k, $300k-400k, $400k-500k, >$500k
    private static final double[] BINS = {100000, 200000, 300000, 400000, 500000};

    private final ElasticsearchOperations es;
    private final ModelClient modelClient;

    public MarketService(ElasticsearchOperations es, ModelClient modelClient) {
        this.es = es;
        this.modelClient = modelClient;
    }

    public MarketStatsResponse getSummary(FilterRequest filter) {
        BoolQuery.Builder bool = buildBoolQuery(filter);
        NativeQuery query = new NativeQueryBuilder()
                .withQuery(Query.of(q -> q.bool(bool.build())))
                .withMaxResults(0)
                .withAggregation("avg_price", agg("price"))
                .withAggregation("min_price", agg("min", "price"))
                .withAggregation("max_price", agg("max", "price"))
                .withAggregation("median_price", Aggregation.of(a -> a
                        .percentiles(p -> p.field("price").percents(50.0))))
                .withAggregation("avg_sqft", agg("square_footage"))
                .withAggregation("avg_year", agg("year_built"))
                .withAggregation("avg_lot", agg("lot_size"))
                .withAggregation("avg_distance", agg("distance_to_city_center"))
                .withAggregation("avg_school", agg("school_rating"))
                .withAggregation("by_bedrooms", Aggregation.of(a -> a
                        .terms(t -> t.field("bedrooms").size(10))
                        .aggregations(Map.of("avg_price", agg("price")))))
                .withAggregation("price_ranges", priceRangeAgg())
                .withAggregation("year_ranges", yearRangeAgg())
                .build();

        SearchHits<PropertyDocument> hits = es.search(query, PropertyDocument.class);
        ElasticsearchAggregations aggs = (ElasticsearchAggregations) hits.getAggregations();
        if (aggs == null) return new MarketStatsResponse();

        MarketStatsResponse result = new MarketStatsResponse();
        result.setTotalProperties(hits.getTotalHits());
        result.setAvgPrice(val(aggs, "avg_price"));
        result.setMinPrice(val(aggs, "min_price"));
        result.setMaxPrice(val(aggs, "max_price"));
        result.setMedianPrice(percentile(aggs, "median_price"));
        result.setAvgSquareFootage(val(aggs, "avg_sqft"));
        result.setAvgYearBuilt(val(aggs, "avg_year"));
        result.setAvgLotSize(val(aggs, "avg_lot"));
        result.setAvgDistanceToCityCenter(val(aggs, "avg_distance"));
        result.setAvgSchoolRating(val(aggs, "avg_school"));
        result.setAvgPriceByBedrooms(bedroomAvgs(aggs));
        result.setPriceDistribution(priceBuckets(aggs));
        result.setPropertyCountByYearRange(yearBuckets(aggs));
        return result;
    }

    private static final java.util.Set<String> ALLOWED_SORT_FIELDS = java.util.Set.of(
            "price", "squareFootage", "bedrooms", "bathrooms",
            "yearBuilt", "lotSize", "distanceToCityCenter", "schoolRating");

    public BreakdownPageResponse getBreakdown(FilterRequest filter) {
        int page = Math.max(1, filter.getPage());
        int pageSize = Math.max(1, filter.getPageSize());
        BoolQuery.Builder bool = buildBoolQuery(filter);
        org.springframework.data.domain.PageRequest pageRequest;
        if (filter.getSortBy() != null && !filter.getSortBy().isEmpty()) {
            if (!ALLOWED_SORT_FIELDS.contains(filter.getSortBy())) {
                throw new IllegalArgumentException("Invalid sort field: " + filter.getSortBy());
            }
            Sort.Direction dir = "desc".equalsIgnoreCase(filter.getSortOrder())
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageRequest = org.springframework.data.domain.PageRequest.of(
                    page - 1, pageSize, Sort.by(dir, filter.getSortBy()));
        } else {
            pageRequest = org.springframework.data.domain.PageRequest.of(
                    page - 1, pageSize);
        }
        NativeQuery query = new NativeQueryBuilder()
                .withQuery(Query.of(q -> q.bool(bool.build())))
                .withPageable(pageRequest)
                .build();

        SearchHits<PropertyDocument> hits = es.search(query, PropertyDocument.class);

        List<PropertyResponse> items = hits.getSearchHits().stream()
                .map(h -> toResponse(h.getContent()))
                .toList();

        return new BreakdownPageResponse(items, hits.getTotalHits(), page, pageSize);
    }

    private static final String[] EXPORT_HEADERS = {
        "ID", "Square Footage", "Bedrooms", "Bathrooms",
        "Year Built", "Lot Size", "Distance to City Center",
        "School Rating", "Price"
    };

    public byte[] exportCsv(FilterRequest filter) {
        List<PropertyDocument> docs = fetchAll(filter);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(out));
        writer.writeNext(EXPORT_HEADERS);
        for (PropertyDocument doc : docs) {
            writer.writeNext(new String[]{
                String.valueOf(doc.getId()),
                String.valueOf(doc.getSquareFootage()),
                String.valueOf(doc.getBedrooms()),
                String.valueOf(doc.getBathrooms()),
                String.valueOf(doc.getYearBuilt()),
                String.valueOf(doc.getLotSize()),
                String.valueOf(doc.getDistanceToCityCenter()),
                String.valueOf(doc.getSchoolRating()),
                String.valueOf(doc.getPrice()),
            });
        }
        try { writer.close(); } catch (Exception ignored) {}
        return out.toByteArray();
    }

    public byte[] exportExcel(FilterRequest filter) {
        List<PropertyDocument> docs = fetchAll(filter);
        List<List<String>> data = docs.stream().map(doc -> List.of(
                String.valueOf(doc.getId()),
                String.valueOf(doc.getSquareFootage()),
                String.valueOf(doc.getBedrooms()),
                String.valueOf(doc.getBathrooms()),
                String.valueOf(doc.getYearBuilt()),
                String.valueOf(doc.getLotSize()),
                String.valueOf(doc.getDistanceToCityCenter()),
                String.valueOf(doc.getSchoolRating()),
                String.valueOf(doc.getPrice())
        )).toList();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        EasyExcel.write(out)
                .head(List.of(List.of("ID"), List.of("Square Footage"), List.of("Bedrooms"),
                        List.of("Bathrooms"), List.of("Year Built"), List.of("Lot Size"),
                        List.of("Distance to City Center"), List.of("School Rating"), List.of("Price")))
                .registerWriteHandler(new SheetWriteHandler() {
                    @Override
                    public void afterSheetCreate(WriteWorkbookHolder wb, WriteSheetHolder ws) {
                        Sheet sheet = ws.getSheet();
                        sheet.setColumnWidth(0, 8 * 256);
                        sheet.setColumnWidth(1, 18 * 256);
                        sheet.setColumnWidth(2, 12 * 256);
                        sheet.setColumnWidth(3, 12 * 256);
                        sheet.setColumnWidth(4, 14 * 256);
                        sheet.setColumnWidth(5, 14 * 256);
                        sheet.setColumnWidth(6, 24 * 256);
                        sheet.setColumnWidth(7, 16 * 256);
                        sheet.setColumnWidth(8, 16 * 256);
                    }
                })
                .sheet("Properties")
                .doWrite(data);
        return out.toByteArray();
    }

    public WhatIfResponse whatIf(WhatIfRequest request) {
        PredictRequest predictRequest = new PredictRequest(
                request.getSquareFootage(),
                request.getBedrooms(),
                request.getBathrooms(),
                request.getYearBuilt(),
                request.getLotSize(),
                request.getDistanceToCityCenter(),
                request.getSchoolRating()
        );

        double predictedPrice = modelClient.predict(predictRequest);

        WhatIfResponse response = new WhatIfResponse();
        response.setPredictedPrice(predictedPrice);
        return response;
    }

    private List<PropertyDocument> fetchAll(FilterRequest filter) {
        long total = es.count(new NativeQueryBuilder()
                .withQuery(Query.of(q -> q.bool(buildBoolQuery(filter).build())))
                .build(), PropertyDocument.class);

        NativeQueryBuilder queryBuilder = new NativeQueryBuilder()
                .withQuery(Query.of(q -> q.bool(buildBoolQuery(filter).build())))
                .withPageable(org.springframework.data.domain.PageRequest.of(0, (int) total));

        if (filter.getSortBy() != null && !filter.getSortBy().isEmpty()) {
            if (!ALLOWED_SORT_FIELDS.contains(filter.getSortBy())) {
                throw new IllegalArgumentException("Invalid sort field: " + filter.getSortBy());
            }
            Sort.Direction dir = "desc".equalsIgnoreCase(filter.getSortOrder())
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            queryBuilder.withSort(Sort.by(dir, filter.getSortBy()));
        }

        return es.search(queryBuilder.build(), PropertyDocument.class)
                .getSearchHits().stream()
                .map(h -> h.getContent())
                .toList();
    }

    private BoolQuery.Builder buildBoolQuery(FilterRequest filter) {
        BoolQuery.Builder bool = new BoolQuery.Builder();

        addRange(bool, "square_footage", filter.getMinSquareFootage(), filter.getMaxSquareFootage());
        addRange(bool, "year_built", filter.getMinYearBuilt(), filter.getMaxYearBuilt());
        addRange(bool, "lot_size", filter.getMinLotSize(), filter.getMaxLotSize());
        addRange(bool, "distance_to_city_center", filter.getMinDistanceToCityCenter(), filter.getMaxDistanceToCityCenter());
        addRange(bool, "price", filter.getMinPrice(), filter.getMaxPrice());

        addTermsOrMin(bool, "bedrooms", filter.getBedrooms(), filter.getMinBedrooms());
        addTermsOrMin(bool, "bathrooms", filter.getBathrooms(), filter.getMinBathrooms());
        addRange(bool, "school_rating", filter.getMinSchoolRating(), filter.getMaxSchoolRating());

        return bool;
    }

    private Aggregation priceRangeAgg() {
        List<AggregationRange> ranges = new ArrayList<>();
        ranges.add(AggregationRange.of(r -> r.to(BINS[0])));
        for (int i = 0; i < BINS.length - 1; i++) {
            double from = BINS[i];
            double to = BINS[i + 1];
            ranges.add(AggregationRange.of(r -> r.from(from).to(to)));
        }
        ranges.add(AggregationRange.of(r -> r.from(BINS[BINS.length - 1])));
        return Aggregation.of(a -> a.range(ra -> ra.field("price").ranges(ranges)));
    }

    private Aggregation yearRangeAgg() {
        List<AggregationRange> ranges = new ArrayList<>();
        ranges.add(AggregationRange.of(r -> r.to(1950d)));
        ranges.add(AggregationRange.of(r -> r.from(1950d).to(1970d)));
        ranges.add(AggregationRange.of(r -> r.from(1970d).to(1990d)));
        ranges.add(AggregationRange.of(r -> r.from(1990d).to(2010d)));
        ranges.add(AggregationRange.of(r -> r.from(2010d)));
        return Aggregation.of(a -> a.range(ra -> ra.field("year_built").ranges(ranges)));
    }

    private Map<String, Long> yearBuckets(ElasticsearchAggregations aggs) {
        ElasticsearchAggregation a = aggs.get("year_ranges");
        if (a == null) return Map.of();
        Aggregate aggregate = a.aggregation().getAggregate();
        if (!aggregate.isRange()) return Map.of();
        Map<String, Long> result = new java.util.LinkedHashMap<>();
        String[] labels = {"<1950", "1950-1970", "1970-1990", "1990-2010", "2010+"};
        int i = 0;
        for (var bucket : aggregate.range().buckets().array()) {
            if (i < labels.length) {
                result.put(labels[i], bucket.docCount());
            }
            i++;
        }
        return result;
    }

    private static Aggregation agg(String field) {
        return Aggregation.of(a -> a.avg(av -> av.field(field)));
    }

    private static Aggregation agg(String fn, String field) {
        return switch (fn) {
            case "min" -> Aggregation.of(a -> a.min(m -> m.field(field)));
            case "max" -> Aggregation.of(a -> a.max(m -> m.field(field)));
            default -> agg(field);
        };
    }

    private double val(ElasticsearchAggregations aggs, String name) {
        ElasticsearchAggregation a = aggs.get(name);
        if (a == null) return 0;
        Aggregate aggregate = a.aggregation().getAggregate();
        return round(aggregate.isAvg() ? aggregate.avg().value()
                : aggregate.isMin() ? aggregate.min().value()
                : aggregate.max().value());
    }

    private double percentile(ElasticsearchAggregations aggs, String name) {
        ElasticsearchAggregation a = aggs.get(name);
        if (a == null) return 0;
        Map<String, String> values = a.aggregation().getAggregate().tdigestPercentiles().values().keyed();
        String v = values.get("50.0");
        return v != null ? round(Double.parseDouble(v)) : 0;
    }

    private Map<String, Double> bedroomAvgs(ElasticsearchAggregations aggs) {
        Map<String, Double> result = new LinkedHashMap<>();
        ElasticsearchAggregation terms = aggs.get("by_bedrooms");
        if (terms == null) return result;
        for (DoubleTermsBucket bucket : terms.aggregation().getAggregate().dterms().buckets().array()) {
            Aggregate subAgg = bucket.aggregations().get("avg_price");
            double avg = subAgg != null && subAgg.isAvg()
                    ? subAgg.avg().value() : 0;
            result.put(String.valueOf(bucket.key()), round(avg));
        }
        return result;
    }

    private List<MarketStatsResponse.PriceRangeBucket> priceBuckets(ElasticsearchAggregations aggs) {
        List<MarketStatsResponse.PriceRangeBucket> buckets = new ArrayList<>();
        ElasticsearchAggregation range = aggs.get("price_ranges");
        if (range == null) return buckets;
        for (RangeBucket bucket : range.aggregation().getAggregate().range().buckets().array()) {
            String label;
            Double toVal = bucket.to();
            Double fromVal = bucket.from();
            if (toVal == null) {
                label = "$" + (int) (BINS[BINS.length - 1] / 1000) + "k+";
            } else if (fromVal == null || fromVal == 0) {
                label = "<$" + (int) (toVal / 1000) + "k";
            } else {
                label = "$" + (int) (fromVal / 1000) + "k-$" + (int) (toVal / 1000) + "k";
            }
            buckets.add(new MarketStatsResponse.PriceRangeBucket(label, bucket.docCount()));
        }
        return buckets;
    }

    private void addRange(BoolQuery.Builder bool, String field, Number min, Number max) {
        if (min == null && max == null) return;
        bool.filter(Query.of(q -> q.range(RangeQuery.of(r -> r.number(n -> {
            n.field(field);
            if (min != null) n.gte(min.doubleValue());
            if (max != null) n.lte(max.doubleValue());
            return n;
        })))));
    }

    /**
     * When both exact values (e.g. 1, 2) and a min (e.g. 3+) are selected,
     * combine as OR: beds IN [1,2] OR beds > 3.
     */
    private void addTermsOrMin(BoolQuery.Builder bool, String field,
                                List<?> terms, Number min) {
        boolean hasTerms = terms != null && !terms.isEmpty();
        boolean hasMin = min != null;

        if (!hasTerms && !hasMin) return;

        if (hasTerms && hasMin) {
            BoolQuery.Builder should = new BoolQuery.Builder();
            should.should(Query.of(q -> q.terms(t -> t.field(field)
                    .terms(tv -> tv.value(terms.stream()
                            .map(v -> FieldValue.of(fv -> fv.doubleValue(((Number) v).doubleValue())))
                            .toList())))));
            should.should(Query.of(q -> q.range(RangeQuery.of(r -> r.number(n ->
                    n.field(field).gt(min.doubleValue()))))));
            should.minimumShouldMatch("1");
            bool.filter(Query.of(q -> q.bool(should.build())));
        } else if (hasTerms) {
            List<FieldValue> fieldValues = terms.stream()
                    .map(v -> FieldValue.of(fv -> fv.doubleValue(((Number) v).doubleValue())))
                    .toList();
            bool.filter(Query.of(q -> q.terms(t -> t.field(field)
                    .terms(tv -> tv.value(fieldValues)))));
        } else {
            bool.filter(Query.of(q -> q.range(RangeQuery.of(r -> r.number(n ->
                    n.field(field).gt(min.doubleValue()))))));
        }
    }

    private PropertyResponse toResponse(PropertyDocument doc) {
        PropertyResponse r = new PropertyResponse();
        r.setId(doc.getId());
        r.setSquareFootage(doc.getSquareFootage());
        r.setBedrooms(doc.getBedrooms());
        r.setBathrooms(doc.getBathrooms());
        r.setYearBuilt(doc.getYearBuilt());
        r.setLotSize(doc.getLotSize());
        r.setDistanceToCityCenter(doc.getDistanceToCityCenter());
        r.setSchoolRating(doc.getSchoolRating());
        r.setPrice(doc.getPrice());
        return r;
    }

    private static double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

}
