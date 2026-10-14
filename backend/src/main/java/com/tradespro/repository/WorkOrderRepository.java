package com.tradespro.repository;

import com.tradespro.domain.JobStatus;
import com.tradespro.domain.WorkOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    long countByStatusNot(JobStatus status);

    boolean existsByCustomerId(Long customerId);

    @Override
    @EntityGraph(attributePaths = {"customer", "quote"})
    List<WorkOrder> findAll();

    @Override
    @EntityGraph(attributePaths = {"customer", "quote"})
    Optional<WorkOrder> findById(Long id);
}
