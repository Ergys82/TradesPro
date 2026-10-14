package com.tradespro.api;

import com.tradespro.api.ApiDtos.DashboardResponse;
import com.tradespro.domain.JobStatus;
import com.tradespro.domain.QuoteStatus;
import com.tradespro.repository.CustomerRepository;
import com.tradespro.repository.PaymentRepository;
import com.tradespro.repository.QuoteRepository;
import com.tradespro.repository.WorkOrderRepository;
import com.tradespro.service.WorkOrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final CustomerRepository customers;
    private final WorkOrderRepository workOrders;
    private final QuoteRepository quotes;
    private final PaymentRepository payments;
    private final WorkOrderService workOrderService;
    private final ApiMapper mapper;

    public DashboardController(CustomerRepository customers,
                               WorkOrderRepository workOrders,
                               QuoteRepository quotes,
                               PaymentRepository payments,
                               WorkOrderService workOrderService,
                               ApiMapper mapper) {
        this.customers = customers;
        this.workOrders = workOrders;
        this.quotes = quotes;
        this.payments = payments;
        this.workOrderService = workOrderService;
        this.mapper = mapper;
    }

    @GetMapping
    public DashboardResponse get() {
        var all = workOrderService.findAll();
        BigDecimal outstanding = all.stream()
                .map(workOrderService::outstanding)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(
                customers.count(),
                workOrders.countByStatusNot(JobStatus.COMPLETED) - workOrders.findAll().stream().filter(w -> w.getStatus() == JobStatus.CANCELLED).count(),
                quotes.countByStatus(QuoteStatus.APPROVED),
                payments.totalPaid(),
                outstanding,
                all.stream().limit(5).map(mapper::workOrder).toList()
        );
    }
}
