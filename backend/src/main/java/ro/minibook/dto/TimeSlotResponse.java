package ro.minibook.dto;

import java.time.Instant;

public record TimeSlotResponse(Instant startTime, Instant endTime) {}
