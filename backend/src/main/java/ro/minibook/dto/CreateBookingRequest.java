package ro.minibook.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreateBookingRequest(
        @NotNull Long roomId,
        @NotNull Instant startTime,
        @NotNull Instant endTime,
        String createdBy
) {}
