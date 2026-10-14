package com.tradespro.api;

import com.tradespro.api.ApiDtos.*;
import com.tradespro.domain.*;
import com.tradespro.service.WorkOrderService;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ApiMapper {
    private final WorkOrderService workOrderService;

    public ApiMapper(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    public CustomerResponse customer(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getPhone(), c.getEmail(), c.getAddress(), c.getNotes(), c.getCreatedAt());
    }

    public MaterialResponse material(MaterialItem m) {
        BigDecimal total = m.getQuantity().multiply(m.getUnitPrice());
        return new MaterialResponse(m.getId(), m.getDescription(), m.getQuantity(), m.getUnitPrice(), total);
    }

    public QuoteResponse quote(Quote q) {
        if (q == null) return null;
        return new QuoteResponse(q.getId(), q.getStatus(), q.getSubtotal(), q.getTaxRate(), q.getTaxAmount(), q.getTotal(), q.getCreatedAt());
    }

    public PaymentResponse payment(Payment p) {
        return new PaymentResponse(p.getId(), p.getAmount(), p.getMethod(), p.getNotes(), p.getPaidAt());
    }

    public WorkOrderResponse workOrder(WorkOrder w) {
        return new WorkOrderResponse(
                w.getId(),
                customer(w.getCustomer()),
                w.getTitle(),
                w.getDescription(),
                w.getStatus(),
                w.getScheduledAt(),
                w.getLaborHours(),
                w.getLaborRate(),
                workOrderService.laborTotal(w),
                w.getTechnicianNotes(),
                w.getMaterials().stream().map(this::material).toList(),
                workOrderService.materialsTotal(w),
                quote(w.getQuote()),
                w.getPayments().stream().map(this::payment).toList(),
                workOrderService.paidTotal(w),
                workOrderService.outstanding(w),
                w.getCreatedAt()
        );
    }
}
