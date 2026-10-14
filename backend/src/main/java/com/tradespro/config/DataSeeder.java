package com.tradespro.config;

import com.tradespro.api.ApiDtos.*;
import com.tradespro.domain.JobStatus;
import com.tradespro.repository.CustomerRepository;
import com.tradespro.service.CustomerService;
import com.tradespro.service.WorkOrderService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(CustomerRepository customerRepository,
                           CustomerService customerService,
                           WorkOrderService workOrderService) {
        return args -> {
            if (customerRepository.count() > 0) return;

            var mario = customerService.create(new CustomerRequest(
                    "Mario Rossi", "333 1234567", "mario.rossi@example.com",
                    "Via Roma 10, Milano", "Cliente privato"
            ));
            var studio = customerService.create(new CustomerRequest(
                    "Studio Bianchi", "02 5550123", "segreteria@studiobianchi.example",
                    "Corso Italia 42, Milano", "Preferisce appuntamenti al mattino"
            ));

            var shower = workOrderService.create(new WorkOrderRequest(
                    mario.getId(), "Riparazione miscelatore doccia",
                    "Deviatore incassato bloccato, verificare cartuccia e ricambi.",
                    JobStatus.IN_PROGRESS, LocalDateTime.now().plusDays(1).withHour(9).withMinute(30),
                    new BigDecimal("2.00"), new BigDecimal("60.00"),
                    "Portare chiavi, silicone e ricambio universale."
            ));
            workOrderService.addMaterial(shower.getId(), new MaterialRequest(
                    "Cartuccia/deviatore", BigDecimal.ONE, new BigDecimal("35.00")
            ));
            workOrderService.addMaterial(shower.getId(), new MaterialRequest(
                    "Materiale di consumo", BigDecimal.ONE, new BigDecimal("8.00")
            ));
            workOrderService.createOrRefreshQuote(shower.getId(), new QuoteRequest(new BigDecimal("22.00")));

            var electrical = workOrderService.create(new WorkOrderRequest(
                    studio.getId(), "Controllo quadro elettrico",
                    "Verifica differenziale e sostituzione due prese.",
                    JobStatus.PLANNED, LocalDateTime.now().plusDays(3).withHour(10).withMinute(0),
                    new BigDecimal("3.00"), new BigDecimal("55.00"), ""
            ));
            workOrderService.addMaterial(electrical.getId(), new MaterialRequest(
                    "Prese elettriche", new BigDecimal("2"), new BigDecimal("12.50")
            ));
        };
    }
}
