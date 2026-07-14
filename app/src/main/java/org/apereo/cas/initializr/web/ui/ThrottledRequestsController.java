package org.apereo.cas.initializr.web.ui;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;
import static org.springframework.data.mongodb.core.query.Criteria.*;

/**
 * This is {@link ThrottledRequestsController}.
 *
 * @author Misagh Moayyed
 * @since 7.0.0
 */
@RestController
public class ThrottledRequestsController {
    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/throttled")
    @Secured({"ROLE_ADMIN"})
    public List<ThrottledIpResult> throttled(@RequestParam(defaultValue = "10") int count) {
        var aggregation = newAggregation(
                match(where("throttled").is(true)),
                group("ip").count().as("count"),
                match(where("count").gte(count)),
                sort(Sort.by(
                        Sort.Order.desc("count"),
                        Sort.Order.asc("_id")
                ))
        );

        var results = mongoTemplate.aggregate(
                aggregation,
                "cas-initializr",
                ThrottledIpResult.class
        );
        return results.getMappedResults();
    }

    public record ThrottledIpResult(
            String id,
            long count
    ) {
    }
}
