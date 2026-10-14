package com.tradespro.service;

import com.tradespro.api.ApiDtos.CustomerRequest;
import com.tradespro.domain.Customer;
import com.tradespro.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tradespro.repository.WorkOrderRepository;

import java.util.List;

@Service
@Transactional
public class CustomerService {
    private final CustomerRepository repository;
    private final WorkOrderRepository workOrderRepository;

    public CustomerService(CustomerRepository repository,
                           WorkOrderRepository workOrderRepository) {
        this.repository = repository;
        this.workOrderRepository = workOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<Customer> findAll() {
        return repository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Customer find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente non trovato: " + id));
    }

    public Customer create(CustomerRequest request) {
        Customer c = new Customer();
        apply(c, request);
        return repository.save(c);
    }

    public Customer update(Long id, CustomerRequest request) {
        Customer c = find(id);
        apply(c, request);
        return c;
    }

    public void delete(Long id) {

        if (workOrderRepository.existsByCustomerId(id)) {
            throw new IllegalStateException(
                    "Impossibile eliminare il cliente: esistono interventi associati."
            );
        }

        repository.delete(find(id));
    }

    private void apply(Customer c, CustomerRequest r) {
        c.setName(r.name());
        c.setPhone(r.phone());
        c.setEmail(r.email());
        c.setAddress(r.address());
        c.setNotes(r.notes());
    }
}
