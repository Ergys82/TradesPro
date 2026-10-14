package com.tradespro.api;

import com.tradespro.domain.JobStatus;
import com.tradespro.domain.QuoteStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class ApiDtos {
    private ApiDtos() {}

    public record CustomerRequest(
            @NotBlank String name,
            String phone,
            @Email String email,
            String address,
            String notes
    ) {}

    public record CustomerResponse(
            Long id,
            String name,
            String phone,
            String email,
            String address,
            String notes,
            LocalDateTime createdAt
    ) {}

    public record WorkOrderRequest(
            @NotNull Long customerId,
            @NotBlank String title,
            String description,
            JobStatus status,
            LocalDateTime scheduledAt,
            @DecimalMin("0.0") BigDecimal laborHours,
            @DecimalMin("0.0") BigDecimal laborRate,
            String technicianNotes
    ) {}

    public record MaterialRequest(
            @NotBlank String description,
            @NotNull @DecimalMin("0.01") BigDecimal quantity,
            @NotNull @DecimalMin("0.0") BigDecimal unitPrice
    ) {}

    public record MaterialResponse(
            Long id,
            String description,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal total
    ) {}

    public record QuoteRequest(
            @NotNull @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal taxRate
    ) {}

    public record QuoteResponse(
            Long id,
            QuoteStatus status,
            BigDecimal subtotal,
            BigDecimal taxRate,
            BigDecimal taxAmount,
            BigDecimal total,
            LocalDateTime createdAt
    ) {}

    public record PaymentRequest(
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            String method,
            String notes,
            LocalDateTime paidAt
    ) {}

    public record PaymentResponse(
            Long id,
            BigDecimal amount,
            String method,
            String notes,
            LocalDateTime paidAt
    ) {}

    public record WorkOrderResponse(
            Long id,
            CustomerResponse customer,
            String title,
            String description,
            JobStatus status,
            LocalDateTime scheduledAt,
            BigDecimal laborHours,
            BigDecimal laborRate,
            BigDecimal laborTotal,
            String technicianNotes,
            List<MaterialResponse> materials,
            BigDecimal materialsTotal,
            QuoteResponse quote,
            List<PaymentResponse> payments,
            BigDecimal paidTotal,
            BigDecimal outstanding,
            LocalDateTime createdAt
    ) {}

    public record DashboardResponse(
            long customers,
            long activeJobs,
            long approvedQuotes,
            BigDecimal revenue,
            BigDecimal outstanding,
            List<WorkOrderResponse> recentJobs
    ) {}

    public record QuoteStatusRequest(@NotNull QuoteStatus status) {}
}
