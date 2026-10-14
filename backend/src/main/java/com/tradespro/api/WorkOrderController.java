package com.tradespro.api;

import com.tradespro.api.ApiDtos.*;
import com.tradespro.service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.tradespro.service.QuotePdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkOrderController {
    private final WorkOrderService service;
    private final ApiMapper mapper;
    private final QuotePdfService quotePdfService;

    public WorkOrderController(WorkOrderService service, ApiMapper mapper, QuotePdfService quotePdfService) {
        this.service = service;
        this.mapper = mapper;
        this.quotePdfService = quotePdfService;
    }

    @GetMapping("/work-orders")
    public List<WorkOrderResponse> all() {
        return service.findAll().stream().map(mapper::workOrder).toList();
    }

    @GetMapping("/work-orders/{id}")
    public WorkOrderResponse one(@PathVariable Long id) {
        return mapper.workOrder(service.find(id));
    }

    @PostMapping("/work-orders")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkOrderResponse create(@Valid @RequestBody WorkOrderRequest request) {
        return mapper.workOrder(service.create(request));
    }

    @PutMapping("/work-orders/{id}")
    public WorkOrderResponse update(@PathVariable Long id, @Valid @RequestBody WorkOrderRequest request) {
        return mapper.workOrder(service.update(id, request));
    }

    @DeleteMapping("/work-orders/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/work-orders/{id}/materials")
    public WorkOrderResponse addMaterial(@PathVariable Long id, @Valid @RequestBody MaterialRequest request) {
        return mapper.workOrder(service.addMaterial(id, request));
    }

    @DeleteMapping("/work-orders/{id}/materials/{materialId}")
    public WorkOrderResponse removeMaterial(@PathVariable Long id, @PathVariable Long materialId) {
        return mapper.workOrder(service.removeMaterial(id, materialId));
    }

    @PostMapping("/work-orders/{id}/quote")
    public QuoteResponse quote(@PathVariable Long id, @Valid @RequestBody QuoteRequest request) {
        return mapper.quote(service.createOrRefreshQuote(id, request));
    }

    @PutMapping("/quotes/{id}/status")
    public QuoteResponse quoteStatus(@PathVariable Long id, @Valid @RequestBody QuoteStatusRequest request) {
        return mapper.quote(service.updateQuoteStatus(id, request.status()));
    }

    @PostMapping("/work-orders/{id}/payments")
    public WorkOrderResponse addPayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return mapper.workOrder(service.addPayment(id, request));
    }

    @GetMapping("/work-orders/{id}/quote/pdf")
    public ResponseEntity<byte[]> downloadQuotePdf(
            @PathVariable Long id,
            @RequestParam(defaultValue = "it") String lang) {

        byte[] pdf = quotePdfService.generateQuotePdf(id, lang);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=preventivo-" + id + ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
