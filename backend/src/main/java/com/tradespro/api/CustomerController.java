package com.tradespro.api;

import com.tradespro.api.ApiDtos.CustomerRequest;
import com.tradespro.api.ApiDtos.CustomerResponse;
import com.tradespro.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService service;
    private final ApiMapper mapper;

    public CustomerController(CustomerService service, ApiMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<CustomerResponse> all() {
        return service.findAll().stream().map(mapper::customer).toList();
    }

    @GetMapping("/{id}")
    public CustomerResponse one(@PathVariable Long id) {
        return mapper.customer(service.find(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        return mapper.customer(service.create(request));
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return mapper.customer(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
