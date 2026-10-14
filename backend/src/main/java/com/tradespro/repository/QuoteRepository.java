package com.tradespro.repository;

import com.tradespro.domain.Quote;
import com.tradespro.domain.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    long countByStatus(QuoteStatus status);
}
