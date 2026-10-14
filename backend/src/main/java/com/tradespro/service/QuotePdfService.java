package com.tradespro.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.tradespro.domain.MaterialItem;
import com.tradespro.domain.Quote;
import com.tradespro.domain.WorkOrder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import com.lowagie.text.Image;
import java.io.InputStream;
import org.springframework.core.io.ClassPathResource;
import com.lowagie.text.Element;
import com.lowagie.text.pdf.PdfPCell;

@Service
public class QuotePdfService {

    private final WorkOrderService workOrderService;

    public QuotePdfService(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @Transactional(readOnly = true)
    public byte[] generateQuotePdf(Long workOrderId, String lang) {

        lang = lang == null ? "it" : lang.toLowerCase();

        WorkOrder workOrder = workOrderService.find(workOrderId);

        Quote quote = workOrder.getQuote();

        if (quote == null) {
            throw new IllegalStateException(
                    "L'intervento non ha ancora un preventivo"
            );
        }

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Document document = new Document();

            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    20
            );

            Font headingFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    12
            );

            try {

                ClassPathResource resource =
                        new ClassPathResource("static/company-logo.png");

                byte[] logoBytes =
                        resource.getInputStream().readAllBytes();

                Image logo = Image.getInstance(logoBytes);
                logo.scaleToFit(180, 70);

                PdfPTable headerTable = new PdfPTable(new float[]{1.3f, 1f});
                headerTable.setWidthPercentage(100);

                // CELLA SINISTRA -> LOGO
                PdfPCell logoCell = new PdfPCell(logo);
                logoCell.setBorder(PdfPCell.NO_BORDER);
                logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

                // CELLA DESTRA -> DATI AZIENDA
                Font companyFont =
                        FontFactory.getFont(FontFactory.HELVETICA, 9);

                Paragraph companyInfo = new Paragraph(
                        "NOME AZIENDA\n" +
                                "P. IVA: 12345678901\n" +
                                "Via Esempio 10, Milano\n" +
                                "Tel: +39 02 1234567\n" +
                                "info@azienda.it",
                        companyFont
                );

                companyInfo.setAlignment(Element.ALIGN_RIGHT);

                PdfPCell companyCell = new PdfPCell(companyInfo);
                companyCell.setBorder(PdfPCell.NO_BORDER);
                companyCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                companyCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

                headerTable.addCell(logoCell);
                headerTable.addCell(companyCell);

                document.add(headerTable);
                document.add(new Paragraph(" "));

            } catch (Exception e) {
                e.printStackTrace();
            }

            //document.add(new Paragraph("TRADESPRO", titleFont));  se non ho un logo lascio la scritta
            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "QUOTE";
                        case "fr" -> "DEVIS";
                        default -> "PREVENTIVO";
                    }
            ));
            document.add(new Paragraph(" "));

            String quoteNumber = String.format("PREV-%04d", quote.getId());

            String quoteDate = LocalDate.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "Quote no.: " + quoteNumber;
                        case "fr" -> "Devis n° : " + quoteNumber;
                        default -> "Preventivo n.: " + quoteNumber;
                    }
            ));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "Date: " + quoteDate;
                        case "fr" -> "Date : " + quoteDate;
                        default -> "Data: " + quoteDate;
                    }
            ));

            document.add(new Paragraph(" "));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "Customer: " + workOrder.getCustomer().getName();
                        case "fr" -> "Client : " + workOrder.getCustomer().getName();
                        default -> "Cliente: " + workOrder.getCustomer().getName();
                    }
            ));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "Work order: " + workOrder.getTitle();
                        case "fr" -> "Intervention : " + workOrder.getTitle();
                        default -> "Intervento: " + workOrder.getTitle();
                    }
            ));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "Status: " + quoteStatusLabel(quote, lang);
                        case "fr" -> "Statut : " + quoteStatusLabel(quote, lang);
                        default -> "Stato: " + quoteStatusLabel(quote, lang);
                    }
            ));

            document.add(new Paragraph(" "));
            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "COST DETAILS";
                        case "fr" -> "DÉTAIL DES COÛTS";
                        default -> "DETTAGLIO COSTI";
                    },
                    headingFont
            ));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);

            table.setWidthPercentage(100);

            table.addCell(switch (lang) {
                case "en" -> "Description";
                case "fr" -> "Description";
                default -> "Descrizione";
            });

            table.addCell(switch (lang) {
                case "en" -> "Quantity";
                case "fr" -> "Quantité";
                default -> "Quantità";
            });

            table.addCell(switch (lang) {
                case "en" -> "Unit price";
                case "fr" -> "Prix unitaire";
                default -> "Prezzo unitario";
            });

            table.addCell(switch (lang) {
                case "en" -> "Total";
                case "fr" -> "Total";
                default -> "Totale";
            });

            BigDecimal laborTotal =
                    workOrderService.laborTotal(workOrder);

            table.addCell(switch (lang) {
                case "en" -> "Labour";
                case "fr" -> "Main-d'œuvre";
                default -> "Manodopera";
            });
            table.addCell(
                    workOrder.getLaborHours() +
                            switch (lang) {
                                case "en" -> " hours";
                                case "fr" -> " heures";
                                default -> " ore";
                            }
            );
            table.addCell(
                    money(workOrder.getLaborRate())
            );
            table.addCell(
                    money(laborTotal)
            );

            for (MaterialItem material : workOrder.getMaterials()) {

                table.addCell(material.getDescription());

                table.addCell(
                        material.getQuantity().toString()
                );

                table.addCell(
                        money(material.getUnitPrice())
                );

                BigDecimal materialTotal =
                        material.getQuantity()
                                .multiply(material.getUnitPrice());

                table.addCell(
                        money(materialTotal)
                );
            }

            document.add(table);

            document.add(new Paragraph(" "));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "Subtotal: " + money(quote.getSubtotal());
                        case "fr" -> "Sous-total : " + money(quote.getSubtotal());
                        default -> "Subtotale: " + money(quote.getSubtotal());
                    }
            ));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "VAT " + quote.getTaxRate() + "%: "
                                + money(quote.getTaxAmount());

                        case "fr" -> "TVA " + quote.getTaxRate() + "% : "
                                + money(quote.getTaxAmount());

                        default -> "IVA " + quote.getTaxRate() + "%: "
                                + money(quote.getTaxAmount());
                    }
            ));

            document.add(new Paragraph(
                    switch (lang) {
                        case "en" -> "TOTAL: " + money(quote.getTotal());
                        case "fr" -> "TOTAL : " + money(quote.getTotal());
                        default -> "TOTALE: " + money(quote.getTotal());
                    },
                    headingFont
            ));

            document.close();

            return outputStream.toByteArray();

        } catch (DocumentException e) {
            throw new RuntimeException(
                    "Errore durante la generazione del PDF",
                    e
            );
        }
    }

    private String money(BigDecimal value) {

        NumberFormat formatter =
                NumberFormat.getCurrencyInstance(Locale.ITALY);

        return formatter.format(value);
    }

    private String quoteStatusLabel(Quote quote,String lang) {

        return switch (lang) {

            case "en" -> switch (quote.getStatus()) {
                case DRAFT -> "Draft";
                case SENT -> "Sent";
                case APPROVED -> "Approved";
                case REJECTED -> "Rejected";
            };

            case "fr" -> switch (quote.getStatus()) {
                case DRAFT -> "Brouillon";
                case SENT -> "Envoyé";
                case APPROVED -> "Approuvé";
                case REJECTED -> "Refusé";
            };

            default -> switch (quote.getStatus()) {
                case DRAFT -> "Bozza";
                case SENT -> "Inviato";
                case APPROVED -> "Approvato";
                case REJECTED -> "Rifiutato";
            };
        };
    }
}
