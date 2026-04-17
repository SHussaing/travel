package smahfood.travel.travel.admin.model;

import java.time.LocalDate;

public record TravelDto(
        String id,
        String destination,
        LocalDate startDate,
        LocalDate endDate,
        int durationDays,
        String activities,
        String accommodation,
        String transportation
) {
}

