package com.tradespro.service;

import com.tradespro.api.ApiDtos.*;
import com.tradespro.domain.*;
import com.tradespro.repository.QuoteRepository;
import com.tradespro.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class WorkOrderService {
    private final WorkOrderRepository repository;
    private final QuoteRepository quoteRepository;
    private final CustomerService customerService;

    public WorkOrderService(WorkOrderRepository repository,
                            QuoteRepository quoteRepository,
                            CustomerService customerService) {
        this.repository = repository;
        this.quoteRepository = quoteRepository;
        this.customerService = customerService;
    }

    @Transactional(readOnly = true)
    public List<WorkOrder> findAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(WorkOrder::getCreatedAt).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkOrder find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Intervento non trovato: " + id));
    }

    public WorkOrder create(WorkOrderRequest request) {
        WorkOrder w = new WorkOrder();
        apply(w, request);
        return repository.save(w);
    }

    public WorkOrder update(Long id, WorkOrderRequest request) {
        WorkOrder w = find(id);
        apply(w, request);
        if (w.getQuote() != null && w.getQuote().getStatus() == QuoteStatus.DRAFT) {
            recalculateQuote(w.getQuote(), w.getQuote().getTaxRate());
        }
        return w;
    }

    public void delete(Long id) {
        repository.delete(find(id));
    }

    public WorkOrder addMaterial(Long id, MaterialRequest request) {
        WorkOrder w = find(id);
        MaterialItem item = new MaterialItem();
        item.setWorkOrder(w);
        item.setDescription(request.description());
        item.setQuantity(request.quantity());
        item.setUnitPrice(request.unitPrice());
        w.getMaterials().add(item);
        if (w.getQuote() != null && w.getQuote().getStatus() == QuoteStatus.DRAFT) {
            recalculateQuote(w.getQuote(), w.getQuote().getTaxRate());
        }
        return w;
    }

    public WorkOrder removeMaterial(Long id, Long materialId) {
        WorkOrder w = find(id);
        boolean removed = w.getMaterials().removeIf(m -> m.getId().equals(materialId));
        if (!removed) throw new IllegalArgumentException("Materiale non trovato: " + materialId);
        if (w.getQuote() != null && w.getQuote().getStatus() == QuoteStatus.DRAFT) {
            recalculateQuote(w.getQuote(), w.getQuote().getTaxRate());
        }
        return w;
    }

    public Quote createOrRefreshQuote(Long id, QuoteRequest request) {
        WorkOrder w = find(id);
        Quote q = w.getQuote();
        if (q == null) {
            q = new Quote();
            q.setWorkOrder(w);
            w.setQuote(q);
        }
        if (q.getStatus() != QuoteStatus.DRAFT && q.getStatus() != QuoteStatus.SENT) {
            throw new IllegalStateException("Un preventivo approvato/rifiutato non può essere ricalcolato");
        }
        q.setStatus(QuoteStatus.DRAFT);
        recalculateQuote(q, request.taxRate());
        return quoteRepository.save(q);
    }

    public Quote updateQuoteStatus(Long quoteId, QuoteStatus status) {
        Quote q = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Preventivo non trovato: " + quoteId));
        q.setStatus(status);
        return q;
    }

    public WorkOrder addPayment(Long id, PaymentRequest request) {
        WorkOrder w = find(id);
        Payment p = new Payment();
        p.setWorkOrder(w);
        p.setAmount(request.amount());
        p.setMethod(request.method());
        p.setNotes(request.notes());
        p.setPaidAt(request.paidAt());
        w.getPayments().add(p);
        return w;
    }

    public BigDecimal materialsTotal(WorkOrder w) {
        return w.getMaterials().stream()
                .map(m -> m.getQuantity().multiply(m.getUnitPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal laborTotal(WorkOrder w) {
        BigDecimal hours = nvl(w.getLaborHours());
        BigDecimal rate = nvl(w.getLaborRate());
        return hours.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal paidTotal(WorkOrder w) {
        return w.getPayments().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal outstanding(WorkOrder w) {
        if (w.getQuote() == null) return BigDecimal.ZERO;
        return w.getQuote().getTotal().subtract(paidTotal(w)).max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void apply(WorkOrder w, WorkOrderRequest r) {
        w.setCustomer(customerService.find(r.customerId()));
        w.setTitle(r.title());
        w.setDescription(r.description());
        w.setStatus(r.status() == null ? JobStatus.PLANNED : r.status());
        w.setScheduledAt(r.scheduledAt());
        w.setLaborHours(nvl(r.laborHours()));
        w.setLaborRate(nvl(r.laborRate()));
        w.setTechnicianNotes(r.technicianNotes());
    }

    private void recalculateQuote(Quote q, BigDecimal taxRate) {
        WorkOrder w = q.getWorkOrder();
        BigDecimal subtotal = laborTotal(w).add(materialsTotal(w)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal rate = nvl(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = subtotal.multiply(rate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        q.setSubtotal(subtotal);
        q.setTaxRate(rate);
        q.setTaxAmount(tax);
        q.setTotal(subtotal.add(tax).setScale(2, RoundingMode.HALF_UP));
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
