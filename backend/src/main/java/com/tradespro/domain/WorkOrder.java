package com.tradespro.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_orders")
public class WorkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.PLANNED;

    private LocalDateTime scheduledAt;

    @Column(precision = 10, scale = 2)
    private BigDecimal laborHours = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal laborRate = BigDecimal.ZERO;

    @Column(length = 3000)
    private String technicianNotes;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<MaterialItem> materials = new ArrayList<>();

    @OneToOne(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private Quote quote;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("paidAt DESC")
    private List<Payment> payments = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = JobStatus.PLANNED;
        if (laborHours == null) laborHours = BigDecimal.ZERO;
        if (laborRate == null) laborRate = BigDecimal.ZERO;
    }

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public BigDecimal getLaborHours() { return laborHours; }
    public void setLaborHours(BigDecimal laborHours) { this.laborHours = laborHours; }
    public BigDecimal getLaborRate() { return laborRate; }
    public void setLaborRate(BigDecimal laborRate) { this.laborRate = laborRate; }
    public String getTechnicianNotes() { return technicianNotes; }
    public void setTechnicianNotes(String technicianNotes) { this.technicianNotes = technicianNotes; }
    public List<MaterialItem> getMaterials() { return materials; }
    public Quote getQuote() { return quote; }
    public void setQuote(Quote quote) { this.quote = quote; }
    public List<Payment> getPayments() { return payments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
